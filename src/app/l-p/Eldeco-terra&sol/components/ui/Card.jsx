import styles from "./Card.module.css";

/** "Card / *" shell used by every content block in the main column. */
export default function Card({ id, title, headerRight, children, className = "", gap = "default", ...rest }) {
  return (
    <section
      id={id}
      data-ets-section={id ? "" : undefined}
      className={`${styles.card} ${gap === "tight" ? styles.tight : ""} ${className}`}
      {...rest}
    >
      {title ? (
        headerRight ? (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {headerRight}
          </div>
        ) : (
          <h2 className={styles.title}>{title}</h2>
        )
      ) : null}
      {children}
    </section>
  );
}
