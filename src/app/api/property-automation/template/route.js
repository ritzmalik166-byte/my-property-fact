/**
 * GET /api/property-automation/template?format=xlsx|json
 *  -> GET /api/v1/integrations/claude/template (Spring Boot)
 * xlsx (default) streams the workbook download; json returns the column specification.
 */
import { proxyGet, gatewayError, methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const format = new URL(request.url).searchParams.get("format");
  if (format !== null && !["xlsx", "json"].includes(format.toLowerCase())) {
    return gatewayError(400, "INVALID_FORMAT", "format must be 'xlsx' or 'json'.");
  }
  return proxyGet(request, { path: "/template", allowedQuery: ["format"] });
}

export function POST() {
  return methodNotAllowed("GET");
}
