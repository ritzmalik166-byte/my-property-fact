"use client";

import { useEffect } from "react";

/** Keeps `--mpf-site-header-height` in sync with the fixed site header so content can offset below it. */
export function useSiteHeaderHeight() {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector(".header");
    if (!header) return undefined;

    let raf = null;
    const compute = () => {
      const h = Math.round(header.getBoundingClientRect().height || header.offsetHeight || 0);
      if (h) root.style.setProperty("--mpf-site-header-height", `${h}px`);
    };
    const schedule = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    compute();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(header);
    window.addEventListener("resize", schedule);

    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);
}
