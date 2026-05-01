import ScrollReveal from "./ScrollReveal";

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32" id="auditors">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-8">
          <ScrollReveal className="flex-1 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0d0d0d] leading-[1.06] tracking-tight mb-8">
              Start paying privately.
            </h2>
            <a
              href="/treasurer"
              className="inline-flex items-center gap-2.5 bg-[#0d0d0d] text-white text-[10px] font-bold tracking-widest uppercase px-7 py-3.5 rounded-full hover:bg-[#222] transition-all hover:scale-[1.04]"
            >
              Launch App
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </a>
          </ScrollReveal>

          <ScrollReveal delay={180} className="flex-1 md:text-right">
            <p className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight select-none" style={{ color: "#e8e8e5" }}>
              Private by default.{" "}
              <span className="font-serif-italic" style={{ fontWeight: 400 }}>Auditable on demand.</span>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
