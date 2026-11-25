import Image from "next/image";
import Card from "../ui/Card";
import Icon from "../ui/Icon";
import EnquiryButton from "../enquiry/EnquiryButton";
import { icons, images } from "../../assets";
import { AMENITIES, SECTION_IDS } from "../../data/content";
import styles from "./AmenitiesCard.module.css";

/** Card / Amenities and Features — desktop 23:382 (3 columns), mobile 23:829 (2 columns). */
export default function AmenitiesCard() {
  return (
    <Card id={SECTION_IDS.amenities} title="Amenities and Features">
      <div className={styles.photo}>
        <Image
          src={images.amenityPool}
          alt="All weather infinity pool at Eldeco Terra & Sol"
          fill
          sizes="(max-width: 767px) 100vw, 714px"
          className={styles.photoImage}
        />
        <span className={`${styles.label} ets-d`}>All Weather Infinity Pool</span>
        <span className={styles.chip}>Artistic Impression</span>
      </div>

      <ul className={styles.grid}>
        {AMENITIES.map((item) => (
          <li key={item.d} className={`${styles.item} ${item.m ? "" : "ets-d"}`}>
            <span className={`${styles.check} ets-d`}>
              <Icon src={icons.checkAmenity} size={14} />
            </span>
            <Icon src={icons.checkAmenity16} size={16} className="ets-m" />
            <span className={`${styles.text} ets-d`}>{item.d}</span>
            {item.m ? <span className={`${styles.text} ets-m`}>{item.m}</span> : null}
          </li>
        ))}
      </ul>

      <EnquiryButton
        variant="outline"
        className={styles.cta}
        title="Get the Complete Amenities List"
        submitLabel="Get Amenities List"
      >
        View All Amenities
      </EnquiryButton>
    </Card>
  );
}
