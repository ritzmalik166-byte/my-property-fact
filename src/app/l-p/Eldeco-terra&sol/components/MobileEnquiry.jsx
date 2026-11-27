import EnquiryForm from "./enquiry/EnquiryForm";
import styles from "./MobileEnquiry.module.css";

/** 03 Enquiry form (mobile 23:689) — sits between the hero and the tab bar below 1024px. */
export default function MobileEnquiry() {
  return (
    <section className={styles.section} aria-label="Get exclusive price">
      <div className={styles.inner}>
        <EnquiryForm idPrefix="ets-hero" showCallRow source="Hero form — Get Exclusive Price" />
      </div>
    </section>
  );
}
