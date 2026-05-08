"use client";

import Reveal from "./Reveal";

type Tone = "danger" | "warn" | "primary";

interface Card {
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  tone: Tone;
}

const CARDS: Card[] = [
  {
    tag: "Public ledgers",
    title: "Every salary on Solscan. Forever.",
    desc: "Standard payroll exposes every transfer.",
    bullets: ["Anyone sees contributor pay", "Competitors learn your runway", "Talent retention takes a hit"],
    tone: "danger",
  },
  {
    tag: "Anonymous mixers",
    title: "Private, but un-auditable.",
    desc: "Mixers hide everything — even from your accountant.",
    bullets: ["No way to prove totals", "Banks won't onboard you", "Regulatory risk piles up"],
    tone: "warn",
  },
  {
    tag: "Stealth",
    title: "Private by default. Auditable on demand.",
    desc: "The middle ground that DAOs actually need.",
    bullets: ["Encrypted balances on-chain", "Scoped, revocable read access", "Standard audit reports"],
    tone: "primary",
  },
];

const TONE: Record<Tone, {
  tagBg: string;
  tagText: string;
  iconBg: string;
  iconText: string;
  bullet: string;
  topAccent: string;
  halo: string;
}> = {
  danger: {
    tagBg: "bg-rose-50",
    tagText: "text-rose-700",
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    bullet: "text-rose-500",
    topAccent: "linear-gradient(90deg, transparent, rgba(244,63,94,0.55), transparent)",
    halo: "radial-gradient(circle, rgba(244,63,94,0.10), transparent 70%)",
  },
  warn: {
    tagBg: "bg-amber-50",
    tagText: "text-amber-700",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    bullet: "text-amber-500",
    topAccent: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)",
    halo: "radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)",
  },
  primary: {
    tagBg: "bg-zinc-900",
    tagText: "text-white",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    bullet: "text-emerald-600",
    topAccent: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(139,92,246,0.7), transparent)",
    halo: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
  },
};

const TONE_ICON: Record<Tone, React.ReactNode> = {
  danger: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  warn: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5L17 15H1L9 1.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 7v3M9 12h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  primary: (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5L15.5 4.5V11L9 16.5L2.5 11V4.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 9l2.5 2.5L13 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function ProblemSection() {
  return (
    <section id="why" className="cv-section relative py-24 md:py-32 px-5 md:px-8 bg-zinc-50/60 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-14">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              The problem
            </span>
            <h2
              className="mt-4 font-bold text-zinc-900 tracking-tight"
              style={{
                fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Public is broken. Anonymous is worse.
            </h2>
            <p className="mt-4 text-[14.5px] text-zinc-600 leading-relaxed">
              Most teams pick the lesser of two bad options. Stealth gives you the third.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {CARDS.map((c, i) => {
            const t = TONE[c.tone];
            const isPrimary = c.tone === "primary";
            return (
              <Reveal key={c.title} delay={i * 80} y={14}>
                <article
                  className={`group relative h-full p-6 cursor-default overflow-hidden ${
                    isPrimary ? "card-gradient spotlight-glow" : "card card-hover"
                  }`}
                  onMouseMove={
                    isPrimary
                      ? (e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                        }
                      : undefined
                  }
                >
                  {/* Top accent line */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
                    style={{ background: t.topAccent }}
                  />

                  {/* Hover halo */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500"
                    style={{ background: t.halo }}
                  />

                  <div className="relative flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-md grid place-items-center ${t.iconBg} ${t.iconText} icon-wiggle`}
                      >
                        {TONE_ICON[c.tone]}
                      </span>
                      <span
                        className={`inline-flex text-[10.5px] font-semibold tracking-wide uppercase rounded-full px-2.5 py-1 ${t.tagBg} ${t.tagText}`}
                      >
                        {c.tag}
                      </span>
                    </div>
                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <span className="relative flex h-1 w-1">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                          <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500" />
                        </span>
                        Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="relative text-[16px] font-semibold text-zinc-900 leading-snug mb-2 tracking-tight">
                    {c.title}
                  </h3>
                  <p className="relative text-[13px] leading-relaxed text-zinc-500 mb-5">{c.desc}</p>
                  <ul className="relative space-y-2">
                    {c.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-[13px] text-zinc-700"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className={`mt-0.5 flex-shrink-0 ${t.bullet}`}
                        >
                          {isPrimary ? (
                            <>
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
                              <path d="M3.5 7l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </>
                          ) : (
                            <>
                              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
                              <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            </>
                          )}
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
