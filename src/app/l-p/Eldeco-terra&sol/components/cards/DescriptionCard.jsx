import Card from "../ui/Card";
import StatTiles from "../ui/StatTiles";
import { DESCRIPTION, STAT_TILES } from "../../data/content";
import styles from "./Prose.module.css";

/** Card / Description — desktop 23:257, mobile 23:729. */
export default function DescriptionCard() {
  return (
    <Card title="Description">
      {DESCRIPTION.d.map((text) => (
        <p key={text} className={`${styles.body} ets-d`}>
          {text}
        </p>
      ))}
      {DESCRIPTION.m.map((text) => (
        <p key={text} className={`${styles.body} ets-m`}>
          {text}
        </p>
      ))}
      <StatTiles items={STAT_TILES} />
    </Card>
  );
}
