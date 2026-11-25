import Card from "../ui/Card";
import EnquiryButton from "../enquiry/EnquiryButton";
import { PRICE_LIST, SECTION_IDS } from "../../data/content";
import prose from "./Prose.module.css";
import styles from "./PriceListCard.module.css";

/** Card / Price List — desktop 23:360 (table), mobile 23:816 (stacked price cards). */
export default function PriceListCard() {
  return (
    <Card
      id={SECTION_IDS.price}
      title="Price List"
      headerRight={
        <span className={`${styles.offerTag} ets-d`}>
          <span className={styles.dot} aria-hidden="true" />
          Latest offers available
        </span>
      }
    >
      {/* desktop table */}
      <div className={`${styles.table} ets-d`} role="table" aria-label="Eldeco Terra & Sol price list">
        <div className={`${styles.tr} ${styles.head}`} role="row">
          <span role="columnheader">Type</span>
          <span role="columnheader">Price</span>
          <span role="columnheader">
            <span className="ets-sr-only">Action</span>
          </span>
        </div>
        {PRICE_LIST.map((row) => (
          <div key={row.type} className={`${styles.tr} ${styles.row}`} role="row">
            <span role="cell" className={styles.type}>
              {row.type}
            </span>
            <span role="cell" className={styles.price}>
              {row.price}
            </span>
            <span role="cell" className={styles.action}>
              <EnquiryButton size="sm" arrow title={`Get ${row.type} Price`} submitLabel="Get Price Details">
                Get Price Details
              </EnquiryButton>
            </span>
          </div>
        ))}
      </div>

      {/* mobile cards */}
      <ul className={`${styles.cards} ets-m`}>
        {PRICE_LIST.map((row) => (
          <li key={row.type} className={styles.priceCard}>
            <div className={styles.priceTop}>
              <span className={styles.cardType}>{row.type}</span>
              <span className={styles.price}>{row.price}</span>
            </div>
            <EnquiryButton size="sm" arrow full title={`Get ${row.type} Price`} submitLabel="Get Price Details">
              Get Price Details
            </EnquiryButton>
          </li>
        ))}
      </ul>

      <p className={prose.note}>
        <span className="ets-d">*T&amp;C apply. Prices are indicative; please confirm the latest price with the sales team.</span>
        <span className="ets-m">*T&amp;C apply. Prices are indicative.</span>
      </p>
    </Card>
  );
}
