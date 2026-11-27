/**
 * Renders desktop copy (`d`) and mobile copy (`m`) and lets CSS pick one
 * at the 767px breakpoint. Text is always wrapped in an element so the
 * scroll animations can line-split it (bare text next to an icon cannot be).
 */
export default function Responsive({ value, as: Tag = "span" }) {
  if (value == null) return null;
  if (typeof value === "string" || value.d === value.m) {
    return <Tag>{typeof value === "string" ? value : value.d}</Tag>;
  }
  return (
    <>
      <Tag className="ets-d">{value.d}</Tag>
      {value.m ? <Tag className="ets-m">{value.m}</Tag> : null}
    </>
  );
}
