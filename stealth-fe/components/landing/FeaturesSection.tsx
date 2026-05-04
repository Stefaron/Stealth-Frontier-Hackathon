"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import GsapReveal from "./GsapReveal";
import GsapStagger from "./GsapStagger";

interface Feature {
  label: string;
  headline: string;
  sub: string;
  accent: string;
  accentSoft: string;
  icon: ReactNode;
}

const FEATURES: Feature[] = [
  {
    label: "Privacy",
    headline: "Bulk confidential payroll",
    sub: "Encrypted token accounts. Recipients invisible on-chain. Pay 200 contributors in one tx.",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15 5.5v7L9 16l-6-3.5v-7L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Compliance",
    headline: "Scoped auditor grants",
    sub: "X25519 viewing keys. Read-only access by date range, scope, recipient — revocable any time.",
    accent: "#38bdf8",
    accentSoft: "rgba(56,189,248,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15.5 5.5V12L9 15.5L2.5 12V5.5L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Workflow",
    headline: "CSV upload & tagging",
    sub: "Drop a CSV. Tag rows by team, role, jurisdiction. Validate addresses before signing.",
    accent: "#34d399",
    accentSoft: "rgba(52,211,153,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 4h12M3 8h8M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Audit",
    headline: "PDF + CSV export",
    sub: "Generate signed payroll reports. Auditor ingests CSV. Treasury keeps the PDF for the books.",
    accent: "#fbbf24",
    accentSoft: "rgba(251,191,36,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h5M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Security",
    headline: "OFAC screening",
    sub: "Sanctions list checked client-side before broadcast. Flagged rows blocked, never signed.",
    accent: "#f87171",
    accentSoft: "rgba(248,113,113,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5V8l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Auth",
    headline: "Wallet-native identity",
    sub: "No emails. No accounts. Wallet signs every action — ed25519 deterministic identity.",
    accent: "#f472b6",
    accentSoft: "rgba(244,114,182,0.18)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="7" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="11.5" r="1.25" fill="currentColor" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 relative" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <GsapReveal y={20} duration={0.55}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-violet-400/60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400/80" />
                </span>
                <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/30">
                  Features
                </p>
              </div>
            </GsapReveal>
            <GsapReveal delay={0.1} y={28} duration={0.7}>
              <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-xl">
                Everything DAOs need.{" "}
                <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
                  Nothing more.
                </span>
              </h2>
            </GsapReveal>
          </div>

          <GsapReveal delay={0.18} x={28} y={0} duration={0.6}>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/25">
              <span>Hover any row</span>
              <span className="w-6 h-px bg-white/15" />
              <span className="text-white/45">{active !== null ? String(active + 1).padStart(2, "0") : "—"}</span>
              <span className="text-white/25">/</span>
              <span>{String(FEATURES.length).padStart(2, "0")}</span>
            </div>
          </GsapReveal>
        </div>

        <div className="relative">
          <div
            className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            style={{ backgroundSize: "200% 100%", animation: "shimmerLine 6s linear infinite" }}
          />

          <GsapStagger stagger={0.07} duration={0.55} y={24} delay={0.08}>
            {FEATURES.map((f, i) => (
              <div
                key={f.headline}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="feature-row flex items-center gap-5 md:gap-8 py-6 px-4 md:px-5 -mx-3 border-b border-white/[0.05] cursor-default"
                style={
                  {
                    "--accent": f.accentSoft,
                    "--accent-solid": f.accent,
                  } as CSSProperties
                }
              >
                <span className="feat-num font-mono text-[20px] md:text-[24px] font-bold tracking-tight w-12 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className="text-[8px] font-bold tracking-[0.24em] uppercase w-24 flex-shrink-0 hidden sm:block transition-colors duration-300"
                  style={{ color: active === i ? f.accent : "rgba(255,255,255,0.30)" }}
                >
                  {f.label}
                </span>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white/80 text-[15px] md:text-base transition-colors duration-300 group-hover:text-white">
                    {f.headline}
                  </h3>
                  <div className="feat-sub">
                    <p className="text-[12px] text-white/45 leading-relaxed mt-1.5 max-w-md">
                      {f.sub}
                    </p>
                  </div>
                </div>

                <div
                  className="feat-icon-wrap w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0"
                  style={{ color: active === i ? f.accent : "rgba(255,255,255,0.45)" }}
                >
                  {f.icon}
                </div>

                <span
                  className="feat-arrow font-mono text-xs flex-shrink-0 hidden md:inline-block"
                  style={{ color: f.accent }}
                >
                  →
                </span>
              </div>
            ))}
          </GsapStagger>
        </div>
      </div>
    </section>
  );
}
