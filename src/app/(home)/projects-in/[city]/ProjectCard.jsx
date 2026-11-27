import Image from "next/image";
import Link from "next/link";
import { buildProjectImageUrl } from "@/lib/projectImageUrl";

function text(value) {
  return String(value ?? "").trim();
}

/** Prices come from the API in crore, e.g. "3.73" -> ₹3.73 Cr. */
function formatPrice(value) {
  const raw = text(value);
  if (!raw || /request/i.test(raw)) return "Price on request";
  if (/[a-z]/i.test(raw)) return raw.startsWith("₹") ? raw : `₹${raw}`;
  const number = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(number) || number <= 0) return "Price on request";
  if (number < 1) return `₹${Math.round(number * 100)} L`;
  return `₹${Number(number.toFixed(2))} Cr`;
}

/** "Studio Apartments-373 sq.ft, 1 BHK-753 sq.ft, 3 BHK-1496 sq.ft" -> "Studio · 1–3 BHK" */
function summarizeConfiguration(value) {
  const raw = text(value);
  if (!raw) return "";

  let studio = false;
  let villa = false;
  const bhk = new Set();
  const others = [];

  for (const part of raw.split(",")) {
    const label = part.split(/-|\d[\d,]*\s*sq/i)[0].trim();
    if (!label) continue;
    if (/studio/i.test(label)) studio = true;
    if (/villa/i.test(label)) villa = true;
    const bhkMatch = label.match(/(\d+)\s*BHK/i);
    if (bhkMatch) bhk.add(Number(bhkMatch[1]));
    else if (!/studio|villa/i.test(label) && !others.includes(label)) others.push(label);
  }

  const parts = [];
  if (studio) parts.push("Studio");
  if (bhk.size) {
    const nums = [...bhk].sort((a, b) => a - b);
    const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
    parts.push(
      nums.length === 1 ? `${nums[0]} BHK` :
      contiguous ? `${nums[0]}–${nums[nums.length - 1]} BHK` :
      `${nums.join(", ")} BHK`,
    );
  }
  if (villa) parts.push("Villas");
  parts.push(...others);

  return parts.join(" · ") || raw;
}

function statusTone(status) {
  if (/new\s*launch/i.test(status)) return "new";
  if (/ready/i.test(status)) return "ready";
  return "default";
}

export default function ProjectCard({ project }) {
  const name = text(project.projectName) || "Untitled Project";
  const slug = text(project.slugURL || project.slugUrl);
  const status = text(project.projectStatusName);
  const locality = text(project.projectLocality);
  const city = text(project.cityName);
  const location = [locality, city].filter(Boolean).join(", ");
  const configuration = summarizeConfiguration(project.projectConfiguration);

  return (
    <article className="ap-card">
      <Link href={slug ? `/${slug}` : "#"} className="ap-card__link" aria-label={`View ${name}`}>
        <div className="ap-card__media">
          <Image
            src={buildProjectImageUrl(project)}
            alt={name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 340px"
          />
          {status ? (
            <span className={`ap-card__status ap-card__status--${statusTone(status)}`}>{status}</span>
          ) : null}
        </div>

        <div className="ap-card__body">
          {location ? <p className="ap-card__location">{location}</p> : null}
          <h3 className="ap-card__title">{name}</h3>
          {text(project.builderName) ? (
            <p className="ap-card__developer">by {text(project.builderName)}</p>
          ) : null}

          <div className="ap-card__footer">
            <div className="ap-card__meta">
              {configuration ? <span className="ap-card__config">{configuration}</span> : null}
              <strong className="ap-card__price">{formatPrice(project.projectPrice)}</strong>
            </div>
            <span className="ap-card__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
