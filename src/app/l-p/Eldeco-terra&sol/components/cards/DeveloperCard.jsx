import Card from "../ui/Card";
import StatTiles from "../ui/StatTiles";
import { DEVELOPER, SECTION_IDS } from "../../data/content";
import prose from "./Prose.module.css";

/** Card / About Developer — desktop 23:543, mobile 23:949. */
export default function DeveloperCard() {
  return (
    <Card id={SECTION_IDS.developer} title="About Eldeco Group">
      <p className={`${prose.body} ets-d`}>{DEVELOPER.text.d}</p>
      <p className={`${prose.body} ets-m`}>{DEVELOPER.text.m}</p>
      <StatTiles items={DEVELOPER.counters} align="center" />
    </Card>
  );
}
