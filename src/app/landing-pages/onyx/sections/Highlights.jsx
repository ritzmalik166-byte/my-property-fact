"use client";

import { useEffect } from "react";
import feather from "feather-icons";

const highlights = [
  {
    icon: "map-pin",
    text: "Located just steps from Sector 142 Metro Station",
  },
  {
    icon: "clock",
    text: "10 mins from DND Flyway | 15 mins from FNG Expressway",
  },
  {
    icon: "crosshair",
    text: "5 mins from Felix Hospital | 49 mins from Jewar International Airport",
  },
  {
    icon: "briefcase",
    text: "Surrounded by MNCs like British Airways, Infosys, Indigo",
  },
  {
    icon: "layers",
    text: "Designed by leading architects with abstract, iconic enclosures",
  },
  {
    icon: "coffee",
    text: "Climate-controlled alfresco-inspired food court experience",
  },
  {
    icon: "check-circle",
    text: "Developed by Splendor Group, with 40+ years of trust",
  },
];

export default function Highlights() {
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <section
      id="highlight"
      className="py-5 px-3"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      <div className="container">
        <h2
          className="text-center fw-bold mb-5 text-dark"
          style={{ fontSize: "2rem" }}
        >
          Highlights
        </h2>

        <div className="row gy-4">
          {highlights.map((item, index) => (
            <div key={index} className="col-md-6">
              <div
                className="highlight-card d-flex align-items-center p-4 bg-white shadow-sm rounded"
                data-aos="flip-up"
              >
                <div className="icon-circle me-3">
                  <i data-feather={item.icon}></i>
                </div>
                <p className="mb-0 text-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
