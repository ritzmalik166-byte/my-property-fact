"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  LuArrowRight,
  LuArrowUpRight,
  LuBuilding2,
  LuCalendarDays,
  LuCoins,
  LuCrown,
  LuLeaf,
  LuSparkles,
  LuUsers,
} from "react-icons/lu";
import {
  buildGalleryImageUrl,
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { getTopPickEditorial } from "./topPicksContent";
import "./common.css";
import "./mpfTopPick.css";

const CommonPopUpform = dynamic(() => import("./common/popupform"), {
  ssr: false,
});

const USP_ICONS = {
  green: LuLeaf,
  amenities: LuCrown,
  gated: LuUsers,
};

const FACT_ICONS = {
  Possession: LuCalendarDays,
  "Starting from": LuCoins,
  Configuration: LuBuilding2,
};

const MODAL_FLEX_CLASS = "lead-form-popup-trigger--modal-flex";

const AUTO_ADVANCE_MS = 6000;
/** Scroll-pinning drives slides by page scroll, which conflicts with the timed autoplay. */
const ENABLE_SCROLL_PIN = false;
const SWIPE_THRESHOLD_PX = 48;
/** Page scroll (px) spent on each card while pinned. */
const PIN_STEP_PX = 560;
const PIN_MEDIA_QUERY =
  "(min-width: 768px) and (min-height: 520px) and (prefers-reduced-motion: no-preference)";
const TILT_MEDIA_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const MOTION_MEDIA_QUERY = "(prefers-reduced-motion: no-preference)";

const pad2 = (value) => String(value).padStart(2, "0");

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Fades the section in the first time it scrolls into view. */
function useRevealOnce(ref) {
  const [state, setState] = useState("idle");
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setState("in");
      return undefined;
    }
    setState("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("in");
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return state;
}

/** Whether the element is currently on screen (autoplay only runs while visible). */
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

/**
 * Writes the section's progress through the viewport to `--fp-par` (-1 → 1),
 * which drifts the photos for a light parallax. Style-only, no re-renders.
 */
function useScrollParallax(sectionRef, enabled) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!enabled || !section) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh - rect.top) / (vh + rect.height);
      const value = Math.min(1, Math.max(-1, progress * 2 - 1));
      section.style.setProperty("--fp-par", value.toFixed(3));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      section.style.removeProperty("--fp-par");
    };
  }, [sectionRef, enabled]);
}

/** Pointer position over the photo as `--mx` / `--my` (-1 → 1) for the 3D tilt. */
function useCardTilt(enabled) {
  const frameRef = useRef(0);

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const card = event.currentTarget;
      const { clientX, clientY } = event;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        const rect = card.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((clientY - rect.top) / rect.height) * 2 - 1;
        card.style.setProperty("--mx", Math.max(-1, Math.min(1, x)).toFixed(3));
        card.style.setProperty("--my", Math.max(-1, Math.min(1, y)).toFixed(3));
        card.classList.add("is-tilting");
      });
    },
    [enabled],
  );

  const onPointerLeave = useCallback((event) => {
    const card = event.currentTarget;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    card.classList.remove("is-tilting");
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return { onPointerMove, onPointerLeave };
}

/** Scroll-pinning only where a whole card fits on screen; phones keep swipe. */
function usePinnedMode(enabled) {
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setPinned(false);
      return undefined;
    }
    const query = window.matchMedia(PIN_MEDIA_QUERY);
    const update = () => setPinned(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [enabled]);
  return pinned;
}

/**
 * Keeps the pinned panel clear of the fixed festive strip + site header, which
 * slides away on scroll-down and back on scroll-up.
 */
function usePinTopOffset(sectionRef, pinned) {
  useEffect(() => {
    if (!pinned) return undefined;
    const section = sectionRef.current;
    const header = document.querySelector(".header");
    const strip = document.querySelector(".mpf-navratri-strip");

    let frame = 0;
    let lastValue = -1;

    // Rendered edges (transform included) so a sliding-away header is tracked too.
    const update = () => {
      frame = 0;
      const stripBottom = strip ? strip.getBoundingClientRect().bottom : 0;
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const value = Math.round(Math.max(0, stripBottom, headerBottom));
      if (value === lastValue) return;
      lastValue = value;
      section?.style.setProperty("--fp-pin-top", `${value}px`);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    const observer = header ? new MutationObserver(request) : null;
    observer?.observe(header, { attributes: true, attributeFilter: ["class"] });
    header?.addEventListener("transitionend", request);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      header?.removeEventListener("transitionend", request);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [sectionRef, pinned]);
}

/**
 * Sizes the pinned section from the panel's real height: the section is the panel
 * plus one scroll step per extra card. A panel taller than the window sticks with
 * its bottom edge on screen (negative top) so the full photo stays visible.
 */
function usePinnedLayout(sectionRef, pinRef, pinned, total) {
  const stickTopRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!pinned || !section || !pin) return undefined;

    let frame = 0;
    const layout = () => {
      frame = 0;
      const pinHeight = pin.offsetHeight;
      const stickTop = Math.min(0, window.innerHeight - pinHeight);
      stickTopRef.current = stickTop;
      pin.style.top = `${stickTop}px`;
      section.style.height = `${pinHeight + (total - 1) * PIN_STEP_PX}px`;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(layout);
    };

    layout();
    const observer = new ResizeObserver(request);
    observer.observe(pin);
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", request);
      pin.style.top = "";
      section.style.height = "";
    };
  }, [sectionRef, pinRef, pinned, total]);

  return stickTopRef;
}

/** "2 BHK-863 sq.ft, 3 BHK-990 sq.ft, 4 BHK-1552 sq.ft" → "2, 3 & 4 BHK" */
function summariseConfiguration(configuration) {
  const raw = String(configuration ?? "").trim();
  if (!raw) return "";

  const sizes = [...new Set(raw.match(/\d+(?=\s*BHK)/gi) ?? [])].sort(
    (a, b) => Number(a) - Number(b),
  );
  if (sizes.length === 0) return raw.split(",")[0].trim();
  if (sizes.length === 1) return `${sizes[0]} BHK`;
  return `${sizes.slice(0, -1).join(", ")} & ${sizes[sizes.length - 1]} BHK`;
}

function formatStartingPrice(price) {
  const raw = String(price ?? "").trim();
  if (!raw) return "";
  if (/[a-z]/i.test(raw)) return raw;

  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return raw;
  return value < 1 ? `₹ ${Math.round(value * 100)} Lakh*` : `₹ ${value} Cr*`;
}

/** The CMS stores "New Launched"; the badge reads better as "New Launch". */
function formatStatusBadge(status) {
  const raw = String(status ?? "").trim();
  if (!raw) return "";
  return /^new launched$/i.test(raw) ? "New Launch" : raw;
}

function buildSlide(project) {
  const slug = String(project.slugURL ?? "").trim();
  const editorial = getTopPickEditorial(slug);
  const projectName = String(project.projectName ?? "").trim();
  const builderName = String(project.builderName ?? "").trim();
  const locality = String(project.projectLocality ?? "").trim();
  const city = String(project.cityName ?? "").trim();
  const isCommercial = project.propertyTypeName === "Commercial";
  const projectLogo = String(project.projectLogo ?? "").trim();
  const configuration = summariseConfiguration(project.projectConfiguration);
  const configurationLabel = configuration
    ? `${configuration} ${isCommercial ? "Commercial" : "Residences"}`
    : "";
  const price = formatStartingPrice(project.projectPrice);

  const facts = [
    editorial.possession && { label: "Possession", value: editorial.possession },
    price && { label: "Starting from", value: price },
    !editorial.possession &&
      configurationLabel && { label: "Configuration", value: configurationLabel },
  ].filter(Boolean);

  return {
    slug,
    href: slug ? `/${slug}` : "/projects",
    projectName,
    builderName,
    location:
      [locality, city].filter(Boolean).join(", ") ||
      String(project.projectAddress ?? "").trim(),
    tagline: editorial.tagline ?? "",
    facts,
    usps: Array.isArray(editorial.usps) ? editorial.usps : [],
    statusFull: String(project.projectStatusName ?? "").trim(),
    status: formatStatusBadge(project.projectStatusName),
    price,
    configuration: configurationLabel,
    enquiry: {
      id: project.id,
      slugURL: slug,
      projectName,
      builderName,
      cityName: city,
      location: locality,
    },
    image: buildProjectImageUrl(project, {
      preferThumbnail: false,
      fallback: DEFAULT_PROJECT_CARD_IMAGE,
    }),
    imageAlt: projectName
      ? `${projectName} — My Property Fact Top Picks featured project`
      : "Featured project — My Property Fact Top Picks",
    logo: projectLogo ? buildGalleryImageUrl(slug, projectLogo) : "",
    logoAlt: builderName
      ? `${builderName} — ${projectName} logo, My Property Fact Top Picks`
      : "Project logo — My Property Fact Top Picks",
  };
}

export default function MpfTopPicks({ topProjects }) {
  const slides = useMemo(
    () =>
      (Array.isArray(topProjects) ? topProjects : [])
        .filter((project) => project && project.projectName)
        .map(buildSlide),
    [topProjects],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [enquiryProject, setEnquiryProject] = useState(null);

  useEffect(() => {
    if (!enquiryProject) return undefined;
    document.body.classList.add(MODAL_FLEX_CLASS);
    return () => document.body.classList.remove(MODAL_FLEX_CLASS);
  }, [enquiryProject]);
  const swipeStart = useRef(null);
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const baseId = useId();

  const total = slides.length;
  const hasMultiple = total > 1;
  const safeIndex = activeIndex < total ? activeIndex : 0;
  const isLast = hasMultiple && safeIndex === total - 1;

  const pinned = usePinnedMode(ENABLE_SCROLL_PIN && hasMultiple);
  usePinTopOffset(sectionRef, pinned);
  const stickTopRef = usePinnedLayout(sectionRef, pinRef, pinned, total);

  const motionOk = useMediaQuery(MOTION_MEDIA_QUERY);
  const tiltOk = useMediaQuery(TILT_MEDIA_QUERY);
  const reveal = useRevealOnce(sectionRef);
  useScrollParallax(sectionRef, motionOk);
  const tilt = useCardTilt(tiltOk);
  const inView = useInView(sectionRef);
  const autoplay = hasMultiple && !pinned && motionOk;
  const halted = paused || !inView || Boolean(enquiryProject);

  // Pinned: page scroll drives the slide, so the section holds until every card has shown.
  useEffect(() => {
    if (!pinned) return undefined;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const scrolled =
        stickTopRef.current - section.getBoundingClientRect().top;
      const index = Math.round(scrolled / PIN_STEP_PX);
      setActiveIndex(Math.min(total - 1, Math.max(0, index)));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [pinned, total, stickTopRef]);

  const goTo = useCallback(
    (index) => {
      if (total < 1) return;
      if (!pinned) {
        setActiveIndex(((index % total) + total) % total);
        return;
      }
      const section = sectionRef.current;
      if (!section) return;
      const target = Math.min(total - 1, Math.max(0, index));
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      window.scrollTo({
        top: sectionTop - stickTopRef.current + target * PIN_STEP_PX + 1,
        behavior: "smooth",
      });
    },
    [pinned, total, stickTopRef],
  );

  const step = useCallback(
    (delta) => goTo(safeIndex + delta),
    [goTo, safeIndex],
  );

  // Auto-advance between projects every minute. Hover/focus pauses the countdown
  // and leaving resumes it, matching the CSS progress fill; a slide change restarts it.
  // Also halted while off-screen or while the enquiry form is open.
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = 0;
  }, [safeIndex, autoplay]);

  // A photo that stops being active keeps no leftover tilt.
  useEffect(() => {
    sectionRef.current
      ?.querySelectorAll(".mpf-fp__media.is-tilting")
      .forEach((media) => {
        media.classList.remove("is-tilting");
        media.style.removeProperty("--mx");
        media.style.removeProperty("--my");
      });
  }, [safeIndex]);

  useEffect(() => {
    if (!autoplay || halted) return undefined;
    const startedAt = performance.now();
    const remaining = Math.max(0, AUTO_ADVANCE_MS - elapsedRef.current);
    const id = setTimeout(() => step(1), remaining);
    return () => {
      clearTimeout(id);
      elapsedRef.current += performance.now() - startedAt;
    };
  }, [autoplay, halted, safeIndex, step]);

  const onPointerDown = (event) => {
    if (!hasMultiple || event.pointerType === "mouse") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy))
      return;
    step(dx < 0 ? 1 : -1);
  };

  const onKeyDown = (event) => {
    if (!hasMultiple) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  if (total === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={[
        "mpf-fp",
        pinned && "is-pinned",
        reveal === "armed" && "is-armed",
        reveal === "in" && "is-in",
        autoplay && "is-autoplay",
        halted && "is-paused",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--fp-autoplay": `${AUTO_ADVANCE_MS}ms` }}
      aria-labelledby={`${baseId}-heading`}
      aria-roledescription="carousel"
    >
      <div className="mpf-fp__pin" ref={pinRef}>
        <div className="container mpf-fp__inner">
          <header className="mpf-fp__head">
            <div className="mpf-fp__head-copy">
              <span className="mpf-fp__kicker">Featured pick</span>
              <h2 id={`${baseId}-heading`} className="mpf-fp__title">
                My Property Fact&apos;s Top Picks
              </h2>
            </div>
          </header>

          <div
            className={`mpf-fp__viewport${hasMultiple ? " has-peek" : ""}`}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={onKeyDown}
          >
            <div
              className="mpf-fp__rail"
              style={{
                "--mpf-fp-index": safeIndex,
                "--mpf-fp-end": isLast ? 1 : 0,
              }}
            >
              {slides.map((slide, index) => {
                const isActive = index === safeIndex;
                const stateClass = isActive
                  ? " is-active"
                  : index < safeIndex
                    ? " is-before"
                    : "";
                return (
                  <div
                    key={slide.slug || slide.projectName}
                    className={`mpf-fp__slide${stateClass}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${total}: ${slide.projectName}`}
                  >
                    <article
                      className="mpf-fp__card"
                      aria-hidden={!isActive}
                      inert={isActive ? undefined : ""}
                    >
                      <div className="mpf-fp__info">
                        <div className="mpf-fp__top">
                          <div className="mpf-fp__logo-box">
                            {slide.logo ? (
                              <Image
                                src={slide.logo}
                                alt={slide.logoAlt}
                                title={slide.logoAlt}
                                width={180}
                                height={80}
                                quality={88}
                                sizes="160px"
                                className="mpf-fp__logo"
                              />
                            ) : (
                              <span className="mpf-fp__wordmark">
                                {slide.builderName || slide.projectName}
                              </span>
                            )}
                          </div>

                          <div className="mpf-fp__headline">
                            <h3 className="mpf-fp__project">
                              <Link
                                href={slide.href}
                                title={`View ${slide.projectName} — floor plans, pricing, and details`}
                              >
                                {slide.projectName}
                              </Link>
                            </h3>
                            {(slide.price || slide.configuration) && (
                              <p className="mpf-fp__price">
                                {slide.price || slide.configuration}
                              </p>
                            )}
                          </div>

                          {slide.status && (
                            <p
                              className="mpf-fp__badge"
                              title={`Project status: ${slide.statusFull}`}
                            >
                              {slide.status}
                            </p>
                          )}
                        </div>

                        {slide.facts.length > 0 && (
                          <dl className="mpf-fp__facts">
                            {slide.facts.map((fact) => {
                              const FactIcon = FACT_ICONS[fact.label];
                              return (
                                <div className="mpf-fp__fact" key={fact.label}>
                                  <dt>
                                    {FactIcon && (
                                      <FactIcon
                                        className="mpf-fp__fact-ico"
                                        aria-hidden="true"
                                      />
                                    )}
                                    {fact.label}
                                  </dt>
                                  <dd>{fact.value}</dd>
                                </div>
                              );
                            })}
                          </dl>
                        )}

                        {slide.usps.length > 0 && (
                          <ul className="mpf-fp__perks">
                            {slide.usps.map((usp) => {
                              const UspIcon = USP_ICONS[usp.icon] ?? LuSparkles;
                              return (
                                <li
                                  className="mpf-fp__perk"
                                  key={`${usp.title}-${usp.note}`}
                                >
                                  <UspIcon aria-hidden="true" />
                                  <span>
                                    {usp.title} {usp.note}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        <button
                          type="button"
                          className="mpf-fp__enquire"
                          onClick={() => setEnquiryProject(slide.enquiry)}
                          title={`Enquire about ${slide.projectName}`}
                        >
                          <span>Enquire Now</span>
                          <LuArrowRight aria-hidden="true" />
                        </button>
                      </div>

                      <div
                        className="mpf-fp__media"
                        onPointerMove={isActive ? tilt.onPointerMove : undefined}
                        onPointerLeave={isActive ? tilt.onPointerLeave : undefined}
                      >
                        <div className="mpf-fp__media-layer">
                          <Image
                            src={slide.image}
                            alt={slide.imageAlt}
                            title={slide.imageAlt}
                            fill
                            quality={88}
                            sizes="(max-width: 767.98px) 96vw, (max-width: 1199.98px) 85vw, 1150px"
                            className="mpf-fp__img"
                          />
                        </div>
                        <span className="mpf-fp__scrim" aria-hidden="true" />

                        <div className="mpf-fp__overlay">
                          {slide.location && (
                            <>
                              <span className="mpf-fp__eyebrow">Location</span>
                              <p className="mpf-fp__loc">{slide.location}</p>
                            </>
                          )}
                          {slide.tagline && (
                            <p className="mpf-fp__tagline">{slide.tagline}</p>
                          )}
                          {slide.usps.length > 0 && (
                            <ul className="mpf-fp__usps">
                              {slide.usps.map((usp) => (
                                <li
                                  className="mpf-fp__usp"
                                  key={`${usp.title}-${usp.note}`}
                                >
                                  {usp.title} {usp.note}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <Link
                          href={slide.href}
                          className="mpf-fp__go"
                          aria-label={`View ${slide.projectName}`}
                          title={`View ${slide.projectName} — floor plans, pricing, and details`}
                        >
                          <LuArrowUpRight aria-hidden="true" />
                        </Link>
                      </div>
                    </article>

                    {!isActive && (
                      <button
                        type="button"
                        className="mpf-fp__peek-hit"
                        onClick={() => goTo(index)}
                        aria-label={`Show ${slide.projectName}`}
                        title={`Show ${slide.projectName}`}
                        tabIndex={-1}
                      >
                        <span className="mpf-fp__peek-icon" aria-hidden="true">
                          <LuArrowRight />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMultiple && (
              <div className="mpf-fp__progress">
                <div className="mpf-fp__progress-track">
                  {slides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.slug || slide.projectName}
                      className={`mpf-fp__progress-seg${
                        index === safeIndex
                          ? " is-active"
                          : index < safeIndex
                            ? " is-done"
                            : ""
                      }`}
                      onClick={() => goTo(index)}
                      aria-label={`Show ${slide.projectName}`}
                      aria-current={index === safeIndex ? "true" : undefined}
                      title={`Show ${slide.projectName}`}
                    >
                      <span className="mpf-fp__progress-fill" />
                    </button>
                  ))}
                </div>
                <p className="mpf-fp__count" aria-live="polite">
                  <span className="mpf-fp__count-now">{pad2(safeIndex + 1)}</span>
                  <span className="mpf-fp__count-sep" aria-hidden="true">
                    /
                  </span>
                  <span className="mpf-fp__count-all">{pad2(total)}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {enquiryProject && (
        <CommonPopUpform
          show
          handleClose={(open) => {
            if (!open) setEnquiryProject(null);
          }}
          from="Project Detail"
          data={enquiryProject}
        />
      )}
    </section>
  );
}
