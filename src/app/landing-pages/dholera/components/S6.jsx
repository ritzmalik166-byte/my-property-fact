"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useModal } from "../layout";

gsap.registerPlugin(ScrollTrigger);

function S6() {
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const leftSideRef = useRef(null);
  const rightSideRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(leftSideRef.current, { opacity: 0, x: -80 });
    gsap.set(rightSideRef.current, { opacity: 0, x: 80 });

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
    }).to(
      rightSideRef.current,
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.8"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      id="floor-plans"
      className="dolera-s6-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: "url(/dolera/s6/s6-bg.png)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="s6-main-container"
        style={{
          width: "1240px",
          height: "519px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side Div  */}
        <div
          ref={leftSideRef}
          className="s6-left-side"
          style={{
            width: "342px",
            height: "339px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "50px",
          }}
        >
          <h2
            className="s6-title"
            style={{
              fontWeight: 600,
              fontSize: "48px",
              color: "white",
            }}
          >
            Floor Plans
          </h2>

          <div
            className="s6-left-content"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              className="s6-master-plan"
              style={{
                borderBottom: "1px solid rgba(228, 228, 228, 1)",
              }}
            >
              <p
                className="s6-master-plan-text"
                style={{
                  fontWeight: 600,
                  fontSize: "22px",
                  color: "white",
                }}
              >
                Master Plan
              </p>
            </div>
            <button
              className="s6-download-btn-left"
              onClick={() => openModal("Download Brochure")}
              style={{
                width: "208px",
                height: "52px",
                fontWeight: 600,
                color: "white",
                fontSize: "16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "rgba(231, 73, 52, 1)",
                cursor: "pointer",
                
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(14, 76, 144, 0.9)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgb(271, 73, 52, 1)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Download Brochure
            </button>
          </div>
        </div>

        {/* Right Side Div  */}
        <div
          ref={rightSideRef}
          className="s6-right-side"
          style={{
            width: "805px",
            height: "519px",
            backgroundImage: "url(/dolera/s6/s6-bg-i2.png)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            className="s6-download-btn-right"
            onClick={() => openModal("Download Brochure")}
            style={{
              width: "208px",
              height: "52px",
              fontWeight: 600,
              color: "white",
              fontSize: "16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "rgba(14, 76, 144, 1)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgb(271, 73, 52, 0.9)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Download Brochure
          </button>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s6-section {
            min-height: 100vh !important;
          }

          .s6-main-container {
            width: 1240px !important;
            height: 519px !important;
            flex-direction: row !important;
          }

          .s6-left-side {
            width: 342px !important;
            height: 339px !important;
          }

          .s6-right-side {
            width: 805px !important;
            height: 519px !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s6-section {
            min-height: auto !important;
            padding: 40px 20px !important;
            padding-top: 90px !important;
            padding-bottom: 60px !important;
          }

          .s6-main-container {
            width: 100% !important;
            max-width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s6-left-side {
            width: 100% !important;
            max-width: 400px !important;
            height: auto !important;
            margin: 0 auto !important;
          }

          .s6-title {
            font-size: 42px !important;
          }

          .s6-master-plan-text {
            font-size: 20px !important;
          }

          .s6-download-btn-left {
            width: 100% !important;
            max-width: 250px !important;
          }

          .s6-right-side {
            width: 100% !important;
            max-width: 100% !important;
            height: 400px !important;
            margin: 0 auto !important;
          }

          .s6-download-btn-right {
            width: 100% !important;
            max-width: 250px !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1023px) {
          .dolera-s6-section {
            min-height: auto !important;
            padding: 40px 30px !important;
            padding-top: 90px !important;
            padding-bottom: 60px !important;
          }

          .s6-main-container {
            width: 100% !important;
            max-width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s6-left-side {
            width: 100% !important;
            max-width: 400px !important;
            height: auto !important;
            margin: 0 auto !important;
          }

          .s6-title {
            font-size: 40px !important;
          }

          .s6-master-plan-text {
            font-size: 20px !important;
          }

          .s6-download-btn-left {
            width: 100% !important;
            max-width: 250px !important;
          }

          .s6-right-side {
            width: 100% !important;
            max-width: 100% !important;
            height: 400px !important;
            margin: 0 auto !important;
          }

          .s6-download-btn-right {
            width: 100% !important;
            max-width: 250px !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s6-section {
            min-height: auto !important;
            padding: 30px 20px !important;
            // padding-top: 90px !important;
            padding-bottom: 50px !important;
          }

          .s6-main-container {
            width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s6-left-side {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            gap: 30px !important;
          }

          .s6-title {
            font-size: 32px !important;
          }

          .s6-master-plan-text {
            font-size: 18px !important;
          }

          .s6-download-btn-left {
            width: 100% !important;
            max-width: 280px !important;
            font-size: 15px !important;
          }

          .s6-right-side {
            width: 100% !important;
            max-width: 100% !important;
            height: 350px !important;
          }

          .s6-download-btn-right {
            // width: 100% !important;
            // max-width: 280px !important;
            // font-size: 15px !important;
            display:none !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s6-section {
            min-height: auto !important;
            padding: 20px 16px !important;
            // padding-top: 90px !important;
            padding-bottom: 40px !important;
          }

          .s6-main-container {
            width: 100% !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 25px !important;
          }

          .s6-left-side {
            width: 100% !important;
            height: auto !important;
            gap: 25px !important;
          }

          .s6-title {
            font-size: 28px !important;
          }

          .s6-master-plan-text {
            font-size: 16px !important;
          }

          .s6-download-btn-left {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }

          .s6-right-side {
            width: 100% !important;
            height: 300px !important;
          }

          .s6-download-btn-right {
            // width: 100% !important;
            // max-width: 100% !important;
            // font-size: 14px !important;
             display:none !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s6-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S6;
