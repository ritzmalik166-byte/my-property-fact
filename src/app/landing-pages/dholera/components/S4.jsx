"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Slider from "./swiper/Slider";

gsap.registerPlugin(ScrollTrigger);

function S4() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(titleRef.current, { opacity: 0, y: -40 });
    gsap.set(sliderRef.current, { opacity: 0, x: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    }).to(
      sliderRef.current,
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.5"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      style={{
        width: "100vw",
        minHeight: "816px",
        backgroundImage: "url(/dolera/s4/dol-s4-bg.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        paddingRight: "40px",
      }}
    >
      {/* Right Center Align Div  */}
      <div
        style={{
          height: "464px",
          width: "934px",
          display: "flex",
          flexDirection: "column",
          gap: "62px",
        }}
      >
        <div
          ref={titleRef}
          style={{
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontWeight: 600,
              fontSize: "48px",
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            Highlights
          </h2>
        </div>
        <div
          ref={sliderRef}
          style={{
            display: "flex",
            width: "100%",
          }}
        >
          <Slider></Slider>
        </div>
      </div>
    </section>
  );
}

export default S4;
