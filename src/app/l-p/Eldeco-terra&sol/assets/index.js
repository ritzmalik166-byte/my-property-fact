/*
  Registry of every asset exported from Figma (file H36LWEBD7Tr4SrlnY18Rzu).
  - images/   original image fills, downloaded via the REST /files/:key/images endpoint
  - icons/    SVG exports of the icon instances; file name = <glyph>-<colour>-<size>
  - renders/  composite layers (blurred floor plans, footer pattern)
  Raw design data + reference render live in /exports/figma/eldeco-terra-sol.
*/

// images
import logo from "./images/logo.png";
import logoFooter from "./images/logo-footer.png";
import heroDesktop from "./images/hero-desktop.jpg";
import gallery1 from "./images/gallery-1.jpg";
import gallery2 from "./images/gallery-2.jpg";
import gallery3 from "./images/gallery-3.jpg";
import gallery5 from "./images/gallery-5.jpg";
import videoThumbnail from "./images/video-thumbnail.jpg";
import virtualTour from "./images/virtual-tour.jpg";
import amenityPool from "./images/amenity-infinity-pool.jpg";
import priceBanner from "./images/price-banner.jpg";

// renders
import floorplanBlurDesktop from "./renders/floorplan-blur-desktop.png";
import floorplanBlurMobile from "./renders/floorplan-blur-mobile.png";
import footerPattern from "./renders/footer-pattern.svg";

// icons — feature / highlight glyphs (#b5873b)
import towers22 from "./icons/towers-b5873b-22.svg";
import towers20 from "./icons/towers-b5873b-20.svg";
import lobby22 from "./icons/lobby-b5873b-22.svg";
import lobby20 from "./icons/lobby-b5873b-20.svg";
import expand22 from "./icons/expand-b5873b-22.svg";
import expand20 from "./icons/expand-b5873b-20.svg";
import corner22 from "./icons/corner-b5873b-22.svg";
import corner20 from "./icons/corner-b5873b-20.svg";
import sparkle22 from "./icons/sparkle-b5873b-22.svg";
import sparkle20 from "./icons/sparkle-b5873b-20.svg";
import balcony22 from "./icons/balcony-b5873b-22.svg";
import balcony20 from "./icons/balcony-b5873b-20.svg";
import lock22 from "./icons/lock-b5873b-22.svg";
import lock20 from "./icons/lock-b5873b-20.svg";
import highway22 from "./icons/highway-b5873b-22.svg";
import highway20 from "./icons/highway-b5873b-20.svg";
import road22 from "./icons/road-b5873b-22.svg";
import road20 from "./icons/road-b5873b-20.svg";
import school22 from "./icons/school-b5873b-22.svg";
import school20 from "./icons/school-b5873b-20.svg";

// icons — UI
import chevron from "./icons/chevron-090909-18.svg";
import arrowRight from "./icons/arrowright-b5873b-22.svg";
import calendarDark from "./icons/calendar-090909-20.svg";
import calendarGold from "./icons/calendar-e2b04a-20.svg";
import downloadBronze from "./icons/download-b5873b-20.svg";
import downloadGold from "./icons/download-e2b04a-22.svg";
import unlock from "./icons/unlock-090909-20.svg";
import lockGold from "./icons/lock-e2b04a-20.svg";
import pinBronze20 from "./icons/pin-b5873b-20.svg";
import pinMuted16 from "./icons/pin-6b726b-16.svg";
import pinGold14 from "./icons/pin-e2b04a-14.svg";
import pinGold18 from "./icons/pin-e2b04a-18.svg";
import phoneBronze18 from "./icons/phone-b5873b-18.svg";
import phoneBronze20 from "./icons/phone-b5873b-20.svg";
import phoneGold18 from "./icons/phone-e2b04a-18.svg";
import phoneGold20 from "./icons/phone-e2b04a-20.svg";
import phoneDark20 from "./icons/phone-090909-20.svg";
import phoneDark22 from "./icons/phone-090909-22.svg";
import phoneDark26 from "./icons/phone-090909-26.svg";
import whatsappBronze from "./icons/whatsapp-b5873b-20.svg";
import whatsappDark from "./icons/whatsapp-090909-26.svg";
import checkAmenity from "./icons/check-b0632a-14.svg";
import checkAmenity16 from "./icons/check-b0632a-16.svg";
import checkDark from "./icons/check-090909-14.svg";
import checkGold16 from "./icons/check-e2b04a-16.svg";
import play29 from "./icons/play-1f2b25-29.svg";
import play22 from "./icons/play-1f2b25-22.svg";

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
