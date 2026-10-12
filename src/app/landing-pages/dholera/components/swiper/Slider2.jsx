import React, { useRef } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "./styles.css";

// import required modules
import { Pagination } from "swiper/modules";

// Import React Icons
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function App() {
  const swiperRef = useRef(null);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView={"auto"}
          spaceBetween={30}
          loop
          className="mySwiper"
        >
          <SwiperSlide //dol-s3-i1.png
            style={{
              backgroundImage: "url(/dolera/s5/dol-s5-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Car Parking
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/s3/dol-s3-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Gated Township
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/dol-play.jpg)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
             Kids Play Area
            </p>
          </SwiperSlide>

          <SwiperSlide //dol-s3-i1.png
            style={{
              backgroundImage: "url(/dolera/s5/dol-s5-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Car Parking
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/s3/dol-s3-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Gated Township
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/dol-play.jpg)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
             Kids Play Area
            </p>
          </SwiperSlide>
          <SwiperSlide //dol-s3-i1.png
            style={{
              backgroundImage: "url(/dolera/s5/dol-s5-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Car Parking
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/s3/dol-s3-i1.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Gated Township
            </p>
          </SwiperSlide>
          <SwiperSlide
            style={{
              backgroundImage: "url(/dolera/dol-play.jpg)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <p
              style={{
                width: "166px",
                height: "50px",
                backgroundColor: "rgba(231, 73, 52, 1)",
                color: "white",
                fontWeight: 600,
                fontSize: "20px",
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
             Kids Play Area
            </p>
          </SwiperSlide>
        </Swiper>

        {/* Left Navigation Button */}
        <button
          className="swiper-nav-button swiper-nav-button-left"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Previous slide"
        >
          <FaChevronLeft />
        </button>

        {/* Right Navigation Button */}
        <button
          className="swiper-nav-button swiper-nav-button-right"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Next slide"
        >
          <FaChevronRight />
        </button>
      </div>
    </>
  );
}
