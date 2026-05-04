import GsapReveal from "./GsapReveal";

export default function CtaSection() {
  return (
    <section className="bg-black py-24 md:py-36" id="auditors">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="border-t border-white/[0.07] pt-16 md:pt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12">

            <GsapReveal className="flex-1" x={-50} y={0} duration={0.85}>
              <h2
                className="font-bold text-white leading-[0.95] tracking-tight mb-10"
                style={{ fontSize: "clamp(3rem, 6.5vw, 6rem)" }}
              >
                Start paying
                <br />
                <span className="font-serif-italic text-white/25" style={{ fontWeight: 400 }}>
                  privately.
                </span>
              </h2>
              <a
                href="/treasurer"
                className="inline-flex items-center gap-2.5 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-7 py-3.5 rounded-full hover:bg-white/90 transition-all hover:scale-[1.04] active:scale-[0.98]"
              >
                Launch App
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </a>
            </GsapReveal>

            <GsapReveal delay={0.2} className="flex-1 md:text-right" x={50} y={0} duration={0.85}>
              <p
                className="cta-aurora font-bold leading-[0.95] tracking-tight select-none"
                style={{ fontSize: "clamp(3rem, 6.5vw, 6rem)" }}
              >
                Private by default.{" "}
                <span className="font-serif-italic" style={{ fontWeight: 400 }}>
                  Auditable on demand.
                </span>
              </p>
            </GsapReveal>

          </div>
        </div>
      </div>
    </section>
  );
}
