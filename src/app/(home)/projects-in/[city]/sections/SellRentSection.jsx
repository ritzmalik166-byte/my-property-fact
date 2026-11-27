"use client";

import Image from "next/image";
import Reveal from "./Reveal";

// The header owns the Post Property modal and listens for this event.
const OPEN_POST_PROPERTY_EVENT = "mpf-open-post-property";

const PERKS = ["Post unlimited listings", "Reach verified buyers & tenants", "Manage leads in one place"];

export default function SellRentSection() {
  const openPostProperty = () => window.dispatchEvent(new CustomEvent(OPEN_POST_PROPERTY_EVENT));

  return (
    <section className="ap-section" aria-labelledby="ap-sell-title">
      <div className="abroad-container">
        <Reveal className="ap-sell">
          <div className="ap-sell__copy">
            <span className="ap-section__eyebrow ap-section__eyebrow--light">For owners &amp; agents</span>
            <h2 id="ap-sell-title">
              Sell or rent faster <span>at the right price!</span>
            </h2>
            <p>List your property for free and get genuine enquiries from verified buyers and tenants.</p>

            <ul className="ap-sell__perks">
              {PERKS.map((perk) => (
                <li key={perk}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>

            <button type="button" className="ap-sell__cta" onClick={openPostProperty}>
              Post Property
              <span className="ap-sell__badge">Free</span>
            </button>
          </div>

          <div className="ap-sell__visual" aria-hidden="true">
            <Image
              src="/static/broker-portal/post-property-hero.png"
              alt=""
              width={1024}
              height={682}
              sizes="(max-width: 900px) 90vw, 460px"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
