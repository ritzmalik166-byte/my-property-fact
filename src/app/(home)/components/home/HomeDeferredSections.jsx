"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  DeferredSectionsPlaceholder,
  PLACEHOLDER_HEIGHT,
  SectionPlaceholder,
} from "./deferredSectionPlaceholders";

const sectionPlaceholder = (minHeight) => (
  <SectionPlaceholder minHeight={minHeight} />
);

const EMPTY_PROJECTS = [];

const TopPicksWithRotation = dynamic(() => import("../TopPicksWithRotation"), {
  ssr: false,
  loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.topPicks),
});
const NewInsight = dynamic(() => import("../_homecomponents/NewInsight"), {
  ssr: false,
  loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.insight),
});
const DreamPropertySection = dynamic(
  () => import("./dream-project/DreamPropertySection"),
  { ssr: false, loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.dream) },
);
/** Client Featured UI — do not dynamic-import async RSC FeaturedPage (causes remount/fetch loops). */
const Featured = dynamic(() => import("./featured/featured"), {
  ssr: false,
  loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.featured),
});
// const FeaturedPropertiesSection = dynamic(
//   () => import("./featured-properties/FeaturedPropertiesSection"),
//   { ssr: false, loading: () => sectionPlaceholder(600) },
// );
const SocialFeedsOfMPF = dynamic(
  () => import("../_homecomponents/SocialFeedsOfMPF"),
  {
    ssr: false,
    loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.socialFeeds),
  },
);
const PopularCitiesSection = dynamic(
  () => import("./popular-cities/PopularCitiesSection"),
  {
    ssr: false,
    loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.popularCities),
  },
);
const NoidaProjectsSection = dynamic(
  () => import("./noida-projects/NoidaProjectsSection"),
  { ssr: false, loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.noida) },
);
const VaastuStripSection = dynamic(
  () => import("./vaastu-strip/VaastuStripSection"),
  { ssr: false, loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.vaastu) },
);
const TestimonialSection = dynamic(
  () => import("./testimonials/TestimonialSection"),
  {
    ssr: false,
    loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.testimonials),
  },
);
const RecommendedProjectsWithGeolocation = dynamic(
  () => import("../_homecomponents/RecommendedProjectsWithGeolocation"),
  {
    ssr: false,
    loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.popularProjects),
  },
);
const SocialFeed = dynamic(() => import("./social-feed/socialfeed"), {
  ssr: false,
  loading: () => sectionPlaceholder(PLACEHOLDER_HEIGHT.blogs),
});

/**
 * Below-fold homepage sections — client-only so heavy markup/videos stay out of first HTML.
 * Mount after idle so PSI/Lighthouse can finish first-paint work first.
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

  const hasBlogs = homeBlogs?.length > 0;

  if (!ready) {
    return <DeferredSectionsPlaceholder hasBlogs={hasBlogs} />;
  }

  const row = (i, node) => <div key={i}>{node}</div>;

  return (
    <>
      {row(4, <TopPicksWithRotation initialProjects={mpfTopPickProjects} />)}
      {row(
        5,
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
          <FeaturedPropertiesSection properties={featuredProperties} />,
        )} */}

      <div className="position-relative">
        {row(6, <NewInsight />)}
        {row(7, <DreamPropertySection />)}
        {row(
          8,
          <Featured
            title="Explore Our Premier Residential Projects"
            autoPlay={true}
            allProjects={EMPTY_PROJECTS}
            badgeVariant="home-featured"
            residentialProjects={slimResidential}
            commercialProjects={slimCommercial}
          />,
        )}
        {row(9, <NoidaProjectsSection cities={cityList} />)}
        {row(
          10,
          hasBlogs ? <SocialFeed data={homeBlogs} /> : null,
        )}
        {row(11, <TestimonialSection testimonials={testimonials} />)}
        {row(12, <VaastuStripSection />)}
        {row(13, <SocialFeedsOfMPF />)}
        {row(14, <PopularCitiesSection />)}
      </div>
    </>
  );
}
