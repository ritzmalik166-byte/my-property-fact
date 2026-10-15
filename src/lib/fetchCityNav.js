/**
 * Slim city list (id, name, slug, isActive, state) from `city/nav`.
 * Falls back to the heavy `city/all` payload when the slim endpoint is unavailable
 * (e.g. an older backend), so callers always get a city array.
 */
export async function fetchRawCityNav(apiBase, init = {}) {
  const base = String(apiBase || "").trim();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not defined");

  try {
    const res = await fetch(`${base}city/nav`, init);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // fall through to city/all
  }

  const res = await fetch(`${base}city/all`, init);
  if (!res.ok) throw new Error(`city/all failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
