"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import img1 from "../assets/Offering_OfficeSuit_ONYX.png";
import img2 from "../assets/Offering_retailSpaces_ONYX.png";
import img3 from "../assets/Offering_Foorcourt_ONYX.png";

export default function Projects() {
  const slides = [
    {
      title: "Office Spaces",
      image: img1.src,
      description:
        "Modern and efficient spaces with sizes starting from 526 sq ft. Curated for rapidly growing enterprises and well-established corporate enterprises. Complemented by a grand lobby, high-speed elevators, and multiple breakout zones that redefine the working experience.",
    },
    {
      title: "Retail Spaces",
      image: img2.src,
      description:
        "Retail stores with double floor height optimized for premium footfall. Ideal for Fashion, Lifestyle, Wellness, and Anchor Brands aiming to tap into the high-income catchment.",
    },
    {
      title: "Food Court – Gourmet @ ONYX",
      image: img3.src,
      description:
        "NOIDA’s upcoming gourmet destination blending global culinary experiences with abstract design and a climate-controlled environment — perfect for global franchise restaurants targeting elite consumers.",
    },
  ];

  return (
    <section
      id="offerings"
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5"
    >
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "#3AB24B", fontSize: "2.5rem" }}
      >
        PROJECT OFFERINGS
      </h1>

      <div className="w-100" style={{ maxWidth: "90vw", height: "80vh" }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          pagination={{ clickable: true }}
          navigation
          loop={true}
          autoplay={{ delay: 6000 }}
          className="h-100"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="position-relative d-flex align-items-center justify-content-center text-center text-white h-100"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 1,
                  }}
                ></div>

                <div
                  className="position-relative px-3 px-md-5"
                  style={{ maxWidth: "900px", zIndex: 2 }}
                >
                  <h2 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
                    {slide.title}
                  </h2>
                  <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
