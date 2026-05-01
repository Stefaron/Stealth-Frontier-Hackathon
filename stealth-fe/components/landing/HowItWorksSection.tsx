import ScrollReveal from "./ScrollReveal";

const ROLES = [
  {
    label:       "DAO Treasurer",
    accent:      "text-violet-500",
    accentBg:    "bg-violet-50",
    accentBorder:"border-violet-100",
    headline:    "Pay contributors privately",
    description: "Upload a payroll CSV, tag each payment by category, approve via Squads multisig, and disburse confidentially in one batch — no salary ever hits the public ledger.",
    steps: [
      "Set up DAO workspace & connect multisig",
      "Upload CSV or build from address book",
      "Tag each payment (engineering, ops, marketing…)",
      "Approve → bulk private send via Umbra SDK",
      "Grant scoped access to auditor firms",
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5h14M2 5l1.5 10h11L16 5M2 5H1M16 5h1M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label:       "Contributor",
    accent:      "text-slate-500",
    accentBg:    "bg-slate-50",
    accentBorder:"border-slate-100",
    headline:    "Receive privately, withdraw anytime",
    description: "Your USDC lands in an encrypted Umbra balance. Your employer, your colleagues, and Solscan see nothing. Withdraw to any wallet whenever you're ready.",
    steps: [
      "Connect wallet & register with Umbra",
      "View encrypted earnings across all DAOs",
      "Withdraw to any Solana wallet anytime",
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 16c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:       "Auditor",
    accent:      "text-emerald-500",
    accentBg:    "bg-emerald-50",
    accentBorder:"border-emerald-100",
    headline:    "Scoped access. Real audit reports.",
    description: "DAOs grant you cryptographic access at your agreed scope — aggregate totals, per-category breakdowns, or full detail. You see exactly what you need. Nothing more.",
    steps: [
      "Login with auditor wallet",
      "See DAOs that granted you access",
      "Open compliance dashboard & metrics",
      "Drill into authorized categories",
      "Export PDF + CSV audit report",
    ],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">
            How it works
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0d0d0d] leading-[1.05] tracking-tight max-w-3xl mb-4">
            Three roles.{" "}
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>
              One private
            </span>{" "}
            payroll.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={140}>
          <p className="text-[#6b6b6b] text-base md:text-lg max-w-xl mb-16 leading-relaxed">
            Stealth is built around three distinct roles. The auditor surface is the differentiator —
            anyone can build private payroll, but selective cryptographic disclosure is what makes
            compliance possible without sacrificing privacy.
          </p>
        </ScrollReveal>

        {/* Role cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {ROLES.map((role, i) => (
            <ScrollReveal key={role.label} delay={180 + i * 90}>
              <div className="bg-white border border-[#e8e6e3] rounded-2xl p-7 h-full flex flex-col card-lift">
                {/* Label + icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${role.accent}`}>
                    {role.label}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl ${role.accentBg} border ${role.accentBorder} flex items-center justify-center ${role.accent}`}
                  >
                    {role.icon}
                  </div>
                </div>

                {/* Headline + desc */}
                <h3 className="text-[1.1rem] font-bold text-[#0d0d0d] mb-2.5">
                  {role.headline}
                </h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed mb-7">
                  {role.description}
                </p>

                {/* Steps */}
                <ul className="space-y-2.5 mt-auto">
                  {role.steps.map((step, idx) => (
                    <li key={step} className="flex items-start gap-3 text-xs text-[#6b6b6b]">
                      <span
                        className={`w-5 h-5 rounded-full ${role.accentBg} ${role.accent} text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-px`}
                      >
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
