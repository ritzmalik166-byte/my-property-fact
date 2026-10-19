"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { HOME_FAQ_ITEMS } from "./homeFaqItems";
import "./HomeFAQ.css";

const FaqItem = memo(function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className={`destination-faq__item ${isOpen ? "is-open" : ""}`}>
      <h3 className="destination-faq__question">
        <button
          type="button"
          className="destination-faq__question-btn"
          onClick={() => onToggle(item.id)}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
          id={`faq-trigger-${item.id}`}
        >
          <span className="destination-faq__question-text">
            {item.question}
          </span>
        </button>
      </h3>
      <div
        id={`faq-panel-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
        className={`destination-faq__answer-wrap ${isOpen ? "is-open" : ""}`}
      >
        <div className="destination-faq__answer-inner">
          <div className="destination-faq__answer">
            <p>{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Home FAQ accordion. Questions come from HOME_FAQ_ITEMS, which also feeds the
 * FAQPage JSON-LD in app/(home)/page.jsx. Render inside `.noida-projects-section`:
 * the container width and the home-new / home-redesign overrides are scoped to it.
 */
export default function HomeFAQ() {
  const [openFaqId, setOpenFaqId] = useState(HOME_FAQ_ITEMS[0]?.id || null);

  const toggleFaq = useCallback((faqId) => {
    setOpenFaqId((prev) => (prev === faqId ? null : faqId));
  }, []);

  return (
    <div className="destination-faq" id="home-faq">
      <div className="destination-faq__inner">
        <div className="destination-faq__left">
          <span className="destination-faq__tag">Trusted By</span>
          <h2 className="destination-faq__title">Frequently Asked Questions</h2>
        </div>

        <div className="destination-faq__right">
          <div
            className="destination-faq__scroll-area"
            role="region"
            aria-label="FAQ answers list"
          >
            {HOME_FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openFaqId === item.id}
                onToggle={toggleFaq}
              />
            ))}
          </div>
        </div>

        <div className="destination-faq__contact">
          <p className="destination-faq__contact-title">Still have questions ?</p>
          <p className="destination-faq__contact-text">
            We&apos;re here to answer all your questions. Reach out today!
          </p>
          <Link
            href="/contact-us"
            className="destination-faq__mail-btn"
            aria-label="Open contact us page"
            target="_blank"
            rel="noopener noreferrer"
          >
            Send Mail
          </Link>
        </div>
      </div>
    </div>
  );
}
