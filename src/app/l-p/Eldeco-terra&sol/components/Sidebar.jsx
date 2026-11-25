import Button from "./ui/Button";
import Icon from "./ui/Icon";
import EnquiryForm from "./enquiry/EnquiryForm";
import { EnquiryTrigger } from "./enquiry/EnquiryButton";
import { icons } from "../assets";
import { PHONE_TEL, WHATSAPP_URL } from "../data/content";
import styles from "./Sidebar.module.css";

/** Sidebar (sticky) 23:560 — enquiry form, "Prefer to talk?" and the brochure card. Desktop only. */
export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Enquire about Eldeco Terra & Sol">
      <div className={styles.sticky}>
        <EnquiryForm idPrefix="ets-sidebar" source="Sidebar — Get Exclusive Price" />

        <div className={styles.talk}>
          <h3 className={styles.talkTitle}>Prefer to talk?</h3>
          <p className={styles.talkText}>
            Speak to an Eldeco Terra &amp; Sol expert about prices, availability and site visits.
          </p>
          <div className={styles.talkButtons}>
            <Button href={PHONE_TEL} icon={icons.phoneDark20} className={styles.talkButton}>
              Call Now
            </Button>
            <Button href={WHATSAPP_URL} variant="outline" icon={icons.whatsappBronze} className={styles.talkButton}>
              WhatsApp
            </Button>
          </div>
        </div>

        <EnquiryTrigger
          className={styles.brochure}
          label="Download E-Brochure"
          title="Download E-Brochure"
          submitLabel="Download Brochure"
        >
          <span className={styles.brochureIcon}>
            <Icon src={icons.downloadGold} size={22} />
          </span>
          <span className={styles.brochureText}>
            <span className={styles.brochureTitle}>Download E-Brochure</span>
            <span className={styles.brochureSub}>Plans, amenities and specifications</span>
          </span>
          <Icon src={icons.arrowRight} size={22} />
        </EnquiryTrigger>
      </div>
    </aside>
  );
}
