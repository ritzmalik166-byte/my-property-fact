"use client";

import React from "react";

export default function ClosingStatementSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup")); // Dispatch event to open popup
  };
  return (
    <section className="py-5 bg-light">
      <div className="container text-center px-3" style={{ maxWidth: "768px" }}>
        {/* Subtitle */}
        <p className="fs-5 text-secondary mb-2">
          Closing Statement
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

        {/* Title */}
        <h2 className="text-dark fw-bold display-6 mb-3 mb-md-4">
          A Lifestyle Beyond Expectations
        </h2>

        {/* Description */}
        <p className="text-muted fs-5 lh-lg mb-4 mb-md-5">
          Sikka Kimaya Greens is more than just a residence—it’s a lifestyle
          choice where luxury, nature, and modernity converge. Whether you’re
          investing, upgrading, or looking for your serene second home, Kimaya
          Greens offers a ready, secure, and beautiful future. Join a community
          where every day feels like a retreat. Your elevated living experience
          awaits.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          className="btn"
          style={{
            backgroundColor: "#A8BE04",
            color: "#fff",
            fontSize: "1.125rem",
            fontWeight: "600",
            padding: "1rem 2rem",
            borderRadius: "0.5rem",
            boxShadow:
              "0 4px 6px rgba(168, 190, 4, 0.4)",
            transition: "background-color 0.3s ease",
          }}
          onClick={openPopup}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#94a503")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#A8BE04")}
        >
          Enquire Now
        </button>
      </div>
    </section>
  );
}
