"use client";

import React from "react";

export default function BuilderSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section className="py-5 bg-light">
      <div className="container text-center" style={{ maxWidth: "960px" }}>
        {/* Subtitle */}
        <p className="fs-4 text-secondary mb-2">
          About the Builder
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
        <h2 className="fw-bold display-5 text-dark mb-4">Sikka Group</h2>

        {/* Content */}
        <p className="fs-5 text-muted mb-5" style={{ lineHeight: "1.7" }}>
          With decades of excellence, <strong>Sikka Group</strong> is a trusted
          name in Indian real estate, known for delivering premium homes marked
          by quality, design, and transparency. Each project reflects the
          Group’s commitment to innovation and sustainable living, ensuring your
          investment is both valuable and secure.{" "}
          <strong>Sikka Kimaya Greens</strong> is a testament to this legacy,
          promising luxury, safety, and community.
        </p>

        {/* CTA Button */}
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
          Enquire Now
        </button>
      </div>
    </section>
  );
}
