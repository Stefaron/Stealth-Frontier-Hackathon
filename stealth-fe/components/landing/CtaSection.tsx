"use client";

import Link from "next/link";
import Reveal from "./Reveal";

const STATS = [
  { v: "<60s", l: "Setup time" },
  { v: "0", l: "On-chain leaks" },
  { v: "Free", l: "On devnet" },
];

export default function CtaSection() {
  return (
    <section className="cv-section relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Reveal y={20}>
          <div
            className="cta-card group relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white text-center px-7 py-16 md:px-16 md:py-20 transition-all duration-500 hover:border-zinc-300 hover:-translate-y-1"
            style={{ boxShadow: "0 40px 100px -40px rgba(11,13,18,0.18)" }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            {/* Aurora line on top */}
            <div aria-hidden className="absolute inset-x-0 top-0 aurora-line" />

            {/* Mouse-tracked spotlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.10), transparent 60%)",
              }}
            />

            {/* Multi-tone halo blobs — intensify on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full ambient-drift transition-all duration-700 group-hover:opacity-130 group-hover:scale-110"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(99,102,241,0.18), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full ambient-drift transition-all duration-700 group-hover:scale-110"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(139,92,246,0.14), transparent 70%)",
                animationDelay: "3s",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute top-12 right-1/4 w-[280px] h-[280px] rounded-full transition-opacity duration-700 group-hover:opacity-80"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(56,189,248,0.10), transparent 70%)",
              }}
            />

            {/* Subtle dot grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50"
              style={{
                maskImage:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent 75%)",
              }}
            />

            {/* Floating decorative chips */}
            <div
              aria-hidden
              className="chip-float-1 hidden md:flex items-center gap-1.5 absolute top-10 left-10 px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200 backdrop-blur-sm shadow-sm ambient-float transition-transform duration-500"
              style={{ animationDelay: "1s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10.5px] font-semibold text-zinc-700">Encrypted</span>
            </div>
            <div
              aria-hidden
              className="chip-float-2 hidden md:flex items-center gap-1.5 absolute top-12 right-10 px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200 backdrop-blur-sm shadow-sm ambient-float transition-transform duration-500"
              style={{ animationDelay: "2.5s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10.5px] font-semibold text-zinc-700">X25519</span>
            </div>
            <div
              aria-hidden
              className="chip-float-3 hidden md:flex items-center gap-1.5 absolute bottom-12 left-14 px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200 backdrop-blur-sm shadow-sm ambient-float transition-transform duration-500"
              style={{ animationDelay: "4s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10.5px] font-semibold text-zinc-700">Solana</span>
            </div>
            <div
              aria-hidden
              className="chip-float-4 hidden md:flex items-center gap-1.5 absolute bottom-14 right-16 px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200 backdrop-blur-sm shadow-sm ambient-float transition-transform duration-500"
              style={{ animationDelay: "5.5s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-[10.5px] font-semibold text-zinc-700">Auditable</span>
            </div>

            {/* Content */}
            <div className="relative">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-zinc-200 text-zinc-700 text-[11.5px] font-semibold backdrop-blur-sm shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Live on devnet · Free
              </span>

              <h2
                className="mt-6 font-bold text-zinc-900 tracking-tight"
                style={{
                  fontSize: "clamp(2.25rem, 4.4vw, 3.25rem)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.028em",
                }}
              >
                Start paying{" "}
                <span className="font-serif-italic" style={{ fontWeight: 400, color: "#6366f1" }}>
                  privately.
                </span>
              </h2>
              <p className="mt-5 text-[15px] text-zinc-500 max-w-md mx-auto">
                Connect, upload, send. Your team gets paid. Nobody else sees a thing.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href="/welcome"
                  className="press relative inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden"
                  style={{
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 30px -10px rgba(99,102,241,0.4)",
                  }}
                >
                  <span className="relative z-10">Launch app</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <path
                      d="M2 12L12 2M12 2H5M12 2V9"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Shimmer overlay */}
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      backgroundPosition: "-100% 0",
                      animation: "shimmer 1s ease-out forwards",
                    }}
                  />
                </Link>
                <a
                  href="#how-it-works"
                  className="press inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-300"
                >
                  How it works
                </a>
              </div>

              {/* Stats trio */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto">
                {STATS.map((s, i) => (
                  <div key={s.l} className="relative">
                    {i > 0 && (
                      <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-px h-8 bg-zinc-200" />
                    )}
                    <div className="text-[20px] md:text-[22px] font-bold text-zinc-900 tracking-tight tabular-nums">
                      {s.v}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
