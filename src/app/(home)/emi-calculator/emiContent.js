export const RESULT_GUIDES = [
  {
    id: "emi",
    title: "Monthly EMI",
    description: "The bite out of your salary each month.",
    tips: [
      "Keep your EMI within <b>35% of your net monthly income</b> to stay financially comfortable.",
      "A <b>lower EMI isn’t always better</b>. Longer tenures mean much higher total interest.",
      "Use EMI estimates to plan <b>prepayments</b>, which can reduce your loan term drastically.",
      "Always <b>stress-test EMI</b> by adding 1–1.5% to the interest rate. It prepares you for future hikes.",
      "EMI amounts help <b>determine eligibility</b> but never borrow more than you can breathe under.",
    ],
  },
  {
    id: "interest",
    title: "Total Interest Payable",
    description: "What the bank earns from you.",
    tips: [
      "The longer your loan tenure, the more interest you pay. <b>Even small tenure cuts can save lakhs.</b>",
      "<b>Prepaying early</b> in the loan cycle reduces interest drastically due to the front-loaded structure.",
      "Avoid being lured by low EMI if it <b>balloons your total interest burden</b>.",
      "Use total interest figures to <b>evaluate true loan cost</b>, not just monthly affordability.",
      "Compare lenders beyond rates, <b>processing fees, and reset clauses</b> impact overall payout.",
    ],
  },
  {
    id: "payout",
    title: "Total Payout",
    description: "Principal + interest over the loan’s life.",
    tips: [
      "<b>Total payout = principal + interest.</b> It shows the real cost of your loan, not just EMI.",
      "A ₹50L loan over 20 years could mean a <b>total payout of ₹90L+</b>. Double-check before committing.",
      "<b>Shorter tenures</b> dramatically reduce total payout, even if EMIs are higher.",
      "Prepayments lower your total payout by cutting down <b>future interest obligations</b>.",
      "Always evaluate <b>total payout vs. property appreciation</b> to judge investment viability.",
    ],
  },
  {
    id: "term",
    title: "Loan Term Visual",
    description: "How long you’ll be in repayment mode.",
    tips: [
      "The visual shows how <b>EMI components shift over time</b>. Interest dominates early, principal later.",
      "Helps you identify <b>ideal prepayment windows</b>. Earlier = greater savings.",
      "See how reducing tenure affects your <b>interest outgo and repayment timeline</b> instantly.",
      "Use it to plan major life goals, know when your <b>loan-free milestone</b> is coming.",
      "Great tool to <b>stress-test different scenarios</b> before finalizing your loan structure.",
    ],
  },
];

export const LOAN_DOS = [
  {
    guideline: "Keep EMI ≤35% of net monthly income",
    why: "Leaves room for lifestyle costs, emergencies, and new goals.",
  },
  {
    guideline: "Choose the shortest tenure you can comfortably afford",
    why: "Every extra year balloons total interest. A 20 year loan can cost 60–80% more interest than a 12 year loan.",
  },
  {
    guideline: "Opt for fixed plus floating or pure floating only if you’re ready for rate swings",
    why: "Floating rates usually fall faster than they rise, but you must have buffer cash for upward cycles.",
  },
  {
    guideline: "Schedule an annual 5–10% principal pre payment",
    why: "Even modest pre payments in early years knock years off the schedule and slash interest outgo.",
  },
  {
    guideline: "Build a 3 to 6 month EMI emergency fund",
    why: "Protects your credit score (and peace of mind) during job changes or medical surprises.",
  },
];

export const LOAN_DONTS = [
  "Don’t chase the absolute maximum eligibility that banks dangle; “stretching” today can feel suffocating tomorrow.",
  "Don’t be seduced by teaser rates that jump sharply after 12–24 months—run the calculator with post teaser rates.",
  "Don’t ignore ancillary costs (registration, GST on under construction property, maintenance deposits). They’re paid upfront, not financed.",
  "Don’t extend tenure only for a lower EMI while planning “I’ll pre pay later.” If discipline slips, you’ll bleed interest for decades.",
  "Don’t pick a lender solely on EMI; compare processing fees, foreclosure charges, rate reset frequency, and customer service ratings.",
];

export const INTERPRETATIONS = [
  {
    id: "tight",
    label: "EMI feels tight",
    title: "If EMI feels tight",
    summary: "Consider a larger down payment or longer tenure (but note total interest jump).",
    tips: [
      "Increase your <b>down payment</b> to reduce the loan amount and lower your monthly payments.",
      "Opt for a <b>slightly longer tenure</b>, but only if you're disciplined about future prepayments.",
      "Review all existing EMIs. <b>Consolidate or close small debts</b> to free up cash.",
      "Consider <b>joint loans</b> to boost eligibility and ease the burden.",
      "Delay purchase if needed. <b>Financial comfort beats rushed ownership.</b>",
    ],
  },
  {
    id: "interest",
    label: "Interest shocks you",
    title: "If total interest shocks you",
    summary: "Target aggressive pre payments. Even one extra EMI a year can shave multiple years off.",
    tips: [
      "Choose a <b>shorter tenure.</b> It significantly reduces interest paid over time.",
      "Plan for <b>aggressive prepayments,</b> especially in the first 5 years.",
      "Increase your <b>EMI slightly</b> if your budget allows. It cuts interest fast.",
      "Avoid loans with <b>teaser rates</b> that spike later.",
      "Use the shock as a trigger to <b>negotiate better terms or reconsider the loan amount.</b>",
    ],
  },
  {
    id: "affordable",
    label: "Looks affordable",
    title: "If the calculator shows affordability",
    summary: "Still stress test: add 1–1.5% to the rate and see if EMI remains comfortable.",
    tips: [
      "Still perform a <b>stress test</b> by adding 1–1.5% to the interest rate. Future hikes are real.",
      "Don’t stretch to your max. Leave room for <b>emergencies and future goals.</b>",
      "Consider <b>shortening the tenure</b> to save on interest while it’s affordable.",
      "Use your position to <b>negotiate better terms</b> with lenders.",
      "Plan <b>prepayments early</b> to close the loan more quickly and affordably.",
    ],
  },
];

export const NEXT_STEPS = [
  {
    title: "Find your sweet spot",
    text: "Tweak inputs until you hit a “sweet spot” EMI.",
  },
  {
    title: "Print the schedule",
    text: "Download/print the amortisation schedule as a negotiation tool with lenders.",
  },
  {
    title: "Talk to an advisor",
    text: "Speak with a loan advisor to confirm eligibility and best products.",
  },
];
