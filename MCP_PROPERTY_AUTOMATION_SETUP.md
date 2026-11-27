# MCP server: Property Automation (ChatGPT / Claude connectors)

Temporary **local testing** MCP server that exposes the My Property Fact Property Automation APIs as MCP tools. It runs inside the existing Next.js app and is published through ngrok. Nothing is deployed.

Related docs:
- `CLAUDE_PROPERTY_AUTOMATION_API_REFERENCE.md`: data rules, response fields and error codes.
- `CHATGPT_PROPERTY_AUTOMATION_SETUP.md`: the older Custom GPT Actions route.

## Architecture

```text
ChatGPT (developer-mode connector) / Claude (custom connector)
  |  MCP over HTTPS: JSON-RPC POST, Streamable HTTP transport, stateless
  v
https://YOUR_NGROK_DOMAIN/api/property-automation/mcp/<MCP_KEY>     (Next.js, port 3000)
  |  builds properties.xlsx (exceljs) + images.zip (@zip.js/zip.js) from the tool arguments
  |  signs in server-side with the integration account
  v
Spring Boot  /api/v1/integrations/claude/*   (port 8005, connector enabled)
  v
MySQL (local)   unpublished drafts only
```

- **Two input modes.** Both feed the same image checks and the same backend endpoints.
  - **File mode (v1.1):** one Excel `workbook` and one `imagesZip`, transferred as files. The workbook is forwarded **unchanged**.
  - **JSON mode:** `properties` rows plus `images` URLs. The server builds the workbook (sheet `Sheet1`, template headers).
- **Images are checked before anything is forwarded.** In both modes the server:
  - checks format, dimensions, integrity, naming, project association and Image Studio size (see **Image validation**);
  - rebuilds a ZIP with canonical names (`<Project-Key>/<Project-Key>_<Slot>_My-Property-Fact.<ext>`);
  - forwards it. The backend then runs its own unchanged ZIP and image validation on it.
- **No new packages.** The server is hand-written (no MCP SDK) using libraries already in `package.json`. Image headers are parsed from the bytes; there is no image library.

## File transfer (workbook + image ZIP)

`workbook` and `imagesZip` each take **exactly one** of these:

| Form | Use it when | How it works |
|---|---|---|
| `{ "uploadId": "…" }` | Any client (Claude, ChatGPT, scripts), files up to the limit | Call `create_upload_session`, PUT the raw file to the returned `uploadUrl` (the result includes a ready `curl` command), then pass the `uploadId`. |
| `{ "download_url": "…", "file_id": "…" }` | ChatGPT, with a file attached in the chat | The tools declare `_meta["openai/fileParams"] = ["workbook","imagesZip"]`, so ChatGPT fills this in automatically. Only hosts in `PROPERTY_AUTOMATION_FILE_HOSTS` (default `oaiusercontent.com`) over https are fetched. |
| `{ "base64": "…", "filename": "…" }` | Tiny files only | The assistant must emit the whole file as text, which is impractical above a few hundred KB. Hard limit 4 MB. |

**Upload slot security.** Each `uploadId` is a 256-bit random value:
- It can be written **once** (a second PUT returns `409`).
- It is **never readable** over HTTP (GET returns `405`).
- It expires after 30 minutes (`PROPERTY_AUTOMATION_UPLOAD_TTL_MINUTES`).
- It can only be used by the MCP tools, which need the MCP key.
- Unknown ids return `404`, with a per-IP lockout after 10 misses per minute.
- The content must be a ZIP container (`PK`), otherwise `415`.
- Slots live in memory in the single Next.js process and are lost on restart.
- The same `uploadId`s can be reused for validate and then import.

**Size limits:**
- Workbook ≤ 5 MB. ZIP ≤ 9 MB.
- Workbook + rebuilt ZIP ≤ 10 MB per call, because of the backend dev multipart limit and the Next.js middleware 10 MB body limit.
- Split bigger batches.

**Upload endpoint:** `PUT https://YOUR_NGROK_DOMAIN/api/property-automation/uploads/<uploadId>`
- Body: the raw file bytes.
- Optional header: `X-File-Name`.

## Image validation (MPF Image Studio)

| Slot (canonical) | Accepted file-name tokens | Required size | Stored by the existing importer as |
|---|---|---|---|
| `Desktop-1` (day) | `Desktop-1`, `Desktop`, `Desktop-Banner`, `DesktopBanner`, `Desktop-Day` | 2225×1065 | fit in 2508×1200 (2225×1065 → 2507×1200, upscaled) |
| `Desktop-2` (night) | `Desktop-2`, `Desktop-Banner-2`, `Desktop-Night` | 2225×1065 | same |
| `Mobile-1` (day) | `Mobile-1`, `Mobile`, `Mobile-Banner`, `Mobile-Day` | 2700×2700 | fit in 800×800 (downscaled) |
| `Mobile-2` (night) | `Mobile-2`, `Mobile-Banner-2`, `Mobile-Night` | 2700×2700 | same |
| `Location` | `Location`, `Location-Map` | 815×815 | fit in 1200×800 (→ 800×800) |
| `Thumbnail` | `Thumbnail`, `Thumb` | 400×400 | fit in 800×800 (upscaled) |
| `Logo` (strip) | `Logo`, `Logo-Strip` | 390×100 | fit in 792×203 (upscaled) |
| `Gallery-N` | `Gallery-1`, `Gallery-2`… (number required) | unchanged original (any size ≥ 100 px per side) | fit in 1600×1200 |

**Checks per image** (each reported with a code):
- **Content and format:** the bytes must be JPEG, PNG or WEBP.
  - `IMAGE_UNSUPPORTED_FORMAT` names the real format: AVIF, HEIC, GIF, BMP, TIFF, SVG or PDF.
  - `IMAGE_INVALID_CONTENT` is used for anything else.
  - `IMAGE_EXTENSION_MISMATCH` means the extension doesn't match the content.
- **Integrity** (`IMAGE_CORRUPTED`):
  - JPEG: the marker segments are walked and the end marker is required.
  - PNG: every chunk CRC is verified and the image data is inflated and size-checked.
  - WEBP: the RIFF/chunk sizes and the VP8/VP8L header are checked. Animated WEBP is refused.
- **Size limits:**
  - `IMAGE_TOO_SMALL`: under 100 px on a side.
  - `IMAGE_TOO_MANY_PIXELS`: over 60 MP.
- **Image Studio size:** `IMAGE_SPEC_MISMATCH` (`specStatus: RESIZE_REQUIRED`) when the size isn't exact.
  - `imageSpecPolicy: "strict"` (the default) makes this an **ERROR**; `"warn"` makes it a warning.
  - The server **never resizes** images. It reports what has to be re-exported.
- **Naming and association:**
  - `IMAGE_BAD_NAME`, `IMAGE_UNKNOWN_TYPE` (with a suggestion), and `IMAGE_NAME_SUFFIX`.
  - `IMAGE_PROJECT_NOT_IN_WORKBOOK`: the project key is compared, slugged as the backend does, with the workbook's PROJECT NAME values.
  - `IMAGE_FOLDER_MISMATCH`.
- **Duplicates:**
  - `IMAGE_DUPLICATE_SLOT`: e.g. `Desktop-Banner` plus `Desktop-1` (ERROR).
  - `IMAGE_DUPLICATE_CONTENT`: same sha256 (warning).
  - `ZIP_DUPLICATE_FILE_NAME`.
- **ZIP safety:** `ZIP_UNSAFE_PATH` (a `..` or absolute path refuses the whole archive), `ZIP_SYMLINK`, `ZIP_ENCRYPTED`, `ZIP_TOO_MANY_ENTRIES` (200), `ZIP_SUSPICIOUS_RATIO`, `ZIP_EXTRACTED_TOO_LARGE` and `ZIP_UNREADABLE`. `__MACOSX`, `.DS_Store` and `Thumbs.db` are ignored and listed.
- **Missing assets** (`IMAGE_MISSING`, warning): any of the 7 slots above, or no gallery image, for each workbook project.
- **Source permission:** whenever images are sent, `imageSourcePermission: {confirmed: true, source: "…"}` is required.
  - Without it you get `IMAGE_SOURCE_PERMISSION_UNCONFIRMED` (ERROR).
  - The transfer source is recorded in `imageValidation.transfer`: upload-session, chatgpt-file (host and file id), inline-base64 or image-urls.
- **Gallery originals:** they're accepted at any size (`specStatus: ORIGINAL_ACCEPTED`) and stored unchanged (see Storage rule).

### Storage rule (backend connector, 2026-11-24)

These files implement it:
- `ClaudeImageStudioSpec`: the spec table and the slot order.
- `ClaudeImageMetadata`: lossless metadata removal.
- `ClaudeImageAttachmentService`: the storage decision.

**Kept as the original:** an image with its slot's exact Image Studio size, and every gallery image. The stored file has the same pixels, dimensions and format (JPEG, PNG or WebP).
- **Metadata removed losslessly:** EXIF (including GPS), XMP, IPTC, comments and PNG text chunks. Colour profiles are kept.
- **Re-checked before writing:** the cleaned file is decoded again and must have the same dimensions.
- **Report:** these images show `importerStorage.action = "KEPT_ORIGINAL"`.

**Resize path (as before, `FileUtils.saveImageFromBytes`)** is used for:
- an off-spec banner, logo, location or thumbnail;
- a JPEG whose EXIF orientation is not 1 (dropping it would rotate the displayed image);
- any file the lossless path can't handle.

These are fitted into the old boxes and re-encoded (`UPSCALED` / `DOWNSCALED`). Under the default `strict` policy, off-spec images never reach the importer.

**Order:** files are saved and rows inserted in slot order, whatever the ZIP order:
- Desktop-1 (day), Desktop-2 (night), Mobile-1, Mobile-2, Logo, Location, Thumbnail, then Gallery-1, Gallery-2 and so on.
- The site lists banners and gallery images in insertion (id) order.

**Alt tags:** logo, location and thumbnail now get alt tags (`<Project> - Logo` and so on). They used to be empty.

**Unchanged:**
- the ZIP checks: archive-bomb ratio, zip-slip, symlinks, encryption, pixel and size limits, format versus extension, full decode;
- duplicate detection and idempotency;
- draft-only inserts with the job-claim check;
- the image-source permission check.

**Day/night convention:** Desktop-Banner and Desktop-Banner-2 (and the Mobile equivalents) are read as day and night, and renamed to `Desktop-1` / `Desktop-2`. The backend only understands numbered tokens and rejects `Desktop-Banner` as an unknown type.

**Blocking rules:**
- `validate_properties` always returns the full report.
- `import_properties` stops with **`422 IMAGE_VALIDATION_FAILED`** if any image ERROR exists. Nothing is sent to the importer and nothing is written.
- Otherwise the backend's own rules still apply: duplicate project detection, `DUPLICATE_BATCH` idempotency, draft-only creation and verification. Existing projects are never modified.

## Endpoint and authentication

- **URL:** `https://YOUR_NGROK_DOMAIN/api/property-automation/mcp/<PROPERTY_AUTOMATION_MCP_KEY>`
  - MCP connectors in ChatGPT and Claude can't send custom headers, so the secret is the last path segment.
  - A wrong key returns `404`. Repeated wrong keys from one IP are locked out for the rest of the minute (`429`).
  - **Treat the full URL as a password.**
- **Connector authentication setting:** choose **No authentication**. The URL secret is the protection.
- **Backend access:** the server signs in to Spring Boot with the integration account in `.env.local` (`PROPERTY_AUTOMATION_BACKEND_*`). The MCP client never sees a JWT.
- **Transport:**
  - `POST` with JSON-RPC 2.0, single or batched messages, answered as `application/json`.
  - Notifications are answered with `202`.
  - `GET` and `DELETE` return `405`, because there's no SSE stream and no sessions.
  - Protocol versions supported: `2025-06-18`, `2025-03-26` and `2024-11-05`.

## Tools

| Tool | Writes? | Arguments | Backend call |
|---|---|---|---|
| `get_template` | no | none | `GET /template?format=json` |
| `create_upload_session` | no (memory slot only) | `files?: ["workbook","imagesZip"]` (default both) | none |
| `validate_properties` | no | **either** `workbook` **or** `properties[]`; **either** `imagesZip` **or** `images[]` (optional); `imageSourcePermission` (needed with images); `imageSpecPolicy?` (`strict`/`warn`) | `POST /properties/validate` |
| `import_properties` | **yes, drafts only** | same as validate, plus `idempotencyKey` (required), `batchName?`, `allowPartial?`, `dryRun?` | `POST /properties/import` |
| `get_import_job` | no | `jobId` | `GET /jobs/{jobId}` |
| `get_import_results` | no | `jobId` | `GET /jobs/{jobId}/results` |
| `get_property_details` (v1.2) | **no, read-only** | `propertyId` (integer, required); `inspectImages?` (default true); `compareWorkbook?`, `compareImagesZip?` (same file forms as `workbook` / `imagesZip`). Any other argument is refused. | `GET /api/v1/projects/admin/get-by-id/{id}` (integration JWT), `GET /api/v1/project-status`, `GET /api/v1/get/images/properties/{slug}/{file}` (no credentials) |

### get_property_details (read-only)

- **Read-only by construction:** `propertyDetails.js` sends GET only, and only to the three path patterns above (a hard-coded allow-list). The backend's `ClaudeIntegrationAccountRestrictionFilter` also limits the integration account to read-only project GETs on existing APIs.
- **Access:** the secret MCP key is required, plus the server-side integration account. Drafts are readable only through the admin endpoint; the public `/projects/get/{slug}` answers 400 for a draft.
- **Image URLs:** `readUrl` is returned only for **published** projects, because the backend image endpoint is unauthenticated. For drafts it is `null`, and the files are inspected server-side instead.
- **Response fields:**
  - `property`: name, slug, RERA, builder, location with ids, `publication.status` (DRAFT/PUBLISHED), `projectStatus {id,name,code}`, `propertyType`, configuration, price, amenities, location advantages, floor plans, FAQ pairs, descriptions, SEO metadata with lengths, alt tags and timestamps.
  - `images.assets[]`: `slot`, `kind`, `table`, `order`, `assetId`, `fileName`, `altTag`, `readUrl`.
    - `stored`: format, width, height, bytes and sha256, measured from the file.
    - `spec`: the Image Studio size.
    - `specStatus`: one of `MATCH`, `RESIZED_BY_IMPORTER`, `MISMATCH`, `ORIGINAL_PRESERVED`, `ORIGINAL_RESIZED`, `LIKELY_RESIZED_BY_IMPORTER` or `ORIGINAL_UNVERIFIED`.
    - `source`: the source image's details, when a comparison ZIP is given.
    - `issues[]`.
  - `images.findings[]`: missing slots, duplicate slot, content or record, the order of day/night banners, and withheld URLs.
  - `findings`: field-level ERROR/WARNING/INFO items.
  - `comparison.workbook`: per-column MATCH / DIFFERENT / NOT_SAVED.
  - `comparison.imagesZip`.
- **Backend limits:** the admin DTO returns banner ids as 0, so banner `assetId` is `null`. Logo, location and thumbnail are columns on the project row (`assetId` = `project.projectLogo` and so on). The order is the order the backend returns.

### get_property_details test: Metro Suites Glitz #1394 (2026-11-24, v1.2, local server)

The draft was compared with `metro-fixed.xlsx` (amenity corrected) and the 10-image ZIP. **17/17 checks passed.** The draft was not re-imported or changed: `status=false` and `updatedAt 2026-11-24T11:51:34` were the same before and after.

**Saved data:** 25 of 27 workbook fields match: all identity, location, RERA, SEO, description and FAQ fields, and all 37 amenities. The 2 that differ:
- BUILDER DESCRIPTION: the existing builder #423 keeps its own text, by design.
- LOCATION ADVANTAGE: free text, so nothing was saved.

| Slot | Stored file | Stored | Source | Image Studio | Status |
|---|---|---|---|---|---|
| Desktop-2 (order 1) | `…_desktop-2_fc670fb9.jpg` | 2507×1200 | 2225×1065 | 2225×1065 | RESIZED_BY_IMPORTER |
| Desktop-1 (order 2) | `…_desktop-1_c1f01cb3.jpg` | 2507×1200 | 2225×1065 | 2225×1065 | RESIZED_BY_IMPORTER |
| Mobile-2 (order 1) | `…_mobile-2_fbaca17d.jpg` | 800×800 | 2380×2380 | 2700×2700 | RESIZED + SOURCE_NOT_SPEC |
| Mobile-1 (order 2) | `…_mobile-1_e4dea740.jpg` | 800×800 | 2380×2380 | 2700×2700 | RESIZED + SOURCE_NOT_SPEC |
| Logo | `…_logo_dedfbcae.jpg` | 792×203 | 390×100 | 390×100 | RESIZED_BY_IMPORTER |
| Location | `…_location_e0854288.jpg` | 803×800 | 815×812 | 815×815 | RESIZED + SOURCE_NOT_SPEC |
| Thumbnail | `…_thumbnail_c20e2655.jpg` | 800×800 | 400×400 | 400×400 | RESIZED_BY_IMPORTER |
| Gallery-1 (#5035) | `…_gallery-1_bab0cb42.jpg` | 1200×1200 | 1800×1800 | original | ORIGINAL_RESIZED |
| Gallery-2 (#5036) | `…_gallery-2_e6e42d91.jpg` | 900×1200 | 765×1020 webp | original | ORIGINAL_RESIZED (webp → jpg) |
| Gallery-3 (#5037) | `…_gallery-3_4c0ef312.jpg` | 1600×719 | 1024×460 | original | ORIGINAL_RESIZED |

**Other findings:**
- No missing, duplicate or wrongly assigned images.
- Night banners were saved before day banners (`IMAGE_ORDER`). The cause was ZIP entry order; `writeCanonicalZip` now sorts by slot for future imports.
- Logo and location alt tags are empty.
- No location advantages are saved.
- No RERA QR.
- The price has no unit.

Full responses are kept in the session scratchpad: `details-1394.json` and `details-1394-compared.json`.

**`properties[]` items:**
- One object per project (one Excel row). The keys are the exact template headers, matched case- and space-insensitively, and the values are text.
- Allowed keys: `ID`, `BUILDER NAME`, `PROJECT NAME`, `PROPERTY TYPE NAME`, `PROJECT STATUS NAME`, `PROJECT CONFIGURATION`, `PROJECT LOCALITY`, `CITY NAME`, `STATE NAME`, `COUNTRY NAME`, `RERA NO`, `RERA WEBSITE`, `IVR NO`, `PROJECT PRICE`, `META TITLE`, `META DESCRIPTION`, `META KEYWORD`, `AMENITY DESCRIPTION`, `LOCATION DESCRIPTION`, `FLOOR PLAN DESCRIPTION`, `BUILDER DESCRIPTION`, `PROJECT Amenities`, `LOCATION ADVANTAGE`, `PROJECT WALKTHROUGH DESCRIPTION`, `Question 1`…`Answer 4`, and the optional `PROJECT ABOUT SHORT DESCRIPTION`.
- Required: `BUILDER NAME`, `PROJECT NAME`, `PROPERTY TYPE NAME`, `PROJECT STATUS NAME`, `CITY NAME`, `STATE NAME`, `COUNTRY NAME`.
- An unknown key is rejected rather than dropped. At most 50 properties per call.

**`images[]` items:** `{ "projectName": "<exact PROJECT NAME>", "type": "Desktop-1", "url": "https://…" }`.
- **Type tokens:** `Logo`, `Thumbnail`, `Location`, `Desktop-N`, `Mobile-N`, `Gallery-N`.
- **File names:** the server downloads each image and names it `<Project-Key>/<Project-Key>_<Type>_My-Property-Fact.<jpg|png|webp>`, with the extension taken from the real content.
- **Accepted URLs:** public **https** only. Private, loopback and link-local addresses (including after redirects) and URLs with credentials are refused.
- **Content:** JPEG, PNG or WEBP only.
- **Limits:** 10 MB in total per call, together with the workbook; at most 200 images.

**Tool result.** `structuredContent` (and the JSON text content) is `{ "httpStatus": <backend status>, "body": <backend JSON> }`, with `isError: true` when the status is 400 or higher.

When images are involved, the result also contains:
- **`valid`:** true only if the backend report and the image report are both valid.
- **`imageValidation`:**
  - `valid`, `specPolicy` and `summary`. The summary counts images, valid, invalid, specMatched, resizeRequired, galleryOriginals, renamed, resizedByImporter, missingAssets, errors and warnings.
  - `transfer`, `zip` and `sourcePermission`.
  - `batchIssues`.
  - `projects[]`, each with `missing[]` and issues.
  - `assets[]`. Each asset has: file, slot, typeToken, projectName, format, width, height, detail, bytes, sha256, spec, specStatus, importerStorage `{storedWidth, storedHeight, action, box}`, canonicalName, renamed, forwarded, status and issues.

- Validation reports omit the verbose per-column mapping text, so they stay small.
- Bad tool input returns `httpStatus: 400` with `body.error = "INVALID_TOOL_INPUT"` and a message saying what to fix.
- How to read each status is the same as in `CLAUDE_PROPERTY_AUTOMATION_API_REFERENCE.md`:
  - `202`: queued; poll the job.
  - `409 DUPLICATE_BATCH`: already submitted; poll its `jobId`.
  - `422 VALIDATION_FAILED`: nothing was imported.

### Storage rule test (2026-11-24, no database writes)

**Backend unit tests** (`ClaudeImageStorageTest`, run with JDK 21):
- They run the real `ClaudeZipInspector` and the real `ClaudeImageAttachmentService`, writing into a temporary `upload_dir`.
- The row writer (draft and claim checks, DB insert) is a mock that records what would be inserted, in order.
- **54/54 connector tests pass:** 7 new and 47 existing.

**JDK 25 limitation:** the Mockito/Byte Buddy versions in `pom.xml` can't instrument classes on JDK 25, so every Mockito test fails there, including tests that existed before. Run tests with JDK 21. `pom.xml` was not changed.

**Metro package used for the test:** the 10 Metro images under canonical names in a deliberately night-first ZIP order. Mobile-1/2 (2380×2380) and Location (815×812) don't meet the spec. For this test only, they were replaced by stand-ins rescaled to 2700×2700 and 815×815. These stand-ins are not production assets.

| Order | Slot | Source | Stored | Format | Bytes |
|---|---|---|---|---|---|
| 1 | Desktop-1 | 2225×1065 | 2225×1065 | jpg | metadata removed (−376 B) |
| 2 | Desktop-2 | 2225×1065 | 2225×1065 | jpg | metadata removed |
| 3 | Mobile-1 | 2700×2700 | 2700×2700 | jpg | byte-identical |
| 4 | Mobile-2 | 2700×2700 | 2700×2700 | jpg | byte-identical |
| 5 | Logo | 390×100 | 390×100 | jpg | metadata removed |
| 6 | Location | 815×815 | 815×815 | jpg | byte-identical |
| 7 | Thumbnail | 400×400 | 400×400 | jpg | metadata removed |
| 8 | Gallery-1 | 1800×1800 | 1800×1800 | jpg | metadata removed |
| 9 | Gallery-2 | 765×1020 | 765×1020 | **webp** | byte-identical |
| 10 | Gallery-3 | 1024×460 | 1024×460 | jpg | byte-identical |

**Non-destructive MCP checks (10/10 passed):**
- `validate_properties` (strict) on the corrected package: 0 image errors, and all 10 images are predicted `KEPT_ORIGINAL`.
- The backend still answers `DUPLICATE_REVIEW_REQUIRED`, because Metro already exists as #1394.
- Without `imageSourcePermission` the call fails with `IMAGE_SOURCE_PERMISSION_UNCONFIRMED`.
- `get_property_details(1394)` flags the missing alt tags, the missing location advantages, the price without a unit (`PRICE_NO_UNIT`, now a WARNING) and the night-before-day order.
- #1394 was unchanged, and no project #1395 was created.

## Server configuration (`my-property-fact/.env.local`, git-ignored)

```env
MPF_BACKEND_URL=http://localhost:8005
PROPERTY_AUTOMATION_MCP_KEY=<long random secret, at least 24 characters>
PROPERTY_AUTOMATION_BACKEND_EMAIL=<integration account email>
PROPERTY_AUTOMATION_BACKEND_DASHBOARD_USERNAME=<integration account dashboard username>
PROPERTY_AUTOMATION_BACKEND_PASSWORD=<integration account password>
# Testing only, never on a public tunnel: PROPERTY_AUTOMATION_MCP_ALLOW_PRIVATE_IMAGE_HOSTS=true
```

The backend must run with `claude.integration.enabled=true` and the integration email in `claude.integration.allowed-emails`. Both are already set in `application-dev.properties`.

## Start

```bash
# 1. backend (Cursor run, or):  java -jar target/My-property-fact-0.0.1-SNAPSHOT.jar    -> :8005
# 2. frontend
cd my-property-fact && npm run build && npm start                                       # -> :3000
# 3. tunnel
ngrok http 3000
```

## Connect ChatGPT (developer mode)

Availability depends on your ChatGPT plan; it is a beta feature.

1. In ChatGPT, open **Settings → Apps & Connectors → Advanced settings** and enable **Developer mode**.
2. Under **Settings → Apps & Connectors → Create**, fill in:
   - **Name:** `MPF Property Automation`
   - **MCP server URL:** `https://YOUR_NGROK_DOMAIN/api/property-automation/mcp/<PROPERTY_AUTOMATION_MCP_KEY>`
   - **Authentication:** No authentication
   - Tick "I trust this application", then click **Create**. ChatGPT lists the five tools.
3. In a new chat, choose **Developer mode** from the tools (+) menu and enable the connector. Ask, for example: "Use MPF Property Automation: call get_template."
4. ChatGPT asks for confirmation before `import_properties`, because it's marked as a write tool.

## Connect Claude (claude.ai custom connector)

1. Open **Settings → Connectors → Add custom connector**.
2. Enter a name and the same URL, leave the OAuth fields empty, and click **Add**.
3. Enable the connector in a chat via the tools menu.

**When the ngrok URL changes** (each restart on the free plan), edit the connector URL.

## Suggested prompt for the assistant

```text
Use the MPF Property Automation tools. Projects are created only as UNPUBLISHED drafts.
1) Call get_template and follow its columns exactly.
2) Research each project from reliable sources; verify RERA on the official state portal; never invent RERA numbers, prices or facts (leave unknown optional fields empty).
3) Master data must match exactly: CITY NAME, STATE NAME, COUNTRY NAME, PROPERTY TYPE NAME, PROJECT STATUS NAME ("New Launched", not "New Launch"), amenities (e.g. "Swimming-Pool_Gym_Rain-Water-Harvesting").
4) Call validate_properties with the workbook + images ZIP (attached files, or create_upload_session uploadIds), or with JSON rows + https image URLs, and imageSourcePermission {confirmed: true, source: "MPF Image Studio"}. Fix every ERROR in imageValidation and body, remove DUPLICATE_REVIEW_REQUIRED rows; repeat until valid is true.
5) Call import_properties with a new unique idempotencyKey. Save body.jobId.
6) Call get_import_job until body.status is COMPLETED, PARTIALLY_COMPLETED, FAILED or VALIDATION_FAILED, then get_import_results.
7) A property succeeded only if importStatus = CREATED_DRAFT, draft = true and verified = true. Report projectId, slug, builderCreated, warnings and unappliedFields.
```

## ZIP file transfer test: Metro Suites Glitz (2026-11-24, v1.1, local server)

**Fixtures:**
- **Workbook:** the Metro Suites Glitz row (sheet row 3) of `Property List-1 - Copy (1).xlsx`, saved as a one-row workbook.
- **Images:** the 10 `Metro-Suites-Glitz_*` images from `New folder (29)`, zipped flat with their original names. The originals were only read.

**Result: 35/35 checks passed, plus a real import (4/4).**

**What the image report found in the 10 images:**

| File | Slot | Size | Image Studio |
|---|---|---|---|
| Desktop-Banner | Desktop-1 (day) | 2225×1065 | MATCH |
| Desktop-Banner-2 | Desktop-2 (night) | 2225×1065 | MATCH |
| Mobile-Banner | Mobile-1 (day) | **2380×2380** | **RESIZE_REQUIRED** (2700×2700) |
| Mobile-Banner-2 | Mobile-2 (night) | **2380×2380** | **RESIZE_REQUIRED** (2700×2700) |
| Location | Location | **815×812** | **RESIZE_REQUIRED** (815×815) |
| Thumbnail | Thumbnail | 400×400 | MATCH |
| Logo | Logo | 390×100 | MATCH |
| Gallery-1 (jpg) | Gallery-1 | 1800×1800 | ORIGINAL_ACCEPTED |
| Gallery-2 (webp) | Gallery-2 | 765×1020 | ORIGINAL_ACCEPTED |
| Gallery-3 (jpg) | Gallery-3 | 1024×460 | ORIGINAL_ACCEPTED |

- All 10 images passed the format and integrity checks.
- All 10 were renamed to canonical names, and no slots were missing.
- The importer resizes all 10 when storing them.

**What the backend found in the workbook row:**
- `UNKNOWN_AMENITY`: "Rainwater-Harvesting" must be "Rain-Water-Harvesting". This blocks the original workbook.
- Warnings: builder #423 already exists, so BUILDER DESCRIPTION is not applied; LOCATION ADVANTAGE is free text and isn't parsed; PROJECT PRICE "1.85" has no unit.

**Checks:**
- **Tools and upload slots:**
  - `tools/list` shows 6 tools.
  - The `openai/fileParams` meta is present.
  - `create_upload_session` returns `201`.
  - PUT of the workbook and the ZIP returns `201`.
  - A second PUT to the same slot returns `409`. GET returns `405`. An unknown id returns `404`.
- **Strict policy:**
  - `valid=false`, with exactly 3 spec errors (Mobile-1, Mobile-2, Location).
  - `import_properties` returns `422 IMAGE_VALIDATION_FAILED`, and nothing is sent.
- **Source permission:** with no `imageSourcePermission`, the result is `IMAGE_SOURCE_PERMISSION_UNCONFIRMED`.
- **Warn policy:**
  - The image report is valid.
  - The backend received all 10 images in the rebuilt ZIP.
  - The backend reports the amenity error.
  - A dryRun writes nothing.
- **Negative ZIP:** each of these is reported:
  - a truncated JPEG (`IMAGE_CORRUPTED`)
  - a .png file with JPEG content (`IMAGE_EXTENSION_MISMATCH`)
  - an image for another project (`IMAGE_PROJECT_NOT_IN_WORKBOOK`)
  - the token `Banner` (`IMAGE_UNKNOWN_TYPE`)
  - the wrong folder (`IMAGE_FOLDER_MISMATCH`)
  - `Desktop-1` together with `Desktop-Banner` (`IMAGE_DUPLICATE_SLOT`)
  - a .txt file (`IMAGE_INVALID_CONTENT`)
  - missing slots (`IMAGE_MISSING`)
- **Rejected inputs:**
  - a ZIP with `../evil.jpg` (`ZIP_UNSAFE_PATH`)
  - a non-ZIP upload (`415`)
  - a ZIP slot used as the workbook
  - an empty slot
  - a `download_url` on a host that isn't allowed
  - `workbook` and `properties` together
- **Inline base64 workbook:** validates.
- **Real import** (local DB, corrected test copy with `Rain-Water-Harvesting`, `imageSpecPolicy: "warn"`):
  - The validation result was `valid=true`.
  - `import_properties` returned `202`, and the job reached `COMPLETED`.
  - The result was **CREATED_DRAFT, project #1394 `metro-suites-glitz`, draft=true, verified=true, builder #423 reused (not changed), imagesImported 10/10**.
- The MCP key and passwords don't appear in the server log.

**Open point: resolved later on 2026-11-24 (see "Storage rule").** The text below describes how imports behaved at the time of this test, including #1394.
- The existing importer always fits images into its own boxes. So:
  - Image Studio sizes are not stored as-is: desktop is stored at 2507×1200, mobile at 800×800, location at 800×800, thumbnail at 800×800 and the logo at 792×203.
  - Gallery originals are refitted to 1600×1200.
- Keeping exact Image Studio sizes and unchanged gallery originals needs a small change in the backend connector's `ClaudeImageAttachmentService`: pass the image's own size as the box when it matches its spec, or for gallery images.

## Verified on 2026-11-24 (v1.0, JSON mode)

**Through `https://luster-flop-float.ngrok-free.dev`:**
- A wrong key returns `404`.
- `initialize` returns `200` (protocol `2025-06-18`), and `notifications/initialized` returns `202`.
- `tools/list` lists the 5 tools.
- `get_template`, `get_import_job` (`COMPLETED`) and `get_import_results` (`CREATED_DRAFT`, `draft: true`, `verified: true`) all work.
- `validate_properties` with a JSON row returns `valid: true`.

**Locally:**
- `validate_properties` with a JSON row plus 3 image URLs returned `valid: true`. The server-built ZIP had 3 images, mapped to Desktop-1, Mobile-1 and Thumbnail.
- `import_properties` with `dryRun` returned "Dry run passed; nothing was written."
- Rejected as expected:
  - an unknown column
  - a non-image URL
  - an image whose project isn't in the batch
  - a private-IP image URL and a plain-http image URL
  - a bad jobId
  - an unknown method (`-32601`)
  - `GET` (`405`)
- The MCP key doesn't appear in the server logs.
- A real (non-dry-run) MCP import was not run, to avoid creating another draft. The same backend import path was verified earlier through the other routes (draft #1393).

**Needs verification with the real clients:**
- How ChatGPT's developer mode and Claude's connector UI behave on your plan.
- Whether the ngrok free-plan browser warning page interferes. It didn't in the curl tests.

## Security notes

- **Who can use it.** Anyone with the full URL can use the integration account: validate, and create unpublished drafts. Keep the URL private, rotate `PROPERTY_AUTOMATION_MCP_KEY` if it leaks, and stop ngrok when you aren't testing.
- **What the account can do.** It's allow-listed with only `MANAGE_PROJECTS`. The backend lets it create drafts only, and blocks edits or deletes of existing projects.
- **Image downloads.** The server fetches only public https URLs, checks the resolved IP addresses, re-checks every redirect, and limits size and time. A DNS rebinding window between the check and the connection is theoretically possible; this is acceptable for local testing only.
- **Existing rewrite.** `next.config.js` still forwards all `/api/v1/*` paths to the backend (pre-existing and unchanged; see the API reference, section K).
