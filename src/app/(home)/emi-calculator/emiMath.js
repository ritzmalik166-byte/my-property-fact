/** Slider range (min/max) vs. what can be typed (inputMin/inputMax). */
export const AMOUNT_LIMITS = { min: 10000, max: 100000000, step: 10000, inputMin: 1000, inputMax: 10000000000 };
export const RATE_LIMITS = { min: 1, max: 30, step: 0.05, inputMin: 0, inputMax: 50 };
export const TENURE_YEAR_LIMITS = { min: 1, max: 30, step: 1, inputMin: 1, inputMax: 40 };
export const TENURE_MONTH_LIMITS = { min: 1, max: 360, step: 1, inputMin: 1, inputMax: 480 };

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function formatPercent(value) {
  return `${round2(value).toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹ —";
  return `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatCompactINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹ —";
  if (n >= 10000000) return `₹${trimDecimals(n / 10000000)} Cr`;
  if (n >= 100000) return `₹${trimDecimals(n / 100000)} L`;
  if (n >= 1000) return `₹${trimDecimals(n / 1000)} K`;
  return `₹${Math.round(n)}`;
}

function trimDecimals(n) {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

export function calculateEmi(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export function buildLoanSummary(principal, annualRate, months) {
  const emi = calculateEmi(principal, annualRate, months);
  const totalPayable = emi * months;
  const totalInterest = Math.max(0, totalPayable - principal);
  const principalPercent = totalPayable > 0 ? (principal / totalPayable) * 100 : 0;
  return {
    emi,
    totalPayable,
    totalInterest,
    principalPercent,
    interestPercent: 100 - principalPercent,
  };
}

/** Year-wise amortisation; year 1 starts with the first EMI. */
export function buildYearlySchedule(principal, annualRate, months) {
  const emi = calculateEmi(principal, annualRate, months);
  const r = annualRate / 12 / 100;
  const rows = [];
  let balance = principal;
  let paidPrincipal = 0;

  for (let start = 0; start < months; start += 12) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const end = Math.min(months, start + 12);
    for (let m = start; m < end; m += 1) {
      const interest = balance * r;
      const principalPart = Math.min(balance, emi - interest);
      balance = Math.max(0, balance - principalPart);
      yearPrincipal += principalPart;
      yearInterest += interest;
    }
    paidPrincipal += yearPrincipal;
    rows.push({
      year: rows.length + 1,
      principal: yearPrincipal,
      interest: yearInterest,
      totalPaid: yearPrincipal + yearInterest,
      balance,
      paidPercent: principal > 0 ? (paidPrincipal / principal) * 100 : 0,
    });
  }

  return rows;
}

export function loanEndLabel(months, from = new Date()) {
  const end = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return end.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
