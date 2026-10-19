"use client";

import Image from "next/image";
import Link from "next/link";
import { HOME_SECTION_BG_SIZES } from "@/lib/optimizedImage";
import DreamCityIcon from "./DreamCityIcon";
import "./DreamPropertySection.css";

const CITY_ORDER = [
  "Bareilly",
  "Chandigarh",
  "Chennai",
  "Dehradun",
  "Faridabad",
  "Goa",
  "Greater Noida",
  "Gurugram",
  "Hyderabad",
  "Indore",
  "Karnal",
  "Kochi",
  "Lucknow",
  "Ludhiana",
  "Meerut",
  "Mohali",
  "Noida Extension",
  "Panipat",
  "Pune",
  "Sonipat",
  "Thiruvananthapuram",
  "Vrindavan",
];

const toCitySlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getIconPaths = (index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    // Preferred filenames (with "(1)") — encode the space for safe URLs
    primary: `/static/icon/icons-${n}%20(1).png`,
    fallback: `/static/icon/icons-${n}.png`,
  };
};

const FLOAT_BASE_PATTERN = [-22, 18, -14, 26, -18, 14];

const cities = CITY_ORDER.map((name, index) => {
  const icons = getIconPaths(index);
  return {
    name,
    link: `/city/${toCitySlug(name)}`,
    image: icons.primary,
    imageFallback: icons.fallback,
    floatBase: FLOAT_BASE_PATTERN[index % FLOAT_BASE_PATTERN.length],
    floatDelay: `${(index * 0.18).toFixed(2)}s`,
  };
});

const BG_ALT =
  "Decorative cityscape background for Find Your Dream Property section";

/** The marquee renders the list twice; the second copy is visual-only. */
function DreamCityItem({ city, isClone }) {
  return (
    <Link
      href={city.link}
      prefetch={false}
      className="dream-city-item"
      role="listitem"
      title={`Explore ${city.name} real estate, projects and local trends on My Property Fact`}
      aria-label={`Explore properties in ${city.name}`}
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : undefined}
      style={{
        "--float-base": `${city.floatBase}px`,
        "--float-delay": city.floatDelay,
      }}
    >
      <div className="dream-city-icon-circle">
        <DreamCityIcon
          src={city.image}
          fallbackSrc={city.imageFallback}
          alt={city.name}
        />
      </div>
      <span className="dream-city-label plus-jakarta-sans-semi-bold">
        {city.name}
      </span>
    </Link>
  );
}

const DreamPropertySection = () => {
  return (
    <section className="dream-property-section mb-4 mb-lg-5">
      <div className="dream-property-section-bg" aria-hidden="true">
        <Image
          src="/dream-cities/dream-section-bg.webp"
          alt={BG_ALT}
          title={BG_ALT}
          width={1920}
          height={600}
          sizes={HOME_SECTION_BG_SIZES}
          quality={70}
          loading="lazy"
          fetchPriority="low"
          className="dream-property-bg-image"
        />
      </div>

      <div className="dream-property-container">
        <h2 className="dream-property-title">
          Find Your Dream Property In The City You Are Searching In
        </h2>

        <div className="dream-city-wave" role="list">
          <div className="dream-city-track" aria-hidden="false">
            {cities.map((city) => (
              <DreamCityItem key={city.name} city={city} />
            ))}
            {cities.map((city) => (
              <DreamCityItem key={`${city.name}-clone`} city={city} isClone />
            ))}
          </div>
        </div>

        <Link
          href="/projects"
          className="dream-see-all-button"
          title="View all property listings on My Property Fact"
        >
          See all properties
        </Link>
      </div>
    </section>
  );
};

export default DreamPropertySection;
