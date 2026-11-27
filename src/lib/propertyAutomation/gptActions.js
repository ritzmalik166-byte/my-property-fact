/**
 * ChatGPT Custom GPT "Actions" adapter for the Property Automation gateway (server-only).
 *
 * Why it exists:
 *  - GPT Actions can send ONE auth header (used for X-Property-Automation-Gateway-Key), so the
 *    backend JWT is obtained here, server-side, by logging in with the integration account.
 *    The credentials and the JWT never leave this server.
 *  - GPT Actions cannot send multipart uploads. Files arrive as `openaiFileIdRefs`
 *    ([{ name, id, mime_type, download_link }]). They are downloaded here (only from
 *    allow-listed OpenAI file hosts), then forwarded to Spring Boot as a normal multipart upload
 *    with the exact field names `excelFile` / `imagesZip`.
 *
 * Environment (server-side only):
 *   PROPERTY_AUTOMATION_BACKEND_EMAIL               integration account email
 *   PROPERTY_AUTOMATION_BACKEND_PASSWORD            integration account password
 *   PROPERTY_AUTOMATION_BACKEND_DASHBOARD_USERNAME  integration account dashboard username
 *   PROPERTY_AUTOMATION_FILE_HOSTS                  default "oaiusercontent.com" (host or parent domain, comma-separated)
 *   PROPERTY_AUTOMATION_ALLOW_HTTP_FILE_LINKS       "true" only for local tests (default: https required)
 */
import { guardKey, forward, gatewayError } from "./gateway";

/* ------------------------------------------------------------------ server-side backend login */

const tokenCache = globalThis.__mpfPropertyAutomationGptToken || { token: null, exp: 0, pending: null };
globalThis.__mpfPropertyAutomationGptToken = tokenCache;

function jwtExp(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

async function login(cfg) {
  const email = process.env.PROPERTY_AUTOMATION_BACKEND_EMAIL;
  const password = process.env.PROPERTY_AUTOMATION_BACKEND_PASSWORD;
  const dashboardUsername = process.env.PROPERTY_AUTOMATION_BACKEND_DASHBOARD_USERNAME;
  if (!email || !password) {
    return { error: gatewayError(503, "GATEWAY_DISABLED", "The ChatGPT gateway has no backend integration account configured on this server.") };
  }
  let res;
  try {
    res = await fetch(`${cfg.backendUrl}/api/v1/admin-portal/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password, dashboardUsername }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(cfg.readTimeoutMs),
    });
  } catch (err) {
    const name = err?.name || "";
    if (name === "TimeoutError" || name === "AbortError") {
      return { error: gatewayError(504, "BACKEND_TIMEOUT", "The backend login did not respond in time.") };
    }
    return { error: gatewayError(503, "BACKEND_UNAVAILABLE", "The backend is not reachable. Is Spring Boot running?") };
  }
  let body = {};
  try { body = await res.json(); } catch { /* ignore */ }
  if (!res.ok || typeof body.token !== "string") {
    console.warn(`[property-automation/gpt] backend login failed -> ${res.status}`);
    return { error: gatewayError(502, "BACKEND_LOGIN_FAILED", "The gateway could not sign in to the backend with its integration account. Ask the developer to check the server configuration.") };
  }
  tokenCache.token = body.token;
  tokenCache.exp = jwtExp(body.token) || Date.now() + 60 * 60 * 1000;
  return { token: body.token };
}

export async function backendToken(cfg, { forceRefresh = false } = {}) {
  if (!forceRefresh && tokenCache.token && tokenCache.exp - Date.now() > 5 * 60 * 1000) {
    return { token: tokenCache.token };
  }
  if (!tokenCache.pending) {
    tokenCache.pending = login(cfg).finally(() => { tokenCache.pending = null; });
  }
  return tokenCache.pending;
}

/** Forward with the server-side JWT; on a backend 401, sign in again once and retry. */
export async function forwardWithServerJwt(cfg, opts) {
  let t = await backendToken(cfg);
  if (t.error) return t.error;
  let res = await forward(cfg, { ...opts, authorization: `Bearer ${t.token}` });
  if (res.status === 401) {
    try { await res.body?.cancel(); } catch { /* ignore */ }
    t = await backendToken(cfg, { forceRefresh: true });
    if (t.error) return t.error;
    const retryOpts = typeof opts.makeBody === "function" ? { ...opts, body: opts.makeBody() } : opts;
    res = await forward(cfg, { ...retryOpts, authorization: `Bearer ${t.token}` });
  }
  return res;
}

/* ------------------------------------------------------------------ file links (openaiFileIdRefs) */

function allowedFileHost(url) {
  const hosts = String(process.env.PROPERTY_AUTOMATION_FILE_HOSTS || "oaiusercontent.com")
    .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
  const allowHttp = process.env.PROPERTY_AUTOMATION_ALLOW_HTTP_FILE_LINKS === "true";
  if (url.protocol !== "https:" && !(allowHttp && url.protocol === "http:")) return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function classify(ref) {
  const name = String(ref?.name || "").toLowerCase();
  const mime = String(ref?.mime_type || "").toLowerCase();
  if (/\.(xlsx|xls)$/.test(name) || mime.includes("spreadsheet") || mime === "application/vnd.ms-excel") return "excelFile";
  if (/\.zip$/.test(name) || mime === "application/zip" || mime === "application/x-zip-compressed") return "imagesZip";
  return null;
}

function safeFileName(ref, field) {
  let name = String(ref?.name || "").split(/[\\/]/).pop().replace(/[\u0000-\u001f"]/g, "").trim();
  if (!name) name = field === "excelFile" ? "properties.xlsx" : "images.zip";
  if (field === "excelFile" && !/\.(xlsx|xls)$/i.test(name)) name += ".xlsx";
  if (field === "imagesZip" && !/\.zip$/i.test(name)) name += ".zip";
  return name.slice(0, 200);
}

/** Download with a running byte budget; follows up to 3 redirects, each re-checked against the allow-list. */
export async function download(link, budget, timeoutMs) {
  let url;
  try { url = new URL(link); } catch { return { error: "invalid download_link" }; }
  for (let hop = 0; hop < 4; hop++) {
    if (!allowedFileHost(url)) return { error: "download_link host is not an allowed OpenAI file host" };
    let res;
    try {
      res = await fetch(url, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
    } catch (err) {
      return { error: err?.name === "TimeoutError" ? "file download timed out" : "file download failed" };
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      try { await res.body?.cancel(); } catch { /* ignore */ }
      url = new URL(res.headers.get("location"), url);
      continue;
    }
    if (!res.ok || !res.body) return { error: `file download returned HTTP ${res.status}` };
    const declared = Number.parseInt(res.headers.get("content-length") || "", 10);
    if (Number.isFinite(declared) && declared > budget) {
      try { await res.body.cancel(); } catch { /* ignore */ }
      return { tooLarge: true };
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of res.body) {
      size += chunk.length;
      if (size > budget) return { tooLarge: true };
      chunks.push(chunk);
    }
    return { bytes: Buffer.concat(chunks) };
  }
  return { error: "too many redirects" };
}

/* ------------------------------------------------------------------ response compaction */

/** GPT Actions truncate very large responses; drop the verbose per-column mapping text. */
async function compact(res) {
  const type = res.headers.get("content-type") || "";
  if (!type.includes("json")) return res;
  let body;
  try { body = await res.json(); } catch { return res; }
  const strip = (report) => {
    if (report && report.workbook && Array.isArray(report.workbook.detectedHeaders)) {
      report.workbook.detectedHeaders = report.workbook.detectedHeaders
        .filter((h) => h.status !== "MAPPED" && h.status !== "FAQ")
        .map(({ column, rawHeader, status }) => ({ column, rawHeader, status }));
      delete report.workbook.unsupportedFields;
    }
  };
  strip(body);
  strip(body?.validation);
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  return new Response(JSON.stringify(body), { status: res.status, headers });
}

/* ------------------------------------------------------------------ public helpers for routes */

/**
 * JSON POST from a GPT Action -> multipart POST to Spring Boot.
 * Body: { openaiFileIdRefs: [...], batchName?, dryRun?, allowPartial?, idempotencyKey? }
 */
export async function gptUpload(request, { path, allowOptions }) {
  const g = guardKey(request, { upload: true });
  if (!g.ok) return g.response;
  const { cfg } = g;

  let body;
  try { body = await request.json(); } catch {
    return gatewayError(400, "INVALID_JSON", "Send a JSON body with openaiFileIdRefs.");
  }
  const refs = Array.isArray(body?.openaiFileIdRefs) ? body.openaiFileIdRefs : [];
  if (refs.length === 0) {
    return gatewayError(400, "FILES_REQUIRED", "Attach the Excel workbook (and optionally the images ZIP) in openaiFileIdRefs.");
  }
  if (refs.some((r) => typeof r !== "object" || r === null || !r.download_link)) {
    return gatewayError(400, "FILE_LINK_MISSING", "Each openaiFileIdRefs item must contain a download_link. Re-attach the files in the chat.");
  }

  const byField = { excelFile: [], imagesZip: [] };
  for (const r of refs) {
    const f = classify(r);
    if (!f) return gatewayError(400, "UNSUPPORTED_FILE", `"${String(r.name || "file").slice(0, 100)}" is neither an Excel workbook (.xlsx/.xls) nor a .zip.`);
    byField[f].push(r);
  }
  if (byField.excelFile.length !== 1) {
    return gatewayError(400, "EXCEL_REQUIRED", `Attach exactly one Excel workbook (found ${byField.excelFile.length}).`);
  }
  if (byField.imagesZip.length > 1) {
    return gatewayError(400, "TOO_MANY_ZIPS", "Attach at most one images ZIP.");
  }

  let budget = cfg.maxUploadBytes;
  const parts = [];
  for (const field of ["excelFile", "imagesZip"]) {
    for (const ref of byField[field]) {
      const d = await download(ref.download_link, budget, cfg.uploadTimeoutMs);
      if (d.tooLarge) {
        return gatewayError(413, "PAYLOAD_TOO_LARGE", `The attached files exceed ${cfg.maxUploadBytes} bytes in total.`);
      }
      if (d.error) return gatewayError(502, "FILE_DOWNLOAD_FAILED", `Could not fetch "${String(ref.name || field).slice(0, 100)}": ${d.error}.`);
      budget -= d.bytes.length;
      parts.push({ field, name: safeFileName(ref, field), bytes: d.bytes, mime: ref.mime_type || "application/octet-stream" });
    }
  }

  const makeBody = () => {
    const fd = new FormData();
    for (const p of parts) fd.append(p.field, new Blob([p.bytes], { type: p.mime }), p.name);
    if (allowOptions) {
      if (typeof body.batchName === "string" && body.batchName.trim()) fd.append("batchName", body.batchName.slice(0, 200));
      if (typeof body.dryRun === "boolean") fd.append("dryRun", String(body.dryRun));
      if (typeof body.allowPartial === "boolean") fd.append("allowPartial", String(body.allowPartial));
      if (typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()) fd.append("idempotencyKey", body.idempotencyKey.slice(0, 200));
    }
    return fd;
  };

  const res = await forwardWithServerJwt(cfg, {
    method: "POST",
    path,
    body: makeBody(),
    makeBody,
    timeoutMs: cfg.uploadTimeoutMs,
  });
  return compact(res);
}

/** GET from a GPT Action with the server-side JWT. */
export async function gptGet(request, { path, query = [] }) {
  const g = guardKey(request, { upload: false });
  if (!g.ok) return g.response;
  return forwardWithServerJwt(g.cfg, { method: "GET", path, query, timeoutMs: g.cfg.readTimeoutMs });
}
