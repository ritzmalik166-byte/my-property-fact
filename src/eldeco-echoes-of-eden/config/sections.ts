export type HeroHighlight = {
  label: string;
  value: string;
};

export type EnquiryField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required?: boolean;
};

export const sectionsConfig = {
  hero: {
    id: "home",
    backgroundImage: "/eldeco-echoes-of-eden/images/hero-bg.jpg",
    location: "Sector 22D, Yamuna Expressway",
    title: "Eldeco Echoes of Eden: 3 BHK Homes Built Around Green Living",
    // subtitle: "3 BHK",
    highlights: [
      { label: "Land Parcel", value: "5 Acres" },
      { label: "Central Greens", value: "3-Acre" },
      { label: "Green Space", value: "80% Open" },
      { label: "Amenities", value: "50+ World-Class Amenities" },
    ] satisfies HeroHighlight[],
    offerBanner: {
      headline: "PAY 10%",
      asterisks: "**",
      headlineSuffix: "NOW",
      subline: "and nothing till 24 months",
    },
    startingPrice: {
      label: "Starting Price",
      value: "₹ 1.99 Cr*",
    },
    enquiry: {
      title: "QUICK ENQUIRY!",
      submitLabel: "SUBMIT NOW",
      consentText:
        "I authorize company representatives to Call, SMS, Email or WhatsApp me about its products and offers. This consent overrides any registration for DNC/NDNC.",
      fields: [
        {
          name: "name",
          label: "Your Name",
          type: "text",
          placeholder: "Your Name",
          required: true,
        },
        {
          name: "email",
          label: "Your Email",
          type: "email",
          placeholder: "Your Email",
          required: true,
        },
        {
          name: "phone",
          label: "Your Phone",
          type: "tel",
          placeholder: "Your Phone",
          required: true,
        },
        {
          name: "message",
          label: "Your Message",
          type: "textarea",
          placeholder: "Your Message",
          required: false,
        },
      ] satisfies EnquiryField[],
    },
  },
  navratriFest: {
    badge: "Navratri Fest",
    titleLead: "This Navratri, celebrate",
    titleHighlight: "new beginnings",
    titleTail: "at Eldeco Echoes of Eden.",
    description:
      "Join us at our Navratri Fest from 13th to 19th October, 11 AM onwards, and enjoy the colours, devotion and joy of the season while you explore our 3 BR VRV air-conditioned homes on the Yamuna Expressway.",
    details: [
      { icon: "calendar", label: "Dates", value: "13th – 19th October" },
      { icon: "clock", label: "Timings", value: "11 AM onwards" },
      {
        icon: "location",
        label: "Venue",
        value: "Eldeco Sales Gallery, Sector 22D, Yamuna Expressway",
      },
    ],
    rera: {
      label: "UP RERA No.",
      number: "UPRERAPRJ125342/02/2026",
      website: "www.up-rera.in",
    },
    disclaimer: "*T&C apply.",
  },
  festiveOffer: {
    badge: "Festive Offer*",
    plan: [
      { percent: 30, title: "Pay 30% Now", note: "Book your home this festive season" },
      { percent: 70, title: "70% Nearing Possession", note: "Pay the balance closer to handover" },
    ],
    ctaLabel: "Claim Festive Offer",
  },
  overview: {
    id: "overview",
    title: "Eldeco Echoes of Eden",
    location: "Sector 22D, Yamuna Expressway",
    description: [
      "Eldeco Echoes of Eden offers premium 3 BHK and 4 BHK residences in Sector 22D, Yamuna Expressway, Greater Noida. Designed for modern families, the project combines comfortable living spaces with lush green surroundings, creating a peaceful and refreshing lifestyle.",
    
      "Located in the fast-growing Yamuna Expressway region, Eldeco Echoes of Eden offers excellent connectivity to key destinations in Greater Noida and nearby areas. With its strategic location, thoughtfully planned homes, and modern lifestyle features, the project is a great choice for both homebuyers and property investors looking for a well-connected residential property in Greater Noida.",
    ],
  },
  highlights: {
    id: "highlight",
    eyebrow: "ELDECO YAMUNA EXPRESSWAY SPECIFICATIONS",
    title: "Our Highlights",
    image: {
      src: "/eldeco-echoes-of-eden/images/hero-bg.jpg",
      alt: "Eldeco Echoes of Eden architectural rendering",
    },
    items: [
      "On one of the fastest-appreciating stretches of the Yamuna Expressway corridor",
      "Every 3 BHK oriented to catch daylight and cross-ventilation through the day",
      "Podium-level towers keep sightlines open to the central green, not to the next block",
      "Amenities picked for daily use, not just brochure headcount",
      "Low tower density leaves room for genuine open space between blocks",
      "A quieter, more settled feel than the traffic-heavy pockets closer to the highway",
    ],
    cta: {
      label: "Download Brochure",
    },
  },
} as const;
