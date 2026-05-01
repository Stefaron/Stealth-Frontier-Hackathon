"use client";

import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

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

const HERO_WORDS = ["STEALTH", "PRIVATE", "ENCRYPTED", "AUDITABLE", "COMPLIANT"];

export default function HeroSection() {
  const doubled = [...TICKER, ...TICKER];

  return (
    <section className="min-h-svh flex flex-col">
      {/* Main */}
      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 lg:gap-8">

          {/* Left: text */}
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

          {/* Right: particle text effect (replaces static card) */}
          <div className="w-full lg:w-[420px] lg:flex-shrink-0 animate-fade-in delay-300">
            <ParticleTextEffect
              words={HERO_WORDS}
              className="w-full"
              showDescription={false}
              canvasWidth={700}
              canvasHeight={560}
              fontSize={90}
            />
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
