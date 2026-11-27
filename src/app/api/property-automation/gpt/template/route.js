/**
 * ChatGPT Action: GET /api/property-automation/gpt/template
 *  -> GET /api/v1/integrations/claude/template?format=json (column specification as JSON)
 */
import { gptGet } from "@/lib/propertyAutomation/gptActions";
import { methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  return gptGet(request, { path: "/template", query: [["format", "json"]] });
}

export function POST() {
  return methodNotAllowed("GET");
}
