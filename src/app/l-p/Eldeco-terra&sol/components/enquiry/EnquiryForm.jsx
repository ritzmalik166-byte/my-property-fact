"use client";

import { useState } from "react";
import { ELDECO_LP_V6_THANK_YOU_PATH } from "@/components/eldecoPaths";
import Icon from "../ui/Icon";
import { icons } from "../../assets";
import { CONSENT_TEXT, PHONE_DISPLAY, PHONE_TEL, RERA } from "../../data/content";
import { LeadValidationError, submitLead } from "../../lib/leadSubmit";
import styles from "./EnquiryForm.module.css";

const NO_ERRORS = { name: "", phone: "", email: "" };

/**
 * "Enquiry form" component (23:561 sidebar, 23:595 final CTA, 23:690 mobile, popup).
 * Every instance submits through lib/leadSubmit.js → RMW CRM + Google Sheet.
 *   source       form name stored with the lead (CRM `form_name`, sheet "Form" column)
 *   showCallRow  the "Call Us" row, visible only in the mobile hero form
 */
export default function EnquiryForm({
  title = "Get Exclusive Price from Developer",
  submitLabel = "Get Exclusive Price",
  source = "Enquiry form",
  showCallRow = false,
  className = "",
  idPrefix = "ets",
  headingLevel = "h2",
}) {
  // idle → sending → success (redirecting) | error
  const [state, setState] = useState("idle");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(NO_ERRORS);
  const busy = state === "sending" || state === "success";
  const Heading = headingLevel;

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return; // no double submits
    const form = event.currentTarget;

    setState("sending");
    setFormError("");
    setFieldErrors(NO_ERRORS);

    try {
      await submitLead(form, source);
      setState("success");
      window.location.href = ELDECO_LP_V6_THANK_YOU_PATH;
    } catch (error) {
      setState("error");
      if (error instanceof LeadValidationError) {
        setFieldErrors({ ...NO_ERRORS, ...error.fieldErrors });
        const firstInvalid = ["name", "phone", "email"].find((f) => error.fieldErrors[f]);
        form.elements.namedItem(firstInvalid)?.focus({ preventScroll: false });
      } else {
        setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      }
    }
  }

  // clear a field's error as soon as the visitor edits it
  const clearError = (field) => () => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    if (formError) setFormError("");
  };

  const id = (name) => `${idPrefix}-${name}`;
  const fieldProps = (name) => ({
    id: id(name),
    name,
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? id(`${name}-error`) : undefined,
    onInput: clearError(name),
  });
  const errorText = (name) =>
    fieldErrors[name] ? (
      <p id={id(`${name}-error`)} className={styles.fieldError}>
        {fieldErrors[name]}
      </p>
    ) : null;

  return (
    <form
      className={`${styles.form} ${className}`}
      onSubmit={onSubmit}
      noValidate
      aria-busy={busy}
      data-crm-form={source}
    >
      <Heading className={styles.title}>{title}</Heading>

      {showCallRow ? (
        <a href={PHONE_TEL} className={styles.callRow}>
          <Icon src={icons.phoneGold18} size={18} />
          <span>Call Us: {PHONE_DISPLAY}</span>
        </a>
      ) : null}

      {/* fieldset[disabled] locks every input + the submit button while sending */}
      <fieldset className={styles.fieldset} disabled={busy}>
        <div className={styles.field}>
          <label htmlFor={id("name")} className={styles.label}>
            Full Name
          </label>
          <div className={`${styles.input} ${fieldErrors.name ? styles.invalid : ""}`}>
            <input {...fieldProps("name")} type="text" autoComplete="name" placeholder="Enter your name" maxLength={60} />
          </div>
          {errorText("name")}
        </div>

        <div className={styles.field}>
          <label htmlFor={id("phone")} className={styles.label}>
            Phone Number
          </label>
          <div className={`${styles.input} ${fieldErrors.phone ? styles.invalid : ""}`}>
            <span className={styles.prefix} aria-hidden="true">
              +91
              <span className={styles.prefixRule} />
            </span>
            <input
              {...fieldProps("phone")}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98XXXXXXXX"
              maxLength={10}
              onChange={(e) => {
                // digits only
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                if (digits !== e.target.value) e.target.value = digits;
              }}
            />
          </div>
          {errorText("phone")}
        </div>

        <div className={styles.field}>
          <label htmlFor={id("email")} className={styles.label}>
            Email Address
          </label>
          <div className={`${styles.input} ${fieldErrors.email ? styles.invalid : ""}`}>
            <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="name@gmail.com" maxLength={100} />
          </div>
          {errorText("email")}
        </div>

        <button type="submit" className={`ets-water ${styles.submit} ${busy ? styles.submitBusy : ""}`}>
          {busy ? <span className={styles.spinner} aria-hidden="true" /> : null}
          <span>{state === "sending" ? "Submitting…" : state === "success" ? "Redirecting…" : submitLabel}</span>
          {busy ? null : <Icon src={icons.chevron} size={18} />}
        </button>
      </fieldset>

      <p className={styles.srStatus} role="status" aria-live="polite">
        {state === "sending" ? "Submitting your details" : state === "success" ? "Submitted. Redirecting…" : ""}
      </p>

      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <p className={styles.consent}>{CONSENT_TEXT}</p>

      <p className={styles.trust}>
        <Icon src={icons.checkGold16} size={16} />
        <span>{RERA}</span>
      </p>
    </form>
  );
}
