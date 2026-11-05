"use client";

/**
 * Bulk project import (Excel + images) for any number of projects.
 *
 * The browser does the heavy lifting so the upload has no size limit:
 *  1. Reads the Excel and indexes the images (zips are read lazily from disk, one image at a
 *     time, so multi-GB zips are fine; a plain image folder works too).
 *  2. Matches each image to its Excel row with the same rules the server uses.
 *  3. Splits the work into small batches (rows + their images), shrinks each image to the size
 *     the server stores anyway, and sends batch after batch to the existing
 *     /excel-upload/projects/async endpoint. Failed batches are retried; the next batch is
 *     prepared while the server is still saving the current one.
 *
 * Re-running is safe: projects are matched by slug and duplicate images are skipped server-side,
 * so an interrupted import can simply be resumed or restarted.
 */

import axios from "axios";
import * as XLSX from "xlsx";
import {
  BlobReader,
  BlobWriter,
  ZipReader,
  ZipWriter,
  configure,
} from "@zip.js/zip.js";

// Native (De)CompressionStream does the work; avoids bundling zip.js worker scripts.
configure({ useWebWorkers: false });

export const BATCH_MAX_ROWS = 20;
export const BATCH_MAX_IMAGES = 80;
const IMAGE_CONCURRENCY = 3;
const POLL_MS = 1500;
const MAX_ATTEMPTS = 5;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;
// Java's \s is [ \t\n\x0B\f\r]; JS \s also matches non-breaking spaces, which the server strips.
const JAVA_WS = /[ \t\n\x0B\f\r]+/g;

/** Same output as FileUtils.generateSlug on the server. */
export function generateSlug(input) {
  if (input == null) return "";
  return String(input)
    .trim()
    .replace(/[^a-zA-Z0-9 \t\n\x0B\f\r-]/g, "")
    .replace(JAVA_WS, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const normHeader = (v) =>
  String(v ?? "")
    .trim()
    .toUpperCase()
    .replace(JAVA_WS, " ");

const cellText = (v) => {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v).trim();
};

const baseName = (path) => path.substring(path.lastIndexOf("/") + 1);

/** Image file name → {key, type}, using the server's rule: ProjectKey_ImageType_anything.ext */
function parseImageName(name) {
  let base = baseName(name);
  const dot = base.lastIndexOf(".");
  if (dot > 0) base = base.substring(0, dot);
  const parts = base.split("_");
  if (parts.length < 2) return null;
  const key = parts[0].trim();
  const type = parts[1].trim();
  if (!key || !type) return null;
  return { key, type };
}

/** Box the server resizes each image type into (ProjectExcelUploadService constants). */
function targetBox(imageType) {
  const t = imageType.toLowerCase();
  if (t.startsWith("desktop")) return [2508, 1200];
  if (t.startsWith("mobile")) return [800, 800];
  if (t.startsWith("logo")) return [792, 203];
  if (t.startsWith("location")) return [1200, 800];
  if (t.startsWith("thumbnail")) return [800, 800];
  return [1600, 1200];
}

// ---------------------------------------------------------------------------
// Step 1: read and check the files
// ---------------------------------------------------------------------------

async function readExcel(file) {
  const wb = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws || !ws["!ref"]) return [];
  // Start at A1 like the server (getRow(0)), even if the sheet's used range starts later.
  const range = XLSX.utils.decode_range(ws["!ref"]);
  range.s.r = 0;
  range.s.c = 0;
  return XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: true,
    range,
  });
}

function isJunkEntry(path) {
  const name = baseName(path);
  return path.includes("__MACOSX/") || name.startsWith(".") || !name;
}

/** Lists images from zips (read lazily) and loose files without loading any image data. */
async function indexImages(zipFiles, looseFiles) {
  const images = [];
  const readers = [];
  const seen = new Set();
  let duplicates = 0;
  let unsupported = 0;

  const add = (name, size, getBlob) => {
    if (isJunkEntry(name)) return;
    const file = baseName(name);
    if (!IMAGE_EXT.test(file)) {
      unsupported++;
      return;
    }
    // The server keys images by file name, so a repeated name would overwrite the first.
    if (seen.has(file.toLowerCase())) {
      duplicates++;
      return;
    }
    seen.add(file.toLowerCase());
    images.push({ name: file, size, getBlob });
  };

  for (const zip of zipFiles) {
    const reader = new ZipReader(new BlobReader(zip));
    readers.push(reader);
    const entries = await reader.getEntries();
    for (const entry of entries) {
      if (entry.directory) continue;
      add(entry.filename, entry.uncompressedSize, () =>
        entry.getData(new BlobWriter()),
      );
    }
  }
  for (const f of looseFiles) {
    add(f.webkitRelativePath || f.name, f.size, async () => f);
  }

  const close = async () => {
    await Promise.all(readers.map((r) => r.close().catch(() => {})));
  };
  return { images, duplicates, unsupported, close };
}

/**
 * Reads the Excel and indexes the images, then matches them. Nothing is uploaded yet; the
 * result is shown to the admin for review before the import starts.
 */
export async function analyzeFiles(excelFile, zipFiles = [], looseFiles = []) {
  const aoa = await readExcel(excelFile);
  if (aoa.length === 0) throw new Error("The Excel file is empty.");

  const header = aoa[0] || [];
  const col = {};
  header.forEach((h, i) => {
    const key = normHeader(h);
    if (key) col[key] = i; // last duplicate header wins, as on the server
  });
  if (col["PROJECT NAME"] == null) {
    throw new Error('The first row must be headers and include "PROJECT NAME".');
  }
  const get = (cells, name) =>
    col[name] == null ? "" : cellText(cells[col[name]]);

  const rows = [];
  const invalidRows = [];
  const warnings = [];
  const bySlug = new Map();
  const byName = new Map();

  for (let i = 1; i < aoa.length; i++) {
    const cells = aoa[i] || [];
    if (cells.every((c) => cellText(c) === "")) continue;
    const excelRow = i + 1;
    const name = get(cells, "PROJECT NAME");
    let reason = null;
    if (!name) reason = "Project name is required";
    else if (!get(cells, "BUILDER NAME")) reason = "Builder name is required";
    else if (!get(cells, "CITY NAME")) reason = "City name is required";
    if (reason) {
      invalidRows.push({ excelRow, name, reason });
      continue;
    }
    const slug = generateSlug(name);
    const row = { excelRow, name, slug, cells, images: [] };
    if (bySlug.has(slug)) {
      warnings.push(
        `Row ${excelRow} (${name}) is the same project as row ${bySlug.get(slug).excelRow}; the later row's data wins.`,
      );
    } else {
      bySlug.set(slug, row);
      byName.set(name.toLowerCase(), row);
    }
    rows.push(row);
  }

  const index = await indexImages(zipFiles, looseFiles);
  const orphanImages = [];
  let badNames = 0;
  for (const img of index.images) {
    const parsed = parseImageName(img.name);
    if (!parsed) {
      badNames++;
      continue; // the server ignores these too
    }
    img.type = parsed.type;
    const guess = parsed.key.replace(/-/g, " ").trim();
    const row =
      bySlug.get(generateSlug(guess)) || byName.get(guess.toLowerCase());
    if (row) row.images.push(img);
    else orphanImages.push(img);
  }
  if (index.duplicates) {
    warnings.push(
      `${index.duplicates} image(s) have the same file name as another image and will be ignored.`,
    );
  }
  if (index.unsupported) {
    warnings.push(
      `${index.unsupported} file(s) are not JPG/PNG/WEBP/GIF/BMP images and will be ignored.`,
    );
  }
  if (badNames) {
    warnings.push(
      `${badNames} image(s) are not named like ProjectName_ImageType_… and will be ignored.`,
    );
  }

  const matchedImages = rows.reduce((n, r) => n + r.images.length, 0);
  const plan = {
    header,
    rows,
    invalidRows,
    warnings,
    orphanImages,
    matchedImages,
    rowsWithoutImages: rows.filter((r) => r.images.length === 0),
    totalImageBytes: index.images.reduce((n, i) => n + (i.size || 0), 0),
    close: index.close,
  };
  plan.batches = buildBatches(plan);
  return plan;
}

/**
 * Splits rows and images into batches. A project's images always go in its own batch or a
 * later one, so the project exists before its images are saved; a project with many images is
 * spread over several batches.
 */
function buildBatches(plan) {
  const batches = [];
  let cur = { rows: [], images: [] };
  const flush = () => {
    if (cur.rows.length || cur.images.length) batches.push(cur);
    cur = { rows: [], images: [] };
  };
  for (const row of plan.rows) {
    if (cur.rows.length >= BATCH_MAX_ROWS || cur.images.length >= BATCH_MAX_IMAGES) flush();
    cur.rows.push(row);
    for (const img of row.images) {
      if (cur.images.length >= BATCH_MAX_IMAGES) flush();
      cur.images.push(img);
    }
  }
  // Images for projects that are not in this Excel: the server matches them to existing projects.
  for (const img of plan.orphanImages) {
    if (cur.images.length >= BATCH_MAX_IMAGES) flush();
    cur.images.push(img);
  }
  flush();
  return batches;
}

// ---------------------------------------------------------------------------
// Step 2: prepare one batch (small Excel + small zip of shrunk images)
// ---------------------------------------------------------------------------

function canvasToBlob(canvas, type, quality) {
  if (typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Shrinks an image to the box the server will resize it to, so the server does almost no work
 * and far fewer bytes are uploaded. Images already small enough (or that the browser cannot
 * decode) are sent unchanged.
 */
async function shrinkImage(blob, imageType, name) {
  const [boxW, boxH] = targetBox(imageType);
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }
  try {
    const scale = Math.min(boxW / bitmap.width, boxH / bitmap.height);
    if (scale >= 1) return blob;
    const outW = Math.max(1, Math.round(bitmap.width * scale));
    const outH = Math.max(1, Math.round(bitmap.height * scale));

    // Halve in steps first: a single huge downscale aliases badly.
    let source = bitmap;
    let w = bitmap.width;
    let h = bitmap.height;
    while (Math.floor(w / 2) >= outW && Math.floor(h / 2) >= outH) {
      w = Math.floor(w / 2);
      h = Math.floor(h / 2);
      const step = makeCanvas(w, h);
      const sctx = step.getContext("2d");
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(source, 0, 0, w, h);
      source = step;
    }
    const canvas = makeCanvas(outW, outH);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, outW, outH);

    // PNG keeps transparency (logos); everything else becomes a high-quality JPEG.
    const isPng = blob.type === "image/png" || /\.png$/i.test(name);
    const out = await canvasToBlob(
      canvas,
      isPng ? "image/png" : "image/jpeg",
      isPng ? undefined : 0.92,
    );
    return out && out.size > 0 && out.size < blob.size ? out : blob;
  } finally {
    bitmap.close?.();
  }
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function prepareBatch(batch, header) {
  const aoa = [header, ...batch.rows.map((r) => r.cells)];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Projects");
  const excel = new Blob([XLSX.write(wb, { type: "array", bookType: "xlsx" })], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  // Server reports "Row N" of this small sheet; map it back to the admin's Excel row.
  const rowMap = new Map(batch.rows.map((r, i) => [i + 2, r]));

  let zip = null;
  if (batch.images.length) {
    const shrunk = await mapPool(batch.images, IMAGE_CONCURRENCY, async (img) => {
      try {
        return await shrinkImage(await img.getBlob(), img.type, img.name);
      } catch {
        return null;
      }
    });
    // Stored (no compression, sizes in the local header): images are already compressed, and
    // the server reads the zip with java.util.zip.ZipInputStream.
    const writer = new ZipWriter(new BlobWriter("application/zip"), {
      level: 0,
      dataDescriptor: false,
      useWebWorkers: false,
    });
    for (let i = 0; i < batch.images.length; i++) {
      if (shrunk[i]) await writer.add(batch.images[i].name, new BlobReader(shrunk[i]));
    }
    zip = await writer.close();
  }
  return { excel, zip, rowMap };
}

// ---------------------------------------------------------------------------
// Step 3: send batches
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class RetryableError extends Error {}

async function sendBatch(prepared, apiUrl, onJob, onUploadPct) {
  const fd = new FormData();
  fd.append("file", prepared.excel, "projects-batch.xlsx");
  if (prepared.zip) fd.append("imagesZip", prepared.zip, "images-batch.zip");

  let job;
  try {
    ({ data: job } = await axios.post(`${apiUrl}excel-upload/projects/async`, fd, {
      withCredentials: true,
      timeout: 600000,
      onUploadProgress: (e) => e.total && onUploadPct(e.loaded / e.total),
    }));
  } catch (err) {
    const status = err.response?.status;
    if (!status || status >= 500 || status === 429 || status === 408) {
      throw new RetryableError(err.message);
    }
    throw new Error(err.response?.data?.message || err.message);
  }

  while (!job?.done) {
    await sleep(POLL_MS);
    try {
      ({ data: job } = await axios.get(
        `${apiUrl}excel-upload/projects/jobs/${job.jobId}`,
        { withCredentials: true, timeout: 30000 },
      ));
    } catch (err) {
      // 404 = server restarted and lost the job; re-sending is safe.
      const status = err.response?.status;
      if (status === 404 || !status || status >= 500) {
        throw new RetryableError(err.message);
      }
      throw err;
    }
    onJob(job);
  }
  if (job.isSuccess !== 1 && /too many imports/i.test(job.message || "")) {
    throw new RetryableError(job.message);
  }
  return job;
}

export function resumeKey(excelFile, zipFiles, looseFiles) {
  const sig = [excelFile, ...zipFiles]
    .map((f) => `${f.name}:${f.size}:${f.lastModified}`)
    .join("|");
  return `mpf-bulk-import:${sig}:${looseFiles.length}:${BATCH_MAX_ROWS}:${BATCH_MAX_IMAGES}`;
}

/**
 * Runs every batch from startBatch on. onUpdate receives a progress snapshot after each change;
 * shouldStop() is checked between batches. Returns the totals and every error.
 */
export async function runImport(plan, { apiUrl, startBatch = 0, storageKey, onUpdate, shouldStop }) {
  const { batches, header } = plan;
  const state = {
    batchIndex: startBatch,
    totalBatches: batches.length,
    stage: "preparing",
    uploadPct: 0,
    job: null,
    rowsDone: batches.slice(0, startBatch).reduce((n, b) => n + b.rows.length, 0),
    imagesDone: batches.slice(0, startBatch).reduce((n, b) => n + b.images.length, 0),
    created: 0,
    updated: 0,
    imagesSaved: 0,
    imagesSkipped: 0,
    rowErrors: [],
    batchErrors: [],
    stopped: false,
    startedAt: Date.now(),
    startBatch,
  };
  const emit = () => onUpdate?.({ ...state });

  const prepare = (i) =>
    prepareBatch(batches[i], header).catch((e) => ({ error: e }));

  let nextPrepared = startBatch < batches.length ? prepare(startBatch) : null;
  for (let i = startBatch; i < batches.length; i++) {
    const batch = batches[i];
    state.batchIndex = i;
    state.stage = "preparing";
    state.uploadPct = 0;
    state.job = null;
    emit();

    const prepared = await nextPrepared;
    // Shrink the next batch's images while the server saves this one.
    nextPrepared = i + 1 < batches.length ? prepare(i + 1) : null;

    let job = null;
    let failure = prepared.error ? `Could not read files: ${prepared.error.message}` : null;
    for (let attempt = 1; !failure && attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        state.stage = "uploading";
        emit();
        job = await sendBatch(
          prepared,
          apiUrl,
          (j) => {
            state.stage = "saving";
            state.job = j;
            emit();
          },
          (pct) => {
            state.uploadPct = pct;
            emit();
          },
        );
        break;
      } catch (err) {
        if (err instanceof RetryableError && attempt < MAX_ATTEMPTS) {
          state.stage = `retrying (attempt ${attempt + 1} of ${MAX_ATTEMPTS})`;
          emit();
          await sleep(3000 * 2 ** (attempt - 1));
        } else {
          failure = err.message || "Upload failed";
        }
      }
    }

    const names = batch.rows.map((r) => r.name);
    if (failure || job?.isSuccess !== 1) {
      const msg = failure || job?.message || "Upload failed";
      state.batchErrors.push({ batch: i + 1, projects: names, message: msg });
      batch.rows.forEach((r) =>
        state.rowErrors.push({ excelRow: r.excelRow, name: r.name, error: `Batch failed: ${msg}` }),
      );
    } else {
      state.created += job.created || 0;
      state.updated += job.updated || 0;
      state.imagesSaved += job.imagesSaved || 0;
      state.imagesSkipped += job.imagesSkipped || 0;
      for (const e of job.errors || []) {
        const m = /^Row (\d+):\s*(.*)$/s.exec(e);
        const row = m ? prepared.rowMap.get(Number(m[1])) : null;
        state.rowErrors.push({
          excelRow: row?.excelRow ?? "",
          name: row?.name ?? "",
          error: m ? m[2] : e,
        });
      }
    }
    state.rowsDone += batch.rows.length;
    state.imagesDone += batch.images.length;
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(i + 1));
      } catch {
        /* storage full or disabled: resume just won't be offered */
      }
    }
    emit();

    if (shouldStop?.() && i + 1 < batches.length) {
      state.stopped = true;
      state.batchIndex = i + 1;
      nextPrepared?.catch(() => {});
      break;
    }
  }
  if (!state.stopped && storageKey) {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }
  state.stage = "done";
  emit();
  return state;
}

// ---------------------------------------------------------------------------
// Reports and template
// ---------------------------------------------------------------------------

export function downloadReport(plan, result) {
  const wb = XLSX.utils.book_new();
  const summary = [
    ["Projects in Excel", plan.rows.length + plan.invalidRows.length],
    ["Skipped before upload (missing data)", plan.invalidRows.length],
    ["Created", result.created],
    ["Updated", result.updated],
    ["Rows with errors", result.rowErrors.length],
    ["Images saved", result.imagesSaved],
    ["Images skipped (no matching project)", result.imagesSkipped],
    ["Batches failed", result.batchErrors.length],
    ["Stopped early", result.stopped ? "Yes" : "No"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Item", "Count"], ...summary]), "Summary");
  const errs = [
    ...plan.invalidRows.map((r) => [r.excelRow, r.name, `Not uploaded: ${r.reason}`]),
    ...result.rowErrors.map((r) => [r.excelRow, r.name, r.error]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([["Excel row", "Project", "Problem"], ...errs]),
    "Row problems",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Excel row", "Project"],
      ...plan.rowsWithoutImages.map((r) => [r.excelRow, r.name]),
    ]),
    "Projects without images",
  );
  XLSX.writeFile(wb, `project-import-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

const TEMPLATE_HEADERS = [
  "PROJECT NAME", "BUILDER NAME", "CITY NAME", "STATE NAME", "COUNTRY NAME",
  "PROJECT STATUS NAME", "PROPERTY TYPE NAME", "PROJECT LOCALITY", "PROJECT CONFIGURATION",
  "PROJECT PRICE", "RERA NO", "RERA WEBSITE", "IVR NO", "PROJECT ABOUT SHORT DESCRIPTION",
  "PROJECT WALKTHROUGH DESCRIPTION", "FLOOR PLAN DESCRIPTION", "LOCATION DESCRIPTION",
  "AMENITY DESCRIPTION", "PROJECT AMENITIES", "LOCATION ADVANTAGE", "META TITLE",
  "META DESCRIPTION", "META KEYWORD", "Question 1", "Answer 1", "Question 2", "Answer 2",
];

export function downloadTemplate() {
  const example = {
    "PROJECT NAME": "Green Valley Heights",
    "BUILDER NAME": "ABC Developers",
    "CITY NAME": "Gurugram",
    "STATE NAME": "Haryana",
    "COUNTRY NAME": "India",
    "PROJECT STATUS NAME": "Under Construction",
    "PROPERTY TYPE NAME": "Residential",
    "PROJECT LOCALITY": "Sector 65",
    "PROJECT CONFIGURATION": "3 BHK-1333 sq.ft, 4 BHK-1744 sq.ft",
    "PROJECT PRICE": "2.5 Cr",
    "PROJECT AMENITIES": "Swimming-Pool_Gymnasium_Club-House",
    "LOCATION ADVANTAGE": "Golf-Course-Road-2.5-Km_Cyber-Hub-8-Km",
    "Question 1": "Is the project RERA approved?",
    "Answer 1": "Yes.",
  };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_HEADERS.map((h) => example[h] ?? "")]),
    "Projects",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Image file name", "Saved as"],
      ["Green-Valley-Heights_Gallery-1_My-Property-Fact.jpg", "Gallery image (any type not listed below)"],
      ["Green-Valley-Heights_Desktop-1_My-Property-Fact.jpg", "Desktop banner (2508×1200)"],
      ["Green-Valley-Heights_Mobile-1_My-Property-Fact.jpg", "Mobile banner (800×800)"],
      ["Green-Valley-Heights_Logo_My-Property-Fact.png", "Project logo (792×203)"],
      ["Green-Valley-Heights_Location_My-Property-Fact.jpg", "Location map (1200×800)"],
      ["Green-Valley-Heights_Thumbnail_My-Property-Fact.jpg", "Thumbnail (800×800)"],
      [],
      ["Rule", "The part before the first _ is the project name with - instead of spaces. The part after it is the image type."],
      ["Rule", "Put all images in one or more zips, or one folder. Sub-folders are fine."],
    ]),
    "Image names",
  );
  XLSX.writeFile(wb, "project-upload-template.xlsx");
}
