import { slimProjectForListing } from "@/lib/slimProjectListing";
import {
  builderLogoSrcFromBuilder,
  normalizeBuildersResponse,
} from "@/app/(home)/components/_homecomponents/topDevelopersMarqueeData";

/** Editorial picks shown first in "Recommended Properties" (same set the homepage features). */
const PINNED_RECOMMENDED_SLUGS = [
  "eldeco-7-peaks-residences",
  "exotica-132",
  "eldeco-camelot",
  "saya-gold-avenue",
  "ghd-velvet-vista",
  "irish-platinum",
  "saya-piazza",
  "gulshan-one29",
];

function text(value) {
  return String(value ?? "").trim();
}

function timeOf(project) {
  return new Date(project.updatedAt || project.createdAt || 0).getTime();
}

/**
 * Pinned picks first, then the newest launches with artwork.
 * `excludeSlugs` keeps projects already listed on the page out of the row.
 */
export function pickRecommendedProjects(allProjects, excludeSlugs, limit = 10) {
  const bySlug = new Map(allProjects.map((project) => [project.slugURL, project]));
  const eligible = (project) =>
    project?.slugURL &&
    !excludeSlugs.has(project.slugURL) &&
    (project.projectThumbnailImage || project.projectBannerImage);

  const pinned = PINNED_RECOMMENDED_SLUGS.map((slug) => bySlug.get(slug)).filter(eligible);
  const pinnedSlugs = new Set(pinned.map((project) => project.slugURL));

  const latest = allProjects
    .filter((project) =>
      eligible(project) &&
      !pinnedSlugs.has(project.slugURL) &&
      /new\s*launch/i.test(project.projectStatusName || ""))
    .sort((a, b) => timeOf(b) - timeOf(a));

  return [...pinned, ...latest].slice(0, limit).map(slimProjectForListing);
}

function countByBuilder(projects) {
  const counts = new Map();
  for (const project of projects) {
    const slug = text(project.builderSlug).toLowerCase();
    if (slug) counts.set(slug, (counts.get(slug) || 0) + 1);
  }
  return counts;
}

function sortedSlugs(counts) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => slug);
}

/**
 * Popularity = number of live projects. Developers active on this page come
 * first; the rest are filled with the most active developers that have a logo.
 */
export function pickPopularBuilders(buildersResponse, allProjects, pageProjects, limit = 12) {
  const builders = new Map(
    normalizeBuildersResponse(buildersResponse)
      .map((builder) => [text(builder.slugUrl || builder.slugURL).toLowerCase(), builder])
      .filter(([slug]) => slug),
  );

  const totalCounts = countByBuilder(allProjects);
  const localCounts = countByBuilder(pageProjects);

  const local = sortedSlugs(localCounts).filter((slug) => builders.has(slug));
  const others = sortedSlugs(totalCounts).filter(
    (slug) => !localCounts.has(slug) && builders.has(slug) && builderLogoSrcFromBuilder(builders.get(slug)),
  );

  return [...local, ...others].slice(0, limit).map((slug) => {
    const builder = builders.get(slug);
    return {
      slug,
      name: text(builder.builderName) || slug,
      logo: builderLogoSrcFromBuilder(builder),
      projectCount: totalCounts.get(slug) || 0,
      isLocal: localCounts.has(slug),
    };
  });
}
