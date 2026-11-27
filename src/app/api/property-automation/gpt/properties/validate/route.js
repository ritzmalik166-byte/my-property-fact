/**
 * ChatGPT Action: POST /api/property-automation/gpt/properties/validate
 *  JSON { openaiFileIdRefs } -> multipart POST /api/v1/integrations/claude/properties/validate
 */
import { gptUpload } from "@/lib/propertyAutomation/gptActions";
import { methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  return gptUpload(request, { path: "/properties/validate", allowOptions: false });
}

export function GET() {
  return methodNotAllowed("POST");
}
