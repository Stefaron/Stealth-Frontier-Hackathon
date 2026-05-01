import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    label:       "Privacy",
    headline:    "Bulk confidential payroll",
    description: "Pay dozens of contributors in one batch transaction. No salary information leaks to Solscan, block explorers, or anyone watching on-chain.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15 5.5v7L9 16l-6-3.5v-7L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9.5C6 8.12 7.12 7 8.5 7h1C10.88 7 12 8.12 12 9.5v.5H6v-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:       "Compliance",
    headline:    "Scoped auditor grants",
    description: "Issue X25519 compliance grants to auditor wallets at three scopes: aggregate, per-category, or full. Set time bounds. Revoke anytime — cryptographically.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15.5 5.5V12L9 15.5L2.5 12V5.5L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label:       "Workflow",
    headline:    "CSV upload & category tagging",
    description: "Import your payroll spreadsheet. Tag each payment by team, category, or budget line. A clean, per-category audit trail builds automatically as you pay.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 4h12M3 8h8M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:       "Audit",
    headline:    "PDF + CSV audit report export",
    description: "One-click export of industry-standard audit workpapers. Auditors sign off on real numbers without ever seeing individual salaries.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 11h5M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:       "Security",
    headline:    "Sanctions screening & flags",
    description: "The auditor dashboard surfaces OFAC screening status, outlier detection, and unusual pattern flags — so compliance reviews have a real evidence trail.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5V9l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label:       "Auth",
    headline:    "Wallet-native identity",
    description: "No accounts, no passwords, no sessions. Wallet signature is the identity for all three roles. First-time registration happens once via Umbra and persists on-chain.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="7" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="11.5" r="1.25" fill="currentColor" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#f8f8f6] py-24 md:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">
            Features
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0d0d0d] leading-[1.05] tracking-tight max-w-3xl mb-16">
            Everything DAOs need to{" "}
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>
              pay with confidence.
            </span>
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.headline} delay={120 + i * 55}>
              <div className="bg-white border border-[#e8e6e3] rounded-2xl p-6 h-full flex flex-col card-lift">
                <div className="w-10 h-10 rounded-xl bg-[#f0eeeb] flex items-center justify-center text-[#0d0d0d] mb-5">
                  {f.icon}
                </div>
                <span className="text-[8px] font-bold tracking-[0.22em] uppercase text-[#9ca3af] block mb-2">
                  {f.label}
                </span>
                <h3 className="font-bold text-[#0d0d0d] text-[1rem] mb-2">{f.headline}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{f.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
