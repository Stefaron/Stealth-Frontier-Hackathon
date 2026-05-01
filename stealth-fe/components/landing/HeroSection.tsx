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
      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full px-6 md:px-8 pt-24 pb-10 md:pt-28 md:pb-12">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-10 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-glow" />
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/28">
            Umbra Side Track · Solana Frontier 2026
          </span>
        </div>

        {/* Particle canvas — main hero visual */}
        <div className="w-full animate-fade-in delay-200">
          <ParticleTextEffect
            words={HERO_WORDS}
            className="w-full"
            showDescription={false}
          />
        </div>

        {/* Sub + CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mt-10 animate-fade-in-up delay-400">
          <p className="text-white/32 text-[15px] leading-relaxed text-center sm:text-left max-w-xs">
            Confidential payroll for DAOs. Built on the Umbra SDK.
          </p>
          <div className="flex items-center gap-4 flex-shrink-0">
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
