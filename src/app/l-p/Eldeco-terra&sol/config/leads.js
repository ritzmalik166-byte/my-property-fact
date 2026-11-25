/*
  Lead capture settings for /l-p/Eldeco-terra&sol (every form on the page:
  sidebar, mobile hero form, final CTA and all popups).

  Flow per submission (see ../lib/leadSubmit.js):
    1. validate name / phone / email in the browser
    2. POST JSON to the RMW CRM  → this decides success / error for the visitor
    3. POST the same lead (+ date, time, CRM status) to your Google Sheet
       (Apps Script web app, mode: "no-cors", keepalive) — a backup copy of every attempt
    4. on CRM success → redirect to the thank-you page
*/

export const CRM_ENDPOINT = "https://crm.ritzmediaworld.com/api/public/leads";
export const CRM_API_KEY = "lc_dlNf31Xvp7VKLUo7JS_67eOBR5Xlpw8r";
export const CRM_PROJECT = "Eldeco Terra & Sol (l-p)";

/**
 * Google Apps Script web-app URL (ends in /exec).
 * Paste it here after following google-sheet-setup.txt (in this route folder),
 * or set NEXT_PUBLIC_ETS_LEADS_SHEET_URL in the environment.
 * While empty, leads still go to the CRM; the sheet step is skipped.
 */
export const GOOGLE_SHEET_WEB_APP_URL = process.env.NEXT_PUBLIC_ETS_LEADS_SHEET_URL || "";

/** Ad-click / UTM parameters remembered from the landing URL. */
export const TRACK_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/** How long a remembered ad click stays attached to leads. */
export const TRACK_TTL_DAYS = 90;

/** Give up on the CRM after this long and show an error (ms). */
export const CRM_TIMEOUT_MS = 15000;

export const TIME_ZONE = "Asia/Kolkata";
