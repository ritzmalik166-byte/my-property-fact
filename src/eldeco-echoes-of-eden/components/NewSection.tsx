"use client";

import { motion } from "framer-motion";
import { sectionsConfig } from "@/eldeco-echoes-of-eden/config/sections";
import { ArrowRightIcon } from "@/eldeco-echoes-of-eden/components/ui/ArrowRightIcon";
import { EnquiryPopupTrigger } from "@/eldeco-echoes-of-eden/components/ui/EnquiryPopupTrigger";
import { LocationIcon } from "@/eldeco-echoes-of-eden/components/ui/LocationIcon";
import {
  fadeUp,
  lineReveal,
  scaleIn,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

const GOLD = "#E8B04B";

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
      <path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const detailIcons = {
  calendar: CalendarIcon,
  clock: ClockIcon,
  location: LocationIcon,
};

function Shimmer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      initial={{ left: "-40%" }}
      animate={{ left: "140%" }}
      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

const goldBadgeStyle = {
  borderColor: `${GOLD}66`,
  backgroundColor: `${GOLD}1f`,
  color: GOLD,
};

export const NewSection = () => {
  const hero = sectionsConfig.hero;
  const fest = sectionsConfig.navratriFest;
  const festive = sectionsConfig.festiveOffer;
  const { startingPrice } = hero;
  const { prefersReducedMotion, transition } = useMotionSettings();

  const [projectName, ...taglineParts] = hero.title.split(":");
  const tagline = taglineParts.join(":").trim();
  const [nowStep, possessionStep] = festive.plan;

  return (
    <section
      id="project-snapshot"
      className="relative scroll-mt-20 overflow-hidden bg-[#F5F7F5] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      aria-labelledby="project-snapshot-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#DBE4DD] opacity-70 blur-3xl sm:size-96"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-[#DBE4DD] opacity-60 blur-3xl sm:size-96"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#1D3B2F1a_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.12, 0.05)}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-[#1D3B2F]/15 bg-white px-4 py-1.5 text-xs font-semibold text-[#1D3B2F] shadow-sm sm:text-sm"
              variants={fadeUp}
              transition={transition(0.6)}
            >
              <LocationIcon className="size-3.5 shrink-0 sm:size-4" />
              {hero.location}
            </motion.span>

            <motion.p
              className="mt-6 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#1D3B2F]/70 sm:text-xs"
              variants={fadeUp}
              transition={transition(0.6)}
            >
              <span className="h-px w-8 bg-[#1D3B2F]/40" aria-hidden="true" />
              {projectName}
            </motion.p>

            <motion.h2
              id="project-snapshot-heading"
              className="mt-3 font-serif text-3xl italic leading-tight text-[#1D3B2F] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
              variants={fadeUp}
              transition={transition(0.7)}
            >
              {tagline || hero.title}
            </motion.h2>

            <motion.div
              className="mt-5 h-0.5 w-20 origin-left bg-[#1D3B2F]"
              variants={lineReveal}
              transition={transition(0.75)}
            />

            <motion.div
              className="mt-8 max-w-sm"
              variants={staggerContainer(0.12, 0.1)}
            >
              <motion.a
                href="#price"
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#1D3B2F] px-6 py-5 text-white shadow-md transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
                variants={scaleIn}
                transition={transition(0.6)}
              >
                <span
                  className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-white/15"
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-xs">
                    {startingPrice.label}
                  </span>
                  <span className="mt-1 block text-2xl font-bold leading-none sm:text-[1.65rem]">
                    {startingPrice.value}
                  </span>
                </span>
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRightIcon className="size-4" />
                </span>
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.ul
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.1, 0.15)}
          >
            {hero.highlights.map((item, index) => (
              <motion.li
                key={item.label}
                className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-[#1D3B2F]/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-[0_18px_40px_rgba(29,59,47,0.14)] sm:p-6 lg:min-h-[11rem]"
                variants={fadeUp}
                transition={transition(0.55)}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              >
                <span
                  className="pointer-events-none absolute -bottom-4 -right-1 select-none font-serif text-7xl font-bold italic leading-none text-[#1D3B2F]/[0.05] transition-colors duration-300 group-hover:text-[#1D3B2F]/[0.09] sm:text-8xl"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-[#DBE4DD] text-[0.65rem] font-bold tracking-wider text-[#1D3B2F] sm:size-9 sm:text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <p className="mt-4 break-words text-lg font-bold leading-snug text-[#1D3B2F] sm:text-xl lg:text-2xl">
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#4A4A4A] sm:text-xs">
                    {item.label}
                  </p>
                </div>
                <span
                  className="absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-[#1D3B2F] transition-transform duration-300 group-hover:scale-x-100 sm:inset-x-6"
                  aria-hidden="true"
                />
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div
          className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D3B2F] via-[#24493A] to-[#073C7E] text-white shadow-[0_30px_70px_rgba(29,59,47,0.28)] sm:mt-14"
          role="region"
          aria-labelledby="navratri-fest-heading"
        >
          <span
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-white/10 sm:size-80"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full border border-white/10 sm:size-52"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -left-20 top-1/3 size-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: GOLD }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-24 right-1/4 size-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: GOLD }}
            aria-hidden="true"
          />

          <motion.div
            className="relative grid gap-8 px-5 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-12 lg:pt-12"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.12, 0.1)}
          >
            <div className="text-center lg:col-span-7 lg:text-left">
              <motion.span
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs"
                style={goldBadgeStyle}
                variants={fadeUp}
                transition={transition(0.6)}
              >
                <span aria-hidden="true">🪔</span>
                {fest.badge}
              </motion.span>

              <motion.h3
                id="navratri-fest-heading"
                className="mt-5 font-serif text-2xl font-bold leading-snug sm:text-3xl lg:text-[2.35rem] lg:leading-[1.2]"
                variants={fadeUp}
                transition={transition(0.7)}
              >
                {fest.titleLead}{" "}
                <span className="italic" style={{ color: GOLD }}>
                  {fest.titleHighlight}
                </span>{" "}
                {fest.titleTail}
              </motion.h3>

              <motion.p
                className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-[0.95rem] lg:mx-0"
                variants={fadeUp}
                transition={transition(0.7)}
              >
                {fest.description}
              </motion.p>
            </div>

            <motion.ul
              className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1"
              variants={staggerContainer(0.1, 0.15)}
            >
              {fest.details.map((detail) => {
                const Icon = detailIcons[detail.icon];

                return (
                  <motion.li
                    key={detail.label}
                    className={`flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm ${
                      detail.icon === "location" ? "sm:col-span-2 lg:col-span-1" : ""
                    }`}
                    variants={fadeUp}
                    transition={transition(0.55)}
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: GOLD, color: "#1D3B2F" }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/60 sm:text-xs">
                        {detail.label}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug sm:text-base">
                        {detail.value}
                      </span>
                    </span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>

          <div className="relative mx-5 my-8 flex items-center gap-4 sm:mx-8 sm:my-10 lg:mx-12" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
            <SparkleIcon className="size-4" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
          </div>

          <motion.div
            className="relative grid gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-12"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.12, 0.1)}
          >
            <div className="text-center lg:col-span-5 lg:text-left">
              <motion.span
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs"
                style={goldBadgeStyle}
                variants={fadeUp}
                transition={transition(0.6)}
              >
                <SparkleIcon className="size-3.5 shrink-0" />
                {festive.badge}
                <Shimmer enabled={!prefersReducedMotion} />
              </motion.span>

              <motion.h3
                className="mt-5 font-serif text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[3.25rem]"
                variants={fadeUp}
                transition={transition(0.7)}
              >
                Pay <span style={{ color: GOLD }}>{nowStep.percent}%</span> Now
              </motion.h3>
              <motion.p
                className="mt-3 text-base font-medium text-white/85 sm:text-lg"
                variants={fadeUp}
                transition={transition(0.7)}
              >
                {possessionStep.title}
              </motion.p>
            </div>

            <div className="lg:col-span-7">
              <motion.div variants={fadeUp} transition={transition(0.7)}>
                <div
                  className="flex h-12 w-full overflow-hidden rounded-full bg-white/10 p-1 ring-1 ring-white/15 sm:h-14"
                  role="img"
                  aria-label={`${nowStep.title}, ${possessionStep.title}`}
                >
                  <motion.div
                    className="flex origin-left items-center justify-center rounded-full text-sm font-extrabold text-[#1D3B2F] shadow-md sm:text-base"
                    style={{ width: `${nowStep.percent}%`, backgroundColor: GOLD }}
                    initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={viewportOnce}
                    transition={transition(1, [0.22, 1, 0.36, 1])}
                  >
                    {nowStep.percent}%
                  </motion.div>
                  <motion.div
                    className="ml-1 flex flex-1 origin-left items-center justify-center rounded-full bg-white/90 text-sm font-extrabold text-[#1D3B2F] sm:text-base"
                    initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={viewportOnce}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {possessionStep.percent}%
                  </motion.div>
                </div>
              </motion.div>

              <motion.ol
                className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4"
                variants={staggerContainer(0.12, 0.2)}
              >
                {festive.plan.map((step, index) => (
                  <motion.li
                    key={step.title}
                    className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-5"
                    variants={fadeUp}
                    transition={transition(0.55)}
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={
                        index === 0
                          ? { backgroundColor: GOLD, color: "#1D3B2F" }
                          : { backgroundColor: "rgba(255,255,255,0.9)", color: "#1D3B2F" }
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-bold leading-snug sm:text-lg">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/70 sm:text-sm">
                        {step.note}
                      </span>
                    </span>
                  </motion.li>
                ))}
              </motion.ol>

              <motion.div
                className="mt-6 flex justify-center lg:justify-start"
                variants={fadeUp}
                transition={transition(0.6)}
              >
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                >
                  <EnquiryPopupTrigger
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#1D3B2F] shadow-lg transition-[filter] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:text-base"
                    style={{ backgroundColor: GOLD }}
                  >
                    {festive.ctaLabel}
                    <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </EnquiryPopupTrigger>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <div className="relative mt-8 flex flex-col items-center gap-2 border-t border-white/10 bg-black/15 px-5 py-4 text-center text-[0.7rem] leading-5 text-white/65 sm:mt-10 sm:flex-row sm:justify-between sm:px-8 sm:text-left sm:text-xs lg:px-12">
            <p>
              {fest.rera.label}: <span className="font-semibold text-white/85">{fest.rera.number}</span>
              <span className="mx-2 text-white/30" aria-hidden="true">|</span>
              <a
                href={fest.rera.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                {fest.rera.website}
              </a>
            </p>
            <p>{fest.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
