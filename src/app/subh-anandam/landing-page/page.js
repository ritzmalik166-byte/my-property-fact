import React from "react";
import HeroSection from "./sections/HeroSection";
import MainSection from "./sections/MainSection";
import FooterSection from "./sections/FooterSection";

import "bootstrap/dist/css/bootstrap.min.css";

const page = () => {
  return (
    <>
      <HeroSection />
      <MainSection />
      <FooterSection />
    </>
  );
};

export default page;
