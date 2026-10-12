"use client";

import React from "react";
import {
  FaHome,
  FaMapMarkerAlt,
  FaBuilding,
  FaRupeeSign,
  FaTree,
  FaShieldAlt,
} from "react-icons/fa";

const iconColor = "#587B89";

const overviewData = [
  { icon: <FaHome size={72} color={iconColor} />, title: "Luxury Living Spaces" },
  { icon: <FaMapMarkerAlt size={72} color={iconColor} />, title: "Prime Dehradun Location" },
  { icon: <FaBuilding size={72} color={iconColor} />, title: "Modern Architecture" },
  { icon: <FaRupeeSign size={72} color={iconColor} />, title: "Affordable Pricing" },
  { icon: <FaTree size={72} color={iconColor} />, title: "Green Landscapes" },
  { icon: <FaShieldAlt size={72} color={iconColor} />, title: "24x7 Security" },
];

export default function OverviewSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section className="py-5 bg-light" style={{ minHeight: "60vh" }}>
      <div className="container text-center">
        {/* Subtitle */}
        <p className="fs-4 text-secondary mb-2">
          Overview
          <span
            className="d-block mx-auto mt-2"
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#A8BE04",
            }}
          ></span>
        </p>

        {/* Title */}
        <h2 className="fw-bold display-5 mb-5">Sikka Kimaya</h2>

        {/* Grid */}
        <div className="row g-4 mb-5">
          {overviewData.map((item, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4">
              <div className="d-flex align-items-center bg-white shadow rounded p-4 h-100 transition hover-shadow-lg">
                <div className="me-4">
                  {item.icon}
                </div>
                <h3 className="h5 fw-semibold text-start mb-0">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          className="btn text-white fs-5 fw-semibold px-5 py-3 shadow"
          style={{
            backgroundColor: "#A8BE04",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#94a503")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#A8BE04")
          }
          onClick={openPopup}
        >
          Download Brochure
        </button>
      </div>
    </section>
  );
}
