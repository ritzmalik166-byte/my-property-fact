/**
 * MCP server endpoint (Streamable HTTP, stateless, JSON responses):
 *   POST /api/property-automation/mcp/{PROPERTY_AUTOMATION_MCP_KEY}
 *
 * The secret is part of the URL because ChatGPT / Claude MCP connectors cannot send custom
 * headers. A wrong key answers 404. Tools: get_template, validate_properties, import_properties,
 * get_import_job, get_import_results (see src/lib/propertyAutomation/mcpServer.js).
 */
import { guardSecret, gatewayError } from "@/lib/propertyAutomation/gateway";
import { handleMessage } from "@/lib/propertyAutomation/mcpServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request, { params }) {
  const { key } = await params;
  const g = guardSecret(request, key, process.env.PROPERTY_AUTOMATION_MCP_KEY || "", { upload: false, label: "MCP endpoint" });
  if (!g.ok) return g.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }), { status: 400, headers: JSON_HEADERS });
  }

  const batch = Array.isArray(payload);
  const messages = batch ? payload : [payload];
  if (messages.length === 0 || messages.length > 20) {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }), { status: 400, headers: JSON_HEADERS });
  }

  const responses = [];
  for (const m of messages) {
    const r = await handleMessage(g.cfg, request, m);
    if (r) responses.push(r);
  }
  if (responses.length === 0) return new Response(null, { status: 202, headers: { "Cache-Control": "no-store" } });
  return new Response(JSON.stringify(batch ? responses : responses[0]), { status: 200, headers: JSON_HEADERS });
}

/** No server-initiated SSE stream; sessions are not used. */
export async function GET(request, { params }) {
  const { key } = await params;
  const g = guardSecret(request, key, process.env.PROPERTY_AUTOMATION_MCP_KEY || "", { upload: false, label: "MCP endpoint" });
  if (!g.ok) return g.response;
  return gatewayError(405, "METHOD_NOT_ALLOWED", "This MCP server uses POST only (no SSE stream).", { Allow: "POST" });
}

export async function DELETE(request, { params }) {
  return GET(request, { params });
}
