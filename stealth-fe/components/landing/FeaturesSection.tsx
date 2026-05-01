import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    label: "Privacy",
    headline: "Bulk confidential payroll",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15 5.5v7L9 16l-6-3.5v-7L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Compliance",
    headline: "Scoped auditor grants",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15.5 5.5V12L9 15.5L2.5 12V5.5L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Workflow",
    headline: "CSV upload & tagging",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 4h12M3 8h8M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Audit",
    headline: "PDF + CSV export",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h5M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Security",
    headline: "OFAC screening",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5V8l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Auth",
    headline: "Wallet-native identity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="7" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="11.5" r="1.25" fill="currentColor" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#eceae4] py-24 md:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <ScrollReveal>
              <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#a09d98] mb-4">
                Features
              </p>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0c0b09] leading-[1.05] tracking-tight max-w-xl">
                Everything DAOs need.{" "}
                <span className="font-serif-italic" style={{ fontWeight: 400 }}>
                  Nothing more.
                </span>
              </h2>
            </ScrollReveal>
          </div>
        </div>

        <div className="border-t border-[#d9d5cc]">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.headline} delay={60 + i * 40}>
              <div className="row-hover flex items-center gap-6 md:gap-10 py-5 border-b border-[#e6e2da] px-3 -mx-3 rounded-xl group cursor-default">
                <span className="font-mono text-[10px] text-[#a09d98] tracking-widest w-7 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[8px] font-bold tracking-[0.24em] uppercase text-[#a09d98] w-24 flex-shrink-0 hidden sm:block">
                  {f.label}
                </span>
                <h3 className="font-semibold text-[#0c0b09] flex-1 text-[15px]">
                  {f.headline}
                </h3>
                <div className="w-8 h-8 rounded-xl bg-white border border-[#e6e2da] flex items-center justify-center text-[#0c0b09] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  {f.icon}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
