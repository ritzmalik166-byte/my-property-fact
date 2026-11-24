import Card from "../ui/Card";
import DetailRows from "../ui/DetailRows";
import { PROPERTY_DETAILS } from "../../data/content";

const MOBILE_ROWS = [...PROPERTY_DETAILS.col1, ...PROPERTY_DETAILS.col2]
  .filter((row) => row.mobile !== false)
  .sort((a, b) => a.mOrder - b.mOrder);

/** Card / Property Details — desktop 23:325 (2 columns), mobile 23:790 (8 rows). */
export default function PropertyDetailsCard() {
  return (
    <Card title="Property Details" gap="tight">
      <DetailRows columns={[PROPERTY_DETAILS.col1, PROPERTY_DETAILS.col2]} mobileRows={MOBILE_ROWS} />
    </Card>
  );
}
