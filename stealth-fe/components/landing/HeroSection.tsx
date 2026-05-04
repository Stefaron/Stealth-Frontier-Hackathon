"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/hooks/useGsap";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";
import MagneticButton from "./MagneticButton";

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

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 });

    if (headlineRef.current) {
      const lines = headlineRef.current.querySelectorAll<HTMLElement>(".hero-line");
      if (lines.length) {
        gsap.set(lines, { y: 24, opacity: 0 });
        tl.to(lines, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        });
      }
    }

    if (subRef.current) {
      gsap.set(subRef.current, { opacity: 0, y: 18 });
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.5");
    }
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 16 });
      tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.4");
    }
    if (particleRef.current) {
      gsap.set(particleRef.current, { opacity: 0, scale: 0.94 });
      tl.to(
        particleRef.current,
        { opacity: 1, scale: 1, duration: 0.85, ease: "power3.out" },
        "-=0.7"
      );
    }
    if (tickerRef.current) {
      gsap.set(tickerRef.current, { opacity: 0 });
      tl.to(tickerRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");
    }
  }, []);

  return (
    <section className="min-h-svh flex flex-col relative">
      <div className="flex-1 flex items-center relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16 lg:gap-12 relative">
          <div className="flex-1 max-w-[520px] relative">
            <span className="hero-headline-glow" aria-hidden />

            <h1
              ref={headlineRef}
              className="leading-[0.9] tracking-tight mb-9 relative"
              style={{ fontSize: "clamp(3.5rem, 6.5vw, 6.25rem)" }}
            >
              <span className="hero-line block font-bold text-white/75">Pay your</span>
              <span className="hero-line block">
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
              ref={subRef}
              className="text-white/40 leading-relaxed mb-10"
              style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)", maxWidth: "34ch" }}
            >
              Confidential payroll for DAOs. Pay contributors with zero salary leaks — fully encrypted, auditable on demand, native to Solana.
            </p>

            <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
              <MagneticButton
                href="/welcome"
                strength={0.28}
                className="hero-cta-primary press group items-center gap-3 bg-white pl-6 pr-1.5 py-1.5 rounded-full transition-shadow duration-300 hover:shadow-[0_18px_50px_-18px_rgba(167,139,250,0.6)]"
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
              </MagneticButton>

              <a
                href="#how-it-works"
                className="press link-fill group inline-flex items-center gap-1.5 text-white/35 text-[10px] font-semibold tracking-widest uppercase hover:text-white/85 transition-colors duration-300"
              >
                How it works
                <span className="inline-block group-hover:translate-y-[3px] transition-transform duration-400">↓</span>
              </a>
            </div>
          </div>

          <div ref={particleRef} className="w-full lg:w-[560px] lg:flex-shrink-0 relative">
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
              canvasWidth={680}
              canvasHeight={480}
              fontSize={120}
            />
          </div>
        </div>

        <div className="hero-scroll-hint hidden md:flex">
          <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-white/45">
            Scroll
          </span>
        </div>
      </div>

      <div ref={tickerRef} className="border-t border-white/[0.05] py-3.5 overflow-hidden relative">
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
