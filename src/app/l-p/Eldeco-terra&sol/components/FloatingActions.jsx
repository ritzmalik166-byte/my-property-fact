import Icon from "./ui/Icon";
import Button from "./ui/Button";
import EnquiryButton from "./enquiry/EnquiryButton";
import { icons } from "../assets";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "../data/content";
import styles from "./FloatingActions.module.css";

/**
 * Floating WhatsApp / Call buttons (23:655, 23:657; mobile 23:986)
 * and the mobile fixed bottom bar (23:983).
 */
export default function FloatingActions() {
  return (
    <>
      <div className={styles.floating}>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`ets-water ${styles.fab} ${styles.fabWhatsapp}`}
          aria-label="Chat on WhatsApp"
        >
          {/* glyph drawn as a mask so it takes the button's text colour (white → WhatsApp green on hover) */}
          <span
            className={styles.whatsappIcon}
            aria-hidden="true"
            style={{ WebkitMaskImage: `url(${icons.whatsappDark.src})`, maskImage: `url(${icons.whatsappDark.src})` }}
          />
        </a>
        <a href={PHONE_TEL} className={`ets-water ${styles.fab} ${styles.fabCall}`} aria-label={`Call ${PHONE_DISPLAY}`}>
          <Icon src={icons.phoneDark26} size={26} />
        </a>
      </div>

      <div className={styles.bar}>
        <Button href={PHONE_TEL} variant="outline" icon={icons.phoneBronze20} className={styles.barButton}>
          Call Now
        </Button>
        <EnquiryButton arrow className={styles.barButton}>
          Enquire Now
        </EnquiryButton>
      </div>
    </>
  );
}
