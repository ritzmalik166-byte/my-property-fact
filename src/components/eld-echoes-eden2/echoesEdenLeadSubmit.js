import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";

export const ECHOES_EDEN_LANDING_PATH = "/lp/eldeco-echoes-of-eden";
export const ECHOES_EDEN_THANKYOU_PATH = `${ECHOES_EDEN_LANDING_PATH}/thankyou`;
export const ECHOES_EDEN_CRM_PROJECT_NAME = "Eldeco Echoes of Eden";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyGFtKW9LdwEHvwO7GTS5Ov2Ri6xFUUJs7qb0mF2FpN-ZmFjab5o4gEty8U1DuRyCQL/exec";
const SHEET_NAME = "Sheet1";

// RMW CRM lead capture (also stores the Google Ads gclid for conversion tracking)
const RMW_CRM_ENDPOINT = "https://crm.ritzmediaworld.com/api/public/leads";
const RMW_CRM_API_KEY = "lc__Gq1WievSLEXLSELt7jPdOzqmA3FfeNd";
const RMW_TRACK_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/** Call once on page load: remembers ad click IDs / UTM tags and the landing URL. */
export function rememberCrmTracking() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  RMW_TRACK_KEYS.forEach((k) => {
    const v = qs.get(k);
    if (v) try { localStorage.setItem(`crm_${k}`, v); } catch {}
  });
  try {
    if (!sessionStorage.getItem("crm_landing")) sessionStorage.setItem("crm_landing", window.location.href);
  } catch {}
}

function sendToRmwCrm({ name, email, phone, message }) {
  const data = {
    api_key: RMW_CRM_API_KEY,
    form_name: "Echoes of Eden LP",
    name,
    phone,
    email,
    message,
    project: ECHOES_EDEN_CRM_PROJECT_NAME,
    page_url: window.location.href,
    referrer: document.referrer,
  };
  try { data.landing_page = sessionStorage.getItem("crm_landing") || window.location.href; } catch { data.landing_page = window.location.href; }
  const qs = new URLSearchParams(window.location.search);
  RMW_TRACK_KEYS.forEach((k) => {
    let v = qs.get(k);
    if (!v) try { v = localStorage.getItem(`crm_${k}`); } catch {}
    if (v) data[k] = v;
  });
  return fetch(RMW_CRM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then((r) => { if (!r.success) throw new Error(r.message || "RMW CRM rejected lead"); })
    .catch((e) => console.error("RMW CRM:", e));
}

function getTrackingFields() {
  const query = new URLSearchParams(window.location.search);

  return {
    url: `${window.location.host}${window.location.pathname}`,
    uniqueId: `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`,
    fld1: (query.get("utm_source") ?? "").trim(),
    fld2: (query.get("utm_campaign") ?? "").trim(),
    fld3: (query.get("utm_medium") ?? "").trim(),
    fld4: (query.get("utm_term") ?? query.get("utm_keyword") ?? "").trim(),
  };
}

function buildMessage(homeType) {
  const preference = String(homeType || "").trim();
  if (!preference) return "Enquiry for Eldeco Echoes of Eden";
  return `Enquiry for Eldeco Echoes of Eden. Looking for: ${preference}`;
}

/**
 * Validate, save lead to Google Sheet, and send to CRM.
 * Sheet uses no-cors simple fetch — response body cannot be read; success = request sent.
 */
export async function submitEchoesEdenLead({ name, email, phone, homeType }) {
  const formData = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    phone: normalizeIndianPhone(String(phone || "").trim()),
    message: buildMessage(homeType),
  };

  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    throw new Error(
      validation.name ||
        validation.email ||
        validation.phone ||
        "Please check your details and try again.",
    );
  }

  const tracking = getTrackingFields();

  const crmPromise = fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mob: formData.phone,
      email: formData.email,
      name: formData.name,
      project: ECHOES_EDEN_CRM_PROJECT_NAME,
      remark: formData.message,
      ...tracking,
    }),
  }).then(async (response) => {
    if (response.ok) return;
    const result = (await response.json().catch(() => ({})));
    throw new Error(result.error ?? "Could not submit to CRM. Please try again.");
  });

  const sheetBody = new FormData();
  sheetBody.append("sheetName", SHEET_NAME);
  sheetBody.append("Name", formData.name);
  sheetBody.append("Email", formData.email);
  sheetBody.append("Phone", formData.phone);
  sheetBody.append("Message", formData.message);
  sheetBody.append("Date", new Date().toString());

  const sheetPromise = fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    body: sheetBody,
    mode: "no-cors",
  }).catch(() => {
    throw new Error("Could not save your enquiry. Please try again.");
  });

  const rmwPromise = sendToRmwCrm(formData);

  await Promise.all([crmPromise, sheetPromise, rmwPromise]);
  return { ok: true };
}

export function goToEchoesEdenThankYou() {
  if (typeof window === "undefined") return;
  window.location.href = ECHOES_EDEN_THANKYOU_PATH;
}
