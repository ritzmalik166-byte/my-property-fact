import Header from "./Header";
import Hero from "./Hero";
import MobileEnquiry from "./MobileEnquiry";
import Sidebar from "./Sidebar";
import FinalCta from "./FinalCta";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";
import { EnquiryProvider } from "./enquiry/EnquiryContext";
import LeadTracking from "./enquiry/LeadTracking";
import SmoothScroll from "./motion/SmoothScroll";
import ScrollAnimations from "./motion/ScrollAnimations";
import ProjectTitleCard from "./cards/ProjectTitleCard";
import DescriptionCard from "./cards/DescriptionCard";
import HighlightsCard from "./cards/HighlightsCard";
import PriceBannerCard from "./cards/PriceBannerCard";
import GalleryCard from "./cards/GalleryCard";
import PropertyDetailsCard from "./cards/PropertyDetailsCard";
import PriceListCard from "./cards/PriceListCard";
import AmenitiesCard from "./cards/AmenitiesCard";
import FloorPlansCard from "./cards/FloorPlansCard";
import LocationCard from "./cards/LocationCard";
import VirtualTourCard from "./cards/VirtualTourCard";
import DeveloperCard from "./cards/DeveloperCard";
import styles from "./LandingPage.module.css";

/**
 * Eldeco Terra & Sol — v6 landing page.
 * Section order follows "Desktop / 1440 (v6)" (23:162); below 1024px it follows
 * "Mobile / 390 (v6)" (23:659): the enquiry form moves under the hero and the
 * sidebar is replaced by the fixed Call / Enquire bar.
 */
export default function LandingPage() {
  return (
    <EnquiryProvider>
      <LeadTracking />
      <SmoothScroll />
      <ScrollAnimations />
      <Header />
      <main>
        <Hero />
        <MobileEnquiry />

        {/* 04 Body (content + sticky sidebar) — 23:224 */}
        <div className={styles.body}>
          <div className={styles.main}>
            <ProjectTitleCard />
            <DescriptionCard />
            <HighlightsCard />
            <PriceBannerCard />
            <GalleryCard />
            <PropertyDetailsCard />
            <PriceListCard />
            <AmenitiesCard />
            <FloorPlansCard />
            <LocationCard />
            <VirtualTourCard />
            <DeveloperCard />
          </div>
          <Sidebar />
        </div>

        <FinalCta />
      </main>
      <Footer />
      <FloatingActions />
    </EnquiryProvider>
  );
}
