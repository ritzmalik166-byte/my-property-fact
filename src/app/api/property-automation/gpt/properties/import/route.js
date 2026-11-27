/**
 * ChatGPT Action: POST /api/property-automation/gpt/properties/import
 *  JSON { openaiFileIdRefs, batchName?, dryRun?, allowPartial?, idempotencyKey? }
 *  -> multipart POST /api/v1/integrations/claude/properties/import
 */
import { gptUpload } from "@/lib/propertyAutomation/gptActions";
import { methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return gptUpload(request, { path: "/properties/import", allowOptions: true });
}

export function GET() {
  return methodNotAllowed("POST");
}
