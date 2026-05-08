import Reveal from "./Reveal";

interface Primitive {
  num: string;
  name: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  haloRgba: string;
  topRgba: string;
}

const PRIMITIVES: Primitive[] = [
  {
    num: "01",
    name: "Private balances",
    tag: "Wallet-owner decrypt",
    desc: "Each contributor has an encrypted balance only their wallet can decrypt.",
    accent: "indigo",
    haloRgba: "rgba(99,102,241,0.14)",
    topRgba: "rgba(99,102,241,0.6)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h14" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="11.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    num: "02",
    name: "Confidential transfers",
    tag: "Bulk payouts",
    desc: "Send to many recipients in one transaction. Amounts and addresses stay private.",
    accent: "sky",
    haloRgba: "rgba(56,189,248,0.14)",
    topRgba: "rgba(56,189,248,0.6)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 9l12-5-4 14-2-6-6-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "03",
    name: "Auditor access",
    tag: "ECDH read keys",
    desc: "Grant or revoke read-only access to auditors with surgical precision.",
    accent: "emerald",
    haloRgba: "rgba(16,185,129,0.14)",
    topRgba: "rgba(16,185,129,0.6)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="11.5" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 9l-7 7M14 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "04",
    name: "Audit reports",
    tag: "Verifiable proofs",
    desc: "Auditors verify totals and produce reports without ever decrypting amounts.",
    accent: "amber",
    haloRgba: "rgba(245,158,11,0.14)",
    topRgba: "rgba(245,158,11,0.6)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M11 2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6l-4-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 2v4h4M6 10h6M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function UmbraSection() {
  return (
    <section id="umbra" className="cv-section relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Built on Umbra
              </span>
              <h2
                className="mt-4 font-bold text-zinc-900 tracking-tight"
                style={{
                  fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                Real privacy primitives. Not just promises.
              </h2>
            </div>
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors group"
            >
              Read the docs
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
            </a>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRIMITIVES.map((p, i) => (
            <Reveal key={p.num} delay={i * 70} y={14}>
              <article className="group relative h-full card card-hover p-6 cursor-default overflow-hidden">
                {/* Top accent strip */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${p.topRgba}, transparent)`,
                  }}
                />

                {/* Soft halo */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500"
                  style={{ background: p.haloRgba }}
                />

                {/* Big translucent number */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-6 -right-2 select-none font-bold tabular-nums leading-none transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                  style={{
                    fontSize: "120px",
                    color: "transparent",
                    WebkitTextStrokeWidth: "1px",
                    WebkitTextStrokeColor: "rgba(11,13,18,0.05)",
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  }}
                >
                  {p.num}
                </span>

                <div className="relative flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="relative w-10 h-10 rounded-xl bg-zinc-50 text-zinc-700 grid place-items-center group-hover:text-white transition-all duration-300 icon-wiggle"
                      style={
                        {
                          "--accent": p.haloRgba,
                        } as React.CSSProperties
                      }
                    >
                      {/* Hover gradient bg */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, #18181b, #27272a)`,
                        }}
                      />
                      <span className="relative">{p.icon}</span>
                    </span>
                    <div>
                      <div className="text-[14.5px] font-semibold text-zinc-900 tracking-tight">
                        {p.name}
                      </div>
                      <div
                        className="text-[11px] mt-0.5 font-medium"
                        style={{ color: p.topRgba.replace("0.6", "1") }}
                      >
                        {p.tag}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10.5px] font-mono px-2 py-0.5 rounded-full tracking-wider border"
                    style={{
                      color: p.topRgba.replace("0.6", "0.9"),
                      borderColor: p.topRgba.replace("0.6", "0.3"),
                      background: p.haloRgba,
                    }}
                  >
                    {p.num}
                  </span>
                </div>
                <p className="relative text-[13px] leading-relaxed text-zinc-500">{p.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
