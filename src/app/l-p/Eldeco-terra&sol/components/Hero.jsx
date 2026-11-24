import { getImageProps } from "next/image";
import EnquiryButton from "./enquiry/EnquiryButton";
import Icon from "./ui/Icon";
import Responsive from "./ui/Responsive";
import { icons, images } from "../assets";
import { HERO } from "../data/content";
import styles from "./Hero.module.css";

/** 02 Hero — desktop 23:179 (1440×640), mobile 23:668 (390×600). */
export default function Hero() {
  const common = { alt: "", sizes: "100vw", quality: 75, priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: images.heroDesktop });
  const {
    props: { srcSet: mobileSrcSet, ...mobileImg },
  } = getImageProps({ ...common, src: images.heroMobile });

  return (
    <section id="hero" className={styles.hero} aria-labelledby="ets-hero-title">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...mobileImg} srcSet={mobileSrcSet} className={styles.bg} />
      </picture>
      <span className={styles.gradientBottom} aria-hidden="true" />
      <span className={styles.gradientLeft} aria-hidden="true" />

      <div className={styles.copy}>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.badgeLight}`}>APARTMENTS</span>
          <span className={`${styles.badge} ${styles.badgeGold}`}>HARERA REGISTERED</span>
          <span className={`${styles.badge} ${styles.badgeGlass}`}>
            <Icon src={icons.pinGold14} size={14} />
            SECTOR 80, GURUGRAM
          </span>
        </div>

        <h1 id="ets-hero-title" className={styles.title}>
          {HERO.title}
        </h1>
        <p className={styles.subtitle}>
          <Responsive value={HERO.subtitle} />
        </p>

        <ul className={styles.facts}>
          {HERO.facts.map((fact) => (
            <li key={fact.value} className={`${styles.fact} ${fact.desktopOnly ? styles.factDesktopOnly : ""}`}>
              <span className={styles.factLabel}>
                <Responsive value={fact.label} />
              </span>
              <span className={`${styles.factValue} ${fact.accent ? styles.factAccent : ""}`}>{fact.value}</span>
            </li>
          ))}
        </ul>

        <div className={styles.ctas}>
          <EnquiryButton arrow className={styles.primaryCta}>
            Get Exclusive Price
          </EnquiryButton>
          <EnquiryButton
            variant="ghost"
            icon={icons.calendarGold}
            className={styles.secondaryCta}
            title="Schedule Your Site Visit"
            submitLabel="Book My Site Visit"
          >
            Book a Site Visit
          </EnquiryButton>
        </div>
      </div>
    </section>
  );
}
