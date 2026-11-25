import { normalizeIndianPhone, validateLeadFields } from "@/lib/leadValidation";
import {
  CRM_API_KEY,
  CRM_ENDPOINT,
  CRM_PROJECT,
  CRM_TIMEOUT_MS,
  GOOGLE_SHEET_WEB_APP_URL,
  TIME_ZONE,
  TRACK_KEYS,
  TRACK_TTL_DAYS,
} from "../config/leads";

const STORE_PREFIX = "ets_crm_";
const LANDING_KEY = "ets_crm_landing";

/* ── ad tracking (gclid / UTM) ─────────────────────────────────────────── */

/**
 * Remember gclid / UTM tags from the ad URL for TRACK_TTL_DAYS, and the first page
 * of this visit. Call once on page load.
 */
export function captureTracking() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  const expires = Date.now() + TRACK_TTL_DAYS * 24 * 60 * 60 * 1000;
  TRACK_KEYS.forEach((key) => {
    const value = qs.get(key);
    if (!value) return;
    try {
      localStorage.setItem(STORE_PREFIX + key, JSON.stringify({ value, expires }));
    } catch {
      /* storage blocked */
    }
  });
  try {
    if (!sessionStorage.getItem(LANDING_KEY)) sessionStorage.setItem(LANDING_KEY, window.location.href);
  } catch {
    /* storage blocked */
  }
}

function readTracking() {
  const qs = new URLSearchParams(window.location.search);
  const out = {};
  TRACK_KEYS.forEach((key) => {
    let value = qs.get(key);
    if (!value) {
      try {
        const saved = JSON.parse(localStorage.getItem(STORE_PREFIX + key) || "null");
        if (saved && saved.expires > Date.now()) value = saved.value;
        else if (saved) localStorage.removeItem(STORE_PREFIX + key);
      } catch {
        /* storage blocked / bad JSON */
      }
    }
    if (value) out[key] = value;
  });
  return out;
}

function landingPage() {
  try {
    return sessionStorage.getItem(LANDING_KEY) || window.location.href;
  } catch {
    return window.location.href;
  }
}

/* ── helpers ───────────────────────────────────────────────────────────── */

/** Date + time in IST, e.g. { date: "24-11-2026", time: "11:42 AM" }. */
function nowInIndia() {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.day}-${parts.month}-${parts.year}`,
    time: `${parts.hour}:${parts.minute} ${String(parts.dayPeriod || "").toUpperCase()}`,
  };
}

export class LeadValidationError extends Error {
  constructor(fieldErrors) {
    super(fieldErrors.name || fieldErrors.phone || fieldErrors.email || "Please check your details.");
    this.name = "LeadValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/** Validate a form's name / phone / email. Returns cleaned values or throws LeadValidationError. */
export function readLeadForm(form) {
  const data = new FormData(form);
  const lead = {
    name: String(data.get("name") ?? "").trim().replace(/\s+/g, " "),
    phone: normalizeIndianPhone(String(data.get("phone") ?? "")),
    email: String(data.get("email") ?? "").trim().toLowerCase(),
    message: String(data.get("message") ?? "").trim(),
  };
  const check = validateLeadFields(lead);
  if (!check.isValid) {
    throw new LeadValidationError({ name: check.name, phone: check.phone, email: check.email });
  }
  return lead;
}

/* ── destinations ──────────────────────────────────────────────────────── */

async function sendToCrm(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const res = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) {
      throw new Error(body.message || `We couldn't submit your details (error ${res.status}). Please try again.`);
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request took too long. Please check your connection and try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Network error — please check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Google Sheet backup via Apps Script. `no-cors` → the response is opaque, so this
 * never blocks or fails the visitor's submission. `keepalive` lets it finish even
 * though the page redirects to the thank-you page right after.
 */
function sendToGoogleSheet(row) {
  if (!GOOGLE_SHEET_WEB_APP_URL) return Promise.resolve();
  return fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    body: new URLSearchParams(row), // form-encoded = "simple" request, read as e.parameter in Apps Script
  }).catch(() => undefined);
}

/* ── main entry ────────────────────────────────────────────────────────── */

/**
 * Submit one lead from a form on this page.
 * @param {HTMLFormElement} form   needs inputs named name / phone / email (+ optional message)
 * @param {string} formName        which form it came from (shown in the CRM + sheet)
 * @throws LeadValidationError | Error — message is safe to show to the visitor
 */
export async function submitLead(form, formName) {
  const lead = readLeadForm(form);
  const tracking = readTracking();
  const { date, time } = nowInIndia();

  const common = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message || formName,
    project: CRM_PROJECT,
    form_name: formName,
    page_url: window.location.href,
    landing_page: landingPage(),
    referrer: document.referrer,
    ...tracking,
  };

  let crmStatus = "success";
  try {
    await sendToCrm({ api_key: CRM_API_KEY, ...common });
  } catch (error) {
    crmStatus = `failed: ${error.message}`;
    // still record the attempt in the sheet, then surface the error
    await sendToGoogleSheet({ ...common, date, time, crm_status: crmStatus });
    throw error;
  }

  await sendToGoogleSheet({ ...common, date, time, crm_status: crmStatus });
  return { ok: true };
}
