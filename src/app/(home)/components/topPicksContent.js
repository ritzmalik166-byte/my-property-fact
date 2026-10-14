/**
 * Curated copy for the Top Picks spotlight, keyed by project slug.
 *
 * The listings API returns name, address, price, configuration and status only —
 * it has no tagline, possession date or USP fields. A slug without an entry here
 * still renders; the spotlight just drops the parts it has no copy for.
 * `desktopImage` replaces the listing photo on desktop (>1024px) only.
 */
export const TOP_PICKS_EDITORIAL = {
  "eldeco-7-peaks-residences": {
    shortName: "Eldeco 7 Peaks",
    tagline: "Elevated living across 7 iconic towers",
    possession: "Dec 2027*",
    plaqueTitle: "A Higher Standard of Living",
    desktopImage: "/images/top-picks/eldeco-7-peaks-desktop.jpg",
    usps: [
      { icon: "green", title: "Lush", note: "Green Spaces" },
      { icon: "amenities", title: "World Class", note: "Amenities" },
      { icon: "gated", title: "Gated", note: "Community" },
    ],
  },
  "exotica-132": {
    shortName: "Exotica 132",
    tagline: "Grade-A workspaces on the Noida Expressway",
    plaqueTitle: "Built for Business Growth",
    desktopImage: "/images/top-picks/exotica-one32-desktop.png",
    usps: [
      { icon: "green", title: "Landscaped", note: "Open Decks" },
      { icon: "amenities", title: "Grade-A", note: "Office Floors" },
      { icon: "gated", title: "Managed", note: "Campus" },
    ],
  },
};

export function getTopPickEditorial(slug) {
  return TOP_PICKS_EDITORIAL[String(slug ?? "").trim()] ?? {};
}
