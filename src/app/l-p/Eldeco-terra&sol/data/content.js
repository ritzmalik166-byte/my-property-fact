/*
  All copy for the Eldeco Terra & Sol v6 landing page.
  Source: Figma file H36LWEBD7Tr4SrlnY18Rzu
    - "Desktop / 1440 (v6)"  node 23:162
    - "Mobile / 390 (v6)"    node 23:659
  Where the mobile frame uses shorter copy, the entry carries `{ d, m }`
  (desktop / mobile) and is rendered with <Responsive />.
*/

export const PHONE_DISPLAY = "+91-9770708080";
export const PHONE_TEL = "tel:+919770708080";
export const WHATSAPP_URL =
  "https://wa.me/919770708080?text=" +
  encodeURIComponent("Hi, I am interested in Eldeco Terra & Sol, Sector 80 Gurugram.");
export const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Eldeco Terra & Sol, Sector 80, Gurugram, Haryana");

export const RERA = "HARERA Reg. No. 20 of 2026";

/** Google Maps embed for the Location card (Eldeco Terra & Sol place pin). */
export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3510.856882485525!2d76.95933647613037!3d28.36317619626023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d3d44a1889ea7%3A0x21f45894d51f58b0!2sEldeco%20Terra%20%26%20Sol!5e0!3m2!1sen!2sin!4v1795502521300!5m2!1sen!2sin";

/** Section anchors shared by the header nav and the footer links. */
export const SECTION_IDS = {
  overview: "overview",
  highlights: "highlights",
  gallery: "gallery",
  price: "price",
  amenities: "amenities",
  floorPlans: "floor-plans",
  location: "location",
  virtualTour: "virtual-tour",
  developer: "about-developer",
};

/**
 * Top-to-bottom order of the anchored sections on the page
 * (must match the card order in components/LandingPage.jsx).
 * Every nav list is sorted by this, so links always follow the page.
 */
export const SECTION_ORDER = [
  SECTION_IDS.overview, // Project title card
  SECTION_IDS.highlights, // Key Highlights
  SECTION_IDS.gallery, // Gallery & Video
  SECTION_IDS.price, // Price List
  SECTION_IDS.amenities, // Amenities and Features
  SECTION_IDS.floorPlans, // Floor Plans
  SECTION_IDS.location, // Location
  SECTION_IDS.virtualTour, // Explore Property
  SECTION_IDS.developer, // About Eldeco Group
];

/** Sort links by where their section sits on the page (stable for links to the same section). */
const byPageOrder = (links) =>
  [...links].sort((a, b) => SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id));

export const HEADER_NAV = byPageOrder([
  { label: "Overview", id: SECTION_IDS.overview },
  { label: "Highlights", id: SECTION_IDS.highlights },
  { label: "Amenities", id: SECTION_IDS.amenities },
  { label: "Price", id: SECTION_IDS.price },
  { label: "Location", id: SECTION_IDS.location },
  { label: "Gallery", id: SECTION_IDS.gallery },
]);

export const HERO = {
  title: "Eldeco Terra & Sol",
  subtitle: {
    d: "Iconic luxury 3 & 3.5 BHK apartments in Gurgaon, with only 4 homes per core and wrapped balconies.",
    m: "Iconic luxury 3 & 3.5 BHK apartments with only 4 homes per core.",
  },
  facts: [
    { label: { d: "Starting", m: "Starting" }, value: "₹3.33 Cr*", accent: true },
    { label: { d: "Floors", m: "Floors" }, value: "G+30" },
    { label: { d: "Land parcel", m: "Land" }, value: "2.7 Acres" },
    { label: { d: "Total units", m: "Total units" }, value: "224", desktopOnly: true },
  ],
};

export const PROJECT_FEATURES = [
  { icon: "towers", label: { d: "3 & 3.5 BHK Apartments", m: "3 & 3.5 BHK" } },
  { icon: "lobby", label: { d: "G+30 Floors", m: "G+30 Floors" } },
  { icon: "expand", label: { d: "2.7 Acres", m: "2.7 Acres" } },
  { icon: "corner", label: { d: "Only 4 Homes per Core", m: "4 Homes per Core" } },
];

export const DESCRIPTION = {
  d: [
    "Eldeco Terra & Sol is a premium residential project in Sector 80, Gurugram, from Eldeco Group. It brings together luxurious comfort, unparalleled connectivity and modern metropolitan living on a 2.7 acre site with 40+ international standard lifestyle features.",
    "With only 4 apartments per core, the 3 BHK and 3.5 BHK homes are designed for the select few, offering privacy and exclusivity. Every apartment is planned for refreshing airflow, abundant natural light and cross-ventilation, and sits more than 30 feet above ground level.",
  ],
  m: [
    "A premium residential project in Sector 80, Gurugram, from Eldeco Group, with luxurious comfort, unparalleled connectivity and 40+ international standard lifestyle features on a 2.7 acre site. Every home is planned for natural light, cross-ventilation and privacy, more than 30 feet above ground level.",
  ],
};

export const STAT_TILES = [
  { value: "G+30", label: "Floors" },
  { value: "Only 2", label: "Towers" },
  { value: "224", label: "Total Units" },
  { value: "2.7 Acres", label: "Land Parcel" },
];

export const HIGHLIGHTS = [
  {
    icon: "sparkle",
    text: { d: "World-class lifestyle and wellness amenities", m: "World-class lifestyle and wellness amenities" },
  },
  {
    icon: "balcony",
    text: {
      d: "Spacious balconies with abundant natural light and airflow",
      m: "Spacious balconies with natural light and airflow",
    },
  },
  {
    icon: "lock",
    text: { d: "Multi-tier security with 24x7 CCTV surveillance", m: "Multi-tier security with 24x7 CCTV" },
  },
  {
    icon: "highway",
    text: { d: "Near NH-48, Dwarka Expressway and KMP Expressway", m: "Near NH-48, Dwarka & KMP Expressway" },
  },
  {
    icon: "road",
    text: {
      d: "Seamless connectivity to Cyber City, IMT Manesar and IGI Airport",
      m: "Connected to Cyber City, IMT Manesar & IGI Airport",
    },
  },
  {
    icon: "school",
    text: {
      d: "Reputed schools, hospitals, malls and business hubs nearby",
      m: "Schools, hospitals, malls and business hubs nearby",
    },
  },
];

/* `mobile: false` rows are absent from the mobile frame; `mOrder` is the mobile order. */
export const PROPERTY_DETAILS = {
  col1: [
    { label: "Apartment", value: "3 / 3.5 BHK", mOrder: 1 },
    { label: "Land parcel", value: "2.7 Acres", mOrder: 3 },
    { label: "Towers", value: "2 (G+30)", mOrder: 4 },
    { label: "Total units", value: "224", mOrder: 5 },
    { label: "Homes per core", value: "Only 4", mOrder: 6 },
  ],
  col2: [
    { label: "Price", value: "₹3.33 Cr* onwards", mOrder: 2 },
    { label: "Location", value: "Sector 80, Gurugram", mobile: false },
    { label: "Property type", value: "Luxury Apartments", mobile: false },
    { label: "Developer", value: "Eldeco Group", mOrder: 7 },
    { label: "RERA", value: "HARERA 20 of 2026", mOrder: 8 },
  ],
};

export const PRICE_LIST = [
  { type: "3 BHK Apartment", price: "₹3.33 Cr*" },
  { type: "3.5 BHK Apartment", price: "₹ On Request" },
];

export const AMENITIES = [
  { d: "All Weather Infinity Pool", m: "Infinity Pool" },
  { d: "Lawn Tennis Court", m: "Lawn Tennis Court" },
  { d: "Yoga & Aerobics", m: "Yoga & Aerobics" },
  { d: "Jogging & Fitness Tracks", m: "Jogging Tracks" },
  { d: "Landscaped Podium Greens", m: "Podium Greens" },
  { d: "Badminton, Cricket & Squash", m: "Squash Court" },
  { d: "3 High-Speed Lifts per Tower", m: "3 High-Speed Lifts" },
  { d: "Exclusive GQ Club", m: "Exclusive GQ Club" },
  { d: "24x7 CCTV Security", m: null },
];

export const FLOOR_PLANS = ["Master Plan", "3 BHK", "3.5 BHK"];

export const DISTANCES = {
  col1: [
    { place: "IMT Manesar", distance: "≈ 5 km" },
    { place: "KMP Expressway", distance: "≈ 6 km" },
    { place: "Dwarka Expressway", distance: "≈ 10 km" },
  ],
  col2: [
    { place: "IGI Airport, Delhi", distance: "≈ 35 km" },
    { place: "Medanta The Medicity", distance: "≈ 18 km" },
    { place: "Cyber City, Gurgaon", distance: "≈ 30 km" },
  ],
};

export const DEVELOPER = {
  text: {
    d: "Eldeco Group is one of India's most trusted and established real estate developers, with a legacy of over four decades across premium residential, commercial and integrated township developments. Building since 1985, the group has handed over 200 projects and delivered over 30 million sq. ft. to more than 30,000 customers.",
    m: "One of India's most trusted developers, building since 1985, with 200 projects handed over and more than 30,000 customers.",
  },
  counters: [
    { value: "40+", label: "Years" },
    { value: "20+", label: "Cities" },
    { value: "200+", label: "Projects" },
    { value: "30,000+", label: "Homes" },
  ],
};

export const FINAL_CTA_POINTS = [
  "3 & 3.5 BHK starting ₹3.33 Cr*",
  "Only 4 homes per core",
  RERA,
];

export const FOOTER_LINKS = {
  quick: byPageOrder([
    { label: "Overview", id: SECTION_IDS.overview },
    { label: "Key Highlights", id: SECTION_IDS.highlights },
    { label: "Amenities", id: SECTION_IDS.amenities },
    { label: "Price List", id: SECTION_IDS.price },
    { label: "Location", id: SECTION_IDS.location },
    { label: "Virtual Tour", id: SECTION_IDS.virtualTour },
  ]),
  project: byPageOrder([
    { label: "3 BHK Apartments", id: SECTION_IDS.price },
    { label: "3.5 BHK Apartments", id: SECTION_IDS.price },
    { label: "Floor Plans", id: SECTION_IDS.floorPlans },
    { label: "Gallery", id: SECTION_IDS.gallery },
    { label: "About Eldeco Group", id: SECTION_IDS.developer },
  ]),
};

export const DISCLAIMER = {
  d: "Disclaimer: This website is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any property. All images, plans, specifications, amenities and pricing are indicative and subject to change without notice. The content may include artistic impressions. Interested buyers are advised to verify all details, including area, pricing and availability, with the sales team before making any decision. *T&C Apply",
  m: "Disclaimer: This website is for informational purposes only and does not constitute an offer to sell. All images, plans, specifications, amenities and pricing are indicative and subject to change without notice. Please verify all details with the sales team. *T&C Apply",
};

export const CONSENT_TEXT =
  "I authorise company representatives to Call, SMS, Email or WhatsApp me about its products and offers. This consent overrides any registration for DNC/NDNC.";
