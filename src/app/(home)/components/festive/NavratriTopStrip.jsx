import "./navratri.css";
import { DiyaIcon } from "./NavratriIcons";
import { NAVRATRI_PICKS_SECTION_ID, NAVRATRI_STRIP } from "./navratriContent";
import NavratriPicksLink from "./NavratriPicksLink";

export default function NavratriTopStrip() {
  return (
    <>
      <div className="mpf-navratri-strip" role="region" aria-label="Navratri festive offers">
        <div className="container mpf-navratri-strip__inner">
          <div className="mpf-navratri-strip__lead">
            <span className="mpf-navratri-strip__diya">
              <DiyaIcon size={14} />
            </span>
            <span className="mpf-navratri-strip__badge">{NAVRATRI_STRIP.badge}</span>
            <p className="mpf-navratri-strip__msg">
              <span className="mpf-navratri-strip__msg-full">{NAVRATRI_STRIP.message}</span>
              <span className="mpf-navratri-strip__msg-short">{NAVRATRI_STRIP.shortMessage}</span>
            </p>
          </div>
          <NavratriPicksLink
            targetId={NAVRATRI_PICKS_SECTION_ID}
            className="mpf-navratri-strip__cta"
            title={NAVRATRI_STRIP.ctaLabel}
          >
            <span className="mpf-navratri-strip__cta-full">{NAVRATRI_STRIP.ctaLabel}</span>
            <span className="mpf-navratri-strip__cta-short">{NAVRATRI_STRIP.ctaShortLabel}</span>
          </NavratriPicksLink>
        </div>
      </div>
      <div className="mpf-navratri-strip-spacer" aria-hidden="true" />
    </>
  );
}
