import {
  fetchBlogs,
  fetchLatestBlogs,
  fetchAllProjects,
  getWeeklyProject,
} from "@/app/_global_components/masterFunction";
import Blog from "./blog";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import { buildFaqJsonLd } from "@/app/_global_components/jsonLd/buildJsonLd";
import { BLOG_LISTING_FAQ_ITEMS } from "./blogFaqItems";

export const metadata = {
  title:
    "Real Estate Blogs & Property Tips | My Property Fact",
  description:
    "Explore real estate blogs, property investment tips, market trends and home-buying guides for India and Delhi NCR on My Property Fact. Make informed decisions.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const pageNum = Math.max(
    1,
    parseInt(String(sp?.page ?? "1"), 10) || 1,
  );
  const pageIndex = pageNum - 1;
  const pageSize = 3;

  const [blogsData, sidebarRecentPosts, projects] = await Promise.all([
    fetchBlogs(pageIndex, pageSize, ""),
    fetchLatestBlogs(3),
    fetchAllProjects(),
  ]);

  const blogsList = blogsData?.content ?? [];
  const totalPages = Math.max(1, blogsData?.totalPages ?? 1);
  const projectArr = Array.isArray(projects) ? projects : [];
  const sidebarLatestProject = getWeeklyProject(projectArr);

  return (
    <>
      <JsonLdScript data={buildFaqJsonLd(BLOG_LISTING_FAQ_ITEMS)} />
      <Blog
        initialBlogs={blogsList}
        initialPageIndex={pageIndex}
        totalPages={totalPages}
        sidebarRecentPosts={sidebarRecentPosts}
        sidebarLatestProject={sidebarLatestProject}
      />
    </>
  );
}
