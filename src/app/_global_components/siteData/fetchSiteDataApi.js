import { getDisplayCityList } from "../cityAliasUtils";
import { slimProjectListForListing } from "@/lib/slimProjectListing";
import {
  slimCityListForNav,
  slimProjectStatusListForNav,
  slimProjectTypeListForNav,
} from "@/lib/slimSiteCatalog";
import {
  filterHiddenBuilders,
  filterHiddenProjects,
} from "../hiddenBuilderUtils";
import { fetchRawCityNav } from "@/lib/fetchCityNav";

const fetchInit =
  typeof window === "undefined" ? { next: { revalidate: 60 } } : {};

function unwrapProjectList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/**
 * Cities, builders, types, and statuses only — safe to embed in root layout HTML.
 * Project catalog is loaded client-side to keep document size under 2MB.
 */
export async function fetchSiteMetaFromApi() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const [cities, buildersRes, typesRes, statusesRes] = await Promise.all([
    fetchRawCityNav(apiBase, fetchInit),
    fetch(`${apiBase}builder/get-all`, fetchInit),
    fetch(`${apiBase}project-types/get-all`, fetchInit),
    fetch(`${apiBase}project-status`, fetchInit),
  ]);

  const parseJson = async (res, label) => {
    if (!res.ok) {
      throw new Error(`${label} failed (${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`${label} returned non-JSON (${contentType || "unknown"})`);
    }
    return res.json();
  };

  const [buildersData, typesData, statusesData] = await Promise.all([
    parseJson(buildersRes, "builder/get-all"),
    parseJson(typesRes, "project-types/get-all"),
    parseJson(statusesRes, "project-status"),
  ]);

  const allCities = slimCityListForNav(cities || []);
  return {
    cityList: getDisplayCityList(allCities),
    allCityList: allCities,
    builderList: filterHiddenBuilders(buildersData?.builders || []),
    projectTypes: slimProjectTypeListForNav(typesData || []),
    projectStatuses: slimProjectStatusListForNav(statusesData || []),
  };
}

/**
 * Slim full project catalog. Client-side only, loaded on demand by SiteDataContext
 * (chatbot, BHK / floor-type hubs) — never on page load.
 */
export async function fetchProjectCatalogFromApi() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const projectsRes = await fetch(`${apiBase}projects`, fetchInit);
  if (!projectsRes.ok) {
    throw new Error(`Failed to load projects (${projectsRes.status})`);
  }
  const projectsData = await projectsRes.json();
  return slimProjectListForListing(
    filterHiddenProjects(unwrapProjectList(projectsData)),
  );
}

/** Site meta plus the full project catalog. */
export async function fetchSiteDataFromApi() {
  const [meta, projectList] = await Promise.all([
    fetchSiteMetaFromApi(),
    fetchProjectCatalogFromApi(),
  ]);
  return { ...meta, projectList };
}
