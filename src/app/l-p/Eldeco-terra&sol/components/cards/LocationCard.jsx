import Card from "../ui/Card";
import DetailRows from "../ui/DetailRows";
import EnquiryButton from "../enquiry/EnquiryButton";
import { icons } from "../../assets";
import { DISTANCES, MAP_EMBED_URL, SECTION_IDS } from "../../data/content";
import prose from "./Prose.module.css";
import styles from "./LocationCard.module.css";

const toRows = (list) => list.map((d) => ({ label: d.place, value: d.distance }));

/** Card / Location — desktop 23:477, mobile 23:902. */
export default function LocationCard() {
  return (
    <Card id={SECTION_IDS.location} title="Location">
      {/* Live Google Map (replaces the stylised map frame 23:479 / 23:904; same size + radius) */}
      <div className={styles.map}>
        <iframe
          src={MAP_EMBED_URL}
          title="Eldeco Terra & Sol, Sector 80, Gurugram — Google Maps"
          className={styles.mapFrame}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className={`${styles.address} ets-d`}>
        <p className={styles.addressLabel}>Address</p>
        <p className={prose.body}>Eldeco Terra &amp; Sol, Sector 80, Gurugram, Haryana</p>
      </div>
      <hr className={`${styles.divider} ets-d`} />

      <h3 className={prose.subheading}>Location Advantage</h3>
      <p className={`${prose.body} ets-d`}>
        Sector 80 sits close to NH-48, Dwarka Expressway and KMP Expressway, with quick access to IMT Manesar, Cyber
        City and IGI Airport.
      </p>

      <DetailRows columns={[toRows(DISTANCES.col1), toRows(DISTANCES.col2)]} />

      <div className={styles.ctas}>
        <EnquiryButton
          icon={icons.calendarDark}
          arrow
          className={styles.cta}
          title="Schedule Your Site Visit"
          submitLabel="Book My Site Visit"
        >
          Book a Site Visit
        </EnquiryButton>
        <EnquiryButton
          variant="outline"
          icon={icons.pinBronze20}
          className={`${styles.cta} ${styles.directions}`}
          title="Get Directions to Eldeco Terra & Sol"
          submitLabel="Get Directions"
        >
          Get Directions
        </EnquiryButton>
      </div>
    </Card>
  );
}
