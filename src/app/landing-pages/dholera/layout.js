"use client";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import Lenis from "lenis";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import EnquiryModal from "./components/EnquiryModal";
import "./style.css";

// Create context for modal state
const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within DoleraLayout");
  }
  return context;
};

export default function DoleraLayout({ children }) {
  const lenisRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormType, setModalFormType] = useState("Enquiry");

  const openModal = (formType = "Enquiry") => {
    setModalFormType(formType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Initialize Lenis with ultra-smooth settings for maximum smoothness
    const lenis = new Lenis({
      duration: 0, // Longer duration for ultra-smooth scrolling
      easing: (t) => {
        // Ultra-smooth cubic easing for buttery smooth feel
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8, // Slightly reduced for smoother control
      smoothTouch: true, // Enable smooth touch scrolling
      touchMultiplier: 1.5,
      infinite: false,
      lerp: 0.08, // Lower lerp for smoother interpolation
    });

    lenisRef.current = lenis;

    // Enhanced animation frame function with higher precision
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);
  

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      
      <main
        style={{
          overflowX: "hidden",
        }}
      >
        <Navbar />
        {children}
        <Footer />
        <EnquiryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          formType={modalFormType}
        />
      </main>
    </ModalContext.Provider>
  );
}
//<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
