import styles from "./DetailRows.module.css";

/**
 * Label / value rows with a bottom rule (Property Details 23:327, Distances 23:505).
 * Desktop renders `columns` side by side (gap 40). On mobile the columns stack,
 * unless `mobileRows` gives a different order/subset for the mobile frame.
 */
export default function DetailRows({ columns, mobileRows }) {
  const renderRows = (rows) =>
    rows.map((row) => (
      <div key={row.label} className={styles.row}>
        <dt className={styles.label}>{row.label}</dt>
        <dd className={styles.value}>{row.value}</dd>
      </div>
    ));

  return (
    <>
      <div className={`${styles.columns} ${mobileRows ? "ets-d" : ""}`}>
        {columns.map((rows, i) => (
          <dl key={i} className={styles.column}>
            {renderRows(rows)}
          </dl>
        ))}
      </div>
      {mobileRows ? <dl className={`${styles.column} ets-m`}>{renderRows(mobileRows)}</dl> : null}
    </>
  );
}
