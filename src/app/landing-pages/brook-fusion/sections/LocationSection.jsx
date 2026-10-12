"use client";

import React from "react";
import {
  FaRoad,
  FaTrain,
  FaSubway,
  FaSchool,
  FaArrowRight,
} from "react-icons/fa";

import locationBg from "../assets/bg.webp";

export default function LocationSection() {
  const locationItems = [
    {
      icon: <FaRoad className="text-white fs-4 me-3" />,
      text: "2 mins from FNG Expressway",
    },
    {
      icon: <FaSubway className="text-white fs-4 me-3" />,
      text: "5 mins from Sector 78 Noida",
    },
    {
      icon: <FaArrowRight className="text-white fs-4 me-3" />,
      text: "10 mins from NH-24 & Sector 62 Metro",
    },
    {
      icon: <FaTrain className="text-white fs-4 me-3" />,
      text: "15 mins to Ghaziabad Railway Station",
    },
    {
      icon: <FaSchool className="text-white fs-4 me-3" />,
      text: "Surrounded by top schools, malls, and hospitals",
    },
  ];

  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section
      id="location"
      className="position-relative text-white py-5 px-3"
      style={{
        backgroundImage: `url(${locationBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 0 }}
      />

      {/* Content */}
      <div className="container position-relative z-1 d-flex flex-column flex-lg-row align-items-start gap-5">
        {/* Left: Embedded Map */}
        <div className="w-100 w-lg-50 rounded overflow-hidden shadow" style={{ paddingTop: '3.5rem' }}>

          <div className="w-100 w-lg-50 rounded overflow-hidden shadow border border-white" style={{ minHeight: "450px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4425.987527363445!2d77.47958137633383!3d28.5611423757038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cedfd8a35ed99%3A0x39307c7c22f3b81b!2sFusion%20The%20Brook!5e1!3m2!1sen!2sin!4v1749627075453!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "450px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map Location"
            ></iframe>
          </div>
        </div>

        {/* Right: Text & Info */}
        <div className="w-100 w-lg-50">
          <h5 className="text-uppercase fw-semibold mb-3" style={{ letterSpacing: "0.05em", fontSize: "1.25rem" }}>
            Location Advantage
          </h5>
          <h2 className="fw-bold mb-4" style={{ fontSize: "2.75rem", lineHeight: "1.2" }}>
            Strategically Placed. Seamlessly Connected.
          </h2>
          <p className="fs-5 mb-4" style={{ maxWidth: "600px" }}>
            Located in Sector 12, Greater Noida West, The Brook offers unmatched
            access to key areas:
          </p>

          <table className=" table-borderless text-white mb-4">
            <tbody>
              {locationItems.map((item, index) => (
                <tr key={index} className="align-middle">
                  <td className="py-2 pe-3">{item.icon}</td>
                  <td className="py-2 fw-semibold fs-5">{item.text}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-white-50 fs-6 mb-4">
            Whether you’re commuting to Delhi or building a future where your family thrives, The Brook places you exactly where growth is guaranteed.
          </p>

          <button
            onClick={openPopup}
            className="btn px-5 py-3 fw-semibold text-white"
            style={{
              backgroundColor: "#D0B674",
              border: "1px solid #D0B674",
              transition: "all 0.3s ease",
              fontSize: "1.125rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "black";
              e.currentTarget.style.color = "#D0B674";
              e.currentTarget.style.borderColor = "#D0B674";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#D0B674";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderColor = "#D0B674";
            }}
          >
            Book Site Visit
          </button>

        </div>
      </div>
    </section>
  );
}
