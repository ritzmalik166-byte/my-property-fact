/*
  Registry of every asset exported from Figma (file H36LWEBD7Tr4SrlnY18Rzu).
  The files live in /public/l-p/eldeco-terra-n-soll and are served from /l-p/eldeco-terra-n-soll:
  - images/   original image fills, downloaded via the REST /files/:key/images endpoint
  - icons/    SVG exports of the icon instances; file name = <glyph>-<colour>-<size>
  - renders/  composite layers (blurred floor plans, footer pattern)
  Each entry is { src, width, height } (same shape as a static import), so it works
  with next/image, getImageProps and ui/Icon unchanged.
  Raw design data + reference render live in /exports/figma/eldeco-terra-sol.
*/

export const ASSET_BASE = "/l-p/eldeco-terra-n-soll";

const asset = (file, width, height) => ({ src: `${ASSET_BASE}/${file}`, width, height });

// images
const logo = asset("images/logo.png", 355, 90);
const logoFooter = asset("images/logo-footer.png", 355, 90);
const heroDesktop = asset("images/hero-desktop.jpg", 2049, 975);
const gallery1 = asset("images/gallery-1.jpg", 920, 645);
const gallery2 = asset("images/gallery-2.jpg", 920, 645);
const gallery3 = asset("images/gallery-3.jpg", 920, 645);
const gallery5 = asset("images/gallery-5.jpg", 920, 645);
const videoThumbnail = asset("images/video-thumbnail.jpg", 2049, 975);
const virtualTour = asset("images/virtual-tour.jpg", 622, 344);
const amenityPool = asset("images/amenity-infinity-pool.jpg", 1187, 832);
const priceBanner = asset("images/price-banner.jpg", 1019, 524);

// renders
const floorplanBlurDesktop = asset("renders/floorplan-blur-desktop.png", 496, 440);
const floorplanBlurMobile = asset("renders/floorplan-blur-mobile.png", 480, 400);
const footerPattern = asset("renders/footer-pattern.svg", 1440, 520);

// icons — feature / highlight glyphs (#b5873b)
const towers22 = asset("icons/towers-b5873b-22.svg", 22, 22);
const towers20 = asset("icons/towers-b5873b-20.svg", 20, 20);
const lobby22 = asset("icons/lobby-b5873b-22.svg", 22, 22);
const lobby20 = asset("icons/lobby-b5873b-20.svg", 20, 20);
const expand22 = asset("icons/expand-b5873b-22.svg", 22, 22);
const expand20 = asset("icons/expand-b5873b-20.svg", 20, 20);
const corner22 = asset("icons/corner-b5873b-22.svg", 22, 22);
const corner20 = asset("icons/corner-b5873b-20.svg", 20, 20);
const sparkle22 = asset("icons/sparkle-b5873b-22.svg", 22, 22);
const sparkle20 = asset("icons/sparkle-b5873b-20.svg", 20, 20);
const balcony22 = asset("icons/balcony-b5873b-22.svg", 22, 22);
const balcony20 = asset("icons/balcony-b5873b-20.svg", 20, 20);
const lock22 = asset("icons/lock-b5873b-22.svg", 22, 22);
const lock20 = asset("icons/lock-b5873b-20.svg", 20, 20);
const highway22 = asset("icons/highway-b5873b-22.svg", 22, 22);
const highway20 = asset("icons/highway-b5873b-20.svg", 20, 20);
const road22 = asset("icons/road-b5873b-22.svg", 22, 22);
const road20 = asset("icons/road-b5873b-20.svg", 20, 20);
const school22 = asset("icons/school-b5873b-22.svg", 22, 22);
const school20 = asset("icons/school-b5873b-20.svg", 20, 20);

// icons — UI
const chevron = asset("icons/chevron-090909-18.svg", 18, 18);
const arrowRight = asset("icons/arrowright-b5873b-22.svg", 22, 22);
const calendarDark = asset("icons/calendar-090909-20.svg", 20, 20);
const calendarGold = asset("icons/calendar-e2b04a-20.svg", 20, 20);
const downloadBronze = asset("icons/download-b5873b-20.svg", 20, 20);
const downloadGold = asset("icons/download-e2b04a-22.svg", 22, 22);
const unlock = asset("icons/unlock-090909-20.svg", 20, 20);
const lockGold = asset("icons/lock-e2b04a-20.svg", 20, 20);
const pinBronze20 = asset("icons/pin-b5873b-20.svg", 20, 20);
const pinMuted16 = asset("icons/pin-6b726b-16.svg", 16, 16);
const pinGold14 = asset("icons/pin-e2b04a-14.svg", 14, 14);
const pinGold18 = asset("icons/pin-e2b04a-18.svg", 18, 18);
const phoneBronze18 = asset("icons/phone-b5873b-18.svg", 18, 18);
const phoneBronze20 = asset("icons/phone-b5873b-20.svg", 20, 20);
const phoneGold18 = asset("icons/phone-e2b04a-18.svg", 18, 18);
const phoneGold20 = asset("icons/phone-e2b04a-20.svg", 20, 20);
const phoneDark20 = asset("icons/phone-090909-20.svg", 20, 20);
const phoneDark22 = asset("icons/phone-090909-22.svg", 22, 22);
const phoneDark26 = asset("icons/phone-090909-26.svg", 26, 26);
const whatsappBronze = asset("icons/whatsapp-b5873b-20.svg", 20, 20);
const whatsappDark = asset("icons/whatsapp-090909-26.svg", 26, 26);
const checkAmenity = asset("icons/check-b0632a-14.svg", 14, 14);
const checkAmenity16 = asset("icons/check-b0632a-16.svg", 16, 16);
const checkDark = asset("icons/check-090909-14.svg", 14, 14);
const checkGold16 = asset("icons/check-e2b04a-16.svg", 16, 16);
const play29 = asset("icons/play-1f2b25-29.svg", 29, 29);
const play22 = asset("icons/play-1f2b25-22.svg", 22, 22);

export const images = {
  logo,
  logoFooter,
  heroDesktop,
  heroMobile: gallery2, // mobile hero (23:668) uses the g2 fill
  gallery1,
  gallery2,
  gallery3,
  gallery5,
  videoThumbnail,
  virtualTour,
  amenityPool,
  priceBanner,
  finalCta: gallery2, // final CTA (23:575 / 23:965) uses the g2 fill
};

export const renders = {
  floorplanBlurDesktop,
  floorplanBlurMobile,
  footerPattern,
};

/** Glyphs used in features/highlights, keyed by name → { d: 22px, m: 20px }. */
export const glyphs = {
  towers: { d: towers22, m: towers20 },
  lobby: { d: lobby22, m: lobby20 },
  expand: { d: expand22, m: expand20 },
  corner: { d: corner22, m: corner20 },
  sparkle: { d: sparkle22, m: sparkle20 },
  balcony: { d: balcony22, m: balcony20 },
  lock: { d: lock22, m: lock20 },
  highway: { d: highway22, m: highway20 },
  road: { d: road22, m: road20 },
  school: { d: school22, m: school20 },
};

export const icons = {
  chevron,
  arrowRight,
  calendarDark,
  calendarGold,
  downloadBronze,
  downloadGold,
  unlock,
  lockGold,
  pinBronze20,
  pinMuted16,
  pinGold14,
  pinGold18,
  phoneBronze18,
  phoneBronze20,
  phoneGold18,
  phoneGold20,
  phoneDark20,
  phoneDark22,
  phoneDark26,
  whatsappBronze,
  whatsappDark,
  checkAmenity,
  checkAmenity16,
  checkDark,
  checkGold16,
  play29,
  play22,
};
