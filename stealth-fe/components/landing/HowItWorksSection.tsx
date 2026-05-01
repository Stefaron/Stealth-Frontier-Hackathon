import ScrollReveal from "./ScrollReveal";

const ROLES = [
  {
    num: "01",
    label: "Treasurer",
    accent: "text-violet-500",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-100",
    headline: "Pay privately",
    sub: "CSV upload · tag recipients · multisig approval · bulk send.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5h14M2 5l1.5 10h11L16 5M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "02",
    label: "Contributor",
    accent: "text-slate-500",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-100",
    headline: "Receive privately",
    sub: "Encrypted balance. Withdraw anytime. No exposure.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 16c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    label: "Auditor",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-100",
    headline: "Audit with scope",
    sub: "Scoped viewing key. Generate PDF report. Export CSV.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <ScrollReveal>
              <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#a09d98] mb-4">
                How it works
              </p>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0c0b09] leading-[1.05] tracking-tight max-w-xl">
                Three roles.{" "}
                <span className="font-serif-italic" style={{ fontWeight: 400 }}>One private</span>{" "}
                payroll.
              </h2>
            </ScrollReveal>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {ROLES.map((role, i) => (
            <ScrollReveal key={role.label} delay={160 + i * 90}>
              <div className="bg-white border border-[#e6e2da] rounded-2xl p-7 h-full card-lift group">
                <div className="flex items-start justify-between mb-7">
                  <span className={`font-mono text-[11px] font-bold ${role.accent} opacity-35`}>
                    {role.num}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl ${role.accentBg} border ${role.accentBorder} flex items-center justify-center ${role.accent}`}
                  >
                    {role.icon}
                  </div>
                </div>
                <span className={`text-[8px] font-bold tracking-[0.22em] uppercase ${role.accent} block mb-2.5`}>
                  {role.label}
                </span>
                <h3 className="text-xl font-bold text-[#0c0b09] mb-2.5">{role.headline}</h3>
                <p className="text-sm text-[#a09d98] leading-relaxed">{role.sub}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
