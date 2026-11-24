import Image from "next/image";
import EnquiryForm from "./enquiry/EnquiryForm";
import Icon from "./ui/Icon";
import { icons, images } from "../assets";
import { FINAL_CTA_POINTS } from "../data/content";
import styles from "./FinalCta.module.css";

/** 05 Final CTA — desktop 23:575, mobile 23:965. */
export default function FinalCta() {
  return (
    <section className={styles.section} id="site-visit" data-ets-section="" aria-labelledby="ets-final-cta-title">
      <Image src={images.finalCta} alt="" fill sizes="100vw" className={styles.bg} />
      <span className={styles.overlay} aria-hidden="true" />

      <div className={styles.copy}>
        <span className={styles.tag}>BOOK YOUR SITE VISIT</span>
        <h2 id="ets-final-cta-title" className={styles.title}>
          Your home at Eldeco Terra &amp; Sol is waiting
        </h2>
        <p className={styles.text}>
          Share your details to get the latest price list, floor plans and a private site visit in Sector 80, Gurugram.
        </p>
        <ul className={styles.points}>
          {FINAL_CTA_POINTS.map((point) => (
            <li key={point} className={styles.point}>
              <span className={styles.check}>
                <Icon src={icons.checkDark} size={14} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.formWrap}>
        <EnquiryForm
          title="Schedule Your Site Visit"
          submitLabel="Book My Site Visit"
          source="Final CTA — Schedule Your Site Visit"
          idPrefix="ets-final"
        />
      </div>
    </section>
  );
}
