/**
 * GET /api/property-automation/gpt/openapi.json
 * OpenAPI 3.1 schema for a ChatGPT Custom GPT (Actions). Contains no secrets; the server URL is
 * taken from the incoming request so it always matches the current ngrok domain.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fileRefs = {
  type: "array",
  description:
    "The files the user attached in the chat: exactly one Excel workbook (.xlsx/.xls) and optionally one images .zip.",
  items: { type: "string" },
};

const ngrokHeader = {
  name: "ngrok-skip-browser-warning",
  in: "header",
  required: true,
  description: "Always send the value true (skips the ngrok browser warning page).",
  schema: { type: "string", enum: ["true"] },
};

const jobIdParam = {
  name: "jobId",
  in: "path",
  required: true,
  description: "The jobId UUID returned by importProperties (or by a 409 DUPLICATE_BATCH response).",
  schema: { type: "string", format: "uuid" },
};

const errorBody = {
  type: "object",
  properties: {
    status: { type: "integer" },
    error: { type: "string", description: "Machine-readable code, e.g. GATEWAY_KEY_INVALID, JOB_NOT_FOUND" },
    message: { type: "string" },
    source: { type: "string", description: "\"gateway\" when the Next.js gateway produced the error" },
  },
};

const anyObject = { type: "object", additionalProperties: true };

function schema(serverUrl) {
  return {
    openapi: "3.1.0",
    info: {
      title: "My Property Fact Property Automation (testing)",
      version: "1.0.0",
      description:
        "Validate and import real-estate projects from an Excel workbook (+ optional images ZIP) as UNPUBLISHED drafts. " +
        "Always call validateProperties first and fix every ERROR before importProperties. Import is asynchronous: poll getJob until the status is " +
        "COMPLETED, PARTIALLY_COMPLETED, FAILED or VALIDATION_FAILED, then call getJobResults. Use only the jobId from responses; ignore statusUrl/resultsUrl.",
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        gatewayKey: { type: "apiKey", in: "header", name: "X-Property-Automation-Gateway-Key" },
      },
      schemas: {},
    },
    security: [{ gatewayKey: [] }],
    paths: {
      "/api/property-automation/gpt/template": {
        get: {
          operationId: "getTemplate",
          summary: "Get the Excel column specification and image naming rules",
          parameters: [ngrokHeader],
          responses: {
            200: { description: "Template specification (sheetName, headerRow, firstDataRow, columns[], images{})", content: { "application/json": { schema: anyObject } } },
            default: { description: "Error", content: { "application/json": { schema: errorBody } } },
          },
        },
      },
      "/api/property-automation/gpt/properties/validate": {
        post: {
          operationId: "validateProperties",
          summary: "Validate the attached workbook and optional images ZIP (writes nothing)",
          description: "Returns a validation report. HTTP 200 does not mean valid: check the 'valid' field and fix every issue with severity ERROR.",
          parameters: [ngrokHeader],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["openaiFileIdRefs"], properties: { openaiFileIdRefs: fileRefs } },
              },
            },
          },
          responses: {
            200: { description: "Validation report (valid, importableRows, blockedRows, duplicateRows, workbookIssues[], zip, rows[] with errors[] and warnings[])", content: { "application/json": { schema: anyObject } } },
            default: { description: "Error", content: { "application/json": { schema: errorBody } } },
          },
        },
      },
      "/api/property-automation/gpt/properties/import": {
        post: {
          operationId: "importProperties",
          summary: "Queue the attached batch for creation as unpublished drafts (asynchronous)",
          description:
            "202 = queued: save jobId and poll getJob. 200 = dryRun result. 409 DUPLICATE_BATCH = already submitted: poll the returned jobId. 422 = validation failed, nothing imported.",
          parameters: [ngrokHeader],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["openaiFileIdRefs", "idempotencyKey"],
                  properties: {
                    openaiFileIdRefs: fileRefs,
                    batchName: { type: "string", description: "Label for this batch" },
                    dryRun: { type: "boolean", description: "true = validate only, write nothing", default: false },
                    allowPartial: { type: "boolean", description: "true = import valid rows even if others are blocked or duplicates", default: false },
                    idempotencyKey: { type: "string", description: "Unique key for this batch, e.g. batch-2026-11-23-001. Reuse it when retrying the same batch." },
                  },
                },
              },
            },
          },
          responses: {
            202: { description: "Queued: { jobId, status: QUEUED, message, validation }", content: { "application/json": { schema: anyObject } } },
            200: { description: "Dry run: { dryRun: true, message, validation }", content: { "application/json": { schema: anyObject } } },
            409: { description: "DUPLICATE_BATCH: { error, message, jobId, status }", content: { "application/json": { schema: anyObject } } },
            422: { description: "VALIDATION_FAILED: { jobId, status, message, validation }", content: { "application/json": { schema: anyObject } } },
            default: { description: "Error", content: { "application/json": { schema: errorBody } } },
          },
        },
      },
      "/api/property-automation/gpt/jobs/{jobId}": {
        get: {
          operationId: "getJob",
          summary: "Get import job status",
          description: "Terminal statuses: COMPLETED, PARTIALLY_COMPLETED, FAILED, VALIDATION_FAILED. Poll every few seconds until terminal.",
          parameters: [jobIdParam, ngrokHeader],
          responses: {
            200: { description: "Job (jobId, status, totalProperties, successfulProperties, failedProperties, duplicateProperties, skippedProperties, errorSummary)", content: { "application/json": { schema: anyObject } } },
            default: { description: "Error", content: { "application/json": { schema: errorBody } } },
          },
        },
      },
      "/api/property-automation/gpt/jobs/{jobId}/results": {
        get: {
          operationId: "getJobResults",
          summary: "Get per-property import results",
          description: "Success for a row = importStatus CREATED_DRAFT and draft true and verified true.",
          parameters: [jobIdParam, ngrokHeader],
          responses: {
            200: { description: "{ job, results: [ { excelRow, projectName, projectId, slug, draft, verified, builderCreated, importStatus, errors[], warnings[], unappliedFields } ] }", content: { "application/json": { schema: anyObject } } },
            default: { description: "Error", content: { "application/json": { schema: errorBody } } },
          },
        },
      },
    },
  };
}

export async function GET(request) {
  const proto = (request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "")).split(",")[0].trim();
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host).split(",")[0].trim();
  const serverUrl = `${proto}://${host}`;
  return new Response(JSON.stringify(schema(serverUrl), null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
