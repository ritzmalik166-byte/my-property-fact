"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
  Scroll-triggered motion for the whole landing page. Exactly one effect per kind,
  so the page feels consistent:

  TEXT     every heading, paragraph, label, list item, badge, table cell and footer
           link → split into lines; each line slides up from behind its own mask
           (editorial "line reveal"), lines staggered.
  IMAGE    every photo / plan / map / logo → a curtain wipes the frame open from the
           bottom while the picture zooms from 1.3× down to rest.
  PARALLAX the two full-bleed backgrounds (hero, final CTA) drift slowly while you scroll.
  BUTTONS  rise in softly with their section (labels are not split).

  Responsive: shorter travel + faster timings on phones; lines re-split on resize
  (SplitText autoSplit). With prefers-reduced-motion nothing animates.
  Every reveal runs once — no replay when scrolling back up.
*/

const SCOPE = "main, footer";
const TEXT_TAGS = "h1, h2, h3, p, li, dt, dd, label, span, a";
// text inside these is never split
const SKIP = ".ets-water, [role=dialog], button, input, select, textarea, svg, [aria-hidden='true']";
// inline children allowed inside a "text leaf"
const INLINE = new Set(["SPAN", "BR", "STRONG", "EM", "B", "I", "SMALL"]);

/** An element that holds only text (+ inline wrappers) — safe to split into lines. */
function isTextLeaf(el) {
  if (!el.textContent.trim()) return false;
  if (el.closest(SKIP)) return false;
  for (const child of el.children) {
    if (!INLINE.has(child.tagName)) return false;
    if (child.querySelector("img, svg, button, input")) return false;
  }
  return true;
}

/** Keep only the outermost text leaves (a <p> with <span>s is split once, as the <p>). */
function outermost(list) {
  const set = new Set(list);
  return list.filter((el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
    return true;
  });
}

const PHOTO = "img:not([aria-hidden='true'])";

export default function ScrollAnimations() {
  useLayoutEffect(() => {
    const root = document.querySelector(".ets");
    if (!root) return undefined;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMobile, reduce } = context.conditions;
        if (reduce) return undefined;

        const T = {
          start: isMobile ? "top 92%" : "top 88%",
          textDuration: isMobile ? 0.9 : 1.1,
          lineStagger: isMobile ? 0.06 : 0.09,
          imageDuration: isMobile ? 1.2 : 1.5,
          rise: isMobile ? 24 : 40,
        };
        const scopes = [...root.querySelectorAll(SCOPE)];
        // the footer sits at the very end of the page — its last lines can never reach
        // the 88% line, so footer content reveals as soon as it enters the viewport
        const startFor = (el) => (el.closest("footer") ? "top bottom" : T.start);

        /* ── TEXT: masked line reveal ─────────────────────────────── */
        const candidates = scopes.flatMap((s) => [...s.querySelectorAll(TEXT_TAGS)]).filter(isTextLeaf);
        outermost(candidates).forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "etsLine", // one word: SplitText names the mask "etsLine-mask"
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                rotate: 2.5,
                transformOrigin: "0% 100%",
                duration: T.textDuration,
                ease: "expo.out",
                stagger: T.lineStagger,
                scrollTrigger: { trigger: el, start: startFor(el), once: true },
              }),
          });
        });

        /* ── BUTTONS: soft rise ───────────────────────────────────── */
        scopes
          .flatMap((s) => [...s.querySelectorAll(".ets-water")])
          .forEach((btn) => {
            gsap.from(btn, {
              y: T.rise,
              autoAlpha: 0,
              duration: 0.9,
              ease: "power3.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: { trigger: btn, start: startFor(btn), once: true },
            });
          });

        /* ── IMAGES: curtain wipe + zoom settle ───────────────────── */
        scopes
          .flatMap((s) => [...s.querySelectorAll(PHOTO)])
          .forEach((img) => {
            const frame = img.parentElement ?? img;
            const isHero = Boolean(img.closest("section")?.querySelector("h1"));
            const isBackdrop = isHero || Boolean(img.closest("#site-visit"));

            if (isHero) {
              // LCP image: never hidden — slow cinematic zoom-in on load instead of the wipe
              gsap.fromTo(img, { scale: 1.3 }, { scale: 1.08, duration: 2.4, ease: "expo.out" });
            } else {
              gsap.fromTo(
                img,
                { clipPath: "inset(100% 0% 0% 0%)", scale: 1.3 },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  scale: isBackdrop ? 1.08 : 1,
                  duration: T.imageDuration,
                  ease: "expo.out",
                  clearProps: isBackdrop ? "clipPath" : "clipPath,transform",
                  scrollTrigger: { trigger: frame, start: startFor(frame), once: true },
                },
              );
            }

            /* ── PARALLAX on the full-bleed backdrops ───────────────── */
            if (isBackdrop) {
              const section = img.closest("section");
              gsap.fromTo(
                img,
                { yPercent: isHero ? 0 : -3 },
                {
                  yPercent: isHero ? 8 : 3,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: isHero ? "top top" : "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            }
          });

        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        return () => window.removeEventListener("load", refresh);
      },
    );

    return () => mm.revert();
  }, []);

  return null;
}
