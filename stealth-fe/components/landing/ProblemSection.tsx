import ScrollReveal from "./ScrollReveal";

const OPTION_A = [
  "Every salary permanently public on Solscan",
  "Competitors see your burn rate and runway",
  "Vendor invoices and spend patterns exposed to all",
  "Senior talent won't join — comp is public knowledge",
];

const OPTION_B = [
  "Zero auditability — no auditor can sign a real report",
  "Regulatory risk: OFAC, AML, sanctions exposure",
  "Institutional capital and grants become inaccessible",
  "No compliance trail — legal liability for the DAO",
];

export default function ProblemSection() {
  return (
    <section className="bg-[#f8f8f6] py-24 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">
            The Problem
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0d0d0d] leading-[1.05] tracking-tight max-w-3xl mb-16">
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>
              Two broken options.
            </span>{" "}
            One unsolved trilemma.
          </h2>
        </ScrollReveal>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Option A */}
          <ScrollReveal delay={120}>
            <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 h-full card-lift">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-red-500 text-[9px] font-bold tracking-widest uppercase">
                  Option A — Public Payroll
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0d0d0d] mb-1.5">Realms / Squads</h3>
              <p className="text-sm text-[#9ca3af] mb-7">
                Audit-friendly. But every observer is watching too.
              </p>
              <ul className="space-y-3.5">
                {OPTION_A.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#6b6b6b]">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Option B */}
          <ScrollReveal delay={220}>
            <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 h-full card-lift">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-600 text-[9px] font-bold tracking-widest uppercase">
                  Option B — Anonymous Mixers
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0d0d0d] mb-1.5">Tornado-style Mixers</h3>
              <p className="text-sm text-[#9ca3af] mb-7">
                Total privacy. But completely un-auditable.
              </p>
              <ul className="space-y-3.5">
                {OPTION_B.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#6b6b6b]">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2L14.5 14H1.5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      <path d="M8 6.5V10M8 11.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>

        {/* Solution bridge */}
        <ScrollReveal delay={320}>
          <div className="bg-[#0a0a0a] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/50 text-[9px] font-bold tracking-widest uppercase">
                  The Stealth Answer
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-snug">
                Private by default.{" "}
                <span className="font-serif-italic text-white/60" style={{ fontWeight: 400 }}>
                  Auditable on demand.
                </span>
              </h3>
              <p className="text-white/45 text-sm max-w-md leading-relaxed">
                No serious DAO wants 100% public or 100% anonymous. Stealth uses Umbra's
                compliance-ready privacy to give you both — without compromise.
              </p>
            </div>
            <a
              href="#how-it-works"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-[#0d0d0d] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-[1.04] whitespace-nowrap"
            >
              See how it works →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
