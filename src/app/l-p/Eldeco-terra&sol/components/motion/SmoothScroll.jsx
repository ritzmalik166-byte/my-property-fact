"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "./lenisStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling — mounted by this landing page only, so the rest of the
 * site keeps native scrolling. Driven by GSAP's ticker so ScrollTrigger animations
 * stay in sync. In-page anchor links (#overview, #price …) scroll smoothly and stop
 * 16px under the sticky header.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      anchors: {
        offset: -((document.querySelector(".ets header")?.offsetHeight ?? 84) + 16),
      },
    });
    setLenis(lenis);
    document.documentElement.classList.add("ets-lenis");

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
      document.documentElement.classList.remove("ets-lenis");
    };
  }, []);

  return null;
}
