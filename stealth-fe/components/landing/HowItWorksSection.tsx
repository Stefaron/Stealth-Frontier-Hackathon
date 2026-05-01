import ScrollReveal from "./ScrollReveal";

const ROLES = [
  {
    label: "Treasurer",
    accent: "text-violet-500",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-100",
    headline: "Pay privately",
    sub: "CSV upload → tag → multisig → bulk send.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5h14M2 5l1.5 10h11L16 5M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Contributor",
    accent: "text-slate-500",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-100",
    headline: "Receive privately",
    sub: "Encrypted balance. Withdraw anytime.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 16c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Auditor",
    accent: "text-emerald-500",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-100",
    headline: "Audit with scope",
    sub: "Scoped access. Export PDF report.",
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
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">How it works</p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0d0d0d] leading-[1.05] tracking-tight max-w-2xl mb-16">
            Three roles.{" "}
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>One private</span>{" "}
            payroll.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {ROLES.map((role, i) => (
            <ScrollReveal key={role.label} delay={160 + i * 80}>
              <div className="bg-white border border-[#e8e6e3] rounded-2xl p-7 h-full card-lift">
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${role.accent}`}>{role.label}</span>
                  <div className={`w-9 h-9 rounded-xl ${role.accentBg} border ${role.accentBorder} flex items-center justify-center ${role.accent}`}>
                    {role.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0d0d0d] mb-2">{role.headline}</h3>
                <p className="text-sm text-[#9ca3af]">{role.sub}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
