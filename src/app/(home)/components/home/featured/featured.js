"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./featured.css";
import Link from "next/link";
import PropertyContainer from "../../common/PropertyContainer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FeaturedArrowButton,
  SLICK_NEXT_ARROW,
  SLICK_PREV_ARROW,
} from "./FeaturedArrows";

const SWIPE_RAIL_QUERY = "(max-width: 768px)";

export default function Featured({
  url = "",
  autoPlay,
  allProjects,
  type,
  badgeVariant = "default",
  title,
  residentialProjects,
  commercialProjects,
}) {
  const [projectType, setProjectType] = useState("Residential");
  const [isLoading, setIsLoading] = useState(false);
  const swipeViewportRef = useRef(null);
  const isHomeFeaturedShowcase = type === "Featured" && !autoPlay;
  const isPremierTypeTabs = Boolean(autoPlay) && type !== "Similar";
  const cardLayoutVariant =
    badgeVariant === "home-featured"
      ? "showcase"
      : type === "Featured"
        ? "overlap"
        : "default";
  // Read the media query on first client render so desktop mounts Slick directly instead of
  // mounting the swipe rail and swapping. The premier-tabs rail is only rendered client-side.
  const [useSwipeRail, setUseSwipeRail] = useState(
    () =>
      isPremierTypeTabs &&
      (typeof window === "undefined" || window.matchMedia(SWIPE_RAIL_QUERY).matches),
  );

  // When residentialProjects + commercialProjects are passed, use them per tab (no filter). Else filter allProjects by type.
  const filteredProjects = useMemo(() => {
    if (residentialProjects && commercialProjects) {
      return projectType === "Residential" ? residentialProjects : commercialProjects;
    }
    if (!allProjects || allProjects.length === 0) return [];
    if (type === "Similar" || type === "Featured") {
      return allProjects;
    }
    return allProjects
      .filter((project) => project.propertyTypeName === projectType)
      .slice(0, 9);
  }, [allProjects, projectType, type, residentialProjects, commercialProjects]);

  // Native swipe rail on phones — Slick drag fights page scroll and parent overflow-x: clip.
  useEffect(() => {
    if (!isPremierTypeTabs || typeof window === "undefined") return undefined;
    const mq = window.matchMedia(SWIPE_RAIL_QUERY);
    const sync = () => setUseSwipeRail(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [isPremierTypeTabs]);

  // Clear loading state when filtered projects are ready
  useEffect(() => {
    if (isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filteredProjects, isLoading]);

  const scrollSwipeRail = useCallback((direction) => {
    const viewport = swipeViewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 1) return;
    const slide = viewport.querySelector(".featured-swipe-rail__slide");
    const step = slide?.getBoundingClientRect().width || viewport.clientWidth * 0.82;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const target = viewport.scrollLeft + direction * step;
    viewport.scrollTo({
      left:
        direction > 0
          ? target > maxScroll - 1
            ? 0
            : target
          : target < 1
            ? maxScroll
            : target,
      behavior: "smooth",
    });
  }, []);

  // Show arrows for Featured, Similar, and Residential/Commercial (autoPlay true)
  const showArrows = autoPlay || type === "Featured" || type === "Similar";
  const projectCount = filteredProjects.length;

  const settings = useMemo(() => {
    const premierRailSettings = {
      slidesToShow: 4,
      infinite: projectCount > 4,
      responsive: [
        {
          // Small laptop: 3 cards fill the rail (1024–1120)
          breakpoint: 1199,
          settings: {
            slidesToShow: 3,
            infinite: projectCount > 3,
            swipe: true,
            touchMove: true,
            swipeToSlide: true,
          },
        },
        {
          // Tablet: 2 wider cards (768–1023)
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            infinite: projectCount > 2,
            swipe: true,
            touchMove: true,
            swipeToSlide: true,
          },
        },
        {
          breakpoint: 481,
          settings: {
            slidesToShow: 1.15,
            infinite: projectCount > 1,
            swipe: true,
            touchMove: true,
            swipeToSlide: true,
            arrows: true,
            autoplay: false,
          },
        },
      ],
    };
    const showcaseSettings = {
      slidesToShow: 6,
      infinite: projectCount > 6,
      responsive: [
        { breakpoint: 1400, settings: { slidesToShow: 5 } },
        { breakpoint: 1200, settings: { slidesToShow: 4 } },
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 2,
            swipe: true,
            touchMove: true,
            swipeToSlide: true,
          },
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 1,
            swipe: true,
            touchMove: true,
            swipeToSlide: true,
          },
        },
      ],
    };
    const showSlickArrows = showArrows && projectCount > 1;
    return {
      dots: false,
      speed: 400,
      autoplay: autoPlay && !useSwipeRail,
      autoplaySpeed: 5000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: showArrows,
      nextArrow: showSlickArrows ? SLICK_NEXT_ARROW : null,
      prevArrow: showSlickArrows ? SLICK_PREV_ARROW : null,
      slidesToScroll: 1,
      swipe: true,
      touchMove: true,
      swipeToSlide: true,
      draggable: true,
      waitForAnimate: false,
      ...(isHomeFeaturedShowcase ? showcaseSettings : premierRailSettings),
    };
  }, [autoPlay, isHomeFeaturedShowcase, projectCount, showArrows, useSwipeRail]);

  // Memoized section title
  const sectionTitle = useMemo(() => {
    if (!autoPlay) return title;
    if (projectType === "Commercial" && type !== "Similar") {
      return `Explore Top Commercial Spaces for Growth`;
    } else if (projectType === "Residential" && type !== "Similar") {
      return `Explore Our Premier Residential Projects`;
    } else if (type === "Similar") {
      return "";
    } else {
      return title;
    }
  }, [projectType, autoPlay, title, type]);

  // Fast tab switching handler with loading state
  const handleProjectType = (nextType) => {
    if (nextType !== projectType) {
      setIsLoading(true);
      setProjectType(nextType);
      if (swipeViewportRef.current) swipeViewportRef.current.scrollLeft = 0;
    }
  };

  return (
    <>
      {type !== "Similar" && (
        <div
          className={`container home-featured-section${
            type === "Featured" ? " home-featured-section--spotlight" : ""
          }`}
        >
          {isPremierTypeTabs && (
            <div
              className="d-flex featured-filter-buttons home-featured-filter-buttons gap-3"
            >
              <button
                type="button"
                className={`mpf-btn-primary ${projectType === "Residential" ? "active" : ""}`}
                onClick={() => handleProjectType("Residential")}
              >
                Residential
              </button>
              <button
                type="button"
                className={`mpf-btn-primary ${projectType === "Commercial" ? "active" : ""}`}
                onClick={() => handleProjectType("Commercial")}
              >
                Commercial
              </button>
            </div>
          )}
          <div className="home-featured-section-heading">
            {isPremierTypeTabs ? (
              <div className="home-featured-section-kicker">
                <span className="home-featured-section-kicker__label">
                  Explore Top Projects1
                </span>
                <Link
                  title="View all projects"
                  className="btn projects-view-all-btn btn-normal-color border-0"
                  href={
                    url
                      ? `/projects/${url}`
                      : `/projects/${projectType === "Commercial" ? "commercial" : "residential"}`
                  }
                >
                  View all
                </Link>
              </div>
            ) : null}
            <div className="home-featured-section-title-row">
              <h2 className="text-left plus-jakarta-sans-semi-bold home-featured-section-title">
                {sectionTitle}
              </h2>
              {isPremierTypeTabs && useSwipeRail && filteredProjects.length > 1 ? (
                <div className="featured-swipe-rail__nav" aria-label="Project slides">
                  <FeaturedArrowButton direction="prev" onClick={() => scrollSwipeRail(-1)} />
                  <FeaturedArrowButton direction="next" onClick={() => scrollSwipeRail(1)} />
                </div>
              ) : null}
            </div>
          </div>
          {isLoading ? (
            <div className="featured-loading-container">
              <div className="featured-loading-spinner"></div>
              <p className="featured-loading-text">Loading projects...</p>
            </div>
          ) : filteredProjects?.length > 0 ? (
            useSwipeRail ? (
              <div className={`featured-page-slider featured-swipe-rail${badgeVariant === "home-featured" ? " featured-page-slider--tiles" : ""}`}>
                <div
                  className="featured-swipe-rail__viewport"
                  ref={swipeViewportRef}
                >
                  <div className="featured-swipe-rail__track">
                    {filteredProjects.map((item, index) => (
                      <div
                        key={item.id ?? item.slugURL ?? index}
                        className="featured-swipe-rail__slide featured-poster-slide"
                      >
                        <PropertyContainer
                          data={item}
                          badgeVariant={badgeVariant}
                          layoutVariant={cardLayoutVariant}
                          imagePriority={
                            badgeVariant === "home-featured" ? false : index < 2
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`featured-page-slider${
                  type === "Featured" && !autoPlay ? " featured-projects-mobile-arrows featured-page-slider--two-up" : ""
                }${badgeVariant === "home-featured" ? " featured-page-slider--tiles" : ""}`}
              >
                <Slider key={projectType} {...settings}>
                  {filteredProjects.map((item, index) => (
                    <div
                      key={item.id}
                      className={
                        isHomeFeaturedShowcase
                          ? "featured-showcase-slide"
                          : "featured-poster-slide"
                      }
                    >
                      <PropertyContainer
                        data={item}
                        badgeVariant={badgeVariant}
                        layoutVariant={cardLayoutVariant}
                        imagePriority={
                          badgeVariant === "home-featured" ? false : index < 2
                        }
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )
          ) : (
            <div className="featured-no-projects">
              <p>No projects available for this category.</p>
            </div>
          )}
        </div>
      )}
      {type === "Similar" && (
        <>
          <div className="container">
            <div className="featured-page-slider">
              <Slider {...settings}>
                {filteredProjects.map((item) => (
                  <div key={item.id} className="px-2 pb-3">
                    <PropertyContainer data={item} />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </>
      )}
    </>
  );
}
