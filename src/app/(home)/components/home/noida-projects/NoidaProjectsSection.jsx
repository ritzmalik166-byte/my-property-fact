"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { HOME_FAQ_ITEMS } from "./homeFaqItems";
import { CITY_CARDS, SHOW_HOME_DESTINATIONS } from "./homeCityCards";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";
import {
  buildHomeCardImageProps,
  HOME_CITY_HERO_SIZES,
} from "@/lib/optimizedImage";

const FAQ_ITEMS = HOME_FAQ_ITEMS;

export default function NoidaProjectsSection({ cityCards: cityCardsProp = null }) {
  const cityCards = cityCardsProp?.length ? cityCardsProp : CITY_CARDS;
  useDeferredStylesheet(() =>
    Promise.all([
      import("swiper/css"),
      import("./NoidaProjectsSection.css"),
    ]),
  );

  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0]?.id || null);

  /**
   * Swiper loop needs enough slides (>= 2 * slidesPerView on desktop). Duplicate
   * the set so the loop is seamless and no blank space appears at the join.
   */
  const swiperSlides = useMemo(
    () => [...cityCards, ...cityCards],
    [cityCards],
  );

  const toggleFaq = (faqId) => {
    setOpenFaqId((prev) => (prev === faqId ? null : faqId));
  };

  const showDestinations = SHOW_HOME_DESTINATIONS;

  return (
    <section className="container noida-projects-section">
      {showDestinations && (
        <div className="noida-projects-container">
          <div className="noida-projects-content">
            <div className="noida-projects-header">
              <h2 className="plus-jakarta-sans-semi-bold text-center my-5">
                Popular Real Estate Destinations
              </h2>
            </div>
            <div className="city-cards-slider-wrapper">
              <Swiper
                modules={[Autoplay]}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  waitForTransition: false,
                }}
                loop={swiperSlides.length > 1}
                roundLengths
                watchSlidesProgress
                watchOverflow={false}
                centerInsufficientSlides={false}
                spaceBetween={8}
                speed={800}
                slidesPerView={3}
                breakpoints={{
                  0: { slidesPerView: 1, spaceBetween: 8 },
                  760: { slidesPerView: 2, spaceBetween: 12 },
                  1025: { slidesPerView: 3, spaceBetween: 8 },
                }}
                preventClicks
                preventClicksPropagation
                className="city-cards-swiper"
              >
                {swiperSlides.map((city, index) => (
                  <SwiperSlide key={`${city.id}-${index}`}>
                    <CityCard city={city} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}

      <div className="destination-faq" id="home-faq">
        <div className="destination-faq__inner">
          <div className="destination-faq__left">
            <span className="destination-faq__tag">Trusted By</span>
            <h2 className="destination-faq__title">Frequently Asked Questions</h2>
          </div>

          <div className="destination-faq__right">
            <div
              className="destination-faq__scroll-area"
              role="region"
              aria-label="FAQ answers list"
            >
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`destination-faq__item ${isOpen ? "is-open" : ""}`}
                >
                  <h3 className="destination-faq__question">
                    <button
                      type="button"
                      className="destination-faq__question-btn"
                      onClick={() => toggleFaq(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item.id}`}
                      id={`faq-trigger-${item.id}`}
                    >
                      <span className="destination-faq__question-text">
                        {item.question}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={`destination-faq__answer-wrap ${isOpen ? "is-open" : ""}`}
                  >
                    <div className="destination-faq__answer-inner">
                      <div className="destination-faq__answer">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="destination-faq__contact">
            <p className="destination-faq__contact-title">Still have questions ?</p>
            <p className="destination-faq__contact-text">
              We&apos;re here to answer all your questions. Reach out today!
            </p>
            <Link
              href="/contact-us"
              className="destination-faq__mail-btn"
              aria-label="Open contact us page"
              target="_blank"
              rel="noopener noreferrer"
            >
              Send Mail
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// City Card Component
function CityCard({ city }) {
  const cityLabel = (city.name && String(city.name).trim()) || "City";
  const cityDestinationAlt = `${cityLabel} — popular real estate destination; projects for sale on My Property Fact`;
  const topPickAlt = city.topProjectName
    ? `${city.topProjectName} in ${cityLabel} — featured project on My Property Fact`
    : cityDestinationAlt;
  const heroImgDescription = topPickAlt;
  const iconNavigateTitle = `View ${cityLabel} real estate on My Property Fact (opens city page)`;
  const iconArrowTitle = `See all ${cityLabel} properties for sale (opens city page)`;
  const heroSrc = city.displayImageSrc || city.imageSrc;
  const heroImageProps = buildHomeCardImageProps({
    src: heroSrc,
    width: 640,
    height: 360,
    alt: heroImgDescription,
    sizes: HOME_CITY_HERO_SIZES,
    quality: 65,
  });

  const cityLinkTitle = `Explore ${cityLabel} real estate, listings and price trends on My Property Fact`;

  return (
    <Link
      href={city.href}
      prefetch={false}
      className="city-card city-card-link"
      title={cityLinkTitle}
    >
      <div className="city-card-hero">
        <div className="city-card-hero__img">
          <img
            {...heroImageProps}
            className="city-card-hero__image"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="city-card-hero__bar" aria-hidden="true" />
        <div className="city-card-hero__overlay">
          <div className="city-header-row">
            <h3 className="city-name city-name--on-image">{cityLabel}</h3>
            <span className="city-external-icon" aria-hidden="true">
              <img
                src="/icon/navigate.svg"
                alt={iconNavigateTitle}
                title={iconNavigateTitle}
                width={18}
                height={18}
                className="navigate-icon navigate-icon--on-image"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>

      <div className="city-card-body">
        {city.topProjectName && (
          <p className="city-top-pick" title={city.topProjectName ?? undefined}>
            <span className="city-top-pick__label">Top project</span>
            <span className="city-top-pick__name">{city.topProjectName}</span>
          </p>
        )}

        <div className="city-price-range">
          <span className="price-text">{city.priceRange}</span>
        </div>

        <div className="city-properties-count">
          <span className="count-text">
            {city.totalProperties}{" "}
            {city.totalProperties === 1
              ? "Property for Sale"
              : "Properties for Sale"}
            <img
              src="/icon/arrow.svg"
              alt={iconArrowTitle}
              title={iconArrowTitle}
              width={16}
              height={16}
              className="count-arrow-icon"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
