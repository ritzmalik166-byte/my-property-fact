import Image from "next/image";
import Card from "../ui/Card";
import EnquiryButton, { EnquiryTrigger } from "../enquiry/EnquiryButton";
import { icons, images } from "../../assets";
import { SECTION_IDS } from "../../data/content";
import prose from "./Prose.module.css";
import styles from "./VirtualTourCard.module.css";

/** Card / Explore Property (Virtual Tour) — desktop 23:529, mobile 23:941. */
export default function VirtualTourCard() {
  return (
    <Card id={SECTION_IDS.virtualTour} title="Explore Property">
      <EnquiryTrigger
        className={styles.preview}
        label="Start virtual tour"
        title="Book a Virtual Tour"
        submitLabel="Start Virtual Tour"
        source="Start Virtual Tour"
      >
        {/* dark, blurred, slowly drifting "video" backdrop */}
        <span className={styles.media} aria-hidden="true">
          <Image
            src={images.virtualTour}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 714px"
            className={styles.image}
          />
        </span>
        <span className={styles.overlay} />
        <span className={styles.chip}>Artistic Impression</span>
        <span className={styles.badge}>360°</span>
        <span className={`${styles.label} ets-d`}>Start Virtual Tour</span>
      </EnquiryTrigger>

      <p className={`${prose.body} ets-d`}>
        Experience the residences, premium amenities, green spaces and well-crafted interiors virtually, and see the
        lifestyle that is redefining life in Sector 80, Gurugram.
      </p>

      <div className={styles.ctas}>
        <EnquiryButton arrow className={styles.cta} title="Request E-Brochure" submitLabel="Get E-Brochure">
          Request E-Brochure
        </EnquiryButton>
        <EnquiryButton
          variant="outline"
          icon={icons.phoneBronze20}
          className={`${styles.cta} ${styles.callback}`}
          title="Request a Call Back"
          submitLabel="Request Call Back"
        >
          Request a Call Back
        </EnquiryButton>
      </div>
    </Card>
  );
}
