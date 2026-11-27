/**
 * get_property_details (MCP, read-only): one saved project, drafts included, with its stored image
 * files inspected and compared against the MPF Image Studio specifications.
 *
 * Read-only by construction: every backend call goes through backendGet(), which only sends GET and
 * only to the fixed paths in READ_PATHS. Nothing in this module can create, update, delete or
 * publish anything.
 *
 * Access: the MCP route already requires the secret MCP key. Project data is read with the
 * allow-listed integration account (server-side JWT; ClaudeIntegrationAccountRestrictionFilter
 * limits that account to the read-only admin project GETs). Image files are read from the existing
 * image endpoint without credentials. Direct image URLs are only returned for PUBLISHED projects,
 * because that endpoint is unauthenticated: a draft's URLs are withheld so draft assets are not
 * handed out as shareable links.
 *
 * Optional environment (server-side only):
 *   PROPERTY_AUTOMATION_PUBLIC_IMAGE_URL  base for direct image URLs of published projects
 *                                         (default NEXT_PUBLIC_IMAGE_URL, e.g. https://.../api/v1/get/images/)
 */
import crypto from "node:crypto";
import ExcelJS from "exceljs";
import { backendToken } from "./gptActions";
import { IMAGE_STUDIO_SPECS, IMPORTER_BOXES, inspectImageBytes, legacyImporterStorage, slugify, buildImageReport, readZip } from "./imageStudio";

const READ_PATHS = [
  /^\/api\/v1\/projects\/admin\/get-by-id\/[1-9][0-9]{0,9}$/,
  /^\/api\/v1\/project-status$/,
  /^\/api\/v1\/get\/images\/properties\/[A-Za-z0-9-]{1,200}\/[A-Za-z0-9._-]{1,200}$/,
];
const MAX_STORED_IMAGE_BYTES = 40 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 150 * 1024 * 1024;
const MAX_IMAGES = 120;
const SAFE_SEGMENT = /^[A-Za-z0-9._-]{1,200}$/;
const STORED_NAME = /^\d+_(desktop-\d+|mobile-\d+|logo|location|thumbnail|gallery-\d+)_[0-9a-f]{8}\.[a-z0-9]+$/i;
const KIND_TABLE = {
  DESKTOP: "project_desktop_banner", MOBILE: "project_mobile_banner", GALLERY: "project_gallery",
  LOGO: "project.project_logo", LOCATION: "project.location_map", THUMBNAIL: "project.project_thumbnail",
};

export class DetailsInputError extends Error {}

/* ------------------------------------------------------------------ backend (GET only) */

async function backendGet(cfg, path, { auth, timeoutMs, maxBytes = 5 * 1024 * 1024 } = {}) {
  if (!READ_PATHS.some((re) => re.test(path))) throw new Error("path not allowed for read-only tool");
  const send = async (token) => {
    const headers = { Accept: "*/*" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(cfg.backendUrl + path, { method: "GET", headers, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(timeoutMs || cfg.readTimeoutMs) });
  };
  let res;
  try {
    if (auth) {
      let t = await backendToken(cfg);
      if (t.error) return { status: 503, error: "BACKEND_LOGIN_FAILED" };
      res = await send(t.token);
      if (res.status === 401) {
        try { await res.body?.cancel(); } catch { /* ignore */ }
        t = await backendToken(cfg, { forceRefresh: true });
        if (t.error) return { status: 503, error: "BACKEND_LOGIN_FAILED" };
        res = await send(t.token);
      }
    } else {
      res = await send(null);
    }
  } catch (err) {
    const name = err?.name || "";
    return { status: name === "TimeoutError" || name === "AbortError" ? 504 : 503, error: name === "TimeoutError" ? "BACKEND_TIMEOUT" : "BACKEND_UNAVAILABLE" };
  }
  const declared = Number(res.headers.get("content-length") || 0);
  if (declared > maxBytes) {
    try { await res.body?.cancel(); } catch { /* ignore */ }
    return { status: res.status, tooLarge: true };
  }
  const chunks = [];
  let size = 0;
  if (res.body) {
    for await (const chunk of res.body) {
      size += chunk.length;
      if (size > maxBytes) return { status: res.status, tooLarge: true };
      chunks.push(chunk);
    }
  }
  return { status: res.status, bytes: Buffer.concat(chunks), contentType: res.headers.get("content-type") || "" };
}

function json(bytes) {
  try { return JSON.parse(bytes.toString("utf8")); } catch { return null; }
}

/* ------------------------------------------------------------------ helpers */

const plain = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const key = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const clip = (s, n = 160) => { const t = plain(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const norm = (h) => String(h).trim().replace(/\s+/g, " ").toUpperCase();

function finding(list, severity, code, field, message, extra = {}) {
  list.push({ severity, code, field, message, ...extra });
}

function slotOf(fileName, kind) {
  const m = STORED_NAME.exec(fileName || "");
  if (!m) return { slot: null, fromName: false };
  const t = m[1].toLowerCase();
  const slot = t === "logo" ? "Logo" : t === "location" ? "Location" : t === "thumbnail" ? "Thumbnail"
    : t.replace(/^(\w)(\w*)-(\d+)$/, (_, a, b, n) => `${a.toUpperCase()}${b}-${Number(n)}`);
  const slotKind = slot.startsWith("Gallery") ? "GALLERY" : slot.split("-")[0].toUpperCase();
  return { slot, slotKind, fromName: true, matchesTable: slotKind === kind };
}

/* ------------------------------------------------------------------ comparison sources */

const WORKBOOK_FIELDS = [
  ["PROJECT NAME", "projectName"], ["BUILDER NAME", "builder.name"], ["PROPERTY TYPE NAME", "propertyType.name"],
  ["PROJECT STATUS NAME", "projectStatus.name"], ["PROJECT CONFIGURATION", "configuration"], ["PROJECT LOCALITY", "location.locality"],
  ["CITY NAME", "location.city"], ["STATE NAME", "location.state"], ["COUNTRY NAME", "location.country"],
  ["RERA NO", "reraNo"], ["RERA WEBSITE", "reraWebsite"], ["IVR NO", "ivrNo"], ["PROJECT PRICE", "price"],
  ["META TITLE", "seo.metaTitle"], ["META DESCRIPTION", "seo.metaDescription"], ["META KEYWORD", "seo.metaKeyword"],
  ["AMENITY DESCRIPTION", "descriptions.amenity"], ["LOCATION DESCRIPTION", "descriptions.location"],
  ["FLOOR PLAN DESCRIPTION", "descriptions.floorPlan"], ["PROJECT WALKTHROUGH DESCRIPTION", "descriptions.walkthrough"],
  ["BUILDER DESCRIPTION", "builder.description"],
];

const pick = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** The workbook row whose PROJECT NAME equals the saved project name (first sheet named Sheet1, else first). */
export async function readWorkbookRow(bytes, projectName) {
  if (!(bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b)) throw new DetailsInputError("'compareWith.workbook' is not an .xlsx file.");
  const wb = new ExcelJS.Workbook();
  try { await wb.xlsx.load(bytes); } catch { throw new DetailsInputError("'compareWith.workbook' could not be read as an .xlsx workbook."); }
  const ws = wb.getWorksheet("Sheet1") || wb.worksheets[0];
  if (!ws) throw new DetailsInputError("'compareWith.workbook' has no worksheet.");
  const cols = new Map();
  ws.getRow(1).eachCell((cell, n) => { const h = norm(cell.text); if (h && !cols.has(h)) cols.set(h, n); });
  const nameCol = cols.get("PROJECT NAME");
  if (!nameCol) throw new DetailsInputError("'compareWith.workbook' has no PROJECT NAME column.");
  let found = null;
  const names = [];
  ws.eachRow((row, n) => {
    if (n === 1 || found) return;
    const v = row.getCell(nameCol).text.trim();
    if (v) names.push(v);
    if (key(v) === key(projectName)) {
      found = { sheetRow: n, values: Object.fromEntries([...cols].map(([h, c]) => [h, row.getCell(c).text.trim()])) };
    }
  });
  return { sheet: ws.name, row: found, projectNamesInWorkbook: names.slice(0, 50) };
}

function compareWorkbook(property, wbRow, findings) {
  if (!wbRow.row) {
    finding(findings, "WARNING", "COMPARE_ROW_NOT_FOUND", "workbook", `No row with PROJECT NAME "${property.projectName}" in the workbook.`);
    return { sheet: wbRow.sheet, sheetRow: null, fields: [], summary: null };
  }
  const v = wbRow.row.values;
  const fields = [];
  for (const [col, path] of WORKBOOK_FIELDS) {
    if (!(col in v)) continue;
    const expected = v[col];
    const saved = pick(property, path);
    let status;
    if (!expected && (saved == null || saved === "")) status = "BOTH_EMPTY";
    else if (key(expected) === key(saved)) status = "MATCH";
    else if (saved == null || saved === "") status = "NOT_SAVED";
    else status = "DIFFERENT";
    const row = { column: col, field: path, status };
    if (status !== "MATCH" && status !== "BOTH_EMPTY") { row.workbook = clip(expected); row.saved = clip(saved); }
    if (col === "BUILDER DESCRIPTION" && status !== "MATCH") row.note = "Imports never change an existing builder profile; the saved value is the builder's own description.";
    fields.push(row);
  }

  // amenities (tokens separated by "_", hyphenated words) vs saved titles
  if ("PROJECT AMENITIES" in v) {
    const want = v["PROJECT AMENITIES"].split(/[_,;\n]+/).map((s) => s.trim()).filter(Boolean);
    const have = new Map(property.amenities.map((a) => [key(a.title), a.title]));
    const missing = want.filter((w) => !have.has(key(w)));
    const wantKeys = new Set(want.map(key));
    const extra = property.amenities.filter((a) => !wantKeys.has(key(a.title))).map((a) => a.title);
    fields.push({ column: "PROJECT Amenities", field: "amenities", status: missing.length || extra.length ? "DIFFERENT" : "MATCH",
      workbookCount: want.length, savedCount: property.amenities.length, missingFromSaved: missing, notInWorkbook: extra });
  }

  if ("LOCATION ADVANTAGE" in v) {
    const saved = property.locationAdvantages.length;
    fields.push({ column: "LOCATION ADVANTAGE", field: "locationAdvantages", status: v["LOCATION ADVANTAGE"] && !saved ? "NOT_SAVED" : saved ? "SAVED" : "BOTH_EMPTY",
      workbook: clip(v["LOCATION ADVANTAGE"]), savedCount: saved,
      note: v["LOCATION ADVANTAGE"] && !saved ? "The importer only stores \"Place-Name-4.2-Km\" / \"Place Name (4.2 Km)\" segments; free text is reported as LOCATION_ADVANTAGE_UNPARSED and not saved." : undefined });
  }

  // FAQ pairs
  for (let i = 1; i <= 20; i++) {
    const q = v[`QUESTION ${i}`];
    const a = v[`ANSWER ${i}`];
    if (q === undefined && a === undefined) continue;
    if (!q && !a) continue;
    const saved = property.faqs.find((f) => key(f.question) === key(q));
    let status = !saved ? "NOT_SAVED" : key(saved.answer) === key(a) ? "MATCH" : "DIFFERENT";
    const row = { column: `Question ${i} / Answer ${i}`, field: "faqs", status, question: clip(q, 100) };
    if (status === "DIFFERENT") { row.workbookAnswer = clip(a); row.savedAnswer = clip(saved.answer); }
    fields.push(row);
  }

  const by = (s) => fields.filter((f) => f.status === s).length;
  for (const f of fields) {
    if (f.status === "DIFFERENT" && f.column !== "BUILDER DESCRIPTION") {
      finding(findings, "WARNING", "SAVED_DIFFERS_FROM_WORKBOOK", f.field, `${f.column}: the saved value differs from the workbook.`);
    }
    if (f.status === "NOT_SAVED") {
      finding(findings, f.field === "locationAdvantages" ? "WARNING" : "ERROR", "WORKBOOK_VALUE_NOT_SAVED", f.field, `${f.column} has a value in the workbook but nothing is saved.`);
    }
  }
  return { sheet: wbRow.sheet, sheetRow: wbRow.row.sheetRow, summary: { match: by("MATCH") + by("SAVED"), different: by("DIFFERENT"), notSaved: by("NOT_SAVED"), bothEmpty: by("BOTH_EMPTY") }, fields };
}

/* ------------------------------------------------------------------ main */

export async function getPropertyDetails(cfg, args, { sourceWorkbook, sourceZip } = {}) {
  const id = args.propertyId;
  if (!Number.isInteger(id) || id < 1 || id > 2_000_000_000) throw new DetailsInputError("propertyId must be a positive integer, e.g. 1394.");
  const inspect = args.inspectImages !== false;

  const r = await backendGet(cfg, `/api/v1/projects/admin/get-by-id/${id}`, { auth: true });
  if (r.error) return { httpStatus: r.status, body: { error: r.error, message: "The backend could not be reached or the integration account could not sign in." } };
  if (r.status === 403) return { httpStatus: 403, body: { error: "FORBIDDEN", message: "The integration account is not allowed to read this project." } };
  const p = r.bytes ? json(r.bytes) : null;
  if (r.status >= 400 || !p || typeof p.id !== "number") {
    const msg = String((p && (p.message || p.error)) || "");
    if (r.status === 404 || /not found/i.test(msg) || r.status === 400 || r.status === 500) {
      return { httpStatus: 404, body: { error: "PROPERTY_NOT_FOUND", message: `No project with id ${id}.` } };
    }
    return { httpStatus: 502, body: { error: "BAD_BACKEND_RESPONSE", message: `The backend answered ${r.status}.` } };
  }

  let statuses = [];
  const s = await backendGet(cfg, "/api/v1/project-status", {});
  if (s.status === 200 && s.bytes) statuses = json(s.bytes) || [];
  const ps = Array.isArray(statuses) ? statuses.find((x) => x.id === p.projectStatusId) : null;

  const findings = [];
  const published = p.status === true;
  const property = {
    id: p.id,
    projectName: p.projectName,
    slug: p.slugURL,
    reraNo: p.reraNo,
    reraWebsite: p.reraWebsite,
    reraQr: p.reraQr,
    ivrNo: p.ivrNo,
    price: p.projectPrice,
    configuration: p.projectConfiguration,
    publication: { status: published ? "PUBLISHED" : "DRAFT", published, showFeaturedProperties: !!p.showFeaturedProperties },
    projectStatus: { id: p.projectStatusId ?? null, name: ps?.statusName ?? null, code: ps?.code ?? null },
    propertyType: { id: p.propertyTypeId ?? null, name: p.propertyTypeName ?? null },
    builder: p.builder ? { id: p.builder.id, name: p.builder.builderName, slug: p.builder.slugURL, description: p.builder.builderDescription } : null,
    location: { locality: p.projectLocality, city: p.city, cityId: p.cityId, state: p.state, stateId: p.stateId, country: p.country, countryId: p.countryId },
    amenities: (p.amenities || []).map((a) => ({ id: a.id, title: a.title })),
    locationAdvantages: (p.locationBenefits || []).map((b) => ({ id: b.id, name: b.benefitName, distance: b.distance })),
    floorPlans: (p.floorPlans || []).map((f) => ({ planType: f.planType, areaSqFt: f.areaSqFt, areaSqMt: f.areaSqMt })),
    faqs: (p.faqs || []).map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    descriptions: { amenity: p.amenityDesc, location: p.locationDesc, floorPlan: p.floorPlanDesc, walkthrough: p.projectWalkthroughDescription },
    seo: {
      metaTitle: p.metaTitle, metaDescription: p.metaDescription, metaKeyword: p.metaKeyword,
      metaTitleLength: plain(p.metaTitle).length, metaDescriptionLength: plain(p.metaDescription).length,
    },
    altTags: { logo: p.projectLogoAltTag, locationMap: p.locationMapAltTag },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    notReturnedByBackend: ["PROJECT ABOUT SHORT DESCRIPTION", "thumbnail alt tag", "banner record ids and display order fields", "floor plan images"],
  };

  /* ---- field-level checks */
  const req = (path, label, sev = "ERROR") => {
    const val = pick(property, path);
    if (val == null || (typeof val === "string" && !plain(val))) finding(findings, sev, "FIELD_MISSING", path, `${label} is empty.`);
  };
  req("projectName", "Project name"); req("slug", "Slug"); req("builder.id", "Builder"); req("location.city", "City");
  req("location.state", "State"); req("location.country", "Country"); req("propertyType.name", "Property type"); req("projectStatus.id", "Project status");
  req("reraNo", "RERA number", "WARNING"); req("reraWebsite", "RERA website", "WARNING"); req("location.locality", "Locality", "WARNING");
  req("configuration", "Configuration", "WARNING"); req("price", "Price", "WARNING"); req("ivrNo", "IVR number", "INFO"); req("reraQr", "RERA QR image", "INFO");
  req("seo.metaTitle", "Meta title", "WARNING"); req("seo.metaDescription", "Meta description", "WARNING"); req("seo.metaKeyword", "Meta keywords", "INFO");
  req("descriptions.amenity", "Amenity description", "WARNING"); req("descriptions.location", "Location description", "WARNING");
  req("descriptions.floorPlan", "Floor plan description", "WARNING"); req("descriptions.walkthrough", "Walkthrough description", "WARNING");
  req("altTags.logo", "Logo alt tag", "WARNING"); req("altTags.locationMap", "Location map alt tag", "WARNING");
  if (property.projectStatus.id != null && !property.projectStatus.name) finding(findings, "WARNING", "FIELD_UNRESOLVED", "projectStatus.name", `Project status #${property.projectStatus.id} has no name in the master list.`);
  if (!property.amenities.length) finding(findings, "WARNING", "FIELD_MISSING", "amenities", "No amenities linked.");
  if (!property.floorPlans.length) finding(findings, "WARNING", "FIELD_MISSING", "floorPlans", "No floor plans.");
  if (!property.faqs.length) finding(findings, "WARNING", "FIELD_MISSING", "faqs", "No FAQs.");
  if (!property.locationAdvantages.length) finding(findings, "WARNING", "FIELD_MISSING", "locationAdvantages", "No location advantages saved.");
  property.faqs.forEach((f, i) => {
    if (!plain(f.question)) finding(findings, "ERROR", "FAQ_INCOMPLETE", `faqs[${i}].question`, `FAQ #${f.id} has no question.`);
    if (!plain(f.answer)) finding(findings, "ERROR", "FAQ_INCOMPLETE", `faqs[${i}].answer`, `FAQ #${f.id} has no answer.`);
  });
  const dupQ = property.faqs.map((f) => key(f.question)).filter((q, i, a) => q && a.indexOf(q) !== i);
  if (dupQ.length) finding(findings, "WARNING", "FAQ_DUPLICATE", "faqs", `${dupQ.length} duplicate FAQ question(s).`);
  property.floorPlans.forEach((f, i) => {
    if (!f.planType) finding(findings, "WARNING", "FLOOR_PLAN_INCOMPLETE", `floorPlans[${i}].planType`, "Floor plan has no type.");
    if (!(f.areaSqFt > 0)) finding(findings, "WARNING", "FLOOR_PLAN_INCOMPLETE", `floorPlans[${i}].areaSqFt`, "Floor plan has no area.");
  });
  if (property.seo.metaTitleLength > 60) finding(findings, "INFO", "SEO_LENGTH", "seo.metaTitle", `Meta title is ${property.seo.metaTitleLength} characters (search results usually show about 60).`);
  if (property.seo.metaDescriptionLength > 160) finding(findings, "INFO", "SEO_LENGTH", "seo.metaDescription", `Meta description is ${property.seo.metaDescriptionLength} characters (search results usually show about 160).`);
  if (property.price && /^[0-9.,\s]+$/.test(property.price)) finding(findings, "WARNING", "PRICE_NO_UNIT", "price", `Price "${property.price}" has no unit (e.g. Cr / Lakh).`);
  if (property.slug && property.projectName && property.slug !== slugify(property.projectName) && !property.slug.startsWith(`${slugify(property.projectName)}-`)) {
    finding(findings, "INFO", "SLUG_DIFFERS", "slug", `Slug "${property.slug}" is not derived from the project name.`);
  }

  /* ---- image records */
  const records = [];
  const push = (kind, fileName, extra) => records.push({ kind, table: KIND_TABLE[kind], fileName: fileName || null, ...extra });
  (p.desktopImages || []).forEach((d, i) => push("DESKTOP", d.desktopImage, { order: i + 1, assetId: d.id || null, altTag: d.desktopAltTag }));
  (p.mobileImages || []).forEach((d, i) => push("MOBILE", d.mobileImage, { order: i + 1, assetId: d.id || null, altTag: d.mobileAltTag }));
  if (p.projectLogo) push("LOGO", p.projectLogo, { order: 1, assetId: "project.projectLogo", altTag: p.projectLogoAltTag });
  if (p.locationMap) push("LOCATION", p.locationMap, { order: 1, assetId: "project.locationMap", altTag: p.locationMapAltTag });
  if (p.projectThumbnailImage) push("THUMBNAIL", p.projectThumbnailImage, { order: 1, assetId: "project.projectThumbnail", altTag: null });
  (p.galleryImages || []).forEach((g, i) => push("GALLERY", g.imageName, { order: i + 1, assetId: g.id || null, altTag: g.altTag }));

  // optional source package
  let source = null;
  if (sourceZip) {
    const z = await readZip(sourceZip.bytes);
    const { report } = buildImageReport(z.files || [], [property.projectName], { specPolicy: "warn", sourcePermission: { confirmed: true, source: "comparison only" }, zipIssues: z.issues });
    source = {
      filename: sourceZip.filename, bytes: sourceZip.bytes.length,
      assets: report.assets.filter((a) => a.slot).map((a) => ({ file: a.file, slot: a.slot, kind: a.kind, format: a.format, width: a.width, height: a.height, bytes: a.bytes, sha256: a.sha256, specStatus: a.specStatus, status: a.status })),
      issues: [...(report.batchIssues || []), ...report.assets.filter((a) => !a.slot).flatMap((a) => a.issues || [])].slice(0, 30),
    };
  }

  const slug = property.slug && /^[A-Za-z0-9-]{1,200}$/.test(property.slug) ? property.slug : null;
  const publicBase = String(process.env.PROPERTY_AUTOMATION_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_IMAGE_URL || "").trim();
  const assets = [];
  let total = 0;
  const list = records.slice(0, MAX_IMAGES);
  if (records.length > MAX_IMAGES) finding(findings, "WARNING", "IMAGE_LIST_TRUNCATED", "images", `Only the first ${MAX_IMAGES} of ${records.length} image records were inspected.`);

  const inspectOne = async (rec) => {
    const a = { slot: null, kind: rec.kind, table: rec.table, order: rec.order, assetId: rec.assetId, fileName: rec.fileName, altTag: rec.altTag ?? null, readUrl: null, stored: null, spec: null, specStatus: null, issues: [] };
    const so = slotOf(rec.fileName, rec.kind);
    a.slot = so.slot || (rec.kind === "GALLERY" ? `Gallery-${rec.order}` : rec.kind === "DESKTOP" || rec.kind === "MOBILE" ? `${rec.kind[0]}${rec.kind.slice(1).toLowerCase()}-${rec.order}` : rec.kind[0] + rec.kind.slice(1).toLowerCase());
    a.slotFrom = so.fromName ? "filename" : "record position";
    if (so.fromName && !so.matchesTable) a.issues.push({ severity: "ERROR", code: "IMAGE_WRONG_ASSIGNMENT", message: `File is named as ${so.slot} but is saved in ${rec.table}.` });
    const specSlot = a.slot && IMAGE_STUDIO_SPECS[a.slot] ? a.slot : rec.kind === "DESKTOP" ? "Desktop-1" : rec.kind === "MOBILE" ? "Mobile-1" : null;
    a.spec = rec.kind === "GALLERY" ? "ORIGINAL" : specSlot ? { width: IMAGE_STUDIO_SPECS[specSlot].width, height: IMAGE_STUDIO_SPECS[specSlot].height } : null;
    if (!rec.fileName || !SAFE_SEGMENT.test(rec.fileName) || !slug) {
      a.issues.push({ severity: "ERROR", code: "IMAGE_RECORD_INVALID", message: "The saved file name or slug cannot be resolved to a stored file." });
      return a;
    }
    if (published && publicBase) a.readUrl = `${publicBase.replace(/\/?$/, "/")}properties/${slug}/${rec.fileName}`;
    if (!inspect) return a;
    if (total > MAX_TOTAL_IMAGE_BYTES) { a.issues.push({ severity: "INFO", code: "IMAGE_NOT_INSPECTED", message: "Inspection byte budget reached." }); return a; }
    const g = await backendGet(cfg, `/api/v1/get/images/properties/${slug}/${rec.fileName}`, { maxBytes: MAX_STORED_IMAGE_BYTES, timeoutMs: cfg.uploadTimeoutMs || 60000 });
    if (g.error) { a.issues.push({ severity: "ERROR", code: "IMAGE_FILE_UNREADABLE", message: `Image endpoint: ${g.error}.` }); return a; }
    if (g.tooLarge) { a.issues.push({ severity: "ERROR", code: "IMAGE_FILE_TOO_LARGE", message: `Stored file is larger than ${MAX_STORED_IMAGE_BYTES} bytes.` }); return a; }
    if (g.status === 404) { a.issues.push({ severity: "ERROR", code: "IMAGE_FILE_MISSING", message: "The record exists but the stored file was not found." }); return a; }
    if (g.status !== 200) { a.issues.push({ severity: "ERROR", code: "IMAGE_FILE_UNREADABLE", message: `Image endpoint answered ${g.status}.` }); return a; }
    total += g.bytes.length;
    const info = inspectImageBytes(g.bytes);
    a.stored = { bytes: g.bytes.length, sha256: crypto.createHash("sha256").update(g.bytes).digest("hex"), format: info.format || null, width: info.width ?? null, height: info.height ?? null };
    if (info.code) a.issues.push({ severity: "ERROR", code: info.code, message: info.error });
    const ext = (rec.fileName.split(".").pop() || "").toLowerCase().replace("jpeg", "jpg");
    if (info.format && ext !== info.format) a.issues.push({ severity: "WARNING", code: "IMAGE_EXTENSION_MISMATCH", message: `Stored as .${ext} but the content is ${info.format}.` });
    return a;
  };

  // limited concurrency
  const queue = [...list];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const rec = queue.shift();
      assets.push(await inspectOne(rec));
    }
  });
  await Promise.all(workers);
  const rank = (a) => ["DESKTOP", "MOBILE", "LOGO", "LOCATION", "THUMBNAIL", "GALLERY"].indexOf(a.kind) * 1000 + a.order;
  assets.sort((x, y) => rank(x) - rank(y));

  /* ---- spec comparison per stored image */
  for (const a of assets) {
    const src = source?.assets.find((s) => s.slot === a.slot);
    if (src) a.source = { file: src.file, format: src.format, width: src.width, height: src.height, bytes: src.bytes, sha256: src.sha256 };
    const st = a.stored;
    if (!st || st.width == null) { a.specStatus = "NOT_INSPECTED"; continue; }
    const [bw, bh] = IMPORTER_BOXES[a.kind];
    if (a.kind === "GALLERY") {
      if (src && src.width) {
        if (src.width === st.width && src.height === st.height) a.specStatus = "ORIGINAL_PRESERVED";
        else {
          a.specStatus = "ORIGINAL_RESIZED";
          a.issues.push({ severity: "WARNING", code: "GALLERY_ORIGINAL_NOT_PRESERVED", message: `Original ${src.width}×${src.height} was stored as ${st.width}×${st.height} (importer fits gallery images into ${bw}×${bh}).` });
        }
      } else if (st.width === bw || st.height === bh) {
        a.specStatus = "LIKELY_RESIZED_BY_IMPORTER";
        a.issues.push({ severity: "WARNING", code: "GALLERY_ORIGINAL_NOT_PRESERVED", message: `${st.width}×${st.height} touches the importer's ${bw}×${bh} box, so the original was most likely rescaled. Pass compareWith.imagesZip to confirm.` });
      } else a.specStatus = "ORIGINAL_UNVERIFIED";
    } else if (a.spec) {
      const { width: sw, height: sh } = a.spec;
      if (st.width === sw && st.height === sh) a.specStatus = "MATCH";
      else {
        const fromSpec = legacyImporterStorage(a.kind, sw, sh);
        const fromSrc = src?.width ? legacyImporterStorage(a.kind, src.width, src.height) : null;
        if (st.width === fromSpec.storedWidth && st.height === fromSpec.storedHeight) {
          a.specStatus = "RESIZED_BY_IMPORTER";
          a.issues.push({ severity: "WARNING", code: "IMAGE_RESIZED_BY_IMPORTER", message: `Spec ${sw}×${sh}, stored ${st.width}×${st.height}: the importer ${fromSpec.action.toLowerCase()} it into its ${fromSpec.box} box.` });
        } else if (fromSrc && st.width === fromSrc.storedWidth && st.height === fromSrc.storedHeight) {
          a.specStatus = "RESIZED_BY_IMPORTER";
          a.issues.push({ severity: "WARNING", code: "IMAGE_RESIZED_BY_IMPORTER", message: `Source ${src.width}×${src.height} was ${fromSrc.action.toLowerCase()} to ${st.width}×${st.height} (importer box ${fromSrc.box}).` });
        } else {
          a.specStatus = "MISMATCH";
          a.issues.push({ severity: "WARNING", code: "IMAGE_SPEC_MISMATCH", message: `Stored ${st.width}×${st.height}; Image Studio size is ${sw}×${sh} and the importer would store that as ${fromSpec.storedWidth}×${fromSpec.storedHeight}.` });
        }
        // aspect check: catches a wrongly assigned image (e.g. a square image saved as a desktop banner)
        const ar = st.width / st.height;
        const want = sw / sh;
        if (Math.abs(ar - want) / want > 0.15) {
          a.issues.push({ severity: "WARNING", code: "IMAGE_ASPECT_MISMATCH", message: `Aspect ratio ${ar.toFixed(2)} does not fit ${a.slot} (${want.toFixed(2)}); the image may be assigned to the wrong slot.` });
        }
      }
      if (src?.width && (src.width !== sw || src.height !== sh)) {
        a.issues.push({ severity: "WARNING", code: "IMAGE_SOURCE_NOT_SPEC", message: `The uploaded source was ${src.width}×${src.height}, not the Image Studio size ${sw}×${sh}.` });
      }
    }
    if (src?.format && st.format && src.format !== st.format) a.formatChanged = `${src.format} → ${st.format}`;
    if (src?.sha256 && src.sha256 === st.sha256) a.byteIdenticalToSource = true;
  }

  /* ---- set-level image findings */
  const imageFindings = [];
  const present = new Set(assets.map((a) => a.slot));
  for (const slot of Object.keys(IMAGE_STUDIO_SPECS)) {
    if (!present.has(slot)) imageFindings.push({ severity: "WARNING", code: "IMAGE_MISSING", slot, message: `No ${IMAGE_STUDIO_SPECS[slot].label} (${slot}) is saved.` });
  }
  if (!assets.some((a) => a.kind === "GALLERY")) imageFindings.push({ severity: "WARNING", code: "IMAGE_MISSING", slot: "Gallery-1", message: "No gallery images are saved." });
  const bySlot = new Map();
  for (const a of assets) bySlot.set(a.slot, [...(bySlot.get(a.slot) || []), a]);
  for (const [slot, xs] of bySlot) if (xs.length > 1) imageFindings.push({ severity: "ERROR", code: "IMAGE_DUPLICATE_SLOT", slot, message: `${xs.length} saved images use ${slot}: ${xs.map((x) => x.fileName).join(", ")}.` });
  const bySha = new Map();
  for (const a of assets) if (a.stored?.sha256) bySha.set(a.stored.sha256, [...(bySha.get(a.stored.sha256) || []), a]);
  for (const xs of bySha.values()) if (xs.length > 1) imageFindings.push({ severity: "WARNING", code: "IMAGE_DUPLICATE_CONTENT", message: `Identical stored files: ${xs.map((x) => x.slot).join(", ")}.` });
  const byName = new Map();
  for (const a of assets) if (a.fileName) byName.set(a.fileName, (byName.get(a.fileName) || 0) + 1);
  for (const [n, c] of byName) if (c > 1) imageFindings.push({ severity: "ERROR", code: "IMAGE_DUPLICATE_RECORD", message: `${n} is referenced by ${c} image records.` });
  for (const kind of ["DESKTOP", "MOBILE"]) {
    const xs = assets.filter((a) => a.kind === kind && a.slotFrom === "filename").sort((x, y) => x.order - y.order);
    const nums = xs.map((a) => Number(a.slot.split("-")[1]));
    if (nums.some((n, i) => i && n < nums[i - 1])) {
      imageFindings.push({ severity: "WARNING", code: "IMAGE_ORDER", slot: `${kind[0]}${kind.slice(1).toLowerCase()}-1`,
        message: `${kind.toLowerCase()} banners are returned in the order ${xs.map((a) => a.slot).join(", ")}; the night banner comes before the day banner.` });
    }
  }
  for (const a of assets) {
    if (!a.altTag && a.kind !== "THUMBNAIL") a.issues.push({ severity: "WARNING", code: "IMAGE_ALT_MISSING", message: "No alt tag." });
  }
  if (source) {
    for (const s of source.assets) {
      if (!present.has(s.slot)) imageFindings.push({ severity: "ERROR", code: "IMAGE_NOT_IMPORTED", slot: s.slot, message: `${s.file} (${s.slot}) is in the source package but not saved on the project.` });
    }
    for (const a of assets) {
      if (!source.assets.some((s) => s.slot === a.slot)) imageFindings.push({ severity: "INFO", code: "IMAGE_NOT_IN_SOURCE", slot: a.slot, message: `${a.slot} is saved but not in the source package.` });
    }
  }
  if (!published) {
    imageFindings.push({ severity: "INFO", code: "IMAGE_URLS_WITHHELD", message: "readUrl is null because the project is an unpublished draft: the backend image endpoint is unauthenticated, so draft image links are not handed out. Files were inspected server-side." });
  }

  const all = [...findings, ...imageFindings, ...assets.flatMap((a) => a.issues.map((i) => ({ ...i, slot: a.slot })))];
  const count = (sev) => all.filter((f) => f.severity === sev).length;
  const counts = (st) => assets.filter((a) => a.specStatus === st).length;

  const result = {
    httpStatus: 200,
    readOnly: true,
    property,
    images: {
      summary: {
        records: records.length, inspected: assets.filter((a) => a.stored).length,
        specMatch: counts("MATCH"), resizedByImporter: counts("RESIZED_BY_IMPORTER"), specMismatch: counts("MISMATCH"),
        galleryOriginalPreserved: counts("ORIGINAL_PRESERVED"), galleryOriginalResized: counts("ORIGINAL_RESIZED") + counts("LIKELY_RESIZED_BY_IMPORTER"),
        missingSlots: imageFindings.filter((f) => f.code === "IMAGE_MISSING").map((f) => f.slot),
        duplicates: imageFindings.filter((f) => /DUPLICATE/.test(f.code)).length,
        wrongAssignment: assets.filter((a) => a.issues.some((i) => i.code === "IMAGE_WRONG_ASSIGNMENT")).length,
      },
      urlPolicy: published ? (publicBase ? "PUBLIC_URLS_FOR_PUBLISHED_PROJECT" : "NO_PUBLIC_IMAGE_BASE_CONFIGURED") : "WITHHELD_FOR_DRAFT",
      specs: IMAGE_STUDIO_SPECS,
      importerBoxes: IMPORTER_BOXES,
      assets,
      findings: imageFindings,
    },
    findings: { summary: { errors: count("ERROR"), warnings: count("WARNING"), info: count("INFO") }, fields: findings },
  };
  if (sourceWorkbook || source) {
    result.comparison = {};
    if (sourceWorkbook) {
      const wb = await readWorkbookRow(sourceWorkbook.bytes, property.projectName);
      const cf = [];
      result.comparison.workbook = { filename: sourceWorkbook.filename, ...compareWorkbook(property, wb, cf) };
      result.findings.fields.push(...cf);
      for (const f of cf) result.findings.summary[f.severity === "ERROR" ? "errors" : f.severity === "WARNING" ? "warnings" : "info"]++;
    }
    if (source) result.comparison.imagesZip = { filename: source.filename, bytes: source.bytes, images: source.assets.length, issues: source.issues };
  }
  return result;
}
