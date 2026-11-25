import Image from "next/image";
import EnquiryButton from "../enquiry/EnquiryButton";
import { images } from "../../assets";
import styles from "./PriceBannerCard.module.css";

/** Card / Price banner (CTA) — desktop 23:301, mobile 23:771. */
export default function PriceBannerCard() {
  return (
    <aside className={styles.banner} aria-labelledby="ets-price-banner-title">
      <div className={styles.media} aria-hidden="true">
        <Image src={images.priceBanner} alt="" fill sizes="320px" className={styles.image} />
        <span className={styles.fade} />
      </div>

      <div className={styles.copy}>
        <span className={styles.tag}>LIMITED INVENTORY</span>
        <h2 id="ets-price-banner-title" className={styles.title}>
          Get the latest price list and offers
        </h2>
        <p className={styles.text}>
          Prices for 3 BHK and 3.5 BHK homes, shared directly by the developer&apos;s team.
        </p>
      </div>

      <EnquiryButton arrow className={styles.cta} title="Get the Latest Price List" submitLabel="Get Price Details">
        Get Price Details
      </EnquiryButton>
    </aside>
  );
}
