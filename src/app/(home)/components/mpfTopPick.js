"use client";

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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

const CommonPopUpform = dynamic(() => import("./common/popupform"), { ssr: false });

const USP_ICONS = { green: LuLeaf, amenities: LuCrown, gated: LuUsers };
const FACT_ICONS = {
  Possession: LuCalendarDays,
  "Starting from": LuCoins,
  Configuration: LuBuilding2,
};

const MODAL_FLEX_CLASS = "lead-form-popup-trigger--modal-flex";
const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 48;
const REVEAL_RATIO = 0.15;
const AUTOPLAY_RATIO = 0.35;
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
const TILT_QUERY = `(hover: hover) and (pointer: fine) and ${MOTION_QUERY}`;
const IMAGE_SIZES = "(max-width: 767.98px) 96vw, (max-width: 1199.98px) 85vw, 1150px";

/* ------------------------------------------------------------------ hooks */

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

/**
 * One observer for both the entrance reveal and autoplay visibility.
 * `reveal` is "armed" only when the section starts off-screen, so nothing hides without JS.
 */
function useSectionVisibility(ref) {
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [reveal, setReveal] = useState("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      setInView(true);
      return undefined;
    }

    const rect = node.getBoundingClientRect();
    setReveal(rect.top < window.innerHeight && rect.bottom > 0 ? "in" : "armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        setVisible(entry.isIntersecting);
        setInView(ratio >= AUTOPLAY_RATIO);
        if (ratio >= REVEAL_RATIO) setReveal("in");
      },
      { threshold: [0, REVEAL_RATIO, AUTOPLAY_RATIO] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return { visible, inView, reveal };
}

/**
 * Height of the fixed chrome over the page — the festive strip, plus the header
 * at ≤1024px where it doesn't hide on scroll — as `--fp-screen-top`, so the
 * section can fill exactly the rest of the screen.
 */
function useScreenTopOffset(ref) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return undefined;
    const update = () => {
      const strip = document.querySelector(".mpf-navratri-strip");
      const header = document.querySelector(".header");
      const headerHeight = window.innerWidth <= 1024 && header ? header.offsetHeight : 0;
      section.style.setProperty(
        "--fp-screen-top",
        `${(strip?.offsetHeight ?? 0) + headerHeight}px`,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
}

/** Section progress through the viewport as `--fp-par` (-1 → 1) for the photo parallax. */
function useScrollParallax(ref, enabled) {
  useEffect(() => {
    const section = ref.current;
    if (!enabled || !section) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (vh - rect.top) / (vh + rect.height);
      section.style.setProperty(
        "--fp-par",
        Math.min(1, Math.max(-1, progress * 2 - 1)).toFixed(3),
      );
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [ref, enabled]);
}

function clearTilt(node) {
  node.classList.remove("is-tilting");
  node.style.removeProperty("--mx");
  node.style.removeProperty("--my");
}

/** Pointer position over the photo as `--mx` / `--my` (-1 → 1) for the 3D tilt. */
function useTilt(enabled) {
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return useMemo(
    () => ({
      onPointerMove(event) {
        if (!enabled || event.pointerType !== "mouse") return;
        const node = event.currentTarget;
        const { clientX, clientY } = event;
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect();
          const x = ((clientX - rect.left) / rect.width) * 2 - 1;
          const y = ((clientY - rect.top) / rect.height) * 2 - 1;
          node.style.setProperty("--mx", Math.max(-1, Math.min(1, x)).toFixed(3));
          node.style.setProperty("--my", Math.max(-1, Math.min(1, y)).toFixed(3));
          node.classList.add("is-tilting");
        });
      },
      onPointerLeave(event) {
        cancelAnimationFrame(frameRef.current);
        clearTilt(event.currentTarget);
      },
    }),
    [enabled],
  );
}

/* ------------------------------------------------------------------- data */

/** "2 BHK-863 sq.ft, 3 BHK-990 sq.ft, 4 BHK-1552 sq.ft" → "2, 3 & 4 BHK" */
function summariseConfiguration(configuration) {
  const raw = String(configuration ?? "").trim();
  if (!raw) return "";
  const sizes = [...new Set(raw.match(/\d+(?=\s*BHK)/gi) ?? [])].sort((a, b) => a - b);
  if (sizes.length === 0) return raw.split(",")[0].trim();
  if (sizes.length === 1) return `${sizes[0]} BHK`;
  return `${sizes.slice(0, -1).join(", ")} & ${sizes[sizes.length - 1]} BHK`;
}

function formatStartingPrice(price) {
  const raw = String(price ?? "").trim();
  if (!raw || /[a-z]/i.test(raw)) return raw;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return raw;
  return value < 1 ? `₹ ${Math.round(value * 100)} Lakh*` : `₹ ${value} Cr*`;
}

/** The CMS stores "New Launched"; the badge reads better as "New Launch". */
function formatStatusBadge(status) {
  const raw = String(status ?? "").trim();
  return /^new launched$/i.test(raw) ? "New Launch" : raw;
}

function buildSlide(project) {
  const text = (value) => String(value ?? "").trim();
  const slug = text(project.slugURL);
  const editorial = getTopPickEditorial(slug);
  const projectName = text(project.projectName);
  const builderName = text(project.builderName);
  const locality = text(project.projectLocality);
  const city = text(project.cityName);
  const projectLogo = text(project.projectLogo);
  const configuration = summariseConfiguration(project.projectConfiguration);
  const configurationLabel = configuration
    ? `${configuration} ${project.propertyTypeName === "Commercial" ? "Commercial" : "Residences"}`
    : "";
  const price = formatStartingPrice(project.projectPrice);

  return {
    slug,
    href: slug ? `/${slug}` : "/projects",
    projectName,
    builderName,
    location: [locality, city].filter(Boolean).join(", ") || text(project.projectAddress),
    tagline: editorial.tagline ?? "",
    facts: [
      editorial.possession && { label: "Possession", value: editorial.possession },
      price && { label: "Starting from", value: price },
      !editorial.possession &&
        configurationLabel && { label: "Configuration", value: configurationLabel },
    ].filter(Boolean),
    usps: Array.isArray(editorial.usps) ? editorial.usps : [],
    statusFull: text(project.projectStatusName),
    status: formatStatusBadge(project.projectStatusName),
    headlinePrice: price || configurationLabel,
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

/* ------------------------------------------------------------------ slide */

const TopPickSlide = memo(function TopPickSlide({
  slide,
  index,
  total,
  isActive,
  isBefore,
  tilt,
  onEnquire,
}) {
  const viewTitle = `View ${slide.projectName} — floor plans, pricing, and details`;
  const uspKey = (usp) => `${usp.title}-${usp.note}`;

  return (
    <div
      className={`mpf-fp__slide${isActive ? " is-active" : isBefore ? " is-before" : ""}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${slide.projectName}`}
    >
      <article className="mpf-fp__card" aria-hidden={!isActive} inert={isActive ? undefined : ""}>
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
                <span className="mpf-fp__wordmark">{slide.builderName || slide.projectName}</span>
              )}
            </div>

            <div className="mpf-fp__headline">
              <h3 className="mpf-fp__project">
                <Link href={slide.href} title={viewTitle}>
                  {slide.projectName}
                </Link>
              </h3>
              {slide.headlinePrice && <p className="mpf-fp__price">{slide.headlinePrice}</p>}
            </div>

            {slide.status && (
              <p className="mpf-fp__badge" title={`Project status: ${slide.statusFull}`}>
                {slide.status}
              </p>
            )}
          </div>

          {slide.facts.length > 0 && (
            <dl className="mpf-fp__facts">
              {slide.facts.map(({ label, value }) => {
                const FactIcon = FACT_ICONS[label];
                return (
                  <div className="mpf-fp__fact" key={label}>
                    <dt>
                      {FactIcon && <FactIcon className="mpf-fp__fact-ico" aria-hidden="true" />}
                      {label}
                    </dt>
                    <dd>{value}</dd>
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
                  <li className="mpf-fp__perk" key={uspKey(usp)}>
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
            onClick={() => onEnquire(slide.enquiry)}
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
              sizes={IMAGE_SIZES}
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
            {slide.tagline && <p className="mpf-fp__tagline">{slide.tagline}</p>}
            {slide.usps.length > 0 && (
              <ul className="mpf-fp__usps">
                {slide.usps.map((usp) => (
                  <li className="mpf-fp__usp" key={uspKey(usp)}>
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
            title={viewTitle}
          >
            <LuArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </article>
    </div>
  );
});

/* ---------------------------------------------------------------- section */

export default function MpfTopPicks({ topProjects }) {
  const slides = useMemo(
    () =>
      (Array.isArray(topProjects) ? topProjects : [])
        .filter((project) => project?.projectName)
        .map(buildSlide),
    [topProjects],
  );

  const sectionRef = useRef(null);
  const swipeStart = useRef(null);
  const elapsedRef = useRef(0);
  const baseId = useId();

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [enquiryProject, setEnquiryProject] = useState(null);

  const total = slides.length;
  const hasMultiple = total > 1;
  const safeIndex = activeIndex < total ? activeIndex : 0;

  const motionOk = useMediaQuery(MOTION_QUERY);
  const tilt = useTilt(useMediaQuery(TILT_QUERY));
  const { visible, inView, reveal } = useSectionVisibility(sectionRef);
  useScreenTopOffset(sectionRef);
  useScrollParallax(sectionRef, motionOk && visible);

  const autoplay = hasMultiple && motionOk;
  const halted = paused || !inView || Boolean(enquiryProject);

  const step = useCallback(
    (delta) =>
      setActiveIndex((current) => {
        const from = current < total ? current : 0;
        return (from + delta + total) % total;
      }),
    [total],
  );

  useEffect(() => {
    if (!enquiryProject) return undefined;
    document.body.classList.add(MODAL_FLEX_CLASS);
    return () => document.body.classList.remove(MODAL_FLEX_CLASS);
  }, [enquiryProject]);

  // A slide change restarts the countdown and drops any leftover tilt.
  useEffect(() => {
    elapsedRef.current = 0;
    sectionRef.current?.querySelectorAll(".mpf-fp__media.is-tilting").forEach(clearTilt);
  }, [safeIndex, autoplay]);

  // Autoplay: pausing (hover/focus, off-screen, enquiry open) keeps the elapsed time,
  // so the countdown resumes in step with the CSS progress fill.
  useEffect(() => {
    if (!autoplay || halted) return undefined;
    const startedAt = performance.now();
    const id = setTimeout(() => step(1), Math.max(0, AUTO_ADVANCE_MS - elapsedRef.current));
    return () => {
      clearTimeout(id);
      elapsedRef.current += performance.now() - startedAt;
    };
  }, [autoplay, halted, safeIndex, step]);

  const onPointerDown = (event) => {
    if (hasMultiple && event.pointerType !== "mouse") {
      swipeStart.current = { x: event.clientX, y: event.clientY };
    }
  };

  const onPointerUp = (event) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) >= Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  };

  const onKeyDown = (event) => {
    if (!hasMultiple) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  if (total === 0) return null;

  const sectionClass = [
    "mpf-fp",
    reveal !== "idle" && `is-${reveal}`,
    autoplay && "is-autoplay",
    halted && "is-paused",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      className={sectionClass}
      style={{ "--fp-autoplay": `${AUTO_ADVANCE_MS}ms` }}
      aria-labelledby={`${baseId}-heading`}
      aria-roledescription="carousel"
    >
      <div className="container mpf-fp__inner">
        <header className="mpf-fp__head">
          <span className="mpf-fp__kicker">Featured pick</span>
          <h2 id={`${baseId}-heading`} className="mpf-fp__title">
            My Property Fact&apos;s Top Picks
          </h2>
        </header>

        <div
          className="mpf-fp__viewport"
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
          <div className="mpf-fp__rail" style={{ "--mpf-fp-index": safeIndex }}>
            {slides.map((slide, index) => (
              <TopPickSlide
                key={slide.slug || slide.projectName}
                slide={slide}
                index={index}
                total={total}
                isActive={index === safeIndex}
                isBefore={index < safeIndex}
                tilt={tilt}
                onEnquire={setEnquiryProject}
              />
            ))}
          </div>

          {hasMultiple && (
            <div className="mpf-fp__progress" aria-hidden="true">
              <span key={safeIndex} className="mpf-fp__progress-fill" />
            </div>
          )}
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
