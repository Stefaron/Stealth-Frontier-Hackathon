"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "./Reveal";

type Cat = "All" | "Privacy" | "Compliance" | "Workflow" | "Security";

interface Feature {
  cat: Exclude<Cat, "All">;
  title: string;
  desc: string;
  icon: ReactNode;
}

const FEATURES: Feature[] = [
  {
    cat: "Privacy",
    title: "Bulk private payroll",
    desc: "Pay dozens at once. Amounts and recipients stay confidential.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15 5.5v7L9 16l-6-3.5v-7L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    cat: "Compliance",
    title: "Scoped auditor access",
    desc: "Read-only access with date ranges and one-click revocation.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L15.5 5.5V12L9 15.5L2.5 12V5.5L9 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l2.5 2.5L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: "Workflow",
    title: "CSV upload & tagging",
    desc: "Drop in a spreadsheet. Tag by team, role, or jurisdiction.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 4h12M3 8h8M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cat: "Compliance",
    title: "PDF + CSV export",
    desc: "Signed payroll reports in seconds. CSV for auditor, PDF for treasury.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h5M6 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cat: "Security",
    title: "Sanctions screening",
    desc: "Every recipient checked against OFAC lists before broadcast.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5V8l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cat: "Security",
    title: "Wallet-based identity",
    desc: "No emails, no passwords. Your wallet signs every action.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="7" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="11.5" r="1.25" fill="currentColor" />
      </svg>
    ),
  },
];

const CATS: Cat[] = ["All", "Privacy", "Compliance", "Workflow", "Security"];

export default function FeaturesSection() {
  const [active, setActive] = useState<Cat>("All");
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Record<Cat, HTMLButtonElement | null>>({} as never);
  const first = useRef(true);

  useLayoutEffect(() => {
    const btn = btnRefs.current[active];
    const ind = indicatorRef.current;
    const track = trackRef.current;
    if (!btn || !ind || !track) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || first.current) {
      ind.style.transition = "none";
    } else {
      ind.style.transition =
        "transform 320ms cubic-bezier(0.16,1,0.3,1), width 320ms cubic-bezier(0.16,1,0.3,1)";
    }
    const tr = track.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    ind.style.opacity = "1";
    ind.style.transform = `translateX(${br.left - tr.left}px)`;
    ind.style.width = `${br.width}px`;
    first.current = false;
  }, [active]);

  const visible =
    active === "All" ? FEATURES : FEATURES.filter((f) => f.cat === active);

  return (
    <section id="features" className="cv-section relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Features
              </span>
              <h2
                className="mt-4 font-bold text-zinc-900 tracking-tight"
                style={{
                  fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                Everything you need. Nothing you don&apos;t.
              </h2>
            </div>
            <Reveal y={8}>
              <div
                ref={trackRef}
                className="relative inline-flex items-center gap-1 p-1 rounded-full border border-zinc-200 bg-white"
              >
                <span
                  ref={indicatorRef}
                  className="absolute top-1 bottom-1 left-0 rounded-full bg-zinc-900 pointer-events-none z-0 opacity-0"
                  style={{ width: 0, transform: "translateX(0)" }}
                />
                {CATS.map((c) => (
                  <button
                    key={c}
                    ref={(el) => { btnRefs.current[c] = el; }}
                    onClick={() => setActive(c)}
                    data-active={active === c}
                    className="chip relative z-10"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((f, i) => (
            <Reveal key={f.title} delay={i * 50} y={12}>
              <article className="group h-full card card-hover p-5 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-lg bg-zinc-50 text-zinc-700 grid place-items-center group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300 icon-wiggle">
                    {f.icon}
                  </span>
                  <span className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-400">
                    {f.cat}
                  </span>
                </div>
                <h3 className="text-[14.5px] font-semibold text-zinc-900 mb-1 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-zinc-500">{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
