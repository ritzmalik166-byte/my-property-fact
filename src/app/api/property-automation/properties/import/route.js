/**
 * POST /api/property-automation/properties/import
 *  -> POST /api/v1/integrations/claude/properties/import (Spring Boot)
 * Multipart: excelFile (required), imagesZip (optional), batchName, dryRun, allowPartial, idempotencyKey
 * (the four optional parameters may be sent as multipart fields or as query parameters).
 */
import { proxyMultipart, methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return proxyMultipart(request, {
    path: "/properties/import",
    allowedQuery: ["batchName", "dryRun", "allowPartial", "idempotencyKey"],
  });
}

export function GET() {
  return methodNotAllowed("POST");
}
