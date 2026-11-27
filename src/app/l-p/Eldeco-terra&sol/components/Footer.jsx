import Image from "next/image";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import EnquiryButton from "./enquiry/EnquiryButton";
import { icons, images } from "../assets";
import { DISCLAIMER, FOOTER_LINKS, PHONE_DISPLAY, PHONE_TEL, RERA } from "../data/content";
import styles from "./Footer.module.css";

/** 06 Footer — desktop 23:596, mobile 23:970. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.brand}>
          <Image src={images.logoFooter} alt="Eldeco Terra & Sol" className={styles.logo} sizes="180px" />
          <p className={styles.rera}>{RERA}</p>
          <p className={`${styles.muted} ets-d`}>
            Iconic luxury 3 and 3.5 BHK apartments by Eldeco Group in Sector 80, Gurugram.
          </p>
          <p className={styles.contact}>
            <Icon src={icons.pinGold18} size={18} />
            Sector 80, Gurugram, Haryana
          </p>
          <a href={PHONE_TEL} className={styles.contact}>
            <Icon src={icons.phoneGold18} size={18} />
            {PHONE_DISPLAY}
          </a>
        </div>

        <nav className={`${styles.links} ets-d`} aria-label="Quick links">
          <h3 className={styles.heading}>Quick Links</h3>
          {FOOTER_LINKS.quick.map((link) => (
            <a key={link.label} href={`#${link.id}`} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className={`${styles.links} ets-d`} aria-label="Project">
          <h3 className={styles.heading}>Project</h3>
          {FOOTER_LINKS.project.map((link) => (
            <a key={link.label} href={`#${link.id}`} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={`${styles.enquire} ets-d`}>
          <h3 className={styles.heading}>Enquire Now</h3>
          <EnquiryButton arrow full>
            Get Exclusive Price
          </EnquiryButton>
          <Button href={PHONE_TEL} variant="ghost" icon={icons.phoneGold20} full>
            Tap To Call
          </Button>
        </div>
      </div>

      <hr className={styles.rule} />

      <p className={styles.disclaimer}>
        <span className="ets-d">{DISCLAIMER.d}</span>
        <span className="ets-m">{DISCLAIMER.m}</span>
      </p>

      <div className={styles.bottom}>
        <p>
          © 2026 Eldeco Group. All Rights Reserved. | RERA Registered
          <span className="ets-d"> | Disclaimer &amp; Privacy Policy</span>
        </p>
        <p>Digital Media Planned by Eldeco Group.</p>
      </div>
    </footer>
  );
}
