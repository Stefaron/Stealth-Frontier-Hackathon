import ScrollReveal from "./ScrollReveal";

const PRIMITIVES = [
  { number: "01", name: "Encrypted Token Accounts", tag: "Contributor balances" },
  { number: "02", name: "Mixer Pool (UTXOs)",        tag: "Bulk transfers" },
  { number: "03", name: "X25519 Compliance Grants",  tag: "Auditor access" },
  { number: "04", name: "Mixer Pool Viewing Keys",    tag: "Audit reports" },
];

export default function UmbraSection() {
  return (
    <section className="bg-[#0a0a0a] py-24 md:py-32" id="umbra">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30">Built on Umbra SDK</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-2xl mb-16">
            Every primitive.{" "}
            <span className="font-serif-italic text-white/45" style={{ fontWeight: 400 }}>Fully used.</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-4">
          {PRIMITIVES.map((p, i) => (
            <ScrollReveal key={p.number} delay={160 + i * 60}>
              <div className="border border-white/8 rounded-2xl p-7 bg-white/[0.025] card-lift-dark group">
                <div className="flex items-start justify-between mb-6">
                  <span className="font-mono text-[9px] text-white/18 tracking-widest">{p.number}</span>
                  <span className="text-[8px] font-semibold tracking-widest uppercase text-white/25 border border-white/10 rounded-full px-2.5 py-1">{p.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors duration-200">{p.name}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 pt-8 border-t border-white/8 flex items-center justify-between gap-4">
            <p className="text-white/20 text-xs">Cannot be built without Umbra.</p>
            <a href="https://sdk.umbraprivacy.com/introduction" target="_blank" rel="noopener noreferrer"
              className="text-white/35 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors">
              SDK docs →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
