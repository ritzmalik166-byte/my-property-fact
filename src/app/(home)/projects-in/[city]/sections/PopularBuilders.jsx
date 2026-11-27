import Link from "next/link";
import Reveal from "./Reveal";

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function PopularBuilders({ builders = [], localLabel = "" }) {
  if (!builders.length) return null;

  return (
    <section className="ap-section ap-section--tinted" aria-labelledby="ap-builders-title">
      <div className="abroad-container">
        <Reveal className="ap-section__head">
          <div>
            <span className="ap-section__eyebrow">Trusted developers</span>
            <h2 id="ap-builders-title">Popular Builders</h2>
            <p>The most active developers on My Property Fact, ranked by live projects.</p>
          </div>
        </Reveal>

        <Reveal as="ul" className="ap-builders">
          {builders.map((builder, index) => (
            <li key={builder.slug} style={{ "--ap-delay": `${Math.min(index, 11) * 40}ms` }}>
              <Link href={`/builder/${builder.slug}`} className="ap-builder" prefetch={false}>
                <span className="ap-builder__logo">
                  {builder.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote CMS logo, sized by CSS
                    <img src={builder.logo} alt="" loading="lazy" decoding="async" width="120" height="60" />
                  ) : (
                    <span className="ap-builder__monogram" aria-hidden="true">{initials(builder.name)}</span>
                  )}
                </span>
                <span className="ap-builder__name">{builder.name}</span>
                <span className="ap-builder__meta">
                  {builder.projectCount} {builder.projectCount === 1 ? "project" : "projects"}
                  {builder.isLocal && localLabel ? <em>{localLabel}</em> : null}
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
