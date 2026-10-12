"use client";

import { useEffect } from "react";

export default function DeferredStyles() {
  useEffect(() => {
    const loadDeferredStyles = () => {
      const addStylesheet = (href) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.media = "print";
        link.onload = function() {
          this.media = "all";
        };
        document.head.appendChild(link);
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(() => {
          document.documentElement.classList.add("styles-loaded");
        });
      } else {
        setTimeout(() => {
          document.documentElement.classList.add("styles-loaded");
        }, 100);
      }
    };

    if (document.readyState === "complete") {
      loadDeferredStyles();
    } else {
      window.addEventListener("load", loadDeferredStyles);
      return () => window.removeEventListener("load", loadDeferredStyles);
    }
  }, []);

  return null;
}
