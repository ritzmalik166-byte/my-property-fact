# /l-p/Eldeco-terra&sol — Eldeco Terra & Sol (v6)

Built from Figma file `H36LWEBD7Tr4SrlnY18Rzu`:
`Desktop / 1440 (v6)` (node 23:162) and `Mobile / 390 (v6)` (node 23:659).

```
layout.jsx            Montserrat (next/font) + .ets scope + metadata
page.jsx              renders <LandingPage />
thankyou/             post-submit page (redirects back after 5 s)
components/
  LandingPage.jsx     section order + 2-column body (main 780 + sticky sidebar 380)
  Header, Hero, MobileEnquiry, Sidebar, FinalCta, Footer, FloatingActions
                      (the Figma "Tab bar" frames were dummy-only and are not built)
  cards/              one component per "Card / *" frame in the main column
  enquiry/            EnquiryForm, popup modal + context, EnquiryButton/EnquiryTrigger
  ui/                 Button, Card, Icon, Responsive, StatTiles, DetailRows, Lightbox
  motion/             SmoothScroll (Lenis, this page only), ScrollAnimations (GSAP:
                      masked line reveal for all text, curtain + zoom for all images,
                      parallax backdrops), lenisStore (pause scroll while popups are open)
data/content.js       all copy; `{ d, m }` = desktop / mobile wording
assets/               images (Figma image fills), icons (SVG exports), renders (composites)
styles/landing.css    design tokens + scoped resets (overrides root Lato/Inter rules)
```

Shared behaviour (styles/landing.css): one heading scale (h1 hero / h2 every section title /
h3 sub-headings), one "water" hover for every button (`.ets-water`), header hides on scroll-down
and returns on scroll-up. Location uses a live Google Maps embed (`MAP_EMBED_URL` in data/content.js);
the gallery "video" is a blurred photo loop whose play button opens the enquiry form.

Breakpoints: `≥1024` desktop (sidebar) · `768–1023` tablet (desktop content, form under hero,
fixed Call/Enquire bar) · `≤767` mobile frame.

Leads go through `@/components/eld-terN-sol/eldecoLeadFormSubmit` (Google Sheet + RMW CRM),
then to `thankyou/`.

Raw Figma data (node JSON, readable specs, desktop reference render) lives in
`/exports/figma/eldeco-terra-sol/`.
