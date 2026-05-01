import ScrollReveal from "./ScrollReveal";

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32" id="auditors">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-8">
          {/* Left: CTA copy */}
          <ScrollReveal className="flex-1 max-w-lg">
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">
              Get started
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0d0d0d] leading-[1.06] tracking-tight mb-5">
              Start paying privately.
            </h2>
            <p className="text-[#6b6b6b] text-base max-w-sm mb-9 leading-relaxed">
              Connect your DAO wallet, upload a payroll CSV, and send your first confidential
              batch on Solana devnet in under five minutes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/treasurer"
                className="inline-flex items-center gap-2.5 bg-[#0d0d0d] text-white text-[10px] font-bold tracking-widest uppercase px-7 py-3.5 rounded-full hover:bg-[#222] transition-all duration-200 hover:scale-[1.04]"
              >
                Launch App
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </a>
              <a
                href="https://sdk.umbraprivacy.com/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold tracking-widest uppercase text-[#9ca3af] hover:text-[#0d0d0d] transition-colors duration-150"
              >
                Umbra SDK docs →
              </a>
            </div>
          </ScrollReveal>

          {/* Right: large faded statement */}
          <ScrollReveal delay={200} className="flex-1 md:text-right">
            <p
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight select-none"
              style={{ color: "#e8e8e5" }}
            >
              Private by default.{" "}
              <span className="font-serif-italic" style={{ fontWeight: 400 }}>
                Auditable on demand.
              </span>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
