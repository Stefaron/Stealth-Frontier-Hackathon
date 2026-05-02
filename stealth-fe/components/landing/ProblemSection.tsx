"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Code2, ShieldCheck } from "lucide-react";
import { PixelCanvas } from "@/components/ui/pixel-canvas";

function RevealUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [v, setV] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); io.unobserve(el); } },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  );
}

const BROKEN = [
  {
    ord: "01",
    name: "Realms / Squads",
    tag: "Fully public",
    issue: "Every salary on Solscan. Forever.",
  },
  {
    ord: "02",
    name: "Tornado-style",
    tag: "Anonymous",
    issue: "Private, but zero auditability.",
  },
];

function handleCardPointerMove(event: MouseEvent<HTMLDivElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const rotateX = -((y - 50) / 50) * 4;
  const rotateY = ((x - 50) / 50) * 4;

  card.style.setProperty("--pointer-x", `${x}%`);
  card.style.setProperty("--pointer-y", `${y}%`);
  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.015)`;
}

function handleCardPointerLeave(event: MouseEvent<HTMLDivElement>) {
  const card = event.currentTarget;

  card.style.setProperty("--pointer-x", "50%");
  card.style.setProperty("--pointer-y", "50%");
  card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
}

export default function ProblemSection() {
  return (
    <section className="bg-black py-24 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 md:px-8">

        {/* Section label */}
        <RevealUp>
          <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/18 mb-6">
            The Problem
          </p>
        </RevealUp>

        {/* Headline */}
        <RevealUp delay={70}>
          <h2
            className="font-bold text-white leading-[0.97] tracking-tight mb-16"
            style={{ fontSize: "clamp(2.75rem, 5.5vw, 4.25rem)" }}
          >
            Two broken options.
            <br />
            <span className="font-serif-italic text-white/32" style={{ fontWeight: 400 }}>
              One missing middle.
            </span>
          </h2>
        </RevealUp>

        {/* Broken options - hover cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {BROKEN.map((opt, i) => (
            <RevealUp key={opt.name} delay={120 + i * 70}>
              <article className="problem-card-shell">
                <span className="problem-card-light problem-card-light-a" />
                <span className="problem-card-light problem-card-light-b" />
                <div
                  tabIndex={0}
                  aria-label={`${opt.name}: ${opt.issue}`}
                  onMouseMove={handleCardPointerMove}
                  onMouseLeave={handleCardPointerLeave}
                  style={
                    {
                      "--pointer-x": "50%",
                      "--pointer-y": "50%",
                      transform:
                        "perspective(900px) rotateX(0deg) rotateY(0deg)",
                    } as CSSProperties
                  }
                  className="group relative z-10 aspect-square w-full cursor-pointer overflow-hidden rounded-[32px] border border-white/[0.09] bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out [transform-style:preserve-3d] [will-change:transform] hover:border-[#0ea5e9] hover:shadow-[0_34px_95px_-42px_rgba(14,165,233,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:border-[#0ea5e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0ea5e9]/45"
                >
                  <PixelCanvas
                    gap={10}
                    speed={25}
                    colors={["#e0f2fe", "#7dd3fc", "#0ea5e9"]}
                    variant="icon"
                  />

                  <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_42%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_50%_58%,rgba(255,255,255,0.045),transparent_34%)] opacity-70 animate-pulse-glow transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-0 z-0 opacity-[0.11] transition-opacity duration-300 group-hover:opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle, rgba(125, 211, 252, 0.72) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                  <span className="pointer-events-none absolute inset-x-12 top-10 z-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60" />
                  <span className="pointer-events-none absolute inset-x-12 bottom-10 z-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                  <span className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_52%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-0 z-10 bg-black/42 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span
                    className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{
                      background:
                        "radial-gradient(380px circle at var(--pointer-x) var(--pointer-y), rgba(14, 165, 233, 0.26), transparent 46%)",
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-[-24%] left-[-42%] z-20 w-[34%] rotate-12 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[430%] group-hover:opacity-100 group-focus-visible:translate-x-[430%] group-focus-visible:opacity-100" />

                  <span className="pointer-events-none absolute left-7 right-7 top-7 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-[#0ea5e9] via-[#7dd3fc]/70 to-transparent transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                  <span className="pointer-events-none absolute bottom-7 left-7 right-7 z-20 h-px origin-right scale-x-0 bg-gradient-to-l from-[#0ea5e9] via-[#7dd3fc]/70 to-transparent transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100" />

                  <span className="pointer-events-none absolute left-6 top-6 z-20 h-8 w-8 rounded-tl-[14px] border-l border-t border-[#0ea5e9]/0 transition-colors duration-300 group-hover:border-[#0ea5e9]/70 group-focus-visible:border-[#0ea5e9]/70" />
                  <span className="pointer-events-none absolute right-6 top-6 z-20 h-8 w-8 rounded-tr-[14px] border-r border-t border-[#0ea5e9]/0 transition-colors duration-300 group-hover:border-[#0ea5e9]/70 group-focus-visible:border-[#0ea5e9]/70" />
                  <span className="pointer-events-none absolute bottom-6 left-6 z-20 h-8 w-8 rounded-bl-[14px] border-b border-l border-[#0ea5e9]/0 transition-colors duration-300 group-hover:border-[#0ea5e9]/70 group-focus-visible:border-[#0ea5e9]/70" />
                  <span className="pointer-events-none absolute bottom-6 right-6 z-20 h-8 w-8 rounded-br-[14px] border-b border-r border-[#0ea5e9]/0 transition-colors duration-300 group-hover:border-[#0ea5e9]/70 group-focus-visible:border-[#0ea5e9]/70" />

                  <div className="pointer-events-none absolute left-6 right-6 top-6 z-20 flex items-start justify-between gap-5 opacity-65 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:left-8 md:right-8 md:top-8">
                    <span className="font-mono text-[9px] tracking-[0.22em] text-white/32 transition-colors duration-300 group-hover:text-white/60">
                      {opt.ord}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28 transition-colors duration-300 group-hover:text-[#7dd3fc]">
                      {opt.tag}
                    </span>
                  </div>

                  <div className="relative z-20 flex h-full w-full items-center justify-center">
                    <span className="pointer-events-none absolute h-24 w-24 rotate-45 rounded-[20px] border border-white/[0.045] opacity-70 animate-float transition-all duration-300 group-hover:h-32 group-hover:w-32 group-hover:border-[#0ea5e9]/30 group-hover:opacity-100 group-focus-visible:h-32 group-focus-visible:w-32 group-focus-visible:border-[#0ea5e9]/30 group-focus-visible:opacity-100" />
                    <Code2
                      aria-hidden="true"
                      strokeWidth={2.6}
                      className="relative h-16 w-16 animate-float text-white/55 drop-shadow-[0_0_16px_rgba(255,255,255,0.08)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-[#0ea5e9] group-hover:drop-shadow-[0_0_22px_rgba(14,165,233,0.55)] group-focus-visible:-translate-y-1 group-focus-visible:scale-110 group-focus-visible:text-[#0ea5e9] group-focus-visible:drop-shadow-[0_0_22px_rgba(14,165,233,0.55)] md:h-20 md:w-20"
                    />
                  </div>

                  <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-20 translate-y-1 opacity-70 transition-all delay-75 duration-400 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:bottom-8 md:left-8 md:right-8">
                    <h3 className="max-w-[13rem] text-2xl font-semibold leading-[1] tracking-tight text-white/72 transition-colors duration-300 group-hover:text-white md:text-3xl">
                      {opt.name}
                    </h3>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/36 transition-colors duration-300 group-hover:text-white/62">
                      {opt.issue}
                    </p>
                  </div>
                </div>
              </article>
            </RevealUp>
          ))}
        </div>

        {/* Stealth - breaks the pattern entirely */}
        <RevealUp delay={290}>
          <div className="pt-14 md:pt-18">

            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(360px,500px)] md:items-center">
              <div>
                {/* Hero statement */}
                <h3
                  className="font-bold text-white leading-[0.95] tracking-tight"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
                >
                  Private by default.
                  <br />
                  <span
                    className="font-serif-italic text-white/35"
                    style={{ fontWeight: 400 }}
                  >
                    Auditable on demand.
                  </span>
                </h3>

                <p className="text-sm text-white/25 mt-5 max-w-sm leading-relaxed">
                  Confidential transfers, selective disclosure - the only payroll tool that gives DAOs both privacy and compliance.
                </p>
              </div>

              <div className="w-full max-w-[500px] justify-self-start md:justify-self-end">
                <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.94] p-5 text-[#0d0c0a] shadow-[0_24px_80px_-44px_rgba(255,255,255,0.45)] transition-transform duration-300 hover:-translate-y-1">
                  <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-700 group-hover:left-[115%] group-hover:opacity-100" />

                  <div className="flex items-center justify-between gap-6">
                    <span className="text-xs font-medium text-black/42">
                      Audit Mode
                    </span>
                    <span className="text-xs font-bold text-black/34">
                      (ZK-PAYROLL)
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)]">
                        <ShieldCheck aria-hidden="true" className="h-5 w-5" strokeWidth={2.4} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-2xl font-bold leading-none tracking-tight md:text-3xl">
                          Proof ready
                        </p>
                        <p className="mt-2 text-xs font-medium text-black/40">
                          Selective disclosure without public salary leaks.
                        </p>
                      </div>
                    </div>
                    <span className="hidden rounded-full bg-black/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black/45 sm:inline-flex">
                      Private
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/34">
                    Encrypted transfers
                  </div>

                  {/* CTA */}
                  <a
                    href="#how-it-works"
                    className="group inline-flex items-center gap-3 self-start rounded-full bg-white py-1.5 pl-6 pr-1.5 transition-all duration-200 hover:scale-[1.02] hover:bg-white/92 active:scale-[0.98] sm:self-auto"
                  >
                    <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-[#0d0c0a]">
                      See how
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black transition-colors duration-200 group-hover:bg-black">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </RevealUp>

      </div>
    </section>
  );
}
