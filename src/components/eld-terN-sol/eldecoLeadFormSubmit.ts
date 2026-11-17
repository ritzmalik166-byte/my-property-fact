import type { FormEvent } from "react";
import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";
import {
  ELDECO_CRM_PROJECT_NAME,
  ELDECO_GOOGLE_SHEET_NAME,
  ELDECO_GOOGLE_SHEET_URL,
} from "../eldecoPaths";

const ENABLE_CRM_SUBMISSION = false;

// RMW CRM Lead Capture API: leads land in CRM > Client Leads ("Eldeco Terra & Sol - Google Ads").
// gclid / UTM tags from the ad click are stored as attribution, so Google Ads leads show as google / cpc.
const RMW_CRM_ENDPOINT = "https://crm.ritzmediaworld.com/api/public/leads";
const RMW_CRM_API_KEY = "lc__06hJPiGjXfB6JH4j9mttgt0dQaQa1F1";
const RMW_CRM_PROJECT = "Eldeco Terra & Sol";
const AD_TRACK_KEYS = [
  "gclid", "gbraid", "wbraid", "fbclid",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
];

// Remember the ad click (gclid / UTM) as soon as the page loads, so it survives in-page navigation and return visits.
if (typeof window !== "undefined") {
  const qs = new URLSearchParams(window.location.search);
  AD_TRACK_KEYS.forEach((k) => {
    const v = qs.get(k);
    if (v) try { localStorage.setItem(`crm_${k}`, v); } catch { /* storage blocked */ }
  });
  try {
    if (!sessionStorage.getItem("crm_landing")) sessionStorage.setItem("crm_landing", window.location.href);
  } catch { /* storage blocked */ }
}

function getAdTracking() {
  const qs = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  AD_TRACK_KEYS.forEach((k) => {
    let v = qs.get(k);
    if (!v) try { v = localStorage.getItem(`crm_${k}`); } catch { /* storage blocked */ }
    if (v) out[k] = v;
  });
  return out;
}

/** Send the lead to the RMW CRM. Never blocks or fails the visitor's submission. */
function sendToRmwCrm(lead: { name: string; email: string; phone: string; message: string }) {
  let landing = window.location.href;
  try { landing = sessionStorage.getItem("crm_landing") || landing; } catch { /* storage blocked */ }
  return fetch(RMW_CRM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true, // finishes even if the page redirects to the thank-you page
    body: JSON.stringify({
      api_key: RMW_CRM_API_KEY,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
      project: RMW_CRM_PROJECT,
      form_name: "Eldeco Terra & Sol - Landing page",
      page_url: window.location.href,
      landing_page: landing,
      referrer: document.referrer,
      ...getAdTracking(),
    }),
  }).catch(() => undefined);
}

function getCurrentDateTime() {
  const now = new Date();
  const hours = now.getHours();

  return {
    date: `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${now.getFullYear()}`,
    time: `${hours % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${
      hours >= 12 ? "PM" : "AM"
    }`,
  };
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

export async function handleEldecoLeadFormSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const data = new FormData(event.currentTarget);
  const formData = {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: normalizeIndianPhone(String(data.get("phone") ?? "").trim()),
    message: String(data.get("message") ?? "").trim(),
    ...getCurrentDateTime(),
  };

  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    throw new Error(
      validation.name ||
        validation.email ||
        validation.phone ||
        "Invalid lead details.",
    );
  }

  const tracking = getTrackingFields();
  const crmPromise = ENABLE_CRM_SUBMISSION
    ? fetch("/api/crm-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mob: formData.phone,
          email: formData.email,
          name: formData.name,
          project: ELDECO_CRM_PROJECT_NAME,
          remark: formData.message,
          ...tracking,
        }),
      }).then(async (response) => {
        if (response.ok) return;
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(result.error ?? "Could not submit to CRM. Please try again.");
      })
    : Promise.resolve();

  const sheetBody = new FormData();
  sheetBody.append("sheetName", ELDECO_GOOGLE_SHEET_NAME);
  sheetBody.append("Name", formData.name);
  sheetBody.append("Email", formData.email);
  sheetBody.append("Phone", formData.phone);
  sheetBody.append("Message", formData.message || "No Message");

  const sheetPromise = fetch(ELDECO_GOOGLE_SHEET_URL, {
    method: "POST",
    body: sheetBody,
    mode: "no-cors",
  }).catch(() => {
    throw new Error("Could not save your enquiry. Please try again.");
  });

  const rmwCrmPromise = sendToRmwCrm(formData);

  await Promise.all([crmPromise, sheetPromise, rmwCrmPromise]);
  return { ok: true };
}
