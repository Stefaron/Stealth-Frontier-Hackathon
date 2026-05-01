"use client";

const TICKER = [
  "PRIVATE BY DEFAULT",
  "AUDITABLE ON DEMAND",
  "POWERED BY UMBRA SDK",
  "SOLANA NATIVE",
  "ZERO SALARY LEAKS",
  "COMPLIANCE READY",
  "X25519 GRANTS",
  "ENCRYPTED PAYROLL",
];

function EncryptedBalanceCard() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto animate-float">
      {/* Glow */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, rgba(109,40,217,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div className="relative bg-[#1f1e1b] border border-white/[0.09] rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
        {/* Scanline */}
        <div
          className="absolute left-0 right-0 h-16 pointer-events-none opacity-[0.022]"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95), transparent)",
            animation: "scanline 7s linear infinite",
            top: 0,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/[0.06] grid place-items-center">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-white/25">Stealth Treasury</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-[9px] font-mono text-emerald-400/50">live</span>
          </div>
        </div>

        {/* Balance */}
        <div className="px-4 pt-4 pb-3.5 border-b border-white/[0.05]">
          <p className="text-[8px] font-mono tracking-[0.2em] uppercase text-white/18 mb-2">Encrypted Balance</p>
          <div className="flex items-end gap-2.5">
            <span className="text-2xl font-mono tracking-wider text-white/[0.1] select-none leading-none">
              ██████.██
            </span>
            <span className="text-[10px] font-mono text-white/22 mb-0.5">USDC</span>
            <div className="ml-auto mb-0.5 opacity-30">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="5" width="10" height="6.5" rx="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
                <path d="M4 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Payroll */}
        <div className="px-4 py-3.5 border-b border-white/[0.05]">
          <p className="text-[8px] font-mono tracking-[0.2em] uppercase text-white/18 mb-2">Last Payroll</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50">23 contributors</p>
              <p className="text-[9px] font-mono text-white/[0.1] mt-0.5 select-none tracking-wide">tx: ███████████████</p>
            </div>
            <span className="text-[9px] font-mono text-white/18">2h ago</span>
          </div>
        </div>

        {/* Auditors */}
        <div className="px-4 py-3.5">
          <p className="text-[8px] font-mono tracking-[0.2em] uppercase text-white/18 mb-3">Auditor Access</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-400/65 flex-shrink-0" />
              <span className="text-[10px] text-white/48 flex-1">Hacken</span>
              <span className="text-[8px] text-white/20 font-mono">aggregate</span>
              <span className="text-emerald-400/50 text-[9px] ml-2">✓</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-400/30 flex-shrink-0" />
              <span className="text-[10px] text-white/[0.12] select-none flex-1">██████████</span>
              <span className="text-[8px] text-white/[0.12] font-mono">full</span>
              <span className="text-emerald-400/30 text-[9px] ml-2">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const doubled = [...TICKER, ...TICKER];

  return (
    <section className="min-h-svh flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 lg:gap-8">

          {/* Left */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-10 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-glow" />
              <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/28">
                Umbra Side Track · Solana Frontier 2026
              </span>
            </div>

            <h1
              className="font-bold leading-[0.95] tracking-tight mb-8"
              style={{ fontSize: "clamp(3.75rem, 8.5vw, 8rem)" }}
            >
              <span className="block text-white animate-fade-in-up delay-75">Pay your</span>
              <span className="block text-white animate-fade-in-up delay-150">DAO</span>
              <span
                className="block font-serif-italic text-white/30 animate-fade-in-up delay-300"
                style={{ fontWeight: 400 }}
              >
                privately.
              </span>
            </h1>

            <p className="text-white/35 text-[15px] leading-relaxed max-w-xs mb-10 animate-fade-in-up delay-400">
              Confidential payroll for DAOs. Built on the Umbra SDK.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-500">
              <a
                href="/treasurer"
                className="inline-flex items-center gap-2.5 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-7 py-3.5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Launch App
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="text-white/28 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors duration-200"
              >
                How it works ↓
              </a>
            </div>
          </div>

          {/* Right: card */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 animate-fade-in delay-400">
            <EncryptedBalanceCard />
          </div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="border-t border-white/[0.05] py-3.5 overflow-hidden">
        <div
          className="animate-marquee whitespace-nowrap"
          style={{ display: "inline-flex", width: "max-content" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-8 text-[9px] font-mono tracking-[0.26em] uppercase text-white/14"
            >
              {item}
              <span className="text-white/8">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
