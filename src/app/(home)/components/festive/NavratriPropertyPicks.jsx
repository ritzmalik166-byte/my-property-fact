import Link from "next/link";
import "./navratri.css";
import ProjectShortlistButton from "../common/ProjectShortlistButton";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";
import { resolveProjectCardLocationLabel } from "@/lib/projectCardHelpers";
import { ArrowRightIcon, DiyaIcon, PinIcon, SparkleIcon } from "./NavratriIcons";
import {
  NAVRATRI_CARD_ACCENTS,
  NAVRATRI_PICKS,
  NAVRATRI_PICKS_SECTION_ID,
} from "./navratriContent";

/** API prices are in crores; values below 1 read better as lakhs. */
function formatStartingPrice(price) {
  if (price == null || price === "") return "Price on request";
  if (/[a-zA-Z]/.test(String(price))) return String(price);
  const num = parseFloat(price);
  if (!Number.isFinite(num) || num <= 0) return "Price on request";
  return num < 1 ? `₹ ${Math.round(num * 100)} Lakh` : `₹ ${num} Cr`;
}

export function pickNavratriProjects(projects) {
  if (!Array.isArray(projects)) return [];
  return NAVRATRI_PICKS.slugs
    .map((slug) => projects.find((p) => p?.slugURL === slug))
    .filter(Boolean);
}

export default function NavratriPropertyPicks({ projects = [] }) {
  if (!projects.length) return null;

  const headingId = `${NAVRATRI_PICKS_SECTION_ID}-heading`;

  return (
    <section
      id={NAVRATRI_PICKS_SECTION_ID}
      className="mpf-navratri-picks"
      aria-labelledby={headingId}
    >
      <div className="container">
        <header className="mpf-navratri-picks__head">
          <span className="mpf-navratri-picks__eyebrow">
            <DiyaIcon size={16} />
            {NAVRATRI_PICKS.eyebrow}
            <SparkleIcon size={12} className="mpf-navratri-picks__eyebrow-spark" />
          </span>
          <h2 id={headingId} className="mpf-navratri-picks__title">
            {NAVRATRI_PICKS.title}
          </h2>
          <p className="mpf-navratri-picks__subtitle">{NAVRATRI_PICKS.subtitle}</p>
        </header>

        <div className="mpf-navratri-picks__grid">
          {projects.map((project, index) => {
            const accent = NAVRATRI_CARD_ACCENTS[index % NAVRATRI_CARD_ACCENTS.length];
            const name = project.projectName || "Featured project";
            const href = `/${project.slugURL}`;
            const location = resolveProjectCardLocationLabel(project);
            const builder = String(project.builderName || "").trim();
            const imgLabel = `${name} — Navratri festive property pick`;

            return (
              <article
                key={project.id ?? project.slugURL}
                className="mpf-navratri-card"
                style={{ "--nv-accent-btn": accent.button }}
              >
                <div className="mpf-navratri-card__media">
                  <img
                    src={buildProjectImageUrl(project, { preferThumbnail: true })}
                    alt={imgLabel}
                    title={imgLabel}
                    width={400}
                    height={260}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="mpf-navratri-card__badge">
                    <SparkleIcon size={11} />
                    Festive Pick
                  </span>
                  <ProjectShortlistButton
                    project={project}
                    className="mpf-navratri-card__shortlist"
                  />
                  <span className="mpf-navratri-card__location" title={location}>
                    <PinIcon size={12} />
                    <span>{location}</span>
                  </span>
                </div>

                <div className="mpf-navratri-card__body">
                  <h3 className="mpf-navratri-card__name">
                    <Link href={href} title={`View ${name}`}>
                      {name}
                    </Link>
                  </h3>
                  {builder ? <p className="mpf-navratri-card__builder">By {builder}</p> : null}

                  <div className="mpf-navratri-card__footer">
                    <div className="mpf-navratri-card__price">
                      <span className="mpf-navratri-card__price-label">Starting Price</span>
                      <strong>
                        {formatStartingPrice(project.projectPrice)}
                        {/^₹/.test(formatStartingPrice(project.projectPrice)) ? (
                          <span className="mpf-navratri-card__price-asterisk">*</span>
                        ) : null}
                      </strong>
                    </div>
                    <Link
                      href={href}
                      className="mpf-navratri-card__cta"
                      title={`Explore ${name}`}
                    >
                      Explore
                      <ArrowRightIcon size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
