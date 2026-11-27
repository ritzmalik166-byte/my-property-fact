/**
 * POST /api/property-automation/properties/validate
 *  -> POST /api/v1/integrations/claude/properties/validate (Spring Boot)
 * Multipart: excelFile (required), imagesZip (optional). Read-only on the backend.
 */
import { proxyMultipart, methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return proxyMultipart(request, { path: "/properties/validate" });
}

export function GET() {
  return methodNotAllowed("POST");
}
