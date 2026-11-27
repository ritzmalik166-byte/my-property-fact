/**
 * One-time file upload for the MCP server:  PUT /api/property-automation/uploads/{uploadId}
 *
 * The uploadId comes from the MCP tool create_upload_session (which needs the MCP key). The body is
 * the raw file (Excel workbook or image ZIP). Each id can be written once; files are never served
 * back over HTTP. Unknown ids answer 404, and repeated unknown ids from one IP are locked out.
 */
import { gatewayError, uploadRateExceeded } from "@/lib/propertyAutomation/gateway";
import { getSlot, fillSlot, recordFailure, lockedOut, MAX_UPLOAD_BYTES } from "@/lib/propertyAutomation/uploadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ip(request) {
  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : request.headers.get("x-real-ip") || "local";
}

function safeName(raw, kind) {
  let n = String(raw || "").split(/[\\/]/).pop().replace(/[\u0000-\u001f"]/g, "").trim().slice(0, 200);
  if (!n) n = kind === "workbook" ? "properties.xlsx" : "images.zip";
  return n;
}

export async function PUT(request, { params }) {
  const { uploadId } = await params;
  const who = ip(request);
  if (lockedOut(who)) return gatewayError(429, "RATE_LIMITED", "Too many invalid upload ids. Retry in a minute.", { "Retry-After": "60" });
  if (uploadRateExceeded(request)) return gatewayError(429, "RATE_LIMITED", "Too many uploads. Retry in a minute.", { "Retry-After": "60" });

  const slot = getSlot(uploadId);
  if (!slot) {
    recordFailure(who);
    return gatewayError(404, "NOT_FOUND", "Unknown or expired upload id.");
  }
  if (slot.bytes) return gatewayError(409, "ALREADY_UPLOADED", "This upload id was already used. Create a new upload session.");

  const cap = MAX_UPLOAD_BYTES[slot.kind];
  const declared = Number.parseInt(request.headers.get("content-length") || "", 10);
  if (Number.isFinite(declared) && declared > cap) return gatewayError(413, "PAYLOAD_TOO_LARGE", `The ${slot.kind} may be at most ${cap} bytes.`);
  if (!request.body) return gatewayError(400, "EMPTY_BODY", "Send the file as the request body.");

  const chunks = [];
  let size = 0;
  for await (const chunk of request.body) {
    size += chunk.length;
    if (size > cap) return gatewayError(413, "PAYLOAD_TOO_LARGE", `The ${slot.kind} may be at most ${cap} bytes.`);
    chunks.push(Buffer.from(chunk));
  }
  const bytes = Buffer.concat(chunks);
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    return gatewayError(415, "UNSUPPORTED_FILE",
      slot.kind === "workbook" ? "The workbook must be an .xlsx file." : "The images file must be a .zip archive.");
  }

  const filename = safeName(request.headers.get("x-file-name") || new URL(request.url).searchParams.get("filename"), slot.kind);
  const r = fillSlot(uploadId, bytes, filename);
  if (r.error === "already_uploaded") return gatewayError(409, "ALREADY_UPLOADED", "This upload id was already used.");
  if (r.error) return gatewayError(404, "NOT_FOUND", "Unknown or expired upload id.");
  console.info(`[property-automation/uploads] stored ${slot.kind} (${bytes.length} bytes)`);
  return new Response(JSON.stringify({ uploaded: true, kind: slot.kind, filename, bytes: bytes.length, sha256: r.slot.sha256, expiresAt: new Date(r.slot.expiresAt).toISOString() }), {
    status: 201,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function notAllowed() {
  return gatewayError(405, "METHOD_NOT_ALLOWED", "Use PUT with the file as the body.", { Allow: "PUT" });
}
export const GET = notAllowed;
export const POST = notAllowed;
export const DELETE = notAllowed;
