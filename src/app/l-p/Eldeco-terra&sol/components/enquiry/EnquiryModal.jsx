"use client";

import { useEffect, useRef } from "react";
import EnquiryForm from "./EnquiryForm";
import { startPageScroll, stopPageScroll } from "../motion/lenisStore";
import styles from "./EnquiryModal.module.css";

/** Popup version of the enquiry form, opened by every "Get Price / Unlock / Request" CTA. */
export default function EnquiryModal({ open, onClose, title, submitLabel, source }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    stopPageScroll();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector("input:not([type=hidden])")?.focus({ preventScroll: true });
    }, 50);
    return () => {
      document.body.style.overflow = overflow;
      startPageScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      data-lenis-prevent
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close enquiry form">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <EnquiryForm
          title={title}
          submitLabel={submitLabel}
          source={`Popup — ${source}`}
          idPrefix="ets-modal"
          className={styles.form}
        />
      </div>
    </div>
  );
}
