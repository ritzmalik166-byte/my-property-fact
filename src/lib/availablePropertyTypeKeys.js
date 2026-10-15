function normalizeCommercialConfigKey(rawType = "") {
  const t = String(rawType || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  if (!t) return null;
  if (t === "shop" || t === "shops") return "shops";
  if (t === "office" || t === "offices") return "office";
  if (t === "kiosk" || t === "kiosks") return "kiosk";
  if (t === "food court" || t === "food courts") return "food-court";
  if (t === "restaurant" || t === "restaurants") return "restaurant";
  if (t === "showroom" || t === "showrooms") return "showroom";
  if (t === "sco plots" || t === "sco plot") return "sco-plots";
  return null;
}

/**
 * Property-type filter keys that exist in live projectConfiguration values.
 * Returns plain arrays so the result can be computed on the server and passed as props.
 * @returns {{ residential: string[], commercial: string[] }}
 */
export function getAvailablePropertyTypeKeys(projectList = []) {
  const residential = new Set();
  const commercial = new Set();

  for (const project of projectList || []) {
    const config = String(project?.projectConfiguration || "");
    if (!config) continue;

    if (/\d+\s*bhk/i.test(config)) residential.add("flat");
    if (/\bbuilder\s*floor\b/i.test(config)) residential.add("builder-floor");
    if (/\bvilla\b/i.test(config)) residential.add("villa");
    if (/\bplot(s)?\b/i.test(config) || /\bland\b/i.test(config)) residential.add("plots");
    if (/\bserviced\b/i.test(config)) residential.add("serviced");
    if (/\brk\b/i.test(config) || /\bstudio\b/i.test(config)) residential.add("1rk");
    if (/\bfarm\s*house\b/i.test(config)) residential.add("farm-house");

    const parts = config.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const cleaned = part.replace(/\s*-\s*\d+\s*(?:sq\.?\s*ft|sq\.?ft)\s*/gi, "").trim();
      const key = normalizeCommercialConfigKey(cleaned);
      if (key) commercial.add(key);
      if (/\bsco\s*plots?\b/i.test(cleaned)) commercial.add("sco-plots");
      if (/\bshops?\b/i.test(cleaned)) commercial.add("shops");
      if (/\boffices?\b/i.test(cleaned)) commercial.add("office");
      if (/\bshowrooms?\b/i.test(cleaned)) commercial.add("showroom");
      if (/\bfood\s*courts?\b/i.test(cleaned)) commercial.add("food-court");
      if (/\bkiosks?\b/i.test(cleaned)) commercial.add("kiosk");
      if (/\brestaurants?\b/i.test(cleaned)) commercial.add("restaurant");
    }
  }

  return { residential: [...residential], commercial: [...commercial] };
}
