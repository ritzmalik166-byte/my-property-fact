"use client";

import { useCallback } from "react";

/** Height of the fixed strip, plus the header where it stays pinned (≤1024px). */
function fixedChromeHeight() {
  const strip = document.querySelector(".mpf-navratri-strip");
  const header = document.querySelector(".header");
  const headerHeight = window.innerWidth <= 1024 && header ? header.offsetHeight : 0;
  return (strip?.offsetHeight ?? 0) + headerHeight;
}

/**
 * In-page link to the festive picks section that scrolls it to the middle of
 * the visible area (below the fixed strip/header). Sections taller than that
 * area are aligned to its top instead, so their heading is never cut off.
 */
export default function NavratriPicksLink({ targetId, children, ...props }) {
  const handleClick = useCallback(
    (event) => {
      const target = document.getElementById(targetId);
      if (!target) return;
      event.preventDefault();

      const chrome = fixedChromeHeight();
      const available = window.innerHeight - chrome;
      const { top, height } = target.getBoundingClientRect();
      const offset = chrome + Math.max(0, (available - height) / 2);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: Math.max(0, window.scrollY + top - offset),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      window.history.replaceState(null, "", `#${targetId}`);
    },
    [targetId],
  );

  return (
    <a href={`#${targetId}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
