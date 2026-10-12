"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export default function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      gsap.to("#mobile-menu", {
        duration: 0.5,
        y: "0%",
        opacity: 1,
        ease: "power2.out",
      });
    } else {
      gsap.to("#mobile-menu", {
        duration: 0.5,
        y: "-100%",
        opacity: 0,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  return (
    <div
      id="mobile-menu"
      className="mobile-menu-overlay position-fixed top-0 start-0 w-100 vh-100 bg-white d-flex flex-column justify-content-center align-items-center"
      style={{ fontFamily: "moster_regular" }}
    >
      <button
        style={{
          position: "absolute",
          right: "20px",
          top: "20px",
        }}
        className="btn"
        onClick={onClose}
      >
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <ul
        className="d-flex flex-column align-items-center gap-4 mb-4"
        style={{ fontSize: "20px", listStyle: "none" }}
      >
        <li>
          <a href="#" className="text-decoration-none text-dark">
            Home
          </a>
        </li>
        <li>
          <a href="#about" className="text-decoration-none text-dark">
            About
          </a>
        </li>
        <li>
          <a href="#amenities" className="text-decoration-none text-dark">
            Amenities
          </a>
        </li>
        <li>
          <a href="#floor-plans" className="text-decoration-none text-dark">
            Floor Plans
          </a>
        </li>
        <li>
          <a href="#gallery" className="text-decoration-none text-dark">
            Gallery
          </a>
        </li>
        <li>
          <a href="#location" className="text-decoration-none text-dark">
            Location
          </a>
        </li>
      </ul>

      <button className="cta-button mobile-cta-button">Enquiry Now</button>
    </div>
  );
}
