"use client";

import React from "react";
import Header from "./components/Header";
import Hero from "./sections/Hero";
import Overview from "./sections/Overview";
import Projects from "./sections/Projects";
import Amenities from "./sections/Amenities";
import FloorPlans from "./sections/FloorPlans";
import Gallery from "./sections/Gallery";
import Highlights from "./sections/Highlights";
import Contact from "./sections/Contact";
import ScrollToTop from "./components/ScrollToTop";
import PopUpForm from "./components/PopUpForm";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Script from "next/script";

const Start = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      offset: 120, // offset (in px) from the original trigger point
    });
  }, []);
  return (
    <>
      <ScrollToTop />
      <PopUpForm />
      <Header />
      <Hero />
      <Overview />
      <Projects />
      <Amenities />
      <FloorPlans />
      <Gallery />
      <Highlights />
      <Contact />
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-11480562062"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-11480562062');
          `}
      </Script>
    </>
  );
};

export default Start;
