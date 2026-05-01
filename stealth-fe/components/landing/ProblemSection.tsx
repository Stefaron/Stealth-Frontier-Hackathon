import ScrollReveal from "./ScrollReveal";

export default function ProblemSection() {
  return (
    <section className="bg-[#f8f8f6] py-24 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-4">The Problem</p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0d0d0d] leading-[1.05] tracking-tight max-w-2xl mb-16">
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>Two broken options.</span>{" "}
            One missing middle.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ScrollReveal delay={120}>
            <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 card-lift">
              <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-red-500 text-[9px] font-bold tracking-widest uppercase">Public Payroll</span>
              </span>
              <h3 className="text-2xl font-bold text-[#0d0d0d] mb-2">Realms / Squads</h3>
              <p className="text-[#9ca3af] text-sm">Every salary on Solscan. Forever.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-white rounded-2xl border border-[#e8e6e3] p-8 card-lift">
              <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-600 text-[9px] font-bold tracking-widest uppercase">Anonymous Mixers</span>
              </span>
              <h3 className="text-2xl font-bold text-[#0d0d0d] mb-2">Tornado-style</h3>
              <p className="text-[#9ca3af] text-sm">Private, but zero auditability.</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300}>
          <div className="bg-[#0a0a0a] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/50 text-[9px] font-bold tracking-widest uppercase">Stealth</span>
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Private by default.{" "}
                <span className="font-serif-italic text-white/55" style={{ fontWeight: 400 }}>Auditable on demand.</span>
              </h3>
            </div>
            <a href="#how-it-works" className="flex-shrink-0 bg-white text-[#0d0d0d] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-[1.04] whitespace-nowrap">
              See how →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
