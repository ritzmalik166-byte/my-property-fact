/**
 * One-time upload slots for the MCP server's file transfer (in memory, single Next.js process).
 *
 * create_upload_session (MCP tool, needs the MCP key) creates a slot per file. The file is sent with
 *   PUT /api/property-automation/uploads/{uploadId}
 * The uploadId is a 256-bit random capability: it can be written once, is never readable over HTTP,
 * expires after PROPERTY_AUTOMATION_UPLOAD_TTL_MINUTES (default 30) and is only used by the MCP
 * tools validate_properties / import_properties. Slots are lost when the server restarts.
 */
import crypto from "node:crypto";

const TTL_MS = Math.max(5, Number.parseInt(process.env.PROPERTY_AUTOMATION_UPLOAD_TTL_MINUTES || "30", 10) || 30) * 60_000;
export const MAX_UPLOAD_BYTES = {
  workbook: 5 * 1024 * 1024,
  // Next.js middleware truncates request bodies above 10 MB and the backend dev profile accepts 10 MB
  // per multipart request (workbook + ZIP together).
  imagesZip: 9 * 1024 * 1024,
};
const MAX_SLOTS = 16;

const store = (globalThis.__mpfPropertyAutomationUploads ||= { slots: new Map(), failures: new Map() });

function sweep() {
  const now = Date.now();
  for (const [id, s] of store.slots) if (s.expiresAt <= now) store.slots.delete(id);
  for (const [ip, f] of store.failures) if (f.resetAt <= now) store.failures.delete(ip);
}

export function createSlot(kind) {
  sweep();
  if (!MAX_UPLOAD_BYTES[kind]) throw new Error("bad kind");
  if (store.slots.size >= MAX_SLOTS) {
    // drop the oldest slots first
    const oldest = [...store.slots.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt).slice(0, store.slots.size - MAX_SLOTS + 1);
    for (const [id] of oldest) store.slots.delete(id);
  }
  const uploadId = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  store.slots.set(uploadId, { kind, createdAt: now, expiresAt: now + TTL_MS, bytes: null, filename: null, sha256: null });
  return { uploadId, kind, maxBytes: MAX_UPLOAD_BYTES[kind], expiresAt: new Date(now + TTL_MS).toISOString() };
}

/** Constant-time-ish lookup: the id itself is the secret, so only a well-formed id is looked up. */
export function getSlot(uploadId) {
  sweep();
  if (typeof uploadId !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(uploadId)) return null;
  return store.slots.get(uploadId) || null;
}

export function fillSlot(uploadId, bytes, filename) {
  const s = getSlot(uploadId);
  if (!s) return { error: "not_found" };
  if (s.bytes) return { error: "already_uploaded" };
  s.bytes = bytes;
  s.filename = filename;
  s.sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  return { slot: s };
}

/** Per-IP lockout for unknown upload ids (enumeration guard). */
export function recordFailure(ip) {
  sweep();
  const f = store.failures.get(ip) || { count: 0, resetAt: Date.now() + 60_000 };
  f.count += 1;
  store.failures.set(ip, f);
}

export function lockedOut(ip) {
  sweep();
  const f = store.failures.get(ip);
  return !!f && f.count >= 10;
}
