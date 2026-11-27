/**
 * Minimal MCP server (Streamable HTTP transport, stateless, JSON responses) for the Property
 * Automation APIs. Used by src/app/api/property-automation/mcp/[key]/route.js only.
 *
 * MCP clients (ChatGPT developer-mode connectors, Claude custom connectors) pass tool arguments
 * as JSON and cannot upload files, so the tools take property rows as JSON plus image URLs.
 * This module builds the Excel workbook (exceljs) and the images ZIP (@zip.js/zip.js) on the
 * server and forwards them to Spring Boot as the usual multipart upload (excelFile / imagesZip),
 * signed in server-side with the integration account (same as the /gpt/ routes).
 *
 * Extra environment (server-side only):
 *   PROPERTY_AUTOMATION_MCP_KEY                          secret path segment of the MCP URL (>= 24 chars)
 *   PROPERTY_AUTOMATION_MCP_ALLOW_PRIVATE_IMAGE_HOSTS    "true" only for local tests (default: public https hosts only)
 */
import dns from "node:dns/promises";
import net from "node:net";
import ExcelJS from "exceljs";
import { forwardWithServerJwt, download } from "./gptActions";
import { isValidJobId, uploadRateExceeded } from "./gateway";
import { buildImageReport, readZip, writeCanonicalZip } from "./imageStudio";
import { createSlot, getSlot, MAX_UPLOAD_BYTES } from "./uploadStore";
import { getPropertyDetails, DetailsInputError } from "./propertyDetails";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

/* ------------------------------------------------------------------ workbook columns (backend template) */

/** Exact header text of the backend template (GET /template?format=json), in template order. */
const HEADERS = [
  "ID", "BUILDER NAME", "PROJECT NAME", "PROPERTY TYPE NAME", "PROJECT STATUS NAME", "PROJECT CONFIGURATION",
  "PROJECT LOCALITY", "CITY NAME", "STATE NAME", "COUNTRY NAME", "RERA NO", "RERA WEBSITE", "IVR NO",
  "PROJECT PRICE", "META TITLE", "META DESCRIPTION", "META KEYWORD", "AMENITY DESCRIPTION",
  "LOCATION DESCRIPTION", "FLOOR PLAN DESCRIPTION", "BUILDER DESCRIPTION", "PROJECT Amenities",
  "LOCATION ADVANTAGE", "PROJECT WALKTHROUGH DESCRIPTION",
  "Question 1", "Answer 1", "Question 2", "Answer 2", "Question 3", "Answer 3", "Question 4", "Answer 4",
];
const OPTIONAL_EXTRA = ["PROJECT ABOUT SHORT DESCRIPTION"];
const REQUIRED = ["BUILDER NAME", "PROJECT NAME", "PROPERTY TYPE NAME", "PROJECT STATUS NAME", "CITY NAME", "STATE NAME", "COUNTRY NAME"];
const norm = (h) => String(h).trim().replace(/\s+/g, " ").toUpperCase();
const HEADER_BY_NORM = new Map([...HEADERS, ...OPTIONAL_EXTRA].map((h) => [norm(h), h]));

const MAX_PROPERTIES = 50;
const MAX_IMAGES = 200;
/** Inline base64 files are for small files only (the whole JSON-RPC body passes the 10 MB middleware limit). */
const MAX_INLINE_BYTES = 4 * 1024 * 1024;

/* ------------------------------------------------------------------ tool definitions */

const propertyItemSchema = {
  type: "object",
  description:
    "One project = one Excel row. Keys are the exact template headers (case/space-insensitive). " +
    "Required: " + REQUIRED.join(", ") + ". Values are plain text.",
  properties: Object.fromEntries(
    [...HEADERS, ...OPTIONAL_EXTRA].map((h) => [h, { type: "string", description: REQUIRED.includes(h) ? "required" : "optional" }]),
  ),
  required: REQUIRED,
  additionalProperties: false,
};

const imageItemSchema = {
  type: "object",
  properties: {
    projectName: { type: "string", description: "Exactly the PROJECT NAME of the row this image belongs to." },
    type: {
      type: "string",
      description:
        "Image type token: Logo, Thumbnail, Location, Desktop-1, Desktop-2…, Mobile-1, Mobile-2…, Gallery-1, Gallery-2…. " +
        "Number repeated types inside the token (Gallery-1), never Gallery_1.",
    },
    url: { type: "string", description: "Public https URL of a JPEG, PNG or WEBP image (min 100 px per side)." },
  },
  required: ["projectName", "type", "url"],
  additionalProperties: false,
};

/** One transferred file. Exactly one of uploadId, download_url (ChatGPT file param) or base64. */
const fileInputSchema = (what) => ({
  type: "object",
  description:
    `The ${what}, given ONE way: {uploadId} from create_upload_session (any client, any size up to the limit); ` +
    "{download_url, file_id} (ChatGPT attaches this automatically for a file the user uploaded in the chat); " +
    "or {base64, filename} (small files only, under about 1 MB).",
  properties: {
    uploadId: { type: "string", description: "uploadId from create_upload_session, after the file was PUT to its uploadUrl." },
    download_url: { type: "string", description: "ChatGPT file download URL (set by ChatGPT)." },
    file_id: { type: "string", description: "ChatGPT file id (set by ChatGPT)." },
    base64: { type: "string", description: "File content, base64 encoded (small files only)." },
    filename: { type: "string", description: "Original file name (optional)." },
  },
  additionalProperties: false,
});

const batchInput = {
  properties: {
    type: "array", minItems: 1, maxItems: MAX_PROPERTIES, items: propertyItemSchema,
    description: "JSON mode: property rows. Use either 'properties' or 'workbook', not both.",
  },
  images: {
    type: "array", maxItems: MAX_IMAGES, items: imageItemSchema,
    description: "JSON mode only: optional image URLs, downloaded by the server and zipped with the correct file names. Use either 'images' or 'imagesZip'.",
  },
  workbook: fileInputSchema("Excel workbook (.xlsx, sheet 'Sheet1', template headers). It is forwarded to the importer unchanged"),
  imagesZip: fileInputSchema(
    "image ZIP. Files named <Project-Key>_<Type>_My-Property-Fact.<jpg|png|webp>, optionally inside a <Project-Key>/ folder. " +
    "Types: Desktop-1 (day) / Desktop-2 (night) 2225x1065, Mobile-1 (day) / Mobile-2 (night) 2700x2700, Location 815x815, " +
    "Thumbnail 400x400, Logo 390x100, Gallery-N unchanged originals. Image Studio names Desktop-Banner / Desktop-Banner-2 are accepted and renamed",
  ),
  imageSourcePermission: {
    type: "object",
    description: "Required whenever images are sent: confirm the images may be published and name their source.",
    properties: {
      confirmed: { type: "boolean", description: "true = the images are owned or licensed for use on My Property Fact." },
      source: { type: "string", description: "Where the images come from, e.g. 'MPF Image Studio' or 'Builder supplied (email 2026-11-20)'." },
    },
    required: ["confirmed", "source"],
    additionalProperties: false,
  },
  imageSpecPolicy: {
    type: "string", enum: ["strict", "warn"],
    description: "strict (default) = an image whose size differs from its Image Studio spec is an ERROR and blocks import; warn = report it as a WARNING.",
  },
};

const FILE_PARAMS_META = { "openai/fileParams": ["workbook", "imagesZip"] };

export const TOOLS = [
  {
    name: "get_template",
    title: "Get property template",
    description:
      "Returns the Excel column specification (headers, required columns, max lengths, targets) and the image naming rules. Call this first.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "create_upload_session",
    title: "Create file upload slots",
    description:
      "Creates one-time upload slots for an Excel workbook and/or an image ZIP. PUT each file's bytes to its uploadUrl " +
      "(the user can run the returned curl command), then pass {uploadId} as 'workbook' / 'imagesZip' to validate_properties " +
      "and import_properties. Slots expire after 30 minutes, can be written once and can be reused by validate and import.",
    inputSchema: {
      type: "object",
      properties: {
        files: { type: "array", items: { type: "string", enum: ["workbook", "imagesZip"] }, minItems: 1, maxItems: 2, description: "Default: both." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "validate_properties",
    title: "Validate properties (no writes)",
    description:
      "Validates a batch against the live My Property Fact master data and the MPF Image Studio image specs. Writes nothing. " +
      "Give EITHER 'properties' (JSON rows, optional 'images' URLs) OR 'workbook' (Excel file); images as 'imagesZip' (ZIP file) or 'images'. " +
      "Response: valid (overall), imageValidation (per-image format, size, integrity, project, spec status, missing assets, " +
      "renames, size stored by the importer) and body (the importer's validation report). " +
      "Fix every ERROR and every DUPLICATE_REVIEW_REQUIRED row before importing. " +
      "Master data must match exactly (city, state, country, property type, project status, amenities such as 'Rain-Water-Harvesting').",
    inputSchema: { type: "object", properties: batchInput, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: FILE_PARAMS_META,
  },
  {
    name: "import_properties",
    title: "Import properties as unpublished drafts",
    description:
      "Validates again and queues the rows for creation as UNPUBLISHED draft projects (asynchronous). Never edits existing projects. " +
      "Same inputs as validate_properties. Only call after validate_properties returned valid=true. " +
      "Any image ERROR blocks the whole call (422 IMAGE_VALIDATION_FAILED, nothing sent to the importer). " +
      "Returns jobId (HTTP 202); then poll get_import_job until the status is " +
      "COMPLETED, PARTIALLY_COMPLETED, FAILED or VALIDATION_FAILED, and call get_import_results. " +
      "409 DUPLICATE_BATCH = already submitted (poll its jobId). 422 = nothing imported; read 'validation' / 'imageValidation'.",
    inputSchema: {
      type: "object",
      properties: {
        ...batchInput,
        idempotencyKey: { type: "string", description: "Unique key for this batch, e.g. batch-2026-11-24-001. Reuse it only when retrying the same batch." },
        batchName: { type: "string", description: "Optional label." },
        allowPartial: { type: "boolean", description: "true = import valid rows even if other rows are blocked or duplicates. Default false." },
        dryRun: { type: "boolean", description: "true = validate only, write nothing. Default false." },
      },
      required: ["idempotencyKey"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    _meta: FILE_PARAMS_META,
  },
  {
    name: "get_property_details",
    title: "Get saved property details (read-only)",
    description:
      "READ-ONLY. Returns one saved project by its id, unpublished drafts included: name, slug, RERA, builder, full location, " +
      "publication status, project status, configuration, amenities, location advantages, floor plans, FAQ pairs, descriptions, SEO metadata " +
      "and every image record (slot, order, file name, asset id). Each stored image file is inspected (format, pixel size, bytes, sha256) " +
      "and compared with the MPF Image Studio sizes (gallery = original kept). Reports missing, duplicated, wrongly assigned and resized images " +
      "plus field-level findings. Optional compareWorkbook / compareImagesZip compare the saved project with the source files. " +
      "Direct image URLs are returned only for published projects. Never creates, updates, deletes or publishes anything.",
    inputSchema: {
      type: "object",
      properties: {
        propertyId: { type: "integer", minimum: 1, description: "Project id, e.g. 1394 (projectId from get_import_results)." },
        inspectImages: { type: "boolean", description: "Download and measure the stored image files. Default true." },
        compareWorkbook: fileInputSchema("source Excel workbook to compare against (optional)"),
        compareImagesZip: fileInputSchema("source image ZIP to compare against (optional)"),
      },
      required: ["propertyId"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: { "openai/fileParams": ["compareWorkbook", "compareImagesZip"] },
  },
  {
    name: "get_import_job",
    title: "Get import job status",
    description: "Status of an import job. Terminal statuses: COMPLETED, PARTIALLY_COMPLETED, FAILED, VALIDATION_FAILED.",
    inputSchema: { type: "object", properties: { jobId: { type: "string", description: "jobId UUID from import_properties" } }, required: ["jobId"], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_import_results",
    title: "Get import results",
    description:
      "Per-property results of an import job. A property succeeded only if importStatus = CREATED_DRAFT, draft = true and verified = true. " +
      "Report projectId, slug, builderCreated, warnings and unappliedFields for human review.",
    inputSchema: { type: "object", properties: { jobId: { type: "string", description: "jobId UUID from import_properties" } }, required: ["jobId"], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

export const SERVER_INSTRUCTIONS =
  "My Property Fact property automation (testing). Imports create UNPUBLISHED drafts only; publishing is a manual admin step. " +
  "Workflow: get_template -> validate_properties (repeat until valid=true) -> import_properties (unique idempotencyKey) -> " +
  "get_import_job until terminal -> get_import_results -> get_property_details(projectId) to review the saved draft (read-only). Never invent RERA numbers, prices or facts; leave unknown optional fields empty. " +
  "Files: pass an Excel workbook and an image ZIP as 'workbook' / 'imagesZip' (ChatGPT file attachments are passed automatically; " +
  "otherwise call create_upload_session and have the user PUT the files). Images are checked against the MPF Image Studio specs " +
  "and need imageSourcePermission {confirmed: true, source}. " +
  "Use only jobId from responses (statusUrl/resultsUrl are internal backend paths).";

/* ------------------------------------------------------------------ input checks */

class ToolInputError extends Error {}

function normalizeProperties(list) {
  if (!Array.isArray(list) || list.length === 0) throw new ToolInputError("'properties' must be a non-empty array.");
  if (list.length > MAX_PROPERTIES) throw new ToolInputError(`At most ${MAX_PROPERTIES} properties per call.`);
  return list.map((row, i) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new ToolInputError(`properties[${i}] must be an object.`);
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      const header = HEADER_BY_NORM.get(norm(k));
      if (!header) throw new ToolInputError(`properties[${i}] has unknown key "${k}". Allowed keys: ${[...HEADERS, ...OPTIONAL_EXTRA].join(", ")}.`);
      if (v === null || v === undefined) continue;
      if (typeof v === "object") throw new ToolInputError(`properties[${i}]["${header}"] must be text.`);
      out[header] = String(v);
    }
    return out;
  });
}

function projectKey(name) {
  return String(name).trim().replace(/[\\/:*?"<>|_]/g, "").replace(/\s+/g, "-");
}

/* ------------------------------------------------------------------ workbook + zip */

async function buildWorkbook(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  const headers = [...HEADERS];
  for (const extra of OPTIONAL_EXTRA) if (rows.some((r) => r[extra] !== undefined)) headers.push(extra);
  ws.addRow(headers);
  for (const r of rows) ws.addRow(headers.map((h) => (r[h] === undefined ? null : r[h])));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::") return true;
  if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
  return v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb") || v.startsWith("ff");
}

async function checkImageUrl(url) {
  const allowPrivate = process.env.PROPERTY_AUTOMATION_MCP_ALLOW_PRIVATE_IMAGE_HOSTS === "true";
  if (url.protocol !== "https:" && !(allowPrivate && url.protocol === "http:")) return "only https image URLs are accepted";
  if (url.username || url.password) return "URLs with credentials are not accepted";
  if (allowPrivate) return null;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host.toLowerCase() === "localhost" || host.toLowerCase().endsWith(".localhost")) return "private hosts are not accepted";
  let addrs;
  try {
    addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  } catch {
    return "host name could not be resolved";
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address))) return "private or internal addresses are not accepted";
  return null;
}

function sniffImage(bytes) {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

async function downloadImage(rawUrl, budget, timeoutMs) {
  let url;
  try { url = new URL(rawUrl); } catch { return { error: "invalid URL" }; }
  for (let hop = 0; hop < 4; hop++) {
    const bad = await checkImageUrl(url);
    if (bad) return { error: bad };
    let res;
    try {
      res = await fetch(url, { redirect: "manual", cache: "no-store", headers: { Accept: "image/*" }, signal: AbortSignal.timeout(timeoutMs) });
    } catch (err) {
      return { error: err?.name === "TimeoutError" ? "download timed out" : "download failed" };
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      try { await res.body?.cancel(); } catch { /* ignore */ }
      url = new URL(res.headers.get("location"), url);
      continue;
    }
    if (!res.ok || !res.body) return { error: `HTTP ${res.status}` };
    const chunks = [];
    let size = 0;
    for await (const chunk of res.body) {
      size += chunk.length;
      if (size > budget) return { tooLarge: true };
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    const ext = sniffImage(bytes);
    if (!ext) return { error: "not a JPEG, PNG or WEBP image" };
    return { bytes, ext };
  }
  return { error: "too many redirects" };
}

/** JSON mode: downloads image URLs into files named by the convention (checked later like a ZIP). */
async function downloadUrlImages(images, rows, budget, timeoutMs) {
  if (!Array.isArray(images) || images.length === 0) return [];
  if (images.length > MAX_IMAGES) throw new ToolInputError(`At most ${MAX_IMAGES} images per call.`);
  const names = new Set(rows.map((r) => (r["PROJECT NAME"] || "").trim().toLowerCase()));
  const used = new Set();
  const files = [];
  let remaining = budget;
  for (const [i, img] of images.entries()) {
    if (!img || typeof img.projectName !== "string" || typeof img.type !== "string" || typeof img.url !== "string") {
      throw new ToolInputError(`images[${i}] needs projectName, type and url.`);
    }
    if (!names.has(img.projectName.trim().toLowerCase())) {
      throw new ToolInputError(`images[${i}].projectName "${img.projectName}" does not match any PROJECT NAME in 'properties'.`);
    }
    const type = img.type.trim();
    if (!/^[A-Za-z]+(-?\d{1,3})?$/.test(type)) {
      throw new ToolInputError(`images[${i}].type "${img.type}" is not a valid type token (e.g. Logo, Thumbnail, Desktop-1, Gallery-2).`);
    }
    const key = projectKey(img.projectName);
    const dedupe = `${key}_${type}`.toLowerCase();
    if (used.has(dedupe)) throw new ToolInputError(`Two images for "${img.projectName}" use type "${type}". Number them (Gallery-1, Gallery-2).`);
    used.add(dedupe);
    const d = await downloadImage(img.url, remaining, timeoutMs);
    if (d.tooLarge) throw new ToolInputError(`Images exceed the ${budget}-byte limit for one request. Send fewer or smaller images.`);
    if (d.error) throw new ToolInputError(`images[${i}] (${img.url.slice(0, 120)}): ${d.error}.`);
    remaining -= d.bytes.length;
    const fileName = `${key}_${type}_My-Property-Fact.${d.ext}`;
    files.push({ entryName: fileName, folder: "", fileName, bytes: d.bytes, origin: img.url.slice(0, 300) });
  }
  return files;
}

/* ------------------------------------------------------------------ file transfer */

/** Bytes of one transferred file: upload slot, ChatGPT download_url or inline base64. */
async function resolveFile(cfg, input, kind, budget) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ToolInputError(`'${kind}' must be an object.`);
  const ways = ["uploadId", "download_url", "base64"].filter((k) => typeof input[k] === "string" && input[k].trim());
  if (ways.length !== 1) throw new ToolInputError(`'${kind}' needs exactly one of uploadId, download_url or base64.`);
  const name = (n) => String(n || "").split(/[\\/]/).pop().replace(/[\u0000-\u001f"]/g, "").trim().slice(0, 200);
  const fallback = kind === "workbook" ? "properties.xlsx" : "images.zip";

  if (ways[0] === "uploadId") {
    const slot = getSlot(input.uploadId.trim());
    if (!slot) throw new ToolInputError(`'${kind}.uploadId' is unknown or expired. Call create_upload_session again.`);
    if (slot.kind !== kind) throw new ToolInputError(`'${kind}.uploadId' is a ${slot.kind} slot.`);
    if (!slot.bytes) throw new ToolInputError(`Nothing was uploaded to '${kind}.uploadId' yet. PUT the file to its uploadUrl first.`);
    if (slot.bytes.length > budget) throw new ToolInputError(`The ${kind} is larger than the ${budget}-byte budget left for this request.`);
    return { bytes: slot.bytes, filename: slot.filename || fallback, transfer: { method: "upload-session", bytes: slot.bytes.length, sha256: slot.sha256 } };
  }
  if (ways[0] === "download_url") {
    const d = await download(input.download_url.trim(), budget, cfg.uploadTimeoutMs);
    if (d.tooLarge) throw new ToolInputError(`The ${kind} is larger than the ${budget}-byte budget left for this request.`);
    if (d.error) throw new ToolInputError(`'${kind}.download_url': ${d.error}.`);
    let host = "";
    try { host = new URL(input.download_url).hostname; } catch { /* ignore */ }
    return {
      bytes: d.bytes,
      filename: name(input.filename) || fallback,
      transfer: { method: "chatgpt-file", host, fileId: typeof input.file_id === "string" ? input.file_id.slice(0, 100) : null, bytes: d.bytes.length },
    };
  }
  const b64 = input.base64.replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new ToolInputError(`'${kind}.base64' is not valid base64.`);
  if (b64.length * 0.75 > Math.min(budget, MAX_INLINE_BYTES)) {
    throw new ToolInputError(`'${kind}.base64' is too large for inline transfer (limit ${MAX_INLINE_BYTES} bytes). Use create_upload_session.`);
  }
  const bytes = Buffer.from(b64, "base64");
  return { bytes, filename: name(input.filename) || fallback, transfer: { method: "inline-base64", bytes: bytes.length } };
}

/** PROJECT NAME values of the uploaded workbook (read only; the workbook is forwarded unchanged). */
async function workbookProjectNames(bytes) {
  if (!(bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b)) throw new ToolInputError("'workbook' is not an .xlsx file.");
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(bytes);
  } catch {
    throw new ToolInputError("'workbook' could not be read as an .xlsx workbook.");
  }
  const ws = wb.getWorksheet("Sheet1") || wb.worksheets[0];
  if (!ws) throw new ToolInputError("'workbook' has no worksheet.");
  let col = 0;
  ws.getRow(1).eachCell((cell, n) => { if (!col && norm(cell.text) === "PROJECT NAME") col = n; });
  if (!col) throw new ToolInputError("'workbook' has no PROJECT NAME column in row 1.");
  const names = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const v = row.getCell(col).text.trim();
    if (v) names.push(v);
  });
  return { names, sheet: ws.name };
}

function publicBaseUrl(request) {
  const configured = String(process.env.PROPERTY_AUTOMATION_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000").split(",")[0].trim();
  const proto = (request.headers.get("x-forwarded-proto") || (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? "http" : "https")).split(",")[0].trim();
  return `${proto}://${host}`;
}

function createUploadSession(request, args) {
  const kinds = Array.isArray(args.files) && args.files.length ? [...new Set(args.files)] : ["workbook", "imagesZip"];
  if (kinds.some((k) => k !== "workbook" && k !== "imagesZip")) throw new ToolInputError("files may contain only 'workbook' and 'imagesZip'.");
  const base = publicBaseUrl(request);
  const uploads = {};
  for (const k of kinds) {
    const s = createSlot(k);
    const uploadUrl = `${base}/api/property-automation/uploads/${s.uploadId}`;
    const example = k === "workbook" ? "properties.xlsx" : "images.zip";
    uploads[k] = {
      uploadId: s.uploadId,
      uploadUrl,
      method: "PUT",
      maxBytes: s.maxBytes,
      expiresAt: s.expiresAt,
      curl: `curl -X PUT -H "Content-Type: application/octet-stream" -H "X-File-Name: ${example}" -H "ngrok-skip-browser-warning: 1" --data-binary "@${example}" "${uploadUrl}"`,
    };
  }
  return {
    httpStatus: 201,
    body: {
      uploads,
      next: "PUT each file to its uploadUrl (or ask the user to run the curl commands, replacing the file names). Then call validate_properties " +
        "with workbook: {uploadId} and imagesZip: {uploadId}. Each slot accepts one upload and expires at expiresAt.",
    },
  };
}

/* ------------------------------------------------------------------ backend calls */

function stripReport(report) {
  if (report && report.workbook && Array.isArray(report.workbook.detectedHeaders)) {
    report.workbook.detectedHeaders = report.workbook.detectedHeaders
      .filter((h) => h.status !== "MAPPED" && h.status !== "FAQ")
      .map(({ column, rawHeader, status }) => ({ column, rawHeader, status }));
    delete report.workbook.unsupportedFields;
  }
}

async function backendJson(res) {
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: text.slice(0, 500) }; }
  stripReport(body);
  stripReport(body?.validation);
  return { httpStatus: res.status, body };
}

async function upload(cfg, request, path, args, withOptions) {
  if (uploadRateExceeded(request)) {
    return { httpStatus: 429, body: { error: "RATE_LIMITED", message: "Too many upload calls. Wait a minute and retry." } };
  }
  const hasRows = args.properties !== undefined;
  const hasWorkbook = args.workbook !== undefined;
  if (hasRows === hasWorkbook) throw new ToolInputError("Give either 'properties' (JSON rows) or 'workbook' (Excel file), exactly one.");
  if (args.images !== undefined && args.imagesZip !== undefined) throw new ToolInputError("Give either 'images' (URLs) or 'imagesZip' (ZIP file), not both.");
  if (args.imageSpecPolicy !== undefined && !["strict", "warn"].includes(args.imageSpecPolicy)) throw new ToolInputError("imageSpecPolicy must be 'strict' or 'warn'.");
  const isImport = path === "/properties/import";

  // 1. workbook: built from JSON rows, or the transferred file forwarded unchanged
  let excel;
  let excelName = "properties.xlsx";
  let projectNames;
  let rows = null;
  const transfer = {};
  if (hasRows) {
    rows = normalizeProperties(args.properties);
    excel = await buildWorkbook(rows);
    projectNames = rows.map((r) => r["PROJECT NAME"] || "").filter(Boolean);
    transfer.workbook = { method: "built-from-json", rows: rows.length };
  } else {
    const f = await resolveFile(cfg, args.workbook, "workbook", MAX_UPLOAD_BYTES.workbook);
    excel = f.bytes;
    excelName = /\.xlsx$/i.test(f.filename) ? f.filename : "properties.xlsx";
    const wb = await workbookProjectNames(excel);
    projectNames = wb.names;
    transfer.workbook = { ...f.transfer, filename: excelName, sheet: wb.sheet, projectRows: wb.names.length };
  }

  // 2. images: ZIP file or downloaded URLs, both checked the same way
  let files = [];
  let zipInfo = null;
  let zipIssues = [];
  let zipUnreadable = false;
  if (args.imagesZip !== undefined) {
    const f = await resolveFile(cfg, args.imagesZip, "imagesZip", Math.min(MAX_UPLOAD_BYTES.imagesZip, cfg.maxUploadBytes - excel.length));
    const z = await readZip(f.bytes);
    files = z.files.map((x) => ({ ...x, origin: "zip" }));
    zipIssues = z.issues;
    zipUnreadable = !!z.unreadable;
    zipInfo = { filename: f.filename, bytes: f.bytes.length, entries: z.entries, imageFiles: z.files.length, extractedBytes: z.extractedBytes, ignoredSystemFiles: z.ignored };
    transfer.imagesZip = f.transfer;
  } else if (args.images !== undefined) {
    if (!rows) throw new ToolInputError("'images' (URLs) can only be used with 'properties'. With a workbook, send 'imagesZip'.");
    files = await downloadUrlImages(args.images, rows, cfg.maxUploadBytes - excel.length, cfg.uploadTimeoutMs);
    transfer.images = { method: "image-urls", count: files.length };
  }

  let imageValidation = null;
  let zip = null;
  if (files.length || zipIssues.length || zipUnreadable) {
    const r = buildImageReport(files, projectNames, {
      specPolicy: args.imageSpecPolicy || "strict",
      sourcePermission: args.imageSourcePermission || null,
      transfer,
      zipInfo,
      zipIssues,
    });
    imageValidation = r.report;
    if (isImport && !imageValidation.valid) {
      console.info("[property-automation/mcp] import blocked by image validation");
      return {
        httpStatus: 422,
        valid: false,
        imageValidation,
        body: {
          error: "IMAGE_VALIDATION_FAILED",
          message: `${imageValidation.summary.errors} image error(s). Nothing was sent to the importer and nothing was written. Fix them and validate again.`,
        },
      };
    }
    zip = await writeCanonicalZip(r.canonicalFiles);
  }
  if (excel.length + (zip ? zip.length : 0) > cfg.maxUploadBytes) {
    throw new ToolInputError(`Workbook + images are ${excel.length + (zip ? zip.length : 0)} bytes; the limit per request is ${cfg.maxUploadBytes}. Split the batch.`);
  }

  const makeBody = () => {
    const fd = new FormData();
    fd.append("excelFile", new Blob([excel], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), excelName);
    if (zip) fd.append("imagesZip", new Blob([zip], { type: "application/zip" }), "images.zip");
    if (withOptions) {
      if (typeof args.batchName === "string" && args.batchName.trim()) fd.append("batchName", args.batchName.slice(0, 200));
      if (typeof args.dryRun === "boolean") fd.append("dryRun", String(args.dryRun));
      if (typeof args.allowPartial === "boolean") fd.append("allowPartial", String(args.allowPartial));
      fd.append("idempotencyKey", String(args.idempotencyKey).slice(0, 200));
    }
    return fd;
  };
  const res = await forwardWithServerJwt(cfg, { method: "POST", path, body: makeBody(), makeBody, timeoutMs: cfg.uploadTimeoutMs });
  const out = await backendJson(res);
  if (!imageValidation) return out;
  const backendOk = out.httpStatus < 400 && out.body?.valid !== false && out.body?.validation?.valid !== false;
  return { httpStatus: out.httpStatus, valid: backendOk && imageValidation.valid, imageValidation, body: out.body };
}

async function callTool(cfg, request, name, args = {}) {
  switch (name) {
    case "get_template": {
      const res = await forwardWithServerJwt(cfg, { method: "GET", path: "/template", query: [["format", "json"]], timeoutMs: cfg.readTimeoutMs });
      return backendJson(res);
    }
    case "create_upload_session":
      return createUploadSession(request, args);
    case "validate_properties":
      return upload(cfg, request, "/properties/validate", args, false);
    case "import_properties":
      if (typeof args.idempotencyKey !== "string" || !args.idempotencyKey.trim()) throw new ToolInputError("idempotencyKey is required.");
      return upload(cfg, request, "/properties/import", args, true);
    case "get_property_details": {
      const unknown = Object.keys(args).filter((k) => !["propertyId", "inspectImages", "compareWorkbook", "compareImagesZip"].includes(k));
      if (unknown.length) throw new ToolInputError(`get_property_details is read-only and does not accept: ${unknown.join(", ")}.`);
      if (!Number.isInteger(args.propertyId) || args.propertyId < 1) throw new ToolInputError("propertyId must be a positive integer, e.g. 1394.");
      if (args.inspectImages !== undefined && typeof args.inspectImages !== "boolean") throw new ToolInputError("inspectImages must be true or false.");
      const sourceWorkbook = args.compareWorkbook !== undefined ? await resolveFile(cfg, args.compareWorkbook, "workbook", MAX_UPLOAD_BYTES.workbook) : null;
      const sourceZip = args.compareImagesZip !== undefined ? await resolveFile(cfg, args.compareImagesZip, "imagesZip", MAX_UPLOAD_BYTES.imagesZip) : null;
      try {
        return await getPropertyDetails(cfg, args, { sourceWorkbook, sourceZip });
      } catch (err) {
        if (err instanceof DetailsInputError) throw new ToolInputError(err.message);
        throw err;
      }
    }
    case "get_import_job":
    case "get_import_results": {
      if (!isValidJobId(args.jobId)) throw new ToolInputError("jobId must be the UUID returned by import_properties.");
      const path = name === "get_import_job" ? `/jobs/${args.jobId}` : `/jobs/${args.jobId}/results`;
      const res = await forwardWithServerJwt(cfg, { method: "GET", path, timeoutMs: cfg.readTimeoutMs });
      return backendJson(res);
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ JSON-RPC */

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

/** Handles one JSON-RPC message. Returns a response object, or null for notifications. */
export async function handleMessage(cfg, request, msg) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(msg?.id, -32600, "Invalid Request");
  }
  const isNotification = msg.id === undefined || msg.id === null;
  if (isNotification) return null;
  const { id, method, params = {} } = msg;

  switch (method) {
    case "initialize": {
      const requested = params?.protocolVersion;
      return rpcResult(id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "mpf-property-automation", title: "My Property Fact Property Automation (testing)", version: "1.2.0" },
        instructions: SERVER_INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const name = params?.name;
      if (!TOOLS.some((t) => t.name === name)) return rpcError(id, -32602, `Unknown tool: ${name}`);
      try {
        const out = await callTool(cfg, request, name, params?.arguments || {});
        const isError = out.httpStatus >= 400;
        console.info(`[property-automation/mcp] tools/call ${name} -> ${out.httpStatus}`);
        return rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(out) }],
          structuredContent: out,
          isError,
        });
      } catch (err) {
        if (err instanceof ToolInputError) {
          console.info(`[property-automation/mcp] tools/call ${name} -> input error`);
          const out = { httpStatus: 400, body: { error: "INVALID_TOOL_INPUT", message: err.message } };
          return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(out) }], structuredContent: out, isError: true });
        }
        console.warn(`[property-automation/mcp] tools/call ${name} -> internal error ${err?.name || ""}`);
        const out = { httpStatus: 500, body: { error: "GATEWAY_ERROR", message: "The MCP gateway failed while processing this tool call." } };
        return rpcResult(id, { content: [{ type: "text", text: JSON.stringify(out) }], structuredContent: out, isError: true });
      }
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}
