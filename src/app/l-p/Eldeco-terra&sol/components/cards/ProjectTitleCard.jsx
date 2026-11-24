import Card from "../ui/Card";
import Icon from "../ui/Icon";
import Responsive from "../ui/Responsive";
import EnquiryButton from "../enquiry/EnquiryButton";
import { glyphs, icons } from "../../assets";
import { PROJECT_FEATURES, SECTION_IDS } from "../../data/content";
import styles from "./ProjectTitleCard.module.css";

/** Card / Project title — desktop 23:226, mobile 23:705. */
export default function ProjectTitleCard() {
  return (
    <Card id={SECTION_IDS.overview} aria-labelledby="ets-project-title">
      {/* desktop: title block + price box side by side */}
      <div className={`${styles.titleRow} ets-d`}>
        <div className={styles.titleBlock}>
          <span className={styles.badge}>APARTMENTS</span>
          <h2 id="ets-project-title" className={styles.title}>
            Eldeco Terra &amp; Sol
          </h2>
          <p className={styles.location}>
            <Icon src={icons.pinMuted16} size={16} />
            Sector 80, Gurugram, Haryana
          </p>
        </div>
        <div className={styles.priceBox}>
          <span className={styles.priceLabel}>Starting price</span>
          <span className={styles.priceValue}>₹3.33 Cr*</span>
          <span className={styles.priceSub}>3 BHK onwards</span>
        </div>
      </div>

      {/* mobile: badge + RERA row, title, horizontal price strip */}
      <div className={`${styles.mobileHead} ets-m`}>
        <div className={styles.topRow}>
          <span className={styles.badge}>APARTMENTS</span>
          <span className={styles.rera}>HARERA 20 of 2026</span>
        </div>
        <h2 className={styles.title}>Eldeco Terra &amp; Sol</h2>
        <div className={styles.priceStrip}>
          <span className={styles.priceLabel}>Starting price</span>
          <span className={styles.priceValue}>₹3.33 Cr*</span>
        </div>
      </div>

      <hr className={`${styles.divider} ets-d`} />
      <p className={`${styles.featuresLabel} ets-d`}>FEATURES:</p>

      <ul className={styles.features}>
        {PROJECT_FEATURES.map((f) => (
          <li key={f.icon} className={styles.feature}>
            <Icon src={glyphs[f.icon].d} size={22} className="ets-d" />
            <Icon src={glyphs[f.icon].m} size={20} className="ets-m" />
            <Responsive value={f.label} />
          </li>
        ))}
      </ul>

      <div className={styles.ctas}>
        <EnquiryButton arrow className={styles.cta}>
          Get Price Details
        </EnquiryButton>
        <EnquiryButton
          variant="outline"
          icon={icons.downloadBronze}
          className={styles.cta}
          title="Download E-Brochure"
          submitLabel="Download Brochure"
        >
          Download Brochure
        </EnquiryButton>
      </div>
    </Card>
  );
}
