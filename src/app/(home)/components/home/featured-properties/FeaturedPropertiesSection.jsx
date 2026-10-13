"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBath,
  LuBedDouble,
  LuHeart,
  LuMapPin,
  LuMaximize,
} from "react-icons/lu";
import "./featuredProperties.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--fp-display-font",
});

const WISHLIST_KEY = "mpf_wishlist_properties";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready to Move" },
  { key: "under-construction", label: "Under Construction" },
  { key: "new-launch", label: "New Launch" },
];

function formatPrice(price) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!n || Number.isNaN(n)) return null;
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  return Math.round(n).toLocaleString("en-IN");
}

function readWishlist() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function FeaturedPropertyCard({ property, saved, onToggleSave }) {
  const [imgFailed, setImgFailed] = useState(false);
  const href = `/properties/${property.slug || property.id}`;
  const price = formatPrice(property.totalPrice);
  const stats = [
    property.bedrooms != null && {
      icon: <LuBedDouble />,
      value: property.bedrooms,
      label: "Beds",
    },
    property.bathrooms != null && {
      icon: <LuBath />,
      value: property.bathrooms,
      label: "Baths",
    },
    property.area && {
      icon: <LuMaximize />,
      value: Math.round(property.area).toLocaleString("en-IN"),
      label: "Sq. Ft.",
    },
  ].filter(Boolean);

  return (
    <article className="fp-card">
      {property.image && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="fp-card__img"
          src={property.image}
          alt={property.projectName}
          title={property.projectName}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="fp-card__img fp-card__img--empty" aria-hidden />
      )}
      <div className="fp-card__shade" aria-hidden />
      <Link
        href={href}
        className="fp-card__hit"
        aria-label={`View ${property.projectName}`}
        tabIndex={-1}
      />

      <div className="fp-card__top">
        {property.status ? (
          <span className="fp-card__status">
            <i aria-hidden />
            {property.status}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={`fp-card__save${saved ? " is-saved" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => onToggleSave(property.id)}
        >
          <LuHeart />
        </button>
      </div>

      <div className="fp-card__body">
        {property.builderName && (
          <p className="fp-card__builder">{property.builderName}</p>
        )}
        <h3 className="fp-card__name" title={property.projectName}>
          {property.projectName}
        </h3>
        {property.location && (
          <p className="fp-card__loc">
            <LuMapPin aria-hidden />
            <span>{property.location}</span>
          </p>
        )}
        <p className="fp-card__price">
          {price ? (
            <>
              <span className="fp-card__rupee">₹</span>
              {price}
            </>
          ) : (
            "Price on request"
          )}
        </p>
        {stats.length > 0 && (
          <ul className="fp-card__stats">
            {stats.map((s) => (
              <li key={s.label}>
                {/* <span className="fp-card__stat-ico" aria-hidden>
                  {s.icon}
                </span> */}
                <span>
                  <strong>{s.value}</strong>
                  <em>{s.label}</em>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href={href} className="fp-card__cta">
          View Property
          <LuArrowRight aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedPropertiesSection({ properties = [] }) {
  const [filter, setFilter] = useState("all");
  const [wishlist, setWishlist] = useState(() => new Set());
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    setWishlist(readWishlist());
  }, []);

  const availableFilters = useMemo(
    () =>
      FILTERS.filter(
        (f) => f.key === "all" || properties.some((p) => p.statusKey === f.key),
      ),
    [properties],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? properties
        : properties.filter((p) => p.statusKey === filter),
    [properties, filter],
  );

  const syncArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setCanPrev(rail.scrollLeft > 4);
    setCanNext(rail.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    rail.scrollLeft = 0;
    syncArrows();
    rail.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      rail.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [visible, syncArrows]);

  const scrollRail = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector(".fp-slide");
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = card ? card.getBoundingClientRect().width + gap : rail.clientWidth;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const toggleSave = useCallback((id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  if (!properties.length) return null;

  return (
    <section
      className={`fp-section ${displayFont.variable}`}
      aria-labelledby="fp-heading"
    >
      <div className="container">
        <div className="fp-head">
          <div className="fp-head__copy">
            <p className="fp-kicker">Featured Properties</p>
            <h2 id="fp-heading" className="fp-title">
              Exclusive Homes in Prime Locations
            </h2>
            <p className="fp-sub">
              Curated properties with verified details for a smarter property
              search.
            </p>
          </div>

          <div className="fp-head__controls">
            {availableFilters.length > 1 && (
              <div className="fp-filters" role="tablist" aria-label="Filter by status">
                {availableFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.key}
                    className={`fp-chip${filter === f.key ? " is-on" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <div className="fp-arrows">
              <button
                type="button"
                className="fp-arrow"
                aria-label="Previous properties"
                disabled={!canPrev}
                onClick={() => scrollRail(-1)}
              >
                <LuArrowLeft />
              </button>
              <button
                type="button"
                className="fp-arrow fp-arrow--next"
                aria-label="Next properties"
                disabled={!canNext}
                onClick={() => scrollRail(1)}
              >
                <LuArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div className="fp-rail" ref={railRef} key={filter}>
          {visible.map((property) => (
            <div key={property.id} className="fp-slide">
              <FeaturedPropertyCard
                property={property}
                saved={wishlist.has(String(property.id))}
                onToggleSave={toggleSave}
              />
            </div>
          ))}
        </div>

        <div className="fp-foot">
          <Link href="/properties" className="fp-viewall">
            View all properties
            <LuArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
