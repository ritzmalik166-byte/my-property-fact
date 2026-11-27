"use client";

import { useEffect } from "react";
import { captureTracking } from "../../lib/leadSubmit";

/** Remembers gclid / UTM tags from the ad URL (90 days) so every lead form can send them. */
export default function LeadTracking() {
  useEffect(() => {
    captureTracking();
  }, []);
  return null;
}
