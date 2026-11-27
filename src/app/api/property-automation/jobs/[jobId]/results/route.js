/**
 * GET /api/property-automation/jobs/{jobId}/results
 *  -> GET /api/v1/integrations/claude/jobs/{jobId}/results (Spring Boot)
 */
import { proxyGet, isValidJobId, gatewayError, methodNotAllowed } from "@/lib/propertyAutomation/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { jobId } = await params;
  if (!isValidJobId(jobId)) {
    return gatewayError(400, "INVALID_JOB_ID", "jobId must be the UUID returned by the import endpoint.");
  }
  return proxyGet(request, { path: `/jobs/${jobId}/results` });
}

export function POST() {
  return methodNotAllowed("GET");
}
