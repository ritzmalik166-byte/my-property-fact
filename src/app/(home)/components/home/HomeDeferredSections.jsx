"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const sectionPlaceholder = (minHeight) => (
  <section className="py-4" style={{ minHeight }} aria-busy="true" />
);

/** Start mounting a section when it is within this distance of the viewport. */
const NEAR_VIEWPORT_MARGIN = "900px 0px";

/**
 * Renders the placeholder until the slot nears the viewport, then mounts (and downloads)
 * the section once. Keeps below-fold sections from hydrating in one long task.
 */
function NearViewport({ minHeight, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: NEAR_VIEWPORT_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  if (visible) return children;
  return (
    <section ref={ref} className="py-4" style={{ minHeight }} aria-busy="true" />
  );
}

const TopPicksWithRotation = dynamic(() => import("../TopPicksWithRotation"), {
  ssr: false,
  loading: () => sectionPlaceholder(180),
});
const NewInsight = dynamic(() => import("../_homecomponents/NewInsight"), {
  ssr: false,
  loading: () => sectionPlaceholder(520),
});
const DreamPropertySection = dynamic(
  () => import("./dream-project/DreamPropertySection"),
  { ssr: false, loading: () => sectionPlaceholder(200) },
);
/** Client Featured UI — do not dynamic-import async RSC FeaturedPage (causes remount/fetch loops). */
const Featured = dynamic(() => import("./featured/featured"), {
  ssr: false,
  loading: () => sectionPlaceholder(360),
});
// const FeaturedPropertiesSection = dynamic(
//   () => import("./featured-properties/FeaturedPropertiesSection"),
//   { ssr: false, loading: () => sectionPlaceholder(600) },
// );
const SocialFeedsOfMPF = dynamic(
  () => import("../_homecomponents/SocialFeedsOfMPF"),
  { ssr: false, loading: () => sectionPlaceholder(320) },
);
const PopularCitiesSection = dynamic(
  () => import("./popular-cities/PopularCitiesSection"),
  { ssr: false, loading: () => sectionPlaceholder(200) },
);
const NoidaProjectsSection = dynamic(
  () => import("./noida-projects/NoidaProjectsSection"),
  { ssr: false, loading: () => sectionPlaceholder(400) },
);
const VaastuStripSection = dynamic(
  () => import("./vaastu-strip/VaastuStripSection"),
  { ssr: false, loading: () => sectionPlaceholder(160) },
);
const TestimonialSection = dynamic(
  () => import("./testimonials/TestimonialSection"),
  { ssr: false, loading: () => sectionPlaceholder(280) },
);
const RecommendedProjectsWithGeolocation = dynamic(
  () => import("../_homecomponents/RecommendedProjectsWithGeolocation"),
  { ssr: false, loading: () => sectionPlaceholder(320) },
);
const SocialFeed = dynamic(() => import("./social-feed/socialfeed"), {
  ssr: false,
  loading: () => sectionPlaceholder(240),
});

/**
 * Below-fold homepage sections — client-only so heavy markup/videos stay out of first HTML.
 * Wait for idle, then mount each section only as it approaches the viewport.
 */
export default function HomeDeferredSections({
  mpfTopPickProjects,
  slimRecommendedProjects,
  popularSubtitle,
  slimResidential,
  slimCommercial,
  cityList,
  testimonials,
  homeBlogs = [],
  featuredProperties = [],
  homeCityCards = null,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    const reveal = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(reveal, { timeout: 1800 });
      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        }
      };
    }

    timeoutId = window.setTimeout(reveal, 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!ready) {
    return (
      <>
        {sectionPlaceholder(180)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(200)}
        {sectionPlaceholder(360)}
        {sectionPlaceholder(400)}
        {sectionPlaceholder(280)}
        {sectionPlaceholder(280)}
        {sectionPlaceholder(160)}
        {sectionPlaceholder(320)}
        {sectionPlaceholder(200)}
      </>
    );
  }

  const row = (i, minHeight, node) => (
    <div key={i}>
      <NearViewport minHeight={minHeight}>{node}</NearViewport>
    </div>
  );

  return (
    <>
      {row(4, 180, <TopPicksWithRotation initialProjects={mpfTopPickProjects} />)}
      {row(
        5,
        320,
        <RecommendedProjectsWithGeolocation
          title="Popular Projects"
          fallbackItems={slimRecommendedProjects}
          fallbackSubtitle={popularSubtitle}
          kind="project"
          locationIntent="latest-projects"
          viewAllHref="/projects"
          sectionId="popular-projects"
          eagerImageCount={0}
        />,
      )}
      {/* {featuredProperties.length > 0 &&
        row(
          5.5,
          600,
          <FeaturedPropertiesSection properties={featuredProperties} />,
        )} */}

      <div className="position-relative">
        {row(6, 520, <NewInsight />)}
        {row(7, 200, <DreamPropertySection />)}
        {row(
          8,
          360,
          <Featured
            title="Explore Our Premier Residential Projects"
            autoPlay={true}
            allProjects={[]}
            badgeVariant="home-featured"
            residentialProjects={slimResidential}
            commercialProjects={slimCommercial}
          />,
        )}
        {row(9, 400, <NoidaProjectsSection cityCards={homeCityCards} />)}
        {homeBlogs?.length ? row(10, 240, <SocialFeed data={homeBlogs} />) : null}
        {row(11, 280, <TestimonialSection testimonials={testimonials} />)}
        {row(12, 160, <VaastuStripSection />)}
        {row(13, 320, <SocialFeedsOfMPF />)}
        {row(14, 200, <PopularCitiesSection />)}
      </div>
    </>
  );
}
