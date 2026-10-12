import TopArrow from "./components/TopArrow";
import AboutSection from "./sections/AboutSection";
import AmenitiesSection from "./sections/AmenitiesSection";
import BuilderSection from "./sections/BuilderSection";
import ClosingStatementSection from "./sections/ClosingStatementSection";
import FloorPlanSection from "./sections/FloorPlanSection";
import GallerySection from "./sections/GallerySection";
import HeroSection from "./sections/HeroSection";
import LocationSection from "./sections/LocationSection";
import OverviewSection from "./sections/OverviewSection";
import PopupForm from "./sections/PopupForm";
import ContactFormSection from "./sections/ContactFormSection"
import Header from "./components/Header";
import Footer from "./components/Footer";
export default function SikkaKimaya() {
    return (
        <div>
            <Header/>
            <PopupForm />
            <HeroSection />
            <OverviewSection />
            <AboutSection />
            <BuilderSection />
            <FloorPlanSection />
            <AmenitiesSection />
            <GallerySection />
            <LocationSection />
            <ClosingStatementSection />
            <TopArrow />
            <ContactFormSection />
            <Footer/>
        </div>
    )
}