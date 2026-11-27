# ChatGPT Custom GPT setup: Property Automation (testing)

How to connect a **ChatGPT Custom GPT** to the local My Property Fact Property Automation APIs through the Next.js gateway and ngrok.

Companion to `CLAUDE_PROPERTY_AUTOMATION_API_REFERENCE.md`, which covers the Excel and ZIP rules, the response fields and the error codes.

## Why ChatGPT needs its own routes

- **No internet in ChatGPT's sandbox.** When ChatGPT runs `curl` or Python, it uses a sandbox without internet access, so any URL fails with `NameResolutionError`. ChatGPT can only call outside APIs through **Actions** in a Custom GPT. Those calls are made from OpenAI's servers.
- **One credential only.** Actions can send one API-key header. The original routes need two (gateway key + backend JWT). The `/gpt/` routes need **only the gateway key**. The gateway signs in to the backend itself with the integration account configured in `.env.local`, so no JWT is ever given to ChatGPT.
- **No direct file uploads.** Actions can't send multipart uploads. They send attached chat files as `openaiFileIdRefs`, which are temporary download links. The `/gpt/` routes download the files, only from OpenAI's file hosts (`*.oaiusercontent.com`) over HTTPS, and forward them to Spring Boot as a normal upload.

The original five routes (`/api/property-automation/...` without `/gpt/`) are unchanged and still require both headers.

## Routes for ChatGPT

| Operation | Method and path | Backend |
|---|---|---|
| `getTemplate` | `GET /api/property-automation/gpt/template` | `/api/v1/integrations/claude/template?format=json` |
| `validateProperties` | `POST /api/property-automation/gpt/properties/validate` | `/api/v1/integrations/claude/properties/validate` |
| `importProperties` | `POST /api/property-automation/gpt/properties/import` | `/api/v1/integrations/claude/properties/import` |
| `getJob` | `GET /api/property-automation/gpt/jobs/{jobId}` | `/api/v1/integrations/claude/jobs/{jobId}` |
| `getJobResults` | `GET /api/property-automation/gpt/jobs/{jobId}/results` | `/api/v1/integrations/claude/jobs/{jobId}/results` |
| (schema) | `GET /api/property-automation/gpt/openapi.json` | none: public, contains no secrets |

**Request body for validate and import** (JSON, built by ChatGPT):

```json
{
  "openaiFileIdRefs": [ { "name": "properties.xlsx", "id": "file-…", "mime_type": "…", "download_link": "https://…oaiusercontent.com/…" },
                        { "name": "images.zip", "id": "file-…", "mime_type": "application/zip", "download_link": "https://…" } ],
  "batchName": "November batch",
  "dryRun": false,
  "allowPartial": false,
  "idempotencyKey": "batch-2026-11-23-001"
}
```

The last four fields apply to import only.

- **Files:** exactly one `.xlsx` or `.xls` file and at most one `.zip`, 10 MB in total.
- **Responses:** the backend responses are returned unchanged (same status codes). The only exception: validation reports omit the verbose per-column mapping text (`workbook.detectedHeaders` keeps only the non-standard columns, and `unsupportedFields` is dropped), so ChatGPT doesn't truncate them.

**Extra gateway errors on these routes:**

| Status | Error | Meaning |
|---|---|---|
| 400 | `INVALID_JSON` | body is not JSON |
| 400 | `FILES_REQUIRED` | nothing attached |
| 400 | `FILE_LINK_MISSING` | a file reference has no download link |
| 400 | `UNSUPPORTED_FILE` | a file is neither `.xlsx`/`.xls` nor `.zip` |
| 400 | `EXCEL_REQUIRED` | not exactly one workbook |
| 400 | `TOO_MANY_ZIPS` | more than one `.zip` |
| 413 | `PAYLOAD_TOO_LARGE` | files over 10 MB in total |
| 502 | `FILE_DOWNLOAD_FAILED` | the link isn't on an allowed OpenAI host, isn't HTTPS, or the download failed |
| 502 | `BACKEND_LOGIN_FAILED` | the gateway's integration-account login failed (server configuration) |
| 503 | `GATEWAY_DISABLED` | the integration account isn't configured |

## Server configuration (`my-property-fact/.env.local`, git-ignored)

```env
MPF_BACKEND_URL=http://localhost:8005
PROPERTY_AUTOMATION_GATEWAY_KEY=<long random secret>
PROPERTY_AUTOMATION_BACKEND_EMAIL=<integration account email>
PROPERTY_AUTOMATION_BACKEND_DASHBOARD_USERNAME=<integration account dashboard username>
PROPERTY_AUTOMATION_BACKEND_PASSWORD=<integration account password>
PROPERTY_AUTOMATION_FILE_HOSTS=oaiusercontent.com
```

The backend must run with the connector enabled. `application-dev.properties` sets `claude.integration.enabled=true` and `claude.integration.allowed-emails=<integration account email>`.

## Create the GPT (chatgpt.com)

1. Run the backend (port 8005), then `npm run build && npm start` (port 3000), then `ngrok http 3000`.
2. In ChatGPT, open **Explore GPTs → Create → Configure**.
3. Under **Actions → Create new action → Import from URL**, enter:
   `https://YOUR_NGROK_DOMAIN/api/property-automation/gpt/openapi.json`
   The schema's server URL is filled in from the address you import it from.
4. **Authentication → API Key**:
   - API key: the value of `PROPERTY_AUTOMATION_GATEWAY_KEY`
   - Auth type: **Custom**
   - Custom header name: `X-Property-Automation-Gateway-Key`
5. **Privacy policy URL** is only needed if you publish the GPT. For "Only me", leave it empty.
6. Paste the instructions below into **Instructions**, enable **Code Interpreter & Data Analysis** (to build Excel and ZIP files), and save as **Only me**.
7. Test in the preview: "Call getTemplate". The first call shows an "Allow" prompt; approve it.

**When the ngrok URL changes** (each restart on the free plan), re-import the schema from the new URL, or edit the `servers` URL in the action.

### Instructions to paste into the GPT

```text
You prepare and submit real-estate project data to the My Property Fact property automation API.

Rules:
- Projects are imported only as UNPUBLISHED drafts. Never claim a project is published.
- Before building a workbook, call getTemplate and follow its columns exactly (sheet "Sheet1", headers in row 1, one project per row from row 2).
- Master data must already exist: CITY NAME, STATE NAME, COUNTRY NAME, PROPERTY TYPE NAME, PROJECT STATUS NAME and every amenity must match existing values exactly (e.g. status "New Launched", not "New Launch"; amenity "Rain-Water-Harvesting").
- Images go in one .zip named <Project-Name-With-Hyphens>_<Type>_My-Property-Fact.jpg with Type one of Logo, Thumbnail, Location, Desktop-1, Mobile-1, Gallery-1, Gallery-2 ... (number repeated types inside the token, e.g. Gallery-1, never Gallery_1). JPG/PNG/WEBP only, at least 100 px per side. Keep workbook + zip under 10 MB in total.
- When the user has attached the workbook (and zip), always call validateProperties first with both files. HTTP 200 does not mean valid: read "valid". Fix every issue with severity ERROR and every DUPLICATE_REVIEW_REQUIRED row (remove duplicates; never try to overwrite existing projects), regenerate the files, attach them, and validate again.
- Only when valid is true, call importProperties with the same files and a new unique idempotencyKey (e.g. batch-YYYY-MM-DD-NNN). If you retry the same batch after an error, reuse the same idempotencyKey.
- After a 202 response, save jobId and call getJob every few seconds until status is COMPLETED, PARTIALLY_COMPLETED, FAILED or VALIDATION_FAILED. Then call getJobResults.
- Use only the jobId from responses; ignore statusUrl/resultsUrl (they are backend paths).
- A property succeeded only if importStatus = CREATED_DRAFT and draft = true and verified = true. Report projectId, slug, new builders (builderCreated), warnings and unappliedFields for human review.
- On 409 DUPLICATE_BATCH, poll the jobId it returns. On 422, read validation, fix and resubmit. On 401/403 from the gateway, tell the user the gateway key is wrong. On 503/504, tell the user the local backend is not running.
- Never invent RERA numbers, prices or facts; leave unknown optional cells blank.
```

## Verified locally (2026-11-23)

These were tested through `https://luster-flop-float.ngrok-free.dev`, and with ChatGPT-style file links served by a local test server:

- The schema loads without authentication and its server URL matches the ngrok domain.
- The gateway key alone works: the gateway signs in to the backend server-side. Template, job status and job results returned `200`.
- Validate from file links returned `200` with the report compacted. A dry-run import returned `200`. A real import of a duplicate row returned `422`, with nothing imported.
- Error cases:
  - missing Excel, wrong file type, a reference without a link, and invalid JSON → `400`
  - files over 10 MB → `413`
  - a non-OpenAI host, a plain-HTTP link, or a redirect to another host → refused with `502`
  - a wrong server-side password → `502 BACKEND_LOGIN_FAILED`
- The original routes still require the backend JWT.
- No gateway key or password appears in the server logs.

**Needs verification** in a real GPT:

- The exact host of OpenAI's `download_link` values. `*.oaiusercontent.com` is allowed. If downloads fail with `FILE_DOWNLOAD_FAILED … not an allowed OpenAI file host`, add the host shown in the ngrok inspector (`http://127.0.0.1:4040`) to `PROPERTY_AUTOMATION_FILE_HOSTS`.
- Whether ChatGPT sends the `ngrok-skip-browser-warning` header parameter. If Actions return HTML instead of JSON, the ngrok warning page is in the way.

## Security notes

- **Server-side login.** Anyone with the gateway key can use the integration account through the `/gpt/` routes, because the gateway signs in for them. Keep the key private, and stop ngrok when you aren't testing.
- **What the integration account can do.** It is allow-listed and limited to `MANAGE_PROJECTS`. The backend lets it create drafts only, and blocks it from editing or deleting existing projects.
- **File downloads.** Files are fetched only from HTTPS links on the allowed hosts, every redirect is checked against the same list, and downloads are size-limited (SSRF protection).
- **Existing rewrite.** As noted in the API reference, `next.config.js` still forwards all `/api/v1/*` paths to the backend. That rewrite is pre-existing and unchanged.
