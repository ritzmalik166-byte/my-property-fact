"use client";

import { useEffect, useState } from "react";
import ThirdPartyScripts from "./ThirdPartyScripts";

/** Home only: fallback so visitors who never interact are still tracked. */
const HOME_FALLBACK_AFTER_LOAD_MS = 6000;
const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "wheel", "mousemove"];

/**
 * Mount analytics (GTM/FB/GA/Clarity) after load + idle. On the homepage, wait for the
 * first user interaction (or a few seconds) so their ~1MB of script never competes with
 * hydration. Other routes keep the immediate post-load timing (landing/thank-you
 * conversions depend on it). Scripts still fire the same events once injected.
 */
export default function ThirdPartyScriptsLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    let done = false;
    const isHome = window.location.pathname === "/";
    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const fallbackDelayMs = isHome ? HOME_FALLBACK_AFTER_LOAD_MS : hasIdleCallback ? 0 : 2200;

    const reveal = () => {
      if (done) return;
      done = true;
      cleanupListeners();
      setReady(true);
    };

    const onInteraction = () => reveal();
    const cleanupListeners = () => {
      for (const type of INTERACTION_EVENTS) {
        window.removeEventListener(type, onInteraction, { capture: true });
      }
    };
    const scheduleFallback = () => {
      if (done) return;
      if (isHome) {
        for (const type of INTERACTION_EVENTS) {
          window.addEventListener(type, onInteraction, { capture: true, passive: true, once: true });
        }
      }
      timeoutId = window.setTimeout(() => {
        if (hasIdleCallback) {
          idleId = window.requestIdleCallback(reveal, { timeout: isHome ? 3000 : 4500 });
        } else {
          reveal();
        }
      }, fallbackDelayMs);
    };

    if (document.readyState === "complete") {
      scheduleFallback();
    } else {
      window.addEventListener("load", scheduleFallback, { once: true });
    }

    return () => {
      done = true;
      cleanupListeners();
      window.removeEventListener("load", scheduleFallback);
      if (typeof window.cancelIdleCallback === "function" && idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return <ThirdPartyScripts />;
}
