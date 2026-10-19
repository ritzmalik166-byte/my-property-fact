/** Reserved heights for each below-fold homepage section, in render order. */
export const PLACEHOLDER_HEIGHT = {
  topPicks: 180,
  popularProjects: 320,
  insight: 520,
  dream: 200,
  featured: 360,
  noida: 400,
  blogs: 240,
  testimonials: 280,
  vaastu: 160,
  socialFeeds: 320,
  popularCities: 200,
};

export function SectionPlaceholder({ minHeight }) {
  return <section className="py-4" style={{ minHeight }} aria-busy="true" />;
}

export function DeferredSectionsPlaceholder({ hasBlogs = true }) {
  const h = PLACEHOLDER_HEIGHT;
  const heights = [
    h.topPicks,
    h.popularProjects,
    h.insight,
    h.dream,
    h.featured,
    h.noida,
    ...(hasBlogs ? [h.blogs] : []),
    h.testimonials,
    h.vaastu,
    h.socialFeeds,
    h.popularCities,
  ];

  return (
    <>
      {heights.map((minHeight, i) => (
        <SectionPlaceholder key={i} minHeight={minHeight} />
      ))}
    </>
  );
}
