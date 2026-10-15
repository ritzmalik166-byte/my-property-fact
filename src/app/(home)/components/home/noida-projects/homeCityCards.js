import { buildProjectImageUrl } from "@/lib/projectImageUrl";

/** Popular Real Estate Destinations slider on the home page. Flip to true to restore it. */
export const SHOW_HOME_DESTINATIONS = false;

// Static city data; counts, price ranges and images are refreshed from live projects on the server.
export const CITY_CARDS = [
  {
    id: "ludhiana",
    name: "Ludhiana",
    priceRange: "₹4,000 – ₹8,000 per sqft",
    totalProperties: 2847,
    href: "/city/ludhiana",
    imageSrc: "/agi-sky.webp",
  },
  {
    id: "maria-one",
    name: "Kochi",
    priceRange: "₹5,000 – ₹12,000 per sqft",
    totalProperties: 1923,
    href: "/city/kochi",
    imageSrc: "/marina.webp",
  },
  {
    id: "ajmera-marina",
    name: "Bangalore",
    priceRange: "₹6,000 – ₹15,000 per sqft",
    totalProperties: 5124,
    href: "/city/bangalore",
    imageSrc: "/ajmer.webp",
  },
  {
    id: "galaxy-sawasdee",
    name: "Delhi",
    priceRange: "₹8,000 – ₹25,000 per sqft",
    totalProperties: 3891,
    href: "/city/delhi",
    imageSrc: "/NewDelhi.webp",
  },
  {
    id: "adani-9-pbr",
    name: "Mumbai",
    priceRange: "₹15,000 – ₹50,000 per sqft",
    totalProperties: 2654,
    href: "/city/mumbai",
    imageSrc: "/adani.webp",
  },
  {
    id: "sector-153",
    name: "Noida",
    priceRange: "₹7,000 – ₹12,000 per sqft",
    totalProperties: 487,
    href: "/city/noida",
    imageSrc: "/ace-153.webp",
  },
];

function getPricePerSqft(project) {
  const price = project.pricePerSqft || project.price_per_sqft || project.pricePerSqFt;
  if (price === null || price === undefined) return null;
  const numPrice =
    typeof price === "string" ? parseFloat(price.replace(/[^0-9.]/g, "")) : parseFloat(price);
  return Number.isNaN(numPrice) || numPrice <= 0 ? null : numPrice;
}

function formatPriceRange(prices) {
  const valid = (prices || []).filter((p) => p !== null && p > 0);
  if (!valid.length) return null;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const format = (price) => Math.round(price).toLocaleString("en-IN");
  if (min === max) return `₹${format(min)} per sqft`;
  return `₹${format(min)} – ₹${format(max)} per sqft`;
}

/** Prefer a project in this city with a banner, then higher indicative price. */
function findTopProjectForCity(projects, cityName) {
  const n = String(cityName || "").toLowerCase().trim();
  if (!n) return null;
  const inCity = projects.filter((p) => String(p.cityName || "").toLowerCase().trim() === n);
  if (!inCity.length) return null;
  inCity.sort((a, b) => {
    const hasA = a.projectBannerImage || a.projectThumbnailImage ? 1 : 0;
    const hasB = b.projectBannerImage || b.projectThumbnailImage ? 1 : 0;
    if (hasB !== hasA) return hasB - hasA;
    const ap = parseFloat(a.projectPrice);
    const bp = parseFloat(b.projectPrice);
    return (Number.isNaN(bp) ? 0 : bp) - (Number.isNaN(ap) ? 0 : ap);
  });
  return inCity[0];
}

/** City cards with live project counts, price ranges and a top-project image. */
export function buildHomeCityCards(projects = [], cityList = []) {
  const projectsArray = Array.isArray(projects) ? projects : [];
  if (!projectsArray.length) return CITY_CARDS;

  const countByName = new Map();
  const countById = new Map();
  const pricesByName = new Map();
  for (const project of projectsArray) {
    const name = String(project.cityName || "").toLowerCase();
    if (name) {
      countByName.set(name, (countByName.get(name) || 0) + 1);
      const price = getPricePerSqft(project);
      if (price !== null) {
        if (!pricesByName.has(name)) pricesByName.set(name, []);
        pricesByName.get(name).push(price);
      }
    }
    if (project.cityId) {
      countById.set(project.cityId, (countById.get(project.cityId) || 0) + 1);
    }
  }

  return CITY_CARDS.map((card) => {
    const name = card.name.toLowerCase();
    const cityData = (cityList || []).find(
      (city) => String(city?.cityName || city?.name || "").toLowerCase() === name,
    );
    const count =
      countByName.get(name) ?? (cityData?.id ? countById.get(cityData.id) : undefined);
    const topProject = findTopProjectForCity(projectsArray, card.name);
    return {
      ...card,
      totalProperties: count ?? card.totalProperties,
      priceRange: formatPriceRange(pricesByName.get(name)) || card.priceRange,
      topProjectName: topProject?.projectName || null,
      displayImageSrc: topProject
        ? buildProjectImageUrl(topProject, { preferThumbnail: true }) || null
        : null,
    };
  });
}
