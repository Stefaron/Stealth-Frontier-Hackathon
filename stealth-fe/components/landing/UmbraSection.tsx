import ScrollReveal from "./ScrollReveal";

const PRIMITIVES = [
  {
    number:      "01",
    name:        "Encrypted Token Accounts",
    usedFor:     "Contributor earnings",
    description:
      "Contributor USDC balances are stored encrypted on-chain. Invisible on Solscan. Only the holder's master seed can decrypt — not the employer, not an indexer, not Umbra.",
  },
  {
    number:      "02",
    name:        "Mixer Pool (UTXOs)",
    usedFor:     "Bulk payroll transfers",
    description:
      "Stealth routes transfers through Umbra's mixer pool using UTXO commitments and Merkle proofs. It is cryptographically impossible to link a DAO disbursement to a specific recipient.",
  },
  {
    number:      "03",
    name:        "X25519 Compliance Grants",
    usedFor:     "Auditor access control",
    description:
      "DAOs issue cryptographic grants to auditor wallets at three scopes: aggregate, per-category, or full. Each grant is time-bounded and revocable by the DAO at any time.",
  },
  {
    number:      "04",
    name:        "Mixer Pool Viewing Keys",
    usedFor:     "Audit report generation",
    description:
      "Auditors use viewing keys derived from their compliance grants to decrypt exactly the transaction data they were authorized to see — enabling real audit reports without full disclosure.",
  },
];

export default function UmbraSection() {
  return (
    <section className="bg-[#0a0a0a] py-24 md:py-32" id="umbra">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30">
              Built on Umbra SDK
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-3xl mb-4">
            Every primitive.{" "}
            <span className="font-serif-italic text-white/45" style={{ fontWeight: 400 }}>
              Fully used.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={140}>
          <p className="text-white/38 text-base md:text-lg max-w-xl mb-16 leading-relaxed">
            Remove Umbra and this product collapses. Each core feature maps directly to a specific
            SDK primitive — this is not a superficial integration.
          </p>
        </ScrollReveal>

        {/* Primitives grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {PRIMITIVES.map((p, i) => (
            <ScrollReveal key={p.number} delay={180 + i * 70}>
              <div className="border border-white/8 rounded-2xl p-7 bg-white/[0.025] card-lift-dark group">
                <div className="flex items-start justify-between mb-5">
                  <span className="font-mono text-[9px] text-white/18 tracking-widest">
                    {p.number}
                  </span>
                  <span className="text-[8px] font-semibold tracking-widest uppercase text-white/25 border border-white/10 rounded-full px-2.5 py-1">
                    {p.usedFor}
                  </span>
                </div>
                <h3 className="text-[1.05rem] font-bold text-white mb-2.5 group-hover:text-white/90 transition-colors duration-200">
                  {p.name}
                </h3>
                <p className="text-sm text-white/38 leading-relaxed">{p.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Docs link */}
        <ScrollReveal delay={420}>
          <div className="mt-10 pt-8 border-t border-white/8 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-white/25 text-xs">
              Umbra SDK released April 2026 · Solana-native privacy infrastructure
            </p>
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/40 text-[10px] font-semibold tracking-widest uppercase hover:text-white/70 transition-colors duration-150"
            >
              Read the SDK docs →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
