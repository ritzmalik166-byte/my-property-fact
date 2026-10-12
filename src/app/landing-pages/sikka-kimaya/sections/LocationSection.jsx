"use client";

import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const locationPoints = [
  "Situated on Sahastradhara Road, a highly sought-after address in Dehradun.",
  "Offers easy access to key city destinations including educational institutions, healthcare facilities, shopping centers, and transport hubs.",
  "Surrounded by hills and lush greenery, offering a serene environment.",
  "Provides tranquility away from the hustle and bustle of city life.",
  "Perfectly blends modern convenience with the calm of nature.",
];

export default function LocationSection() {
  return (
    <section className="py-5 bg-white" id="location">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-4 mb-lg-5">
          <p className="fs-5 text-secondary mb-2">
            Location
            <span
              className="d-block mx-auto mt-1"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: "#A8BE04",
                borderRadius: "2px",
              }}
            />
          </p>
          <h2 className="text-dark display-5 fw-bold">
            Connected. Serene. Ideal.
          </h2>
        </div>

        {/* Layout Container */}
        <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-4 align-items-start">
          {/* Map Section */}
          <div
            className="w-100 rounded shadow overflow-hidden"
            style={{ height: "300px", maxHeight: "450px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4347.885716376338!2d78.08625457638706!3d30.366585174762854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3908d7dcb8204ff5%3A0x6a8f7504f2587840!2sSikka%20Kimaya%20Greens!5e1!3m2!1sen!2sin!4v1748845961016!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Key Points */}
          <div className="w-100">
            {locationPoints.map((point, index) => (
              <div
                key={index}
                className="d-flex align-items-start mb-3 text-start"
                style={{ gap: "1rem" }}
              >
                <FaMapMarkerAlt
                  className="text-success"
                  style={{ fontSize: "1.25rem", marginTop: "0.25rem", flexShrink: 0 }}
                />
                <p className="mb-0 text-muted fs-6">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
