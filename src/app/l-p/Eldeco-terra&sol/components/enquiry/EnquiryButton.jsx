"use client";

import Button from "../ui/Button";
import { useEnquiry } from "./EnquiryContext";

/** A design-system Button that opens the enquiry popup. */
export default function EnquiryButton({ title, submitLabel, source, children, ...buttonProps }) {
  const { openEnquiry } = useEnquiry();
  return (
    <Button
      {...buttonProps}
      onClick={() => openEnquiry({ title, submitLabel, source: source ?? String(children) })}
    >
      {children}
    </Button>
  );
}

/** Unstyled wrapper for non-button elements (thumbnails, badges) that should open the popup. */
export function EnquiryTrigger({ title, submitLabel, source, className, children, label }) {
  const { openEnquiry } = useEnquiry();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => openEnquiry({ title, submitLabel, source: source ?? label })}
    >
      {children}
    </button>
  );
}
