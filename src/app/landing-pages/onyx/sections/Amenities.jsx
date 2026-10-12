"use client";

import { useEffect } from "react";
import feather from "feather-icons";

export default function Amenities() {
  useEffect(() => {
    feather.replace(); // Replace feather icons
  }, []);

  const amenities = [
    {
      icon: "bell",
      color: "#e0e7ff",
      text: "Intelligent Fire Alarm System",
    },
    {
      icon: "zap",
      color: "#d1fae5",
      text: "EV Charging Points for a future-ready infrastructure",
    },
    {
      icon: "shield",
      color: "#fecaca",
      text: "CCTV Surveillance & 24/7 Manned Security",
    },
    {
      icon: "wifi",
      color: "#dbeafe",
      text: "Seamless Internet / Wi-Fi Connectivity",
    },
    {
      icon: "layers",
      color: "#fef08a",
      text: "3-Level Parking with easy access",
    },
    {
      icon: "plus",
      color: "#99f6e4",
      text: "On-site Pharmacy for convenience",
    },
  ];

  return (
    <section id="amenities" style={{ backgroundColor: "#324F43" }}>
      <div className="container py-5">
        <h2
          className="text-white text-center fw-bold mb-5"
          style={{ fontSize: "2.5rem" }}
        >
          Amenities
        </h2>

        <div className="row g-4">
          {amenities.map((item, idx) => (
            <div
              className="col-12 col-sm-6 col-md-4"
              key={idx}
              data-aos="fade-up"
            >
              <div
                className="text-center border rounded shadow bg-white p-4 h-100 d-flex flex-column align-items-center transition"
                style={{
                  transition: "all 0.3s ease-in-out",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: item.color,
                  }}
                >
                  <i data-feather={item.icon} width="32" height="32"></i>
                </div>
                <p className="fw-semibold" style={{ fontSize: "1.1rem" }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
