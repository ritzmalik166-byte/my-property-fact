import Card from "../ui/Card";
import Icon from "../ui/Icon";
import Responsive from "../ui/Responsive";
import { glyphs } from "../../assets";
import { HIGHLIGHTS, SECTION_IDS } from "../../data/content";
import styles from "./HighlightsCard.module.css";

/** Card / Key Highlights — desktop 23:274 (2-col bordered tiles), mobile 23:745 (plain list). */
export default function HighlightsCard() {
  return (
    <Card id={SECTION_IDS.highlights} title="Key Highlights">
      <ul className={styles.grid}>
        {HIGHLIGHTS.map((item) => (
          <li key={item.icon} className={styles.item}>
            <span className={styles.badge}>
              <Icon src={glyphs[item.icon].d} size={22} className="ets-d" />
              <Icon src={glyphs[item.icon].m} size={20} className="ets-m" />
            </span>
            <span className={styles.text}>
              <Responsive value={item.text} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
