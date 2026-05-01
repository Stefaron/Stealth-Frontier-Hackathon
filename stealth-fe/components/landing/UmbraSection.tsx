import ScrollReveal from "./ScrollReveal";

const PRIMITIVES = [
  {
    number: "01",
    name: "Encrypted Token Accounts",
    tag: "Contributor balances",
    id: "ETA·x25519·ed25519",
  },
  {
    number: "02",
    name: "Mixer Pool (UTXOs)",
    tag: "Bulk transfers",
    id: "POOL·UTXO·zk-hidden",
  },
  {
    number: "03",
    name: "X25519 Compliance Grants",
    tag: "Auditor access",
    id: "GRANT·ECDH·scoped-key",
  },
  {
    number: "04",
    name: "Mixer Pool Viewing Keys",
    tag: "Audit reports",
    id: "VK·POOL·read-only",
  },
];

export default function UmbraSection() {
  return (
    <section className="bg-[#111010] py-24 md:py-32" id="umbra">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.05] grid place-items-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.25)" />
              </svg>
            </div>
            <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/25">
              Built on Umbra SDK
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-2xl mb-16">
            Every primitive.{" "}
            <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
              Fully used.
            </span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-3">
          {PRIMITIVES.map((p, i) => (
            <ScrollReveal key={p.number} delay={160 + i * 60}>
              <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7 card-lift group">
                <div className="flex items-start justify-between mb-5">
                  <span className="font-mono text-[9px] text-white/18 tracking-widest">{p.number}</span>
                  <span className="text-[8px] font-semibold tracking-widest uppercase text-white/28 border border-white/[0.08] rounded-full px-2.5 py-1">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white/85 transition-colors">
                  {p.name}
                </h3>
                <p className="font-mono text-[9px] text-white/15 tracking-widest">{p.id}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={420}>
          <div className="mt-10 pt-8 border-t border-white/[0.06] flex items-center justify-between gap-4">
            <p className="text-white/18 text-xs">Cannot be built without Umbra.</p>
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/28 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors"
            >
              SDK docs →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
