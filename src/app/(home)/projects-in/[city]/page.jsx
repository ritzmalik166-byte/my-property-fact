import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAllProjects, fetchBuilderData } from "@/app/_global_components/masterFunction";
import DreamPropertySection from "@/app/(home)/components/home/dream-project/DreamPropertySection";
import { slimProjectForListing } from "@/lib/slimProjectListing";
import AbroadProjectsClient from "./AbroadProjectsClient";
import PopularBuilders from "./sections/PopularBuilders";
import RecommendedProjects from "./sections/RecommendedProjects";
import SellRentSection from "./sections/SellRentSection";
import { pickPopularBuilders, pickRecommendedProjects } from "./sections/sectionData";
import "@/app/(home)/components/home/dream-project/DreamPropertySection.css";
import "./abroad-projects.css";
import "./sections/sections.css";

// Public URL is /projects-in-{slug}; next.config.js rewrites it to this route.

const COUNTRY_SHORT_NAMES = {
  "united arab emirates": "UAE",
};

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** City name (lowercase) -> { cityName, stateName, countryName }, built from state/get-all. */
async function fetchGeoIndex() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const index = new Map();
  if (!apiUrl) return index;

  try {
    const res = await fetch(`${apiUrl}state/get-all`, { next: { revalidate: 3600 } });
    if (!res.ok) return index;
    const states = await res.json();
    if (!Array.isArray(states)) return index;

    for (const state of states) {
      for (const city of state.cityList || []) {
        const cityName = String(city.cityName || "").trim();
        if (!cityName) continue;
        index.set(cityName.toLowerCase(), {
          cityName,
          stateName: String(state.stateName || "").trim(),
          countryName: String(state.countryName || "").trim(),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching states:", error);
  }

  return index;
}

/**
 * Resolve the URL slug (a city, emirate/state or country) to its country and
 * return every project in that country.
 */
async function resolvePageData(slug) {
  const [allProjects, geo] = await Promise.all([fetchAllProjects(), fetchGeoIndex()]);

  let match = null;
  for (const entry of geo.values()) {
    if (slugify(entry.cityName) === slug) {
      match = { ...entry, kind: "city" };
      break;
    }
  }
  if (!match) {
    for (const entry of geo.values()) {
      if (slugify(entry.stateName) === slug) {
        match = { ...entry, kind: "state" };
        break;
      }
      if (slugify(entry.countryName) === slug) {
        match = { ...entry, kind: "country" };
        break;
      }
    }
  }

  const geoFor = (project) => geo.get(String(project.cityName || "").trim().toLowerCase());

  // International pages list the whole country (e.g. all UAE emirates);
  // Indian cities have their own hubs, so keep those to the city itself.
  if (match && /^india$/i.test(match.countryName)) match = null;

  let projects;
  if (match?.countryName) {
    projects = allProjects.filter((project) => geoFor(project)?.countryName === match.countryName);
  } else {
    // Geography lookup unavailable — fall back to the city in the URL.
    projects = allProjects.filter((project) => (
      String(project.citySlug || "").toLowerCase() === slug ||
      slugify(project.cityName) === slug
    ));
  }

  const placeName =
    match?.kind === "city" ? match.cityName :
    match?.kind === "state" ? match.stateName :
    match?.kind === "country" ? match.countryName :
    formatSlug(slug);

  const countryName = match?.countryName || "";
  const countryShort = COUNTRY_SHORT_NAMES[countryName.toLowerCase()] || countryName;

  return {
    allProjects,
    projects,
    placeName,
    countryName,
    countryShort,
    isCountryPage: match?.kind === "country",
  };
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const slug = city.toLowerCase();
  const { placeName, countryShort, isCountryPage, projects } = await resolvePageData(slug);
  const where = isCountryPage || !countryShort ? placeName : `${placeName} & ${countryShort}`;

  return {
    title: `Projects in ${where} | My Property Fact`,
    description: `Explore ${projects.length}+ new launch, under construction and ready to move projects in ${where}. Compare locations, configurations and starting prices on My Property Fact.`,
    alternates: { canonical: `/projects-in-${slug}` },
  };
}

export default async function AbroadProjectsPage({ params }) {
  const { city } = await params;
  const slug = city.toLowerCase();
  const [{ allProjects, projects, placeName, countryName, countryShort, isCountryPage }, buildersResponse] =
    await Promise.all([resolvePageData(slug), fetchBuilderData()]);

  if (!projects.length && !countryName) notFound();

  const pageSlugs = new Set(projects.map((p) => p.slugURL));
  const recommendedProjects = pickRecommendedProjects(allProjects, pageSlugs);
  const popularBuilders = pickPopularBuilders(buildersResponse, allProjects, projects);
  // Only ship the fields the listing cards and filters read.
  const listingProjects = projects.map((p) => ({ ...slimProjectForListing(p), createdAt: p.createdAt }));

  const cityCount = new Set(projects.map((p) => p.cityName).filter(Boolean)).size;
  const developerCount = new Set(projects.map((p) => String(p.builderName || "").trim()).filter(Boolean)).size;
  const newLaunchCount = projects.filter((p) => /new\s*launch/i.test(p.projectStatusName || "")).length;
  const showCountry = countryShort && !isCountryPage;

  return (
    <main className="abroad-page" id="primary-content">
      <section className="abroad-hero">
        <Image
          src="/static/banners/uae-projects-banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="abroad-hero__bg"
        />
        <div className="abroad-container abroad-hero__inner">
          <nav className="abroad-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/projects">Projects</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{countryName || placeName}</span>
          </nav>

          <div className="abroad-eyebrow">International Collection </div>

          <h1>
            Projects in <span>{placeName}</span>
            {showCountry ? <> &amp; across the {countryShort}</> : null}
          </h1>

          <p className="abroad-hero__description">
            Handpicked residential and commercial developments from leading developers
            {countryName ? ` across ${countryName}` : ` in ${placeName}`}. Compare
            locations, configurations and starting prices in one place.
          </p>

          <dl className="abroad-hero__stats">
            <div className="abroad-stat">
              <dt>Projects</dt>
              <dd>{projects.length}</dd>
            </div>
            <div className="abroad-stat">
              <dt>{countryShort === "UAE" ? "Emirates" : "Cities"}</dt>
              <dd>{cityCount}</dd>
            </div>
            <div className="abroad-stat">
              <dt>Developers</dt>
              <dd>{developerCount}</dd>
            </div>
            <div className="abroad-stat">
              <dt>New Launches</dt>
              <dd>{newLaunchCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="abroad-listing">
        <div className="abroad-container">
          <AbroadProjectsClient projects={listingProjects} />
        </div>
      </section>

      <RecommendedProjects projects={recommendedProjects} />
      <PopularBuilders builders={popularBuilders} localLabel={countryShort} />
      <DreamPropertySection title="Explore Real Estate in Popular Indian Cities" className="ap-cities" />
      <SellRentSection />
    </main>
  );
}
