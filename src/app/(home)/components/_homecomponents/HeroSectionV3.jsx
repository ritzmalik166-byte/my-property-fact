"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { MPF_GATEWAY_HIDDEN_EVENT } from "@/app/_global_components/mpfGatewayEvents";
import "../home/home.css";
import "./newmpfmetadata.css";

const SearchFilter = dynamic(() => import("./searchFilterNew"));

/** Swap this for the final Figma export (keep ~1920px wide, dark/dusk scene). */
export const HERO_V3_IMAGE = {
  src: "/static/banners/hero-v3-ncr-dusk.webp",
  width: 1920,
  height: 1130,
  alt: "High-rise residential towers in Delhi NCR at dusk — verified properties on My Property Fact",
};

const HOME_HERO_HASH = "#mpf-home-hero";

function useHomeHeroHashScroll() {
  useEffect(() => {
    const run = () => {
      if (window.location.hash !== HOME_HERO_HASH) return;
      document.getElementById("mpf-home-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    run();
    window.addEventListener(MPF_GATEWAY_HIDDEN_EVENT, run);
    window.addEventListener("hashchange", run);
    const t = window.setTimeout(run, 450);
    return () => {
      window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, run);
      window.removeEventListener("hashchange", run);
      window.clearTimeout(t);
    };
  }, []);
}

const ico = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const QUICK_LINKS = [
  {
    href: "/property-rate-and-trend",
    title: "Price Trends",
    sub: "Locality-wise rates",
    icon: (
      <svg {...ico}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    ),
  },
  {
    href: "/projects",
    title: "Builder Directory",
    sub: "Verified developers",
    icon: (
      <svg {...ico}>
        <path d="M4 21V8l6-4 6 4v13" />
        <path d="M16 21V11h4v10M2 21h20M8 10h4M8 14h4" />
      </svg>
    ),
  },
  {
    href: "/emi-calculator",
    title: "EMI Calculator",
    sub: "Plan your home loan",
    icon: (
      <svg {...ico}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M16 11v4" />
      </svg>
    ),
  },
  {
    href: "/account",
    title: "Search Alerts",
    sub: "Get notified first",
    icon: (
      <svg {...ico}>
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
      </svg>
    ),
  },
  {
    href: "/projects",
    title: "Compare Projects",
    sub: "Side-by-side view",
    icon: (
      <svg {...ico}>
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </svg>
    ),
  },
];

export default function HeroSectionV3({ projectTypeList, cityList }) {
  useHomeHeroHashScroll();

  return (
    <section id="mpf-home-hero" className="mpf-hv3" aria-label="Search properties">
      <div className="mpf-hv3__stage">
        {/* Own clipped layer — lets the search card's popovers rise above the tool tiles */}
        <div className="mpf-hv3__bg">
          <Image
            src={HERO_V3_IMAGE.src}
            alt={HERO_V3_IMAGE.alt}
            fill
            priority
            sizes="100vw"
            quality={70}
            className="mpf-hv3__img"
            draggable={false}
          />
          <div className="mpf-hv3__shade" aria-hidden="true" />
        </div>

        <h1 id="mpf-page-heading" className="visually-hidden">
          Verified properties across Noida, Greater Noida, Delhi NCR &amp; major Indian cities
        </h1>

        <div className="container mpf-hv3__inner">
          <SearchFilter projectTypeList={projectTypeList} cityList={cityList} layout="home-hero-v3" />

          <a href="#new-property-launches" className="mpf-hv3__explore">
            <span>Explore more</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <nav className="container mpf-hv3__quick" aria-label="Property tools">
        {QUICK_LINKS.map((item) => (
          <Link key={item.title} href={item.href} className="mpf-hv3__quick-card">
            <span className="mpf-hv3__quick-icon">{item.icon}</span>
            <span className="mpf-hv3__quick-copy">
              <strong>{item.title}</strong>
              <small>{item.sub}</small>
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
