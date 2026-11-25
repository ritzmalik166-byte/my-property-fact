import styles from "./StatTiles.module.css";

/**
 * "Stat tiles" (23:261) and "Counters" (23:546): 4-up on desktop, 2×2 on mobile.
 * `align="center"` for the developer counters.
 */
export default function StatTiles({ items, align = "start" }) {
  return (
    <dl className={`${styles.tiles} ${align === "center" ? styles.center : ""}`}>
      {items.map((item) => (
        <div key={item.label} className={styles.tile}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
