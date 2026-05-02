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
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 lg:gap-12">

          {/* Left: typography */}
          <div className="flex-1 max-w-[520px]">

            <h1
              className="leading-[0.9] tracking-tight mb-9 animate-fade-in-up"
              style={{ fontSize: "clamp(4rem, 8.5vw, 8rem)" }}
            >
              {/* Line 1 */}
              <span className="block font-bold text-white/70">
                Pay your
              </span>
              {/* Line 2: bold sans + inline serif italic */}
              <span className="block">
                <span className="font-bold text-white">DAO </span>
                <span
                  className="font-serif-italic"
                  style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}
                >
                  privately.
                </span>
              </span>
            </h1>

            <p
              className="text-white/32 leading-relaxed mb-10 animate-fade-in-up delay-150"
              style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)", maxWidth: "34ch" }}
            >
              Confidential payroll for DAOs. Pay contributors with zero salary leaks — fully encrypted, auditable on demand, native to Solana.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              {/* Primary CTA — reference-style pill with icon circle */}
              <a
                href="/treasurer"
                className="group inline-flex items-center gap-3 bg-white pl-6 pr-1.5 py-1.5 rounded-full transition-all duration-200 hover:bg-white/92 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0d0c0a]">
                  Launch App
                </span>
                <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-hover:bg-black transition-colors duration-200">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
              </a>

              {/* Secondary */}
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-1.5 text-white/28 text-[10px] font-semibold tracking-widest uppercase hover:text-white/55 transition-colors duration-200"
              >
                How it works
                <span className="inline-block group-hover:translate-y-[3px] transition-transform duration-300">↓</span>
              </a>
            </div>

          </div>

          {/* Right: particle text effect */}
          <div className="w-full lg:w-[560px] lg:flex-shrink-0 animate-fade-in delay-200">
            <ParticleTextEffect
              words={HERO_WORDS}
              className="w-full"
              showDescription={false}
              canvasWidth={1000}
              canvasHeight={700}
              fontSize={160}
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
