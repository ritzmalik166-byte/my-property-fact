"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import "./TestimonialSection.css";

const STATIC_TESTIMONIALS = [
  {
    id: "rahul-sharma",
    clientName: "Rahul Sharma",
    clientLocation: "Noida",
    projectName: "3C Lotus 300",
    storyHeading: "Confident Home Purchase Guidance",
    testimonialText:
      "Provided step-by-step guidance from builder verification to RERA checks. Best real estate advisory for first-time buyers.",
  },
  {
    id: "vikram-malhotra",
    clientName: "Vikram Malhotra",
    clientLocation: "Gurgaon",
    projectName: "DLF One Midtown",
    storyHeading: "High-ROI Property Investment Insights",
    testimonialText:
      "Their insights and price trend analysis helped me identify high-appreciation properties in Noida and Gurgaon.",
  },
  {
    id: "priya-ankit-verma",
    clientName: "Priya & Ankit Verma",
    clientLocation: "Gurgaon",
    projectName: "Emaar Gurgaon Greens",
    storyHeading: "Dream Home Found Within Budget",
    testimonialText:
      "They helped us find our dream 3BHK home in Gurgaon through project filtering and builder checks.",
  },
  {
    id: "rajesh-nair",
    clientName: "Rajesh Nair",
    clientLocation: "Dubai",
    projectName: "Ace Acreville",
    storyHeading: "Easy Remote Investment Process",
    testimonialText:
      "As an NRI, MyPropertyFact made remote property investment easy with RERA verification, project research, and legal documentation.",
  },
  {
    id: "sanjay-mehta",
    clientName: "Sanjay Mehta",
    clientLocation: "Mumbai",
    projectName: "AJOD One",
    storyHeading: "Informed Commercial Property Decision",
    testimonialText:
      "Detailed analysis of commercial projects, rental yields, and builder credibility. Best for out-of-city investors.",
  },
  {
    id: "sunita-devi",
    clientName: "Sunita Devi",
    clientLocation: "Faridabad",
    projectName: "ACE Hanei",
    storyHeading: "Affordable, RERA-Verified Housing Solutions",
    testimonialText:
      "MyPropertyFact showed us RERA-verified affordable housing projects, helping us save with PMAY subsidy. Best for affordable homes.",
  },
  {
    id: "neha-gupta",
    clientName: "Neha Gupta",
    clientLocation: "Noida",
    projectName: "Aastha Greens",
    storyHeading: "Informed, High-Yield Investment Choices",
    testimonialText:
      "Their consultation helped me make informed real estate investments in Noida with strong rental yield potential.",
  },
  {
    id: "iyer-couple",
    clientName: "Mr. & Mrs. Iyer",
    clientLocation: "Chennai",
    projectName: "Hiranandani Anchorage",
    storyHeading: "Stress-Free, Clear Property Purchase",
    testimonialText:
      "Guided us to ready-to-move and legally clear properties. Stress-free process for senior buyers seeking safety and peace.",
  },
  {
    id: "deepak-singhania",
    clientName: "Deepak Singhania",
    clientLocation: "Delhi",
    projectName: "Ace Aquacasa",
    storyHeading: "Expanded Portfolio with Expert Insights",
    testimonialText:
      "With perfect market analysis and builder verification, they helped me grow my real estate portfolio with high-value investments.",
  },
];

function formatQuote(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= 280) return text;
  const clipped = text.slice(0, 280);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 160 ? clipped.slice(0, lastSpace) : clipped).trim()}…`;
}

const FORMATTED_QUOTES = STATIC_TESTIMONIALS.map((t) => formatQuote(t.testimonialText));
const STAR_INDEXES = [0, 1, 2, 3, 4];

const INNER_CONTAINER_STYLE = {
  width: "100%",
  padding: "48px clamp(16px, 6vw, 240px)",
  boxSizing: "border-box",
};

const LEFT_SECTION_STYLE = {
  display: "flex",
  width: "min(450px, 100%)",
  paddingTop: "clamp(0px, 3vw, 50px)",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "14px",
};

const MAIN_TITLE_STYLE = {
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  textAlign: "left",
  gap: "10px",
  color: "#000",
  fontFamily: "Lato",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "normal",
};

const SUBTEXT_STYLE = {
  margin: "8px 0 0",
  textAlign: "left",
  display: "-webkit-box",
  width: "100%",
  maxWidth: "296px",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 4,
  overflow: "hidden",
  color: "var(--texttwo, rgba(0, 0, 0, 0.60))",
  textOverflow: "ellipsis",
  fontFamily: "Inter",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "23px",
};

const RIGHT_SECTION_STYLE = {
  display: "flex",
  width: "568px",
  maxWidth: "100%",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "49px",
  boxSizing: "border-box",
};

export default function TestimonialSection() {
  const total = STATIC_TESTIMONIALS.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState("next");

  const goPrev = useCallback(() => {
    setSlideDir("prev");
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setSlideDir("next");
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const item = STATIC_TESTIMONIALS[activeIndex];
  if (!item) return null;

  return (
    <section className="container home-testimonials-section">
      <div className="home-testimonials-inner-container" style={INNER_CONTAINER_STYLE}>
        <div className="home-testimonials-left-section" style={LEFT_SECTION_STYLE}>
          <div className="home-testimonials-header">
            <h2 className="home-testimonials-main-title" style={MAIN_TITLE_STYLE}>
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                <circle cx="4.5" cy="4.5" r="4.5" fill="#3CB52C" />
              </svg>
              My Client&apos;s Stories
            </h2>
            <p className="home-testimonials-subtext" style={SUBTEXT_STYLE}>
              With the right help and insight in the market, buying my home became so easy and effortless.
            </p>
          </div>
        </div>

        <div className="home-testimonials-right-section" style={RIGHT_SECTION_STYLE}>
          <div className="home-testimonial-card">
            <div
              key={activeIndex}
              className={`home-testimonial-slide-panel home-testimonial-slide-panel--${slideDir}`}
            >
            {/* Heading row: quote + title with horizontal gap (Figma) */}
            <div className="home-testimonial-heading-block">
              <div className="home-testimonials-quote-wrap">
                <Image
                  src="/static/icon/image 1013 (1).png"
                  alt="Opening quotation mark"
                  title="Opening quotation mark"
                  className="home-testimonials-quote-img"
                  width={42}
                  height={42}
                  loading="lazy"
                  fetchPriority="low"
                />
              </div>
              <h3 className="home-testimonial-story-heading">{item.storyHeading}</h3>
            </div>

            <p className="home-testimonial-text">{FORMATTED_QUOTES[activeIndex]}</p>

            <footer className="home-testimonial-meta">
              <p className="home-testimonial-role">
                <span className="home-testimonial-role-name">{`— ${item.clientName}`}</span>
                <span className="home-testimonial-role-loc">{`, ${item.clientLocation}`}</span>
                <span className="home-testimonial-role-sep">{" / "}</span>
                <span className="home-testimonial-role-project">{item.projectName}</span>
              </p>
              <div className="home-testimonial-stars" role="img" aria-label="Rated 5 out of 5 stars">
                {STAR_INDEXES.map((i) => (
                  <Image
                    key={`${item.id}-star-${i}`}
                    src="/static/icon/star.webp"
                    alt={`Rating star ${i + 1} of 5`}
                    title="Rated 5 out of 5 stars"
                    aria-hidden="true"
                    width={22}
                    height={22}
                    loading="lazy"
                    fetchPriority="low"
                  />
                ))}
              </div>
            </footer>
            </div>
          </div>
        </div>

        <div className="home-testimonials-slider-controls">
          <button
            type="button"
            className="home-testimonials-nav-btn"
            aria-label="Previous testimonial"
            onClick={goPrev}
            disabled={total <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M16 6.9899V9.0101H3.87879L9.43434 14.5657L8 16L0 8L8 9.53674e-07L9.43434 1.43434L3.87879 6.9899L16 6.9899Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            className="home-testimonials-nav-btn"
            aria-label="Next testimonial"
            onClick={goNext}
            disabled={total <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M0 6.9899V9.0101H12.1212L6.56566 14.5657L8 16L16 8L8 0L6.56566 1.43434L12.1212 6.9899L0 6.9899Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
