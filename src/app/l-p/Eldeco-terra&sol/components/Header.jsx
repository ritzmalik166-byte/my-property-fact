"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./ui/Icon";
import { icons, images } from "../assets";
import { HEADER_NAV, PHONE_DISPLAY, PHONE_TEL } from "../data/content";
import { getLenis } from "./motion/lenisStore";
import styles from "./Header.module.css";

/** Logo click → smooth scroll back to the hero (top of the page). */
function scrollToHero(event) {
  event.preventDefault();
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
  // keep the URL clean (no #hero) after the click
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

/** Scroll distance (px) that must accumulate in one direction before the header reacts. */
const SCROLL_THRESHOLD = 8;

/**
 * 01 Header (sticky) — desktop 23:163, mobile 23:660.
 * Slides out (translateY(-100%)) while scrolling down and back in (translateY(0))
 * as soon as the visitor scrolls up. Always shown near the top of the page;
 * the mobile menu closes when the header slides away.
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const headerH = headerRef.current?.offsetHeight ?? 84;
      const delta = y - lastY;

      if (y <= headerH) {
        setHidden(false); // near the top: always visible
        lastY = y;
      } else if (Math.abs(delta) >= SCROLL_THRESHOLD) {
        setHidden(delta > 0); // down → hide, up → show
        lastY = y;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu when the header slides away
  useEffect(() => {
    if (hidden && menuOpen) setMenuOpen(false);
  }, [hidden, menuOpen]);

  // let other sticky elements (the desktop enquiry sidebar) follow the header
  useEffect(() => {
    document.documentElement.classList.toggle("ets-header-hidden", hidden);
  }, [hidden]);
  useEffect(() => () => document.documentElement.classList.remove("ets-header-hidden"), []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header ref={headerRef} className={`${styles.header} ${hidden ? styles.hidden : ""}`}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.logoBox} aria-label="Eldeco Terra & Sol — back to top" onClick={scrollToHero}>
          <Image
            src={images.logo}
            alt="Eldeco Terra & Sol"
            className={styles.logo}
            sizes="(max-width: 1023px) 124px, 170px"
            priority
          />
        </a>

        <nav className={styles.nav} aria-label="Page sections">
          {HEADER_NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={PHONE_TEL} className={styles.phone}>
            <Icon src={icons.phoneBronze18} size={18} />
            <span>{PHONE_DISPLAY}</span>
          </a>
          <span className={styles.rera}>HARERA/20/2026</span>
        </div>

        <div className={styles.mobileActions}>
          <a href={PHONE_TEL} className={`ets-water ${styles.callButton}`} aria-label={`Call ${PHONE_DISPLAY}`}>
            <Icon src={icons.phoneDark22} size={22} />
          </a>
          <button
            type="button"
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="ets-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {/* three bars that morph into a ✕ (same size/colour as the Figma Icon/menu) */}
            <span className={styles.burger} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        id="ets-mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Page sections (mobile)">
          {HEADER_NAV.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={styles.mobileLink}
              style={{ "--i": i }}
              tabIndex={menuOpen ? undefined : -1}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <p className={styles.mobileRera}>HARERA/20/2026</p>
      </div>
    </header>
  );
}
