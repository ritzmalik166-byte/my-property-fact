"use client";
import AboutSection from "./sections/AboutSection";
import AmenitiesSection from "./sections/AmenitiesSection";
import HeroSection from "./sections/HeroSection";
import HighlightsSection from "./sections/HighlightsSection";
import LocationSection from "./sections/LocationSection";
import FloorPlansSection from "./sections/FloorPlanSection";
import ContactSection from "./sections/ContactSection";
import PopupForm from "./components/PopupForm";

import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const page = () => {
  return (
    <>
      <PopupForm />
      <Header />
      <HeroSection />
      <AboutSection />
      <HighlightsSection />
      <AmenitiesSection />
      <LocationSection />
      <FloorPlansSection />
      <ContactSection />
      <Footer />
    </>
  );
};

export default page;
