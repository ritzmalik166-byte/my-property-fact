"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import {
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlinePrinter,
  HiOutlineTrendingUp,
  HiOutlineX,
} from "react-icons/hi";
import styles from "./emi-calculator.module.css";
import {
  AMOUNT_LIMITS,
  RATE_LIMITS,
  TENURE_MONTH_LIMITS,
  TENURE_YEAR_LIMITS,
  buildLoanSummary,
  buildYearlySchedule,
  clamp,
  formatCompactINR,
  formatINR,
  formatPercent,
  loanEndLabel,
  round2,
} from "./emiMath";
import {
  INTERPRETATIONS,
  LOAN_DONTS,
  LOAN_DOS,
  NEXT_STEPS,
  RESULT_GUIDES,
} from "./emiContent";
import { EMI_CALCULATOR_FAQ_ITEMS } from "./emiCalculatorFaqItems";
import NoidaProjectsSection from "../components/home/noida-projects/NoidaProjectsSection";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const GUIDE_ICONS = {
  emi: HiOutlineCash,
  interest: HiOutlineTrendingUp,
  payout: HiOutlineCalendar,
  term: HiOutlineClock,
};

const SCHEDULE_PREVIEW_ROWS = 5;
const DONUT_RADIUS = 70;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function SliderField({ id, label, value, limits, onChange, prefix, suffix, minLabel, maxLabel, labelExtra }) {
  const { min, max, step, inputMin, inputMax } = limits;
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  const commit = () => {
    const parsed = parseFloat(String(draft).replace(/,/g, ""));
    onChange(Number.isFinite(parsed) ? clamp(parsed, inputMin, inputMax) : value);
    setEditing(false);
  };

  const sliderValue = clamp(value, min, max);
  const fill = ((sliderValue - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderField}>
      <div className={styles.sliderHead}>
        <span className={styles.labelGroup}>
          <label htmlFor={id}>{label}</label>
          {labelExtra}
        </span>
        <span className={styles.valueBox}>
          {prefix ? <span className={styles.valueAffix}>{prefix}</span> : null}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={editing ? draft : Number(value).toLocaleString("en-IN")}
            onFocus={() => {
              setEditing(true);
              setDraft(String(value));
            }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
          {suffix ? <span className={styles.valueAffix}>{suffix}</span> : null}
        </span>
      </div>
      <input
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        aria-label={label}
        style={{ "--fill": `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.rangeScale}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function EmiCalculator() {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState("years");
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [openGuide, setOpenGuide] = useState(null);
  const [activeInterpretation, setActiveInterpretation] = useState(INTERPRETATIONS[0].id);
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const months = Math.max(1, Math.round(tenureUnit === "years" ? tenure * 12 : tenure));
  const summary = useMemo(() => buildLoanSummary(amount, rate, months), [amount, rate, months]);
  const schedule = useMemo(() => buildYearlySchedule(amount, rate, months), [amount, rate, months]);
  const visibleSchedule = showFullSchedule ? schedule : schedule.slice(0, SCHEDULE_PREVIEW_ROWS);
  const principalPct = formatPercent(summary.principalPercent);
  const interestPct = formatPercent(summary.interestPercent);
  const principalArc = (summary.principalPercent / 100) * DONUT_CIRCUMFERENCE;
  const tenureLimits = tenureUnit === "years" ? TENURE_YEAR_LIMITS : TENURE_MONTH_LIMITS;
  const interpretation = INTERPRETATIONS.find((item) => item.id === activeInterpretation);
  const loanEnd = today ? loanEndLabel(months, today) : "—";
  const switchTenureUnit = (unit) => {
    if (unit === tenureUnit) return;
    setTenure((prev) =>
      unit === "months"
        ? clamp(prev * 12, TENURE_MONTH_LIMITS.inputMin, TENURE_MONTH_LIMITS.inputMax)
        : clamp(round2(prev / 12), TENURE_YEAR_LIMITS.inputMin, TENURE_YEAR_LIMITS.inputMax),
    );
    setTenureUnit(unit);
  };

  const printSchedule = () => {
    setShowFullSchedule(true);
    window.setTimeout(() => window.print(), 50);
  };

  const guideValue = (id) => {
    if (id === "emi") return formatINR(summary.emi);
    if (id === "interest") return formatINR(summary.totalInterest);
    if (id === "payout") return formatINR(summary.totalPayable);
    return `${months} months · till ${loanEnd}`;
  };

  return (
    <div className={`${styles.page} ${manrope.className}`}>
      <section className={styles.hero} aria-labelledby="emi-heading">
        <Image
          src="/static/home-loan-calculator-banner.jpg"
          alt="EMI Calculator Banner"
          title="EMI Calculator Banner"
          className={styles.heroImage}
          fill
          sizes="100vw"
          quality={70}
          priority
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" title="Home">
              Home
            </Link>
            <span aria-hidden="true"> &gt; </span>
            <span>EMI Calculator</span>
          </nav>
          <h1 id="emi-heading" className={`${styles.heroTitle} ${plusJakarta.className}`}>
            Loan &amp; EMI <span>Calculator</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Buying a home is emotional; financing it is mathematical. Our Loan & EMI Calculator lets you preview the maths before signing on the dotted line. Enter your loan amount, interest rate, and tenure to see:
          </p>
          <ul className={styles.heroChips}>
            <li>
              <HiOutlineCheck aria-hidden="true" /> Instant results
            </li>
            <li>
              <HiOutlineCheck aria-hidden="true" /> Year-wise schedule
            </li>
            <li>
              <HiOutlineCheck aria-hidden="true" /> 100% free
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.calcSection} aria-label="EMI calculator">
        <div className={styles.calcGrid}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h2 className={plusJakarta.className}>Calculate Your EMI</h2>
              <p>Drag the sliders or type any value (e.g. ₹20,000, 2% or 3 months). Results update instantly.</p>
            </div>

            <SliderField
              id="emi-amount"
              label="Loan Amount"
              value={amount}
              limits={AMOUNT_LIMITS}
              onChange={(v) => setAmount(round2(v))}
              prefix="₹"
              minLabel={formatCompactINR(AMOUNT_LIMITS.min)}
              maxLabel={formatCompactINR(AMOUNT_LIMITS.max)}
            />

            <SliderField
              id="emi-rate"
              label="Interest Rate (p.a.)"
              value={rate}
              limits={RATE_LIMITS}
              onChange={(v) => setRate(round2(v))}
              suffix="%"
              minLabel={`${RATE_LIMITS.min}%`}
              maxLabel={`${RATE_LIMITS.max}%`}
            />

            <SliderField
              id="emi-tenure"
              label="Loan Tenure"
              value={tenure}
              limits={tenureLimits}
              onChange={(v) => setTenure(round2(v))}
              suffix={tenureUnit === "years" ? "Yr" : "Mo"}
              minLabel={`${tenureLimits.min} ${tenureUnit === "years" ? "Yr" : "Mo"}`}
              maxLabel={`${tenureLimits.max} ${tenureUnit === "years" ? "Yr" : "Mo"}`}
              labelExtra={
                <span className={styles.unitToggle} role="group" aria-label="Tenure unit">
                  <button
                    type="button"
                    className={tenureUnit === "years" ? styles.unitActive : ""}
                    onClick={() => switchTenureUnit("years")}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    className={tenureUnit === "months" ? styles.unitActive : ""}
                    onClick={() => switchTenureUnit("months")}
                  >
                    Months
                  </button>
                </span>
              }
            />

            <p className={styles.formHint}>
              Tip: keep your EMI within <b>35% of your net monthly income</b>.
            </p>
          </div>

          <div className={styles.resultCard} aria-live="polite">
            <p className={styles.resultKicker}>Your Monthly EMI</p>
            <p className={`${styles.resultAmount} ${plusJakarta.className}`}>
              {formatINR(summary.emi)}
            </p>

            <div className={styles.donutRow}>
              <div className={styles.donut} aria-hidden="true">
                <svg viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r={DONUT_RADIUS} className={styles.donutInterest} />
                  <circle
                    cx="90"
                    cy="90"
                    r={DONUT_RADIUS}
                    className={styles.donutPrincipal}
                    strokeDasharray={`${principalArc} ${DONUT_CIRCUMFERENCE}`}
                  />
                </svg>
                <div className={styles.donutCenter}>
                  <strong className={plusJakarta.className}>{formatCompactINR(summary.totalPayable)}</strong>
                  <span>Total payable</span>
                </div>
              </div>
              <ul className={styles.legend}>
                <li>
                  <i className={styles.legendPrincipal} aria-hidden="true" />
                  <div>
                    <span>Principal ({principalPct})</span>
                    <strong>{formatINR(amount)}</strong>
                  </div>
                </li>
                <li>
                  <i className={styles.legendInterest} aria-hidden="true" />
                  <div>
                    <span>Interest ({interestPct})</span>
                    <strong>{formatINR(summary.totalInterest)}</strong>
                  </div>
                </li>
              </ul>
            </div>

            <ul className={styles.breakdown}>
              <li>
                <span>Total Interest Payable</span>
                <strong>{formatINR(summary.totalInterest)}</strong>
              </li>
              <li>
                <span>Total Payout</span>
                <strong>{formatINR(summary.totalPayable)}</strong>
              </li>
              <li>
                <span>Loan-free by</span>
                <strong>{loanEnd}</strong>
              </li>
            </ul>

            <Link href="/home-loan-calculator" className={styles.resultCta} title="Check Loan Eligibility">
              Check Your Loan Eligibility
              <HiOutlineArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.scheduleSection}`} aria-labelledby="schedule-heading">
        <div className={styles.inner}>
          <div className={styles.sectionHeadRow}>
            <div>
              <h2 id="schedule-heading" className={plusJakarta.className}>
                Year-wise Amortisation Schedule
              </h2>
              <p>See how every EMI splits between principal and interest over the years.</p>
            </div>
            <button type="button" className={styles.ghostBtn} onClick={printSchedule}>
              <HiOutlinePrinter aria-hidden="true" /> Print schedule
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Principal Paid</th>
                  <th scope="col">Interest Paid</th>
                  <th scope="col">Total Paid</th>
                  <th scope="col">Balance</th>
                  <th scope="col">Loan Paid</th>
                </tr>
              </thead>
              <tbody>
                {visibleSchedule.map((row) => (
                  <tr key={row.year}>
                    <td>Year {row.year}</td>
                    <td>{formatINR(row.principal)}</td>
                    <td>{formatINR(row.interest)}</td>
                    <td>{formatINR(row.totalPaid)}</td>
                    <td>{formatINR(row.balance)}</td>
                    <td>
                      <div className={styles.progress}>
                        <span style={{ width: `${row.paidPercent}%` }} />
                      </div>
                      <small>{formatPercent(row.paidPercent)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {schedule.length > SCHEDULE_PREVIEW_ROWS ? (
            <button
              type="button"
              className={styles.showMoreBtn}
              onClick={() => setShowFullSchedule((prev) => !prev)}
              aria-expanded={showFullSchedule}
            >
              {showFullSchedule ? "Show less" : `Show all ${schedule.length} years`}
              <HiOutlineChevronDown
                aria-hidden="true"
                className={showFullSchedule ? styles.chevronUp : ""}
              />
            </button>
          ) : null}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="guides-heading">
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <h2 id="guides-heading" className={plusJakarta.className}>
              What Your Results Mean
            </h2>
            <p>
              Use the numbers to fine tune your budget, negotiate better terms, or
              decide whether to pre pay and save interest.
            </p>
          </header>
          <div className={styles.guideGrid}>
            {RESULT_GUIDES.map((guide) => {
              const Icon = GUIDE_ICONS[guide.id];
              const open = openGuide === guide.id;
              return (
                <article key={guide.id} className={`${styles.guideCard}${open ? ` ${styles.guideOpen}` : ""}`}>
                  <span className={styles.guideIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className={plusJakarta.className}>{guide.title}</h3>
                  <p className={styles.guideDesc}>{guide.description}</p>
                  <p className={styles.guideValue}>{guideValue(guide.id)}</p>
                  <button
                    type="button"
                    className={styles.guideToggle}
                    aria-expanded={open}
                    onClick={() => setOpenGuide(open ? null : guide.id)}
                  >
                    {open ? "Hide tips" : "What you should know"}
                    <HiOutlineChevronDown aria-hidden="true" className={open ? styles.chevronUp : ""} />
                  </button>
                  {open ? (
                    <ul className={styles.tipList}>
                      {guide.tips.map((tip) => (
                        <li key={tip} dangerouslySetInnerHTML={{ __html: tip }} />
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="calibrate-heading">
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <h2 id="calibrate-heading" className={plusJakarta.className}>
              How to Calibrate Your Loan
            </h2>
            <p>Smart habits that keep your home loan comfortable for its whole life.</p>
          </header>
          <div className={styles.dosGrid}>
            <div className={`${styles.listCard} ${styles.dosCard}`}>
              <h3 className={plusJakarta.className}>
                <span className={styles.badgeDo}>
                  <HiOutlineCheck aria-hidden="true" />
                </span>
                DOs
              </h3>
              <ul>
                {LOAN_DOS.map((item) => (
                  <li key={item.guideline}>
                    <strong>{item.guideline}</strong>
                    <span>{item.why}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${styles.listCard} ${styles.dontsCard}`}>
              <h3 className={plusJakarta.className}>
                <span className={styles.badgeDont}>
                  <HiOutlineX aria-hidden="true" />
                </span>
                DON’Ts
              </h3>
              <ul>
                {LOAN_DONTS.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="interpret-heading">
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <h2 id="interpret-heading" className={plusJakarta.className}>
              Interpreting Your Results
            </h2>
            <p>Pick the situation that matches your numbers.</p>
          </header>
          <div className={styles.tabs} role="tablist" aria-label="Result scenarios">
            {INTERPRETATIONS.map((item) => {
              const active = item.id === activeInterpretation;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`interpret-tab-${item.id}`}
                  aria-selected={active}
                  aria-controls="interpret-panel"
                  className={`${styles.tab}${active ? ` ${styles.tabActive}` : ""}`}
                  onClick={() => setActiveInterpretation(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div
            id="interpret-panel"
            role="tabpanel"
            aria-labelledby={`interpret-tab-${interpretation.id}`}
            className={styles.tabPanel}
          >
            <h3 className={plusJakarta.className}>{interpretation.title}</h3>
            <p className={styles.tabSummary}>{interpretation.summary}</p>
            <ul className={styles.checkList}>
              {interpretation.tips.map((tip) => (
                <li key={tip}>
                  <HiOutlineCheck aria-hidden="true" />
                  <span dangerouslySetInnerHTML={{ __html: tip }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="next-heading">
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <h2 id="next-heading" className={plusJakarta.className}>
              Next Steps
            </h2>
          </header>
          <ol className={styles.steps}>
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={`${styles.stepNum} ${plusJakarta.className}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={plusJakarta.className}>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.faqSection} aria-label="Home loan FAQs">
        <NoidaProjectsSection faqItems={EMI_CALCULATOR_FAQ_ITEMS} />
      </section>

      <section className={styles.ctaSection} aria-labelledby="emi-cta-heading">
        <aside className={styles.disclaimer} role="note">
          <Image
            src="/static/home-loan-calculator/icon-note.svg"
            alt="Disclaimer"
            title="Disclaimer"
            width={21}
            height={21}
            aria-hidden="true"
          />
          <div>
            <strong className={plusJakarta.className}>Disclaimer</strong>
            <p>
              Figures are estimates for planning only. Actual loan offers depend on
              lender policies, your credit profile, and prevailing market rates.
              Always review final sanction letters carefully before commitment.
            </p>
          </div>
        </aside>
        <div className={styles.ctaInner}>
          <Image
            src="/static/home-loan-calculator-cta.jpg"
            alt="EMI Calculator CTA"
            title="EMI Calculator CTA"
            className={styles.ctaImage}
            fill
            sizes="(max-width: 1180px) 100vw, 1180px"
            quality={65}
            loading="lazy"
          />
          <div className={styles.ctaOverlay} aria-hidden="true" />
          <div className={styles.ctaCopy}>
            <h2 id="emi-cta-heading" className={plusJakarta.className}>
              Found your sweet-spot EMI?
            </h2>
            <p>Talk to our property consultants and find a home that fits your budget.</p>
          </div>
          <Link href="/contact-us" className={styles.ctaBtn} title="Talk to an Expert">
            Talk to an Expert
            <HiOutlineArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
