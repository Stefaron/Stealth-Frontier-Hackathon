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
    <section className="min-h-svh flex flex-col relative">
      <div className="flex-1 flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 lg:gap-12 relative">
          <div className="flex-1 max-w-[520px] relative">
            <span className="hero-headline-glow" aria-hidden />

            <div className="flex items-center gap-2.5 mb-7 animate-fade-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-violet-400/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400/80" />
              </span>
              <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/35">
                Solana Frontier Hackathon · Umbra Track
              </p>
            </div>

            <h1
              className="leading-[0.9] tracking-tight mb-9 animate-fade-in-up relative"
              style={{ fontSize: "clamp(4rem, 8.5vw, 8rem)" }}
            >
              <span className="block font-bold text-white/75">Pay your</span>
              <span className="block">
                <span className="font-bold text-white">DAO </span>
                <span
                  className="font-serif-italic"
                  style={{ color: "rgba(255,255,255,0.50)", fontWeight: 400 }}
                >
                  privately.
                </span>
              </span>
            </h1>

            <p
              className="text-white/40 leading-relaxed mb-10 animate-fade-in-up delay-150"
              style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)", maxWidth: "34ch" }}
            >
              Confidential payroll for DAOs. Pay contributors with zero salary leaks — fully encrypted, auditable on demand, native to Solana.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
              <a
                href="/treasurer"
                className="hero-cta-primary group inline-flex items-center gap-3 bg-white pl-6 pr-1.5 py-1.5 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0d0c0a]">
                  Launch App
                </span>
                <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                  >
                    <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
              </a>

              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-1.5 text-white/35 text-[10px] font-semibold tracking-widest uppercase hover:text-white/80 transition-colors duration-300"
              >
                How it works
                <span className="inline-block group-hover:translate-y-[3px] transition-transform duration-400">↓</span>
              </a>
            </div>
          </div>

          <div className="w-full lg:w-[560px] lg:flex-shrink-0 animate-fade-in delay-200 relative">
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(167,139,250,0.10), transparent 70%)",
                filter: "blur(40px)",
              }}
            />
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

        <div className="hero-scroll-hint hidden md:flex">
          <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-white/45">
            Scroll
          </span>
        </div>
      </div>

      <div className="border-t border-white/[0.05] py-3.5 overflow-hidden relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
          style={{ background: "linear-gradient(90deg, #000, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
          style={{ background: "linear-gradient(-90deg, #000, transparent)" }}
        />
        <div
          className="animate-marquee whitespace-nowrap"
          style={{ display: "inline-flex", width: "max-content" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-8 text-[9px] font-mono tracking-[0.26em] uppercase text-white/22"
            >
              {item}
              <span className="ticker-dot" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
