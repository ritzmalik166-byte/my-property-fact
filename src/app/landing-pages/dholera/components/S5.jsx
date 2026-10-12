"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Slider2 from "./swiper/Slider2";
import { useModal } from "../layout";

gsap.registerPlugin(ScrollTrigger);

function S5() {
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const leftSideRef = useRef(null);
  const sliderRef = useRef(null);
  const priceCardRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(leftSideRef.current, { opacity: 0, x: -60 });
    gsap.set(sliderRef.current, { opacity: 0, x: 60 });
    gsap.set(priceCardRef.current, { opacity: 0, y: -50, scale: 0.95 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(leftSideRef.current, {
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: "power3.out",
    })
      .to(
        sliderRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.8"
      )
      .to(
        priceCardRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.6"
      );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      id="amenities"
      className="dolera-s5-section"
      style={{
        width: "100vw",
        minHeight: "110vh",
        position: "relative",
        display: "flex",
        justifyContent: "end",
        alignItems: "end",
        paddingBottom: "50px",
      }}
    >
      {/*Right Center Align Div  */}
      <div
        className="s5-main-content"
        style={{
          width: "90%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: "460px",
          gap: "50px",
        }}
      >
        {/* Left Side Div  */}
        <div
          ref={leftSideRef}
          className="s5-left-side"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "550px",
            height: "100%",
            textAlign: "center",
          }}
        >
          <h2
            className="s5-amenities-title"
            style={{
              fontWeight: 600,
              fontSize: "48px",
              color: "black",
            }}
          >
            Amenities
          </h2>
          <p
            className="s5-amenities-text"
            style={{
              fontWeight: 400,
              fontSize: "16px",
              width: "322px !important",
            }}
          >
            Two grand clubhouses of 31,000 sq.ft. hosting a number of lifestyle
            amenities.
          </p>
        </div>

        {/* Right Side Slider  */}
        <div
          ref={sliderRef}
          className="s5-slider-container"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Slider2></Slider2>
        </div>
      </div>

      {/* Absolute Postioned Div  */}
      <div
        ref={priceCardRef}
        className="s5-price-list-card"
        style={{
          width: "80%",
          height: "304px",
          backgroundImage: "url(/dolera/s5/s5-abs-img.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, 50%)",
          top: "-30%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Centerd Align Div  */}
        <div
          className="s5-price-content"
          style={{
            width: "90%",
            height: "222px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Left Side  */}
          <div
            className="s5-price-left"
            style={{
              width: "676px",
              height: "100%",
            }}
          >
            {/* Bottom Div  */}
            <div
              className="s5-price-details"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  className="s5-plots-type"
                  style={{
                    fontWeight: 400,
                    fontSize: "38px",
                    color: "#ffffff",
                  }}
                >
                  Plots Types
                </p>
                <div
                  className="s5-size-info"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "70px",
                  }}
                >
                  <p
                    className="s5-size-label"
                    style={{
                      fontWeight: 400,
                      fontSize: "28px",
                      color: "white",
                    }}
                  >
                    Size
                  </p>

                  <p
                    className="s5-size-value"
                    style={{
                      fontWeight: 400,
                      fontSize: "28px",
                      color: "white",
                    }}
                  >
                    130 Sq.Yd*
                  </p>
                </div>
              </div>

              <div>
              <h2
                className="s5-price-title"
                style={{
                  fontWeight: 600,
                  fontSize: "48px",
                  color: "white",
                }}
              >
                Price List
              </h2>

                <p
                  className="s5-starting-price-label"
                  style={{
                    fontWeight: 400,
                    fontSize: "38px",
                    color: "#ffffff",
                  }}
                >
                  Starting Price
                </p>

                <h2
                  className="s5-starting-price-value"
                  style={{
                    fontWeight: 700,
                    fontSize: "47px",
                    color: "#ffffff",
                  }}
                >
                  ₹ 10 Lacs*
                </h2>
              </div>
            </div>
          </div>

          {/* Right Side Div  */}
          <div className="s5-price-button-wrapper">
            <button
              className="s5-enquire-btn"
              onClick={() => openModal("Enquiry")}
              style={{
                width: "164px",
                height: "52px",
                backgroundColor: "rgba(14, 76, 144, 1)",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
              }}
              
            >
              Enquire Now
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s5-section {
            min-height: 110vh !important;
            justify-content: flex-end !important;
            align-items: flex-end !important;
          }

          .s5-main-content {
            width: 90% !important;
            flex-direction: row !important;
            height: 460px !important;
          }

          .s5-price-list-card {
            width: 80% !important;
            height: 304px !important;
            top: -30% !important;
            transform: translate(-50%, 50%) !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s5-section {
            min-height: auto !important;
            // padding: 40px 20px !important;
            // padding-top: 150px !important;
            // padding-bottom: 60px !important;
            display: block !important;
          }

          .s5-main-content {
            width: 100% !important;
            max-width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s5-left-side {
            width: 100% !important;
            max-width: 500px !important;
          }

          .s5-slider-container {
            width: 100% !important;
            height: 400px !important;
          }

          .s5-price-list-card {
            position: relative !important;
            width: 95% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 0 !important;
            margin-top: 40px !important;
            height: auto !important;
            min-height: 250px !important;
          }

          .s5-price-content {
            width: 95% !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 20px !important;
            padding: 20px !important;
          }

          .s5-price-left {
            width: 100% !important;
            height: auto !important;
          }

          .s5-price-title {
            font-size: 36px !important;
          }

          .s5-plots-type,
          .s5-starting-price-label {
            font-size: 28px !important;
          }

          .s5-size-label,
          .s5-size-value {
            font-size: 22px !important;
          }

          .s5-starting-price-value {
            font-size: 32px !important;
          }

          .s5-price-button-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }

          .s5-enquire-btn {
            width: 100% !important;
            max-width: 200px !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1492px) {
          .dolera-s5-section {
            min-height: auto !important;
            // padding: 40px 30px !important;
            // padding-top: 150px !important;
            // padding-bottom: 60px !important;
            justify-content: center !important;
            align-items: center !important;
            display: block !important;
          }

          .s5-main-content {
            width: 100% !important;
            max-width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s5-left-side {
            width: 100% !important;
            max-width: 500px !important;
          }

          .s5-amenities-title {
            font-size: 40px !important;
          }

          .s5-slider-container {
            width: 100% !important;
            height: 400px !important;
          }

          .s5-price-list-card {
            position: relative !important;
            width: 95% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 0 !important;
            margin-top: 40px !important;
            height: auto !important;
            min-height: 250px !important;
          }

          .s5-price-content {
            width: 95% !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 20px !important;
            padding: 20px !important;
          }

          .s5-price-left {
            width: 100% !important;
            height: auto !important;
          }

          .s5-price-title {
            font-size: 32px !important;
          }

          .s5-plots-type,
          .s5-starting-price-label {
            font-size: 24px !important;
          }

          .s5-size-label,
          .s5-size-value {
            font-size: 20px !important;
          }

          .s5-starting-price-value {
            font-size: 28px !important;
          }

          .s5-price-button-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }

          .s5-enquire-btn {
            width: 100% !important;
            max-width: 200px !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s5-section {
            min-height: auto !important;
            padding: 30px 20px !important;
            // padding-top: 150px !important;
            padding-bottom: 50px !important;
            display: block !important;
          }

          .s5-main-content {
            width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s5-left-side {
            width: 100% !important;
          }

          .s5-amenities-title {
            font-size: 32px !important;
          }

          .s5-amenities-text {
            font-size: 14px !important;
            width: auto !important;
          }

          .s5-slider-container {
            width: 100% !important;
            height: 350px !important;
          }

          .s5-price-list-card {
            position: relative !important;
            width: 95% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: 0 !important;
            margin-top: 30px !important;
            height: auto !important;
            min-height: 220px !important;
          }

          .s5-price-content {
            width: 95% !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 15px !important;
            padding: 20px 15px !important;
          }

          .s5-price-left {
            width: 100% !important;
            height: auto !important;
          }

          .s5-price-title {
            font-size: 28px !important;
          }

          .s5-plots-type,
          .s5-starting-price-label {
            font-size: 20px !important;
          }

          .s5-size-info {
            gap: 30px !important;
          }

          .s5-size-label,
          .s5-size-value {
            font-size: 18px !important;
          }

          .s5-starting-price-value {
            font-size: 24px !important;
          }

          .s5-price-button-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }

          .s5-enquire-btn {
            width: 100% !important;
            max-width: 180px !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s5-section {
            min-height: auto !important;
            padding: 20px 16px !important;
            // padding-top: 150px !important;
            padding-bottom: 40px !important;
            display: block !important;
          }

          .s5-main-content {
            width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 25px !important;
          }

          .s5-left-side {
            width: 100% !important;
          }

          .s5-amenities-title {
            font-size: 28px !important;
          }

          .s5-amenities-text {
            font-size: 13px !important;
            line-height: 1.5 !important;
            width: auto !important;
          }

          .s5-slider-container {
            width: 100% !important;
            height: 300px !important;
          }

          .s5-price-list-card {
            position: relative !important;
            width: 100% !important;
            left: 0 !important;
            transform: none !important;
            top: 0 !important;
            margin-top: 30px !important;
            height: auto !important;
            min-height: 200px !important;
          }

          .s5-price-content {
            width: 95% !important;
            height: auto !important;
            flex-direction: column !important;
            gap: 15px !important;
            padding: 20px 12px !important;
          }

          .s5-price-left {
            width: 100% !important;
            height: auto !important;
          }

          .s5-price-details {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }

          .s5-price-title {
            font-size: 24px !important;
          }

          .s5-plots-type,
          .s5-starting-price-label {
            font-size: 18px !important;
          }

          .s5-size-info {
            gap: 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .s5-size-label,
          .s5-size-value {
            font-size: 16px !important;
          }

          .s5-starting-price-value {
            font-size: 22px !important;
          }

          .s5-price-button-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }

          .s5-enquire-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s5-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S5;
