/**
 * Image checks for the MCP server: MPF Image Studio specifications, image format / dimensions /
 * integrity (parsed from the bytes, no image library), ZIP safety, file naming, project association
 * and the size the existing importer will store each asset at.
 *
 * Nothing here talks to the backend. The Spring Boot connector still runs its own ZIP and image
 * validation (ClaudeZipInspector / ClaudeBatchValidator) on whatever this module forwards.
 */
import crypto from "node:crypto";
import zlib from "node:zlib";
import { ZipReader, ZipWriter, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";

/* ------------------------------------------------------------------ specifications */

/** Approved MPF Image Studio output sizes. Gallery images are uploaded as unchanged originals. */
export const IMAGE_STUDIO_SPECS = {
  "Desktop-1": { kind: "DESKTOP", label: "Desktop banner (day)", width: 2225, height: 1065 },
  "Desktop-2": { kind: "DESKTOP", label: "Desktop banner (night)", width: 2225, height: 1065 },
  "Mobile-1": { kind: "MOBILE", label: "Mobile banner (day)", width: 2700, height: 2700 },
  "Mobile-2": { kind: "MOBILE", label: "Mobile banner (night)", width: 2700, height: 2700 },
  Location: { kind: "LOCATION", label: "Location map", width: 815, height: 815 },
  Thumbnail: { kind: "THUMBNAIL", label: "Thumbnail", width: 400, height: 400 },
  Logo: { kind: "LOGO", label: "Logo strip", width: 390, height: 100 },
};
/** Slots every project should have; Gallery-N (at least one) is checked separately. */
export const EXPECTED_SLOTS = Object.keys(IMAGE_STUDIO_SPECS);

/**
 * Boxes of the resize path (FileUtils.saveImageFromBytes via ClaudeImporterSpec.ImageKind): rescaled
 * (up or down), aspect kept, re-encoded. Since the connector's Image Studio storage rule
 * (ClaudeImageStudioSpec), only images that are NOT kept as originals go this way.
 */
export const IMPORTER_BOXES = {
  DESKTOP: [2508, 1200], MOBILE: [800, 800], LOGO: [792, 203], LOCATION: [1200, 800], THUMBNAIL: [800, 800], GALLERY: [1600, 1200],
};

/** Backend limits mirrored from ClaudeIntegrationProperties defaults. */
const MIN_SIDE = 100;
const MAX_PIXELS = 60_000_000;
const MAX_IMAGE_BYTES = 40 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 200;
const MAX_EXTRACTED_BYTES = 200 * 1024 * 1024;
const MAX_RATIO = 100;
const JUNK = new Set([".ds_store", "thumbs.db", "desktop.ini"]);
const FILE_SUFFIX = "My-Property-Fact";

/* ------------------------------------------------------------------ naming */

/** Same rules as the backend FileUtils.generateSlug. */
export function slugify(input) {
  return String(input ?? "").trim().replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

/**
 * Maps a file-name type token to its canonical slot. Accepts the backend tokens (Desktop-1, Logo…)
 * plus the Image Studio export names: Desktop-Banner = day (Desktop-1), Desktop-Banner-2 = night
 * (Desktop-2), Desktop-Day / Desktop-Night, Logo-Strip, Location-Map.
 * @returns {{slot: string, kind: string} | {error: string}}
 */
export function canonicalSlot(token) {
  const t = String(token || "").trim();
  let m = /^(desktop|mobile)(?:-?banner)?(?:-?(day|night|\d{1,3}))?$/i.exec(t);
  if (m) {
    const base = m[1].toLowerCase() === "desktop" ? "Desktop" : "Mobile";
    const v = (m[2] || "1").toLowerCase();
    const n = v === "day" ? 1 : v === "night" ? 2 : Number.parseInt(v, 10);
    if (!n) return { error: `"${t}": numbering starts at 1 (Desktop-1 = day, Desktop-2 = night).` };
    return { slot: `${base}-${n}`, kind: base.toUpperCase() };
  }
  if (/^logo(?:-?strip)?$/i.test(t)) return { slot: "Logo", kind: "LOGO" };
  if (/^thumb(?:nail)?$/i.test(t)) return { slot: "Thumbnail", kind: "THUMBNAIL" };
  if (/^location(?:-?map)?$/i.test(t)) return { slot: "Location", kind: "LOCATION" };
  m = /^gallery(?:-?(\d{1,3}))?$/i.exec(t);
  if (m) {
    if (!m[1]) return { error: `"${t}": number gallery images (Gallery-1, Gallery-2…).` };
    const n = Number.parseInt(m[1], 10);
    if (!n) return { error: `"${t}": numbering starts at Gallery-1.` };
    return { slot: `Gallery-${n}`, kind: "GALLERY" };
  }
  const hint = /logo/i.test(t) ? "Logo" : /thumb/i.test(t) ? "Thumbnail" : /loc|map/i.test(t) ? "Location"
    : /desk/i.test(t) ? "Desktop-1 / Desktop-2" : /mob/i.test(t) ? "Mobile-1 / Mobile-2" : "Gallery-1";
  return { error: `Unknown image type "${t}". Did you mean ${hint}? Allowed: Desktop-1 (day), Desktop-2 (night), Mobile-1 (day), Mobile-2 (night), Location, Thumbnail, Logo, Gallery-N.` };
}

/* ------------------------------------------------------------------ format, dimensions, integrity */

export function sniffFormat(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

/** Names formats the backend does not accept, so the report can say what the file really is. */
function otherFormat(b) {
  if (b.length >= 12 && b.toString("ascii", 4, 8) === "ftyp") {
    const brand = b.toString("ascii", 8, 12);
    if (/avi[fs]/.test(brand)) return "AVIF";
    if (/hei[cx]|mif1|msf1|heis/.test(brand)) return "HEIC";
  }
  if (b.length >= 6 && b.toString("ascii", 0, 3) === "GIF") return "GIF";
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return "BMP";
  if (b.length >= 4 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a) || (b[0] === 0x4d && b[1] === 0x4d && b[3] === 0x2a))) return "TIFF";
  if (b.length >= 5 && /^\s*<(\?xml|svg)/i.test(b.toString("utf8", 0, Math.min(b.length, 200)))) return "SVG";
  if (b.length >= 4 && b.toString("ascii", 0, 4) === "%PDF") return "PDF";
  return null;
}

const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** Walks JPEG marker segments up to the scan, then requires an EOI marker at the end. */
function inspectJpeg(b) {
  let i = 2;
  let dims = null;
  let progressive = false;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return { error: `bad marker at byte ${i}` };
    let marker = b[i + 1];
    while (marker === 0xff && i + 2 < b.length) { i++; marker = b[i + 1]; }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
    if (marker === 0xd9) return { error: "end marker before image data" };
    const len = b.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > b.length) return { error: "segment runs past the end of the file (truncated)" };
    if (SOF.has(marker)) {
      if (len < 8) return { error: "short frame header" };
      dims = { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      progressive = marker === 0xc2 || marker === 0xc6 || marker === 0xca || marker === 0xce;
    }
    if (marker === 0xda) {
      if (!dims) return { error: "scan without a frame header" };
      let end = b.length - 1;
      while (end > i && b[end] === 0x00) end--;
      if (!(b[end - 1] === 0xff && b[end] === 0xd9)) return { error: "missing JPEG end marker (truncated file)" };
      if (end - (i + 2 + len) < 16) return { error: "no compressed image data" };
      return { ...dims, detail: progressive ? "progressive JPEG" : "baseline JPEG" };
    }
    i += 2 + len;
  }
  return { error: "no image scan found (truncated)" };
}

/** Walks PNG chunks, verifies every CRC, inflates IDAT and checks the decompressed size. */
function inspectPng(b) {
  let i = 8;
  let ihdr = null;
  const idat = [];
  let sawEnd = false;
  while (i + 12 <= b.length) {
    const len = b.readUInt32BE(i);
    const type = b.toString("ascii", i + 4, i + 8);
    if (i + 12 + len > b.length) return { error: `chunk ${type} runs past the end of the file (truncated)` };
    const crc = b.readUInt32BE(i + 8 + len);
    if (zlib.crc32(b.subarray(i + 4, i + 8 + len)) !== crc) return { error: `CRC mismatch in chunk ${type} (corrupted)` };
    if (type === "IHDR") {
      ihdr = { width: b.readUInt32BE(i + 8), height: b.readUInt32BE(i + 12), depth: b[i + 16], color: b[i + 17], interlace: b[i + 20] };
    } else if (type === "IDAT") {
      idat.push(b.subarray(i + 8, i + 8 + len));
    } else if (type === "IEND") {
      sawEnd = true;
      break;
    }
    i += 12 + len;
  }
  if (!ihdr) return { error: "missing IHDR header" };
  if (!sawEnd) return { error: "missing IEND chunk (truncated file)" };
  if (idat.length === 0) return { error: "no image data (IDAT)" };
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.color];
  if (!channels) return { error: "unknown PNG colour type" };
  if ((ihdr.width * ihdr.height) > MAX_PIXELS) return { width: ihdr.width, height: ihdr.height, detail: "PNG (not decoded: too many pixels)" };
  const rowBytes = Math.ceil((ihdr.width * channels * ihdr.depth) / 8);
  const expected = ihdr.interlace ? null : (rowBytes + 1) * ihdr.height;
  let raw;
  try {
    raw = zlib.inflateSync(Buffer.concat(idat), { maxOutputLength: (expected || (rowBytes + 1) * ihdr.height * 2) + 1024 });
  } catch {
    return { error: "compressed image data cannot be decoded (corrupted)" };
  }
  if (expected !== null && raw.length !== expected) return { error: `decoded data is ${raw.length} bytes, expected ${expected} (corrupted)` };
  return { width: ihdr.width, height: ihdr.height, detail: `PNG ${ihdr.depth}-bit${ihdr.interlace ? " interlaced" : ""}` };
}

/** Checks the RIFF size and chunk layout and reads the VP8 / VP8L / VP8X header. */
function inspectWebp(b) {
  const riff = b.readUInt32LE(4);
  if (riff + 8 > b.length) return { error: "RIFF size is larger than the file (truncated)" };
  let i = 12;
  let dims = null;
  let detail = "WEBP";
  let hasImage = false;
  while (i + 8 <= riff + 8) {
    const type = b.toString("ascii", i, i + 4);
    const len = b.readUInt32LE(i + 4);
    const data = i + 8;
    if (data + len > b.length) return { error: `chunk ${type.trim()} runs past the end of the file (truncated)` };
    if (type === "VP8X" && len >= 10) {
      dims = { width: 1 + b.readUIntLE(data + 4, 3), height: 1 + b.readUIntLE(data + 7, 3) };
      if (b[data] & 0x02) detail = "animated WEBP";
    } else if (type === "VP8 " && len >= 10) {
      if (!(b[data + 3] === 0x9d && b[data + 4] === 0x01 && b[data + 5] === 0x2a)) return { error: "bad VP8 key-frame header" };
      dims ||= { width: b.readUInt16LE(data + 6) & 0x3fff, height: b.readUInt16LE(data + 8) & 0x3fff };
      hasImage = true;
      if (detail === "WEBP") detail = "WEBP (lossy)";
    } else if (type === "VP8L" && len >= 5) {
      if (b[data] !== 0x2f) return { error: "bad VP8L signature" };
      const bits = b.readUInt32LE(data + 1);
      dims ||= { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      hasImage = true;
      if (detail === "WEBP") detail = "WEBP (lossless)";
    } else if (type === "ANMF") {
      hasImage = true;
    }
    i = data + len + (len & 1);
  }
  if (!dims) return { error: "no WEBP image header" };
  if (!hasImage) return { error: "no WEBP image data" };
  if (detail === "animated WEBP") return { error: "animated WEBP is not supported" };
  return { ...dims, detail };
}

/**
 * Format, dimensions and structural integrity of one image.
 * @returns {{format, width, height, detail} | {error, code}}
 */
export function inspectImageBytes(bytes) {
  const format = sniffFormat(bytes);
  if (!format) {
    const other = otherFormat(bytes);
    return other
      ? { code: "IMAGE_UNSUPPORTED_FORMAT", error: `the content is ${other}; only JPEG, PNG and WEBP are accepted` }
      : { code: "IMAGE_INVALID_CONTENT", error: "not a JPEG, PNG or WEBP image (content checked)" };
  }
  let r;
  try {
    r = format === "jpg" ? inspectJpeg(bytes) : format === "png" ? inspectPng(bytes) : inspectWebp(bytes);
  } catch {
    r = { error: "image header cannot be read" };
  }
  if (r.error) return { format, code: "IMAGE_CORRUPTED", error: r.error };
  return { format, width: r.width, height: r.height, detail: r.detail };
}

/**
 * Size the importer stores an image at. Gallery images and images with their slot's exact Image
 * Studio size are kept as originals (same pixels, size and format; metadata removed); anything else
 * goes through the resize path (legacyImporterStorage).
 */
export function importerStorage(kind, width, height) {
  const spec = Object.values(IMAGE_STUDIO_SPECS).find((x) => x.kind === kind);
  if (kind === "GALLERY" || (spec && spec.width === width && spec.height === height)) {
    return { storedWidth: width, storedHeight: height, action: "KEPT_ORIGINAL", box: null };
  }
  return legacyImporterStorage(kind, width, height);
}

/** The resize path (FileUtils.saveImageFromBytes); also what every import before the storage rule did. */
export function legacyImporterStorage(kind, width, height) {
  const [bw, bh] = IMPORTER_BOXES[kind];
  const scale = Math.min(bw / width, bh / height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const action = w === width && h === height ? "SAME_SIZE" : w > width || h > height ? "UPSCALED" : "DOWNSCALED";
  return { storedWidth: w, storedHeight: h, action, box: `${bw}x${bh}` };
}

/* ------------------------------------------------------------------ ZIP reading */

class CappedSink {
  constructor(cap) {
    this.cap = cap;
    this.size = 0;
    this.chunks = [];
    const self = this;
    this.writable = new WritableStream({
      write(chunk) {
        self.size += chunk.length;
        if (self.size > self.cap) throw new Error("ENTRY_TOO_LARGE");
        self.chunks.push(chunk);
      },
    });
  }
  bytes() { return Buffer.concat(this.chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength))); }
}

function unsafePath(name) {
  const n = name.replace(/\\/g, "/");
  return n.startsWith("/") || /^[A-Za-z]:/.test(n) || n.split("/").includes("..") || n.includes("\0");
}

/**
 * Reads an uploaded ZIP safely. Returns the image files plus ZIP-level issues.
 * @returns {Promise<{files: Array<{entryName, folder, fileName, bytes}>, issues: Array, entries: number, extractedBytes: number, unreadable?: boolean}>}
 */
export async function readZip(zipBytes) {
  const out = { files: [], issues: [], entries: 0, extractedBytes: 0, ignored: [] };
  if (!(zipBytes.length >= 4 && zipBytes[0] === 0x50 && zipBytes[1] === 0x4b)) {
    out.unreadable = true;
    out.issues.push(issue("ERROR", "ZIP_INVALID", "The images file is not a ZIP archive."));
    return out;
  }
  let reader;
  let entries;
  try {
    reader = new ZipReader(new Uint8ArrayReader(new Uint8Array(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength)), { useWebWorkers: false });
    entries = await reader.getEntries();
  } catch (err) {
    out.unreadable = true;
    if (/unsafe filename/i.test(String(err?.message))) {
      out.issues.push(issue("ERROR", "ZIP_UNSAFE_PATH", "The ZIP contains an absolute path or a '..' path (ZIP Slip attempt); the whole archive is refused."));
    } else {
      out.issues.push(issue("ERROR", "ZIP_UNREADABLE", "The ZIP could not be read (corrupted or truncated)."));
    }
    return out;
  }
  out.entries = entries.length;
  if (entries.length > MAX_ZIP_ENTRIES) {
    out.unreadable = true;
    out.issues.push(issue("ERROR", "ZIP_TOO_MANY_ENTRIES", `The ZIP has ${entries.length} entries; the limit is ${MAX_ZIP_ENTRIES}.`));
    await reader.close();
    return out;
  }
  const seen = new Map();
  for (const e of entries) {
    const name = e.filename;
    if (unsafePath(name)) {
      out.issues.push(issue("ERROR", "ZIP_UNSAFE_PATH", `Entry path is absolute or contains '..': ${name}`, { file: name }));
      continue;
    }
    if (e.directory) continue;
    const mode = (e.externalFileAttribute >>> 16) & 0o170000;
    if (mode === 0o120000) {
      out.issues.push(issue("ERROR", "ZIP_SYMLINK", `Symbolic links are not allowed: ${name}`, { file: name }));
      continue;
    }
    if (e.encrypted) {
      out.issues.push(issue("ERROR", "ZIP_ENCRYPTED", `Encrypted entries are not allowed: ${name}`, { file: name }));
      continue;
    }
    const normalized = name.replace(/\\/g, "/");
    const fileName = normalized.slice(normalized.lastIndexOf("/") + 1);
    const folder = normalized.includes("/") ? normalized.slice(0, normalized.lastIndexOf("/")) : "";
    if (normalized.startsWith("__MACOSX/") || JUNK.has(fileName.toLowerCase()) || fileName.startsWith("._")) {
      out.ignored.push(name);
      continue;
    }
    const lower = fileName.toLowerCase();
    if (seen.has(lower)) {
      out.issues.push(issue("ERROR", "ZIP_DUPLICATE_FILE_NAME", `File name "${fileName}" appears twice (${seen.get(lower)}, ${name}). File names must be unique across folders.`, { file: name }));
      continue;
    }
    seen.set(lower, name);
    const sink = new CappedSink(MAX_IMAGE_BYTES);
    try {
      await e.getData(sink.writable, { checkSignature: true });
    } catch (err) {
      const big = String(err?.message || "").includes("ENTRY_TOO_LARGE");
      out.issues.push(issue("ERROR", big ? "IMAGE_TOO_LARGE" : "ZIP_ENTRY_UNREADABLE",
        big ? `${name} is larger than ${MAX_IMAGE_BYTES} bytes.` : `${name} could not be extracted (corrupted entry or CRC mismatch).`, { file: name }));
      continue;
    }
    const bytes = sink.bytes();
    out.extractedBytes += bytes.length;
    if (e.compressedSize > 0 && bytes.length / e.compressedSize > MAX_RATIO) {
      out.issues.push(issue("ERROR", "ZIP_SUSPICIOUS_RATIO", `${name} expands more than ${MAX_RATIO}x (possible archive bomb).`, { file: name }));
      continue;
    }
    if (out.extractedBytes > MAX_EXTRACTED_BYTES) {
      out.unreadable = true;
      out.issues.push(issue("ERROR", "ZIP_EXTRACTED_TOO_LARGE", `Uncompressed content exceeds ${MAX_EXTRACTED_BYTES} bytes.`));
      break;
    }
    out.files.push({ entryName: name, folder, fileName, bytes });
  }
  try { await reader.close(); } catch { /* ignore */ }
  return out;
}

/* ------------------------------------------------------------------ the image report */

function issue(severity, code, message, extra = {}) {
  return { severity, code, message, ...extra };
}

/**
 * Validates a set of image files against the workbook's projects and the Image Studio specs, and
 * returns the report plus canonically named files for the ZIP that is forwarded to the backend.
 *
 * @param files         [{entryName, folder, fileName, bytes, origin?}]
 * @param projectNames  PROJECT NAME values from the workbook rows
 * @param opts          {specPolicy: "strict"|"warn", sourcePermission: {confirmed, source}|null, transfer: object, zipInfo?: object}
 */
export function buildImageReport(files, projectNames, opts = {}) {
  const strict = (opts.specPolicy || "strict") === "strict";
  const projects = new Map();
  for (const name of projectNames) {
    const slug = slugify(name);
    if (slug && !projects.has(slug)) projects.set(slug, { projectName: name, slug, slots: new Map(), assets: [], issues: [] });
  }
  const batchIssues = [...(opts.zipIssues || [])];
  const assets = [];
  const hashes = new Map();

  for (const f of files) {
    const a = {
      file: f.entryName,
      origin: f.origin,
      bytes: f.bytes.length,
      sha256: crypto.createHash("sha256").update(f.bytes).digest("hex"),
      status: "OK",
      issues: [],
    };
    assets.push(a);
    const add = (sev, code, msg) => {
      a.issues.push(issue(sev, code, msg));
      if (sev === "ERROR") a.status = "INVALID";
      else if (a.status === "OK" && sev === "WARNING") a.status = "WARNING";
    };

    // name: <Project-Key>_<Type>_My-Property-Fact.<ext>
    const dot = f.fileName.lastIndexOf(".");
    const base = dot > 0 ? f.fileName.slice(0, dot) : f.fileName;
    const ext = dot > 0 ? f.fileName.slice(dot + 1).toLowerCase() : "";
    const parts = base.split("_");
    if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
      add("ERROR", "IMAGE_BAD_NAME", `"${f.fileName}" must be named <Project-Name-With-Hyphens>_<Type>_${FILE_SUFFIX}.<jpg|png|webp>.`);
    }
    const key = parts[0]?.trim() || "";
    const slug = slugify(key.replace(/-/g, " "));
    const project = projects.get(slug);
    a.projectKey = key || null;
    if (key && !project) {
      add("ERROR", "IMAGE_PROJECT_NOT_IN_WORKBOOK", `Project key "${key}" (slug "${slug}") is not a PROJECT NAME in this workbook. Images are only attached to projects created by this batch.`);
    } else if (project) {
      a.projectName = project.projectName;
    }
    if (f.folder) {
      const last = f.folder.slice(f.folder.lastIndexOf("/") + 1);
      if (slugify(last.replace(/-/g, " ")) !== slug) add("ERROR", "IMAGE_FOLDER_MISMATCH", `"${f.entryName}" is in folder "${last}" but its file name is for "${key}".`);
    }
    if (parts.length >= 3 && parts.slice(2).join("_") !== FILE_SUFFIX) {
      add("WARNING", "IMAGE_NAME_SUFFIX", `Expected the suffix "_${FILE_SUFFIX}"; the file is renamed to the convention.`);
    }

    let slot = null;
    if (parts.length >= 2) {
      const c = canonicalSlot(parts[1]);
      if (c.error) add("ERROR", "IMAGE_UNKNOWN_TYPE", c.error);
      else {
        slot = c;
        a.typeToken = parts[1];
        a.slot = c.slot;
        a.kind = c.kind;
        a.spec = IMAGE_STUDIO_SPECS[c.slot]
          ? { label: IMAGE_STUDIO_SPECS[c.slot].label, width: IMAGE_STUDIO_SPECS[c.slot].width, height: IMAGE_STUDIO_SPECS[c.slot].height }
          : c.kind === "GALLERY" ? { label: "Gallery (unchanged original)" } : { label: `${c.kind.toLowerCase()} (extra, validated against the ${c.kind.toLowerCase()} spec)` };
        if (!a.spec.width && c.kind !== "GALLERY") {
          const ref = IMAGE_STUDIO_SPECS[`${c.kind === "DESKTOP" ? "Desktop" : "Mobile"}-1`];
          a.spec.width = ref.width;
          a.spec.height = ref.height;
        }
      }
    }

    // content
    const info = inspectImageBytes(f.bytes);
    if (info.error) {
      add("ERROR", info.code, `${f.fileName}: ${info.error}.`);
    } else {
      a.format = info.format;
      a.width = info.width;
      a.height = info.height;
      a.detail = info.detail;
      const extFormat = ext === "jpeg" ? "jpg" : ext;
      if (ext && extFormat !== info.format) {
        add("ERROR", "IMAGE_EXTENSION_MISMATCH", `${f.fileName} is named .${ext} but its content is ${info.format.toUpperCase()}.`);
      }
      if (info.width * info.height > MAX_PIXELS) add("ERROR", "IMAGE_TOO_MANY_PIXELS", `${info.width}x${info.height} exceeds ${MAX_PIXELS} pixels.`);
      else if (info.width < MIN_SIDE || info.height < MIN_SIDE) add("ERROR", "IMAGE_TOO_SMALL", `${info.width}x${info.height}; each side must be at least ${MIN_SIDE} px.`);
      if (slot) {
        if (a.spec.width) {
          const match = info.width === a.spec.width && info.height === a.spec.height;
          a.specStatus = match ? "MATCH" : "RESIZE_REQUIRED";
          if (!match) {
            const ratioOff = Math.abs(info.width / info.height - a.spec.width / a.spec.height) / (a.spec.width / a.spec.height);
            add(strict ? "ERROR" : "WARNING", "IMAGE_SPEC_MISMATCH",
              `${a.spec.label} must be exactly ${a.spec.width}x${a.spec.height} (MPF Image Studio); this file is ${info.width}x${info.height}` +
              (ratioOff > 0.01 ? `, and the aspect ratio differs by ${(ratioOff * 100).toFixed(1)}%` : "") + ". Re-export it from Image Studio.");
          }
        } else {
          a.specStatus = "ORIGINAL_ACCEPTED";
        }
        a.importerStorage = importerStorage(slot.kind, info.width, info.height);
        if (slot.kind === "GALLERY" && !["SAME_SIZE", "KEPT_ORIGINAL"].includes(a.importerStorage.action)) {
          add("WARNING", "GALLERY_RESIZED_BY_IMPORTER",
            `The existing importer stores gallery images fitted into ${a.importerStorage.box}: this original will be saved as ${a.importerStorage.storedWidth}x${a.importerStorage.storedHeight}, not unchanged.`);
        }
      }
    }

    // duplicates
    const prev = hashes.get(a.sha256);
    if (prev) add("WARNING", "IMAGE_DUPLICATE_CONTENT", `Same image content as ${prev}.`);
    else hashes.set(a.sha256, f.entryName);
    if (project && slot) {
      const other = project.slots.get(slot.slot);
      if (other) add("ERROR", "IMAGE_DUPLICATE_SLOT", `${slot.slot} is supplied twice for ${project.projectName} (${other} and ${f.entryName}).`);
      else project.slots.set(slot.slot, f.entryName);
    }
    if (project) project.assets.push(a);

    if (slot && key && info.format) {
      a.canonicalName = `${key}/${key}_${slot.slot}_${FILE_SUFFIX}.${info.format}`;
      a.renamed = a.canonicalName !== f.entryName;
    }
    a.forwarded = !!a.canonicalName && a.status !== "INVALID";
  }

  // per project: missing assets
  const projectReports = [];
  for (const p of projects.values()) {
    const missing = EXPECTED_SLOTS.filter((s) => !p.slots.has(s));
    const galleries = [...p.slots.keys()].filter((s) => s.startsWith("Gallery-")).length;
    if (galleries === 0) missing.push("Gallery-1 (at least one)");
    for (const m of missing) {
      p.issues.push(issue("WARNING", "IMAGE_MISSING",
        `${p.projectName}: missing ${IMAGE_STUDIO_SPECS[m] ? `${m} (${IMAGE_STUDIO_SPECS[m].label}, ${IMAGE_STUDIO_SPECS[m].width}x${IMAGE_STUDIO_SPECS[m].height})` : m}.`));
    }
    projectReports.push({
      projectName: p.projectName,
      projectKey: p.assets[0]?.projectKey || null,
      images: p.assets.length,
      validImages: p.assets.filter((x) => x.status !== "INVALID").length,
      missing,
      issues: p.issues,
    });
  }

  // source permission
  const perm = opts.sourcePermission;
  if (files.length > 0) {
    if (!perm || perm.confirmed !== true) {
      batchIssues.push(issue("ERROR", "IMAGE_SOURCE_PERMISSION_UNCONFIRMED",
        "Confirm the images may be used: pass imageSourcePermission = {confirmed: true, source: \"MPF Image Studio\" (or the real source)}."));
    } else if (!String(perm.source || "").trim()) {
      batchIssues.push(issue("ERROR", "IMAGE_SOURCE_MISSING", "imageSourcePermission.source must name where the images come from."));
    }
  }

  const all = [...batchIssues, ...assets.flatMap((a) => a.issues), ...projectReports.flatMap((p) => p.issues)];
  const errors = all.filter((x) => x.severity === "ERROR").length;
  const warnings = all.filter((x) => x.severity === "WARNING").length;
  const valid = errors === 0;
  return {
    report: {
      valid,
      specPolicy: strict ? "strict" : "warn",
      summary: {
        images: assets.length,
        valid: assets.filter((a) => a.status !== "INVALID").length,
        invalid: assets.filter((a) => a.status === "INVALID").length,
        specMatched: assets.filter((a) => a.specStatus === "MATCH").length,
        resizeRequired: assets.filter((a) => a.specStatus === "RESIZE_REQUIRED").length,
        galleryOriginals: assets.filter((a) => a.specStatus === "ORIGINAL_ACCEPTED").length,
        renamed: assets.filter((a) => a.renamed).length,
        resizedByImporter: assets.filter((a) => a.importerStorage && !["SAME_SIZE", "KEPT_ORIGINAL"].includes(a.importerStorage.action)).length,
        missingAssets: projectReports.reduce((n, p) => n + p.missing.length, 0),
        errors,
        warnings,
      },
      transfer: opts.transfer || null,
      zip: opts.zipInfo || null,
      sourcePermission: perm ? { confirmed: perm.confirmed === true, source: perm.source ? String(perm.source).slice(0, 200) : null } : null,
      batchIssues,
      projects: projectReports,
      assets,
      importerNote:
        "importerStorage is how the importer will save each file: KEPT_ORIGINAL for gallery images and images with their exact Image Studio size " +
        "(same pixels, size and format; only metadata such as EXIF/GPS is removed), otherwise fitted into the importer's box and re-encoded (UPSCALED / DOWNSCALED).",
    },
    canonicalFiles: assets.filter((a) => a.forwarded).map((a) => ({ name: a.canonicalName, bytes: files.find((f) => f.entryName === a.file).bytes })),
  };
}

/** ZIP with canonical names, stored (no recompression), in <Project-Key>/ folders. */
export async function writeCanonicalZip(canonicalFiles) {
  if (!canonicalFiles.length) return null;
  const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false });
  // Slot order (day before night, Gallery-1 before Gallery-2): the importer saves banners and
  // gallery rows in ZIP entry order, and the site shows them in saved order.
  const rank = (name) => {
    const slot = String(name).split("/").pop().split("_")[1] || "";
    const [base, n] = slot.split("-");
    const i = ["Desktop", "Mobile", "Logo", "Location", "Thumbnail", "Gallery"].indexOf(base);
    return (i < 0 ? 9 : i) * 10000 + (Number.parseInt(n, 10) || 0);
  };
  const ordered = [...canonicalFiles].sort((a, b) => (a.name.split("/")[0] === b.name.split("/")[0] ? rank(a.name) - rank(b.name) : a.name < b.name ? -1 : 1));
  for (const f of ordered) await writer.add(f.name, new Uint8ArrayReader(new Uint8Array(f.bytes)), { level: 0 });
  return Buffer.from(await writer.close());
}
