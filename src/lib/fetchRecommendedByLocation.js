/**
 * Client fetch for `/api/home/recommended-by-location`, deduped by query.
 * Header, both home rails and the GPS city lookup ask for the same data on load;
 * identical requests share one in-flight promise and reuse the result briefly.
 */

const RESULT_TTL_MS = 60 * 1000;
const cache = new Map();

function buildQuery(params) {
  const q = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value == null || value === "") continue;
    q.set(key, String(value));
  }
  return q.toString();
}

/**
 * @param {Record<string, string | number | undefined | null>} params
 * @returns {Promise<{ ok: boolean, data: any }>} `data` is shared between callers — do not mutate.
 */
export function fetchRecommendedByLocation(params) {
  const query = buildQuery(params || {});
  const now = Date.now();
  const hit = cache.get(query);
  if (hit && (hit.pending || now - hit.at < RESULT_TTL_MS)) return hit.promise;

  const entry = { at: now, pending: true, promise: null };
  entry.promise = fetch(`/api/home/recommended-by-location?${query}`)
    .then(async (res) => {
      const data = await res.json();
      entry.pending = false;
      entry.at = Date.now();
      if (!res.ok) cache.delete(query);
      return { ok: res.ok, data };
    })
    .catch((error) => {
      cache.delete(query);
      throw error;
    });
  cache.set(query, entry);
  return entry.promise;
}
