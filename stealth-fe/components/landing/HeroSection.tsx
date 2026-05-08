"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ROLES = [
  { name: "Treasurer",   tag: "Pay your team privately",        href: "/treasurer" },
  { name: "Contributor", tag: "Receive encrypted payouts",      href: "/contributor" },
  { name: "Auditor",     tag: "Read scoped reports",            href: "/auditor" },
];

const TYPING_PHRASES = [
  "Pay engineering team",
  "Generate Q1 report",
  "Send marketing payout",
  "Grant auditor access",
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 md:pt-32 pb-20 md:pb-24 px-5 md:px-8 overflow-hidden">
      {/* Subtle dot-grid bg — masked radial fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid mask-radial"
      />
      {/* Soft halo — drifts ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 w-[800px] h-[420px] rounded-full -z-10 ambient-drift"
        style={{
          background:
            "radial-gradient(closest-side, rgba(99,102,241,0.10), transparent 70%)",
          transform: "translate(-50%, 0)",
        }}
      />
      {/* SVG accent paths */}
      <svg
        aria-hidden
        className="pointer-events-none absolute top-12 left-0 right-0 mx-auto -z-10 opacity-30"
        width="100%"
        height="500"
        viewBox="0 0 1200 500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroPathFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(99,102,241,0)" />
            <stop offset="50%" stopColor="rgba(99,102,241,0.3)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
        </defs>
        <path
          d="M-50 250 Q300 100, 600 250 T1250 250"
          fill="none"
          stroke="url(#heroPathFade)"
          strokeWidth="1"
        />
        <path
          d="M-50 320 Q300 470, 600 320 T1250 320"
          fill="none"
          stroke="url(#heroPathFade)"
          strokeWidth="1"
        />
      </svg>

      <div className="max-w-4xl mx-auto text-center">
        <a
          href="https://sdk.umbraprivacy.com/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-[12px] font-medium hover:border-zinc-300 hover:-translate-y-px transition-all duration-200 group"
        >
          <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
            New
          </span>
          <span className="w-px h-3 bg-zinc-200" />
          <span className="text-zinc-700">Built on Umbra SDK v4</span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            className="text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M3 6h6m-2-2l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <h1
          className="animate-fade-in-blur delay-100 mt-7 font-bold text-zinc-900 tracking-tight"
          style={{
            fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.028em",
          }}
        >
          Private payroll
          <br />
          <span className="font-serif-italic text-zinc-400" style={{ fontWeight: 400 }}>
            for modern teams.
          </span>
        </h1>

        <p
          className="animate-fade-in-up delay-200 mt-6 text-zinc-500 mx-auto max-w-[44ch]"
          style={{ fontSize: "clamp(15px, 1.1vw, 16.5px)", lineHeight: 1.55 }}
        >
          Pay your team without exposing salaries on-chain. Encrypted by default,
          auditable on demand.
        </p>

        <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/welcome" className="btn-primary press">
            Get started
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </Link>
          <a href="#how-it-works" className="btn-secondary press">
            How it works
          </a>
        </div>
      </div>

      <div className="animate-fade-in-up delay-400 mt-14 md:mt-16 max-w-2xl mx-auto ambient-float">
        <CommandPreview />
      </div>

      <div className="mt-10 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLES.map((r, i) => (
            <Link
              key={r.name}
              href={r.href}
              className="group relative r-card overflow-hidden p-4 flex items-center gap-3 animate-scale-in"
              style={{ animationDelay: `${550 + i * 90}ms` }}
            >
              {/* Hover accent halo */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                style={{
                  background:
                    i === 0
                      ? "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)"
                      : i === 1
                      ? "radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)"
                      : "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)",
                }}
              />
              {/* Top accent strip */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)"
                      : i === 1
                      ? "linear-gradient(90deg, transparent, rgba(56,189,248,0.7), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(16,185,129,0.7), transparent)",
                }}
              />

              <span className="relative w-10 h-10 rounded-xl bg-zinc-50 text-zinc-700 grid place-items-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  {r.name === "Treasurer" && (
                    <path d="M2 5h14M2 5l1.5 10h11L16 5M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {r.name === "Contributor" && (
                    <>
                      <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M3.5 16c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </>
                  )}
                  {r.name === "Auditor" && (
                    <>
                      <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </span>
              <div className="relative text-left flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-zinc-900 tracking-tight">{r.name}</div>
                <div className="text-[12px] text-zinc-500 truncate">{r.tag}</div>
              </div>
              <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-300">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommandPreview() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting">("typing");

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(TYPING_PHRASES[0]);
      return;
    }
    const target = TYPING_PHRASES[phraseIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typed.length < target.length) {
        timer = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 55);
      } else {
        timer = setTimeout(() => setPhase("hold"), 1400);
      }
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("deleting"), 0);
    } else {
      if (typed.length > 0) {
        timer = setTimeout(() => setTyped(typed.slice(0, -1)), 28);
      } else {
        timer = setTimeout(() => {
          setPhraseIdx((i) => (i + 1) % TYPING_PHRASES.length);
          setPhase("typing");
        }, 250);
      }
    }
    return () => clearTimeout(timer);
  }, [typed, phase, phraseIdx]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[24px] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(99,102,241,0.12), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="card overflow-hidden text-left"
        style={{ boxShadow: "0 24px 60px -32px rgba(11,13,18,0.18)" }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-200" />
            <span className="w-2 h-2 rounded-full bg-zinc-200" />
            <span className="w-2 h-2 rounded-full bg-zinc-200" />
            <span className="ml-2 text-[10.5px] font-mono text-zinc-400">stealth.app</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-zinc-400">
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </span>
        </div>

        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-zinc-400 flex-shrink-0">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[14px] text-zinc-700 flex-1 tabular-nums">
            {typed}
            <span className="inline-block w-px h-4 bg-zinc-700 ml-0.5 animate-caret align-middle" />
          </span>
        </div>

        <div className="py-2">
          <CmdRow
            kind="Action"
            label="Send private payment"
            sub="Bulk · 8 recipients · encrypted"
            shortcut="Enter"
            highlighted
            delay={0}
          />
          <CmdRow
            kind="Template"
            label="Monthly engineering payout"
            sub="$24,500 · 8 contributors"
            shortcut="↩"
            delay={70}
          />
          <CmdRow
            kind="Auditor"
            label="Generate Q1 report"
            sub="PDF · CSV · scoped read"
            shortcut="↩"
            delay={140}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-100 bg-zinc-50/60 text-[10.5px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="kbd">↩</span>
              run
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Devnet
          </span>
        </div>
      </div>
    </div>
  );
}

function CmdRow({
  kind,
  label,
  sub,
  shortcut,
  highlighted = false,
  delay = 0,
}: {
  kind: string;
  label: string;
  sub: string;
  shortcut: string;
  highlighted?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`group flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors duration-200 animate-slide-in-up ${
        highlighted ? "bg-zinc-900 text-white" : "hover:bg-zinc-50"
      }`}
      style={{ animationDelay: `${500 + delay}ms` }}
    >
      <span
        className={`text-[10px] font-semibold tracking-wider uppercase rounded px-1.5 py-0.5 ${
          highlighted
            ? "bg-white/15 text-white/85"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {kind}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-medium truncate ${highlighted ? "text-white" : "text-zinc-900"}`}>
          {label}
        </div>
        <div className={`text-[11px] truncate ${highlighted ? "text-white/55" : "text-zinc-500"}`}>
          {sub}
        </div>
      </div>
      <span className={`text-[10.5px] font-mono ${highlighted ? "text-white/55" : "text-zinc-400"}`}>
        {shortcut}
      </span>
    </div>
  );
}
