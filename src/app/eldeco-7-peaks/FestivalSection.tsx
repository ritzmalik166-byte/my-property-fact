import { CtaButton } from "./Popup";

const festival = {
  badge: "Navratri Fest",
  titleLead: "This Navratri, let the festive spirit reach",
  titleHighlight: "new peaks",
  titleTail: "at Eldeco 7 Peaks Residences.",
  description:
    "Join us at our Navratri Fest from 13th to 19th October, 11 AM onwards, and explore our 3 & 4 BR Oxy Rich Residences in Omicron 1A, Greater Noida, starting at ₹2.37 Cr*.",
  details: [
    { icon: "calendar", label: "Dates", value: "13th – 19th October" },
    { icon: "clock", label: "Timings", value: "11 AM onwards" },
    { icon: "tag", label: "Starting At", value: "₹2.37 Cr*" },
  ],
  venue: "Eldeco Experience Centre, Omicron 1A, Greater Noida",
  offer: {
    label: "Festive Offer",
    percent: "10%",
    marker: "**",
    lead: "Pay",
    leadTail: "now",
    subline: "and nothing for 24 months",
    urgency: "Prices are rising after Navratri",
    cta: "Book Your Festive Visit",
  },
  rera: {
    label: "UP RERA No.",
    number: "UPRERAPRJ106523/01/2026",
    website: "www.up-rera.in",
  },
  disclaimer:
    "**Scheme in partnership with Tata Capital Housing Finance. *T&C apply.",
} as const;

const twinkles = [
  { top: "14%", left: "6%", size: 14, delay: "0s" },
  { top: "28%", left: "46%", size: 10, delay: "0.8s" },
  { top: "70%", left: "4%", size: 12, delay: "1.4s" },
  { top: "82%", left: "52%", size: 9, delay: "0.4s" },
  { top: "18%", left: "94%", size: 12, delay: "1.1s" },
  { top: "62%", left: "96%", size: 10, delay: "1.9s" },
];

function SparkleIcon({
  className = "",
  size,
  style,
}: {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 1.5l2.2 6.6 6.6 2.2-6.6 2.2L12 19.1l-2.2-6.6-6.6-2.2 6.6-2.2L12 1.5z" />
    </svg>
  );
}

function StrokeIcon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
        <path d="M16 2.5v4M8 2.5v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    tag: (
      <>
        <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
    hourglass: (
      <path d="M6 2h12M6 22h12M7 2c0 5 5 6.5 5 10S7 17 7 22M17 2c0 5-5 6.5-5 10s5 5 5 10" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Toran() {
  const flowers = [
    [0, 4],
    [16, 16.8],
    [40, 24],
    [64, 16.8],
    [80, 4],
  ];

  return (
    <svg className="relative z-[2] block h-[50px] w-full" aria-hidden="true">
      <defs>
        <pattern id="peaks-toran" width="80" height="50" patternUnits="userSpaceOnUse">
          <path d="M0 4 Q40 44 80 4" fill="none" stroke="#7a4b12" strokeWidth="1.2" />
          <path d="M40 29q-5 8 0 17q5-8 0-17z" fill="#2f8f4e" />
          <path d="M16 22q-3.5 5 0 11q3.5-5 0-11z" fill="#3fa65f" />
          <path d="M64 22q-3.5 5 0 11q3.5-5 0-11z" fill="#3fa65f" />
          {flowers.map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="6" fill="#F28C28" />
              <circle cx={cx} cy={cy} r="3.6" fill="#F9B92B" />
              <circle cx={cx} cy={cy} r="1.4" fill="#C2410C" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="3" fill="#7a4b12" />
      <rect width="100%" height="50" fill="url(#peaks-toran)" />
    </svg>
  );
}

function Diya({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="20" r="15" fill="#F9B92B" opacity="0.22" />
      <g className="peaks-flicker">
        <path d="M32 5C38.5 15.5 40 22 32 30C24 22 25.5 15.5 32 5Z" fill="#F9B92B" />
        <path d="M32 13.5C35 18.5 36 22.5 32 28C28 22.5 29 18.5 32 13.5Z" fill="#FFF3C4" />
      </g>
      <rect x="31" y="28.5" width="2" height="6" rx="1" fill="#3f2a14" />
      <path d="M8 34H56C54 48 44 56 32 56C20 56 10 48 8 34Z" fill="#C2410C" />
      <ellipse cx="32" cy="34" rx="24" ry="4" fill="#EA580C" />
      <circle cx="20" cy="44" r="1.8" fill="#F9B92B" />
      <circle cx="32" cy="47.5" r="1.8" fill="#F9B92B" />
      <circle cx="44" cy="44" r="1.8" fill="#F9B92B" />
    </svg>
  );
}

function Dandiya({ className = "" }: { className?: string }) {
  const stick = (rotate: number, base: string, band: string) => (
    <g transform={`rotate(${rotate} 32 32)`}>
      <rect x="29" y="3" width="6" height="58" rx="3" fill={base} />
      {[12, 22, 32, 42, 52].map((y) => (
        <rect key={y} x="29" y={y} width="6" height="3" fill={band} />
      ))}
    </g>
  );

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {stick(-35, "#F28C28", "#F9B92B")}
      {stick(35, "#BE185D", "#F9B92B")}
    </svg>
  );
}

function Rangoli({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      className={className}
      aria-hidden="true"
    >
      {[95, 72, 40, 14].map((r) => (
        <circle key={r} r={r} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={`o-${i}`} cx="0" cy="-56" rx="8" ry="20" transform={`rotate(${i * 22.5})`} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`i-${i}`} cx="0" cy="-27" rx="6" ry="12" transform={`rotate(${i * 45})`} />
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <circle
          key={`d-${i}`}
          cx="0"
          cy="-84"
          r="1.8"
          fill="currentColor"
          transform={`rotate(${i * 15})`}
        />
      ))}
    </svg>
  );
}

export default function FestivalSection() {
  const { offer, rera } = festival;

  return (
    <section
      id="navratri-fest"
      aria-labelledby="navratri-fest-heading"
      className="relative mb-[60px] overflow-hidden bg-[linear-gradient(160deg,#092119_0%,#133c2e_55%,#0f4a35_100%)] text-white"
    >
      <Toran />

      <Rangoli className="peaks-spin-slow pointer-events-none absolute -right-40 top-16 h-[520px] w-[520px] text-[#f9d58a] opacity-[0.08] max-[800px]:-right-48 max-[800px]:h-[380px] max-[800px]:w-[380px]" />
      <Rangoli className="peaks-spin-slow pointer-events-none absolute -bottom-36 -left-36 h-[360px] w-[360px] text-[#f9d58a] opacity-[0.06] max-[800px]:hidden" />
      <div className="pointer-events-none absolute left-[10%] top-[15%] h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(249,185,43,0.14)_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute bottom-0 right-[15%] h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(20,123,88,0.35)_0%,transparent_65%)]" />

      {twinkles.map((t) => (
        <SparkleIcon
          key={`${t.top}-${t.left}`}
          size={t.size}
          className="peaks-twinkle pointer-events-none absolute text-[#f9d58a]"
          style={{ top: t.top, left: t.left, animationDelay: t.delay }}
        />
      ))}

      <Dandiya className="pointer-events-none absolute bottom-20 left-4 h-16 w-16 opacity-80 max-[1100px]:hidden" />

      <div className="relative z-[1] mx-auto grid w-[min(1219px,calc(100%-48px))] items-center gap-14 py-[70px] min-[1000px]:grid-cols-[1.1fr_0.9fr] max-[800px]:gap-12 max-[800px]:py-[50px]">
        <div className="text-left max-[1000px]:text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f9d58a]/50 bg-[#f9d58a]/10 py-1.5 pl-2 pr-4 font-[family-name:var(--font-7peaks-inter)] text-xs font-semibold uppercase tracking-[3px] text-[#f9d58a]">
            <Diya className="h-6 w-6" />
            {festival.badge}
          </span>

          <h2
            id="navratri-fest-heading"
            className="mb-0 mt-6 font-[family-name:var(--font-7peaks-cormorant)] text-[48px] font-semibold leading-[1.15] max-[800px]:text-[36px] max-[520px]:text-[30px]"
          >
            {festival.titleLead}{" "}
            <span className="italic text-[#f9d58a]">{festival.titleHighlight}</span>{" "}
            {festival.titleTail}
          </h2>

          <p className="mb-0 mt-5 max-w-[580px] text-base leading-[28px] text-white/80 max-[1000px]:mx-auto max-[520px]:text-[15px]">
            {festival.description}
          </p>

          <ul className="m-0 mt-8 grid list-none grid-cols-3 gap-3 p-0 max-[640px]:grid-cols-1 max-[1000px]:mx-auto max-[1000px]:max-w-[620px]">
            {festival.details.map((detail) => (
              <li
                key={detail.label}
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] p-3.5 text-left backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9d58a] text-[#092119]">
                  <StrokeIcon name={detail.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-[family-name:var(--font-7peaks-inter)] text-[11px] font-medium uppercase tracking-[2px] text-white/55">
                    {detail.label}
                  </span>
                  <span className="block text-sm font-semibold leading-snug">
                    {detail.value}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mb-0 mt-5 inline-flex items-start gap-2 text-left text-sm font-medium text-white/85">
            <StrokeIcon name="pin" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#f9d58a]" />
            {festival.venue}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] pt-8">
          <div className="absolute left-1/2 top-0 z-[2] flex -translate-x-1/2 items-end gap-3">
            <Diya className="h-12 w-12" />
            <Diya className="h-16 w-16" />
            <Diya className="h-12 w-12" />
          </div>

          <div className="rounded-[20px] bg-[linear-gradient(135deg,#f9d58a_0%,#aa8453_45%,#f9d58a_100%)] p-[2px] shadow-[0_0_60px_rgba(249,185,43,0.25),0_30px_60px_rgba(0,0,0,0.35)]">
            <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#0f3a2b_0%,#092119_100%)] px-8 pb-8 pt-12 text-center max-[520px]:px-5">
              <Rangoli className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 text-[#f9d58a] opacity-[0.1]" />

              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-7peaks-inter)] text-xs font-semibold uppercase tracking-[4px] text-[#f9d58a]">
                <SparkleIcon className="h-3.5 w-3.5" />
                {offer.label}
                <SparkleIcon className="h-3.5 w-3.5" />
              </span>

              <p className="mb-0 mt-4 text-[26px] font-semibold leading-none max-[520px]:text-[22px]">
                {offer.lead}{" "}
                <span className="text-[72px] font-bold leading-none text-[#f9d58a] max-[520px]:text-[60px]">
                  {offer.percent}
                </span>
                <sup className="text-[18px] text-[#f9d58a]">{offer.marker}</sup>{" "}
                {offer.leadTail}
              </p>
              <p className="mb-0 mt-3 text-lg font-medium text-white/85 max-[520px]:text-base">
                {offer.subline}
              </p>

              <div className="my-6 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#f9d58a]/70" />
                <Dandiya className="h-8 w-8" />
                <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#f9d58a]/70" />
              </div>

              <p className="m-0 inline-flex items-center gap-2 rounded-full border border-[#F28C28]/50 bg-[#F28C28]/15 px-4 py-2 text-sm font-semibold text-[#ffd3a8]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F28C28] opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F28C28]" />
                </span>
                <StrokeIcon name="hourglass" className="h-4 w-4" />
                {offer.urgency}
              </p>

              <div className="mt-7">
                <CtaButton light className="w-full max-w-[320px] text-[15px] uppercase tracking-[1px]">
                  {offer.cta}
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-[min(1219px,calc(100%-48px))] flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 text-xs leading-5 text-white/65 max-[800px]:flex-col max-[800px]:text-center">
          <p className="m-0">
            {rera.label}: <span className="font-semibold text-white/85">{rera.number}</span>
            <span className="mx-2 text-white/30" aria-hidden="true">|</span>
            <span className="text-white/75">{rera.website}</span>
          </p>
          <p className="m-0">{festival.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
