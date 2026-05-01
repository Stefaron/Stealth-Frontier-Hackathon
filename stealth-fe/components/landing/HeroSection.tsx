"use client";

/* ── Encrypted balance mock card shown on the right side of the hero ── */
function EncryptedBalanceCard() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto animate-float">
      {/* Glow behind */}
      <div
        className="absolute inset-0 rounded-2xl blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          transform: "scale(0.85) translateY(10px)",
        }}
      />

      {/* Card */}
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 overflow-hidden">
        {/* Scanline effect */}
        <div
          className="absolute left-0 right-0 h-12 pointer-events-none opacity-[0.03]"
          style={{
            background: "linear-gradient(transparent, rgba(255,255,255,0.8), transparent)",
            animation: "scanline 4s linear infinite",
            top: 0,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
              </svg>
            </div>
            <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">
              Stealth Treasury
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-[9px] font-mono text-green-400/60">Devnet</span>
          </div>
        </div>

        {/* Encrypted balance */}
        <div className="border-t border-white/5 pt-4 mb-4">
          <p className="text-[9px] tracking-widest uppercase text-white/25 mb-1.5 font-mono">
            Encrypted Balance
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-white/15 text-xl tracking-widest select-none font-mono leading-none">
              ██████.██
            </span>
            <span className="text-white/30 text-[10px] font-mono">USDC</span>
            <svg
              className="ml-auto"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <rect x="2" y="5" width="9" height="6" rx="1" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M4 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Last payroll */}
        <div className="border-t border-white/5 pt-3 mb-3">
          <p className="text-[9px] tracking-widest uppercase text-white/25 mb-2 font-mono">
            Last Payroll
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px]">23 contributors</p>
              <p className="text-white/15 text-[9px] font-mono mt-0.5 tracking-wide select-none">
                tx: ███████████████████
              </p>
            </div>
            <span className="text-white/25 text-[9px] font-mono">2h ago</span>
          </div>
        </div>

        {/* Auditor access */}
        <div className="border-t border-white/5 pt-3">
          <p className="text-[9px] tracking-widest uppercase text-white/25 mb-2 font-mono">
            Auditor Access
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                <span className="text-white/55 text-[10px]">Hacken</span>
                <span className="text-white/20 text-[9px]">— Aggregate</span>
              </div>
              <span className="text-green-400/50 text-[9px]">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-400/50" />
                <span className="text-white/15 text-[10px] select-none">██████████</span>
                <span className="text-white/15 text-[9px]">— Full</span>
              </div>
              <span className="text-green-400/40 text-[9px]">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TICKER = [
  "PRIVATE BY DEFAULT",
  "AUDITABLE ON DEMAND",
  "POWERED BY UMBRA",
  "SOLANA NATIVE",
  "ENCRYPTED PAYROLL",
  "COMPLIANCE READY",
  "ZERO SALARY LEAKS",
  "X25519 GRANTS",
];

export default function HeroSection() {
  const doubled = [...TICKER, ...TICKER];

  return (
    <section className="pt-16 px-4 md:px-6 pb-0">
      <div className="max-w-7xl mx-auto">
        {/* ── Dark hero card ── */}
        <div
          className="relative bg-[#0a0a0a] rounded-3xl overflow-hidden flex flex-col"
          style={{ minHeight: "calc(100svh - 72px)" }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Radial glow left */}
          <div
            className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Radial glow right */}
          <div
            className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
            }}
          />

          {/* ── Main content ── */}
          <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-between px-8 md:px-14 lg:px-20 pt-16 pb-12 gap-12 lg:gap-8">
            {/* Left: copy */}
            <div className="flex-1 max-w-2xl">
              {/* Label pill */}
              <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3.5 py-1.5 mb-10 animate-fade-in-up delay-0">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[9px] tracking-widest uppercase text-white/40 font-mono">
                  Umbra Side Track · Solana Frontier 2026
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.04] tracking-tight mb-7">
                <span className="block animate-fade-in-up delay-75">Pay your DAO</span>
                <span className="block font-serif-italic animate-fade-in-up delay-200" style={{ fontWeight: 400 }}>
                  privately.
                </span>
                <span className="block animate-fade-in-up delay-300">Audit it</span>
                <span className="block font-serif-italic animate-fade-in-up delay-400" style={{ fontWeight: 400 }}>
                  confidently.
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/40 text-base leading-relaxed max-w-sm mb-10 animate-fade-in-up delay-500">
                Confidential payroll for DAOs. Built on the Umbra SDK.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-600">
                <a
                  href="/treasurer"
                  className="flex items-center gap-2.5 bg-white text-[#0d0d0d] text-[10px] font-bold tracking-widest uppercase px-7 py-3.5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-[1.04]"
                >
                  Launch App
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </a>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 text-white/40 text-[10px] font-semibold tracking-widest uppercase hover:text-white/70 transition-colors duration-150"
                >
                  How it works
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: card */}
            <div className="flex-shrink-0 w-full lg:w-auto animate-slide-in-right delay-300">
              <EncryptedBalanceCard />
            </div>
          </div>

          {/* ── Marquee ticker ── */}
          <div className="border-t border-white/5 py-3.5 overflow-hidden">
            <div
              className="animate-marquee whitespace-nowrap"
              style={{ display: "inline-flex", width: "max-content" }}
            >
              {doubled.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-5 px-8 text-[9px] tracking-[0.22em] uppercase font-mono text-white/18"
                >
                  {item}
                  <span className="text-white/10">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
