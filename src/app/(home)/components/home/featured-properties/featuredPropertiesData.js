import { transformPublicPropertyList } from "@/app/(home)/properties/transformPublicProperties";

const HOME_FEATURED_PROPERTIES_LIMIT = 16;

function apiRoot() {
  return (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
}

function listingImageUrl(base, imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  let path = imageUrl.replace(/\\/g, "/");
  const idx = path.toLowerCase().indexOf("property-listings/");
  if (idx > 0) path = path.slice(idx);
  path = path.replace(/^\/+/, "");
  if (!path.startsWith("property-listings/")) return null;
  return `${base}/get/images/${path}`;
}

function statusKey(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("ready")) return "ready";
  if (s.includes("construction")) return "under-construction";
  if (s.includes("launch")) return "new-launch";
  return null;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

/** Server-side: slim, card-ready public listings for the homepage Featured Properties rail. */
export async function fetchFeaturedProperties() {
  const base = apiRoot();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/public/properties`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.success || !Array.isArray(data.properties)) return [];

    const withImages = data.properties.filter(
      (p) => Array.isArray(p.imageUrls) && p.imageUrls.length > 0,
    );

    return transformPublicPropertyList(withImages)
      .slice(0, HOME_FEATURED_PROPERTIES_LIMIT)
      .map((item) => {
        const raw = item.raw || {};
        const locality = cleanText(raw.locality);
        const city = cleanText(raw.city);
        const location = [locality, city]
          .filter(
            (part, i, arr) =>
              part &&
              arr.findIndex((x) => x.toLowerCase() === part.toLowerCase()) === i,
          )
          .join(", ");
        return {
          id: item.id,
          slug: item.slug,
          projectName: cleanText(raw.projectName) || item.title,
          builderName: cleanText(raw.builderName) || null,
          location: location || null,
          status: cleanText(raw.status) || null,
          statusKey: statusKey(raw.status),
          totalPrice: raw.totalPrice ?? null,
          bedrooms: raw.bedrooms ?? null,
          bathrooms: raw.bathrooms ?? null,
          area: raw.carpetArea || raw.builtUpArea || raw.superBuiltUpArea || null,
          image: listingImageUrl(base, raw.imageUrls[0]),
        };
      })
      .filter((p) => p.image);
  } catch {
    return [];
  }
}
