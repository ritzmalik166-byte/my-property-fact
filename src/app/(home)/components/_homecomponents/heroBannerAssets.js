import { ENABLE_DIWALI_THEME, ENABLE_NAVRATRI_THEME } from "@/config/themeFlags";

/** Shared hero banner paths + dimensions — keep preload + render in sync. */
const DEFAULT_BANNER = {
  alt: "Luxury residential skyline at sunset — verified properties on My Property Fact",
  desktop: {
    src: "/static/banners/new_banner.webp",
    width: 1440,
    height: 218,
  },
  tablet: {
    src: "/static/banners/hero-tablet-768x218.webp",
    width: 768,
    height: 218,
  },
  mobile: {
    src: "/static/banners/hero-mobile-458x218.webp",
    width: 458,
    height: 218,
  },
};

const NAVRATRI_BANNER = {
  alt: "Navratri garba celebration on a rooftop overlooking the city skyline — festive property picks on My Property Fact",
  desktop: {
    src: "/static/banners/navratri-hero-desktop-1024x282.jpg",
    width: 1024,
    height: 282,
  },
  tablet: {
    src: "/static/banners/navratri-hero-tablet-768x217.jpg",
    width: 768,
    height: 217,
  },
  mobile: {
    src: "/static/banners/navratri-hero-mobile-640x305.jpg",
    width: 640,
    height: 305,
  },
};

/**
 * Supplied "शुभ दीपावली" artwork, cropped per breakpoint by
 * scripts/build-diwali-hero-banners.mjs (from a 4x Real-ESRGAN master, so it
 * stays sharp on high-DPI). The hero box takes each crop's aspect ratio
 * (festive/diwali.css); live fireworks render on top.
 */
const DIWALI_BANNER = {
  alt: "Shubh Deepawali — Happy Diwali from My Property Fact: diyas, lanterns and fireworks over lit residential towers",
  quality: 88,
  desktop: {
    src: "/static/banners/diwali-mpf-hero-desktop.webp",
    width: 3840,
    height: 1280,
  },
  tablet: {
    src: "/static/banners/diwali-mpf-hero-tablet.webp",
    width: 2400,
    height: 1200,
  },
  mobile: {
    src: "/static/banners/diwali-mpf-hero-mobile.webp",
    width: 1600,
    height: 1000,
  },
};

const ACTIVE_BANNER = ENABLE_DIWALI_THEME
  ? DIWALI_BANNER
  : ENABLE_NAVRATRI_THEME
    ? NAVRATRI_BANNER
    : DEFAULT_BANNER;

export const BANNER_ALT = ACTIVE_BANNER.alt;
export const BANNER_DESKTOP = ACTIVE_BANNER.desktop;
export const BANNER_TABLET = ACTIVE_BANNER.tablet;
export const BANNER_MOBILE = ACTIVE_BANNER.mobile;

export const BANNER_WIDTH = BANNER_DESKTOP.width;
export const BANNER_HEIGHT = BANNER_DESKTOP.height;
export const BANNER_SRC = BANNER_DESKTOP.src;

export const HERO_IMAGE_QUALITY = ACTIVE_BANNER.quality ?? 75;
export const HERO_IMAGE_SIZES = "100vw";
