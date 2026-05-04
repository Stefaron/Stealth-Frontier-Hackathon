"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import GsapReveal from "./GsapReveal";
import GsapStagger from "./GsapStagger";

interface Role {
  num: string;
  label: string;
  accent: string;
  accentSoft: string;
  headline: string;
  sub: string;
  icon: ReactNode;
}

const ROLES: Role[] = [
  {
    num: "01",
    label: "Treasurer",
    accent: "#a78bfa",
    accentSoft: "rgba(167,139,250,0.15)",
    headline: "Pay privately",
    sub: "CSV upload · tag recipients · multisig approval · bulk send.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5h14M2 5l1.5 10h11L16 5M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "02",
    label: "Contributor",
    accent: "#38bdf8",
    accentSoft: "rgba(56,189,248,0.15)",
    headline: "Receive privately",
    sub: "Encrypted balance. Withdraw anytime. No exposure.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 16c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    label: "Auditor",
    accent: "#34d399",
    accentSoft: "rgba(52,211,153,0.15)",
    headline: "Audit with scope",
    sub: "Scoped viewing key. Generate PDF report. Export CSV.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function RoleCard({ role }: { role: Role }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
      className="role-card relative h-full p-7 rounded-2xl border border-white/[0.06] bg-black overflow-hidden cursor-default"
      style={
        {
          "--accent": role.accent,
          "--accent-soft": role.accentSoft,
          "--mx": `${pos.x}%`,
          "--my": `${pos.y}%`,
        } as CSSProperties
      }
    >
      <span className="role-spotlight" />
      <span className="role-grid" />
      <span className="role-corner role-corner-tl" />
      <span className="role-corner role-corner-br" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-7">
          <span
            className="role-num font-mono text-[11px] font-bold tracking-widest"
            style={{ color: role.accent }}
          >
            {role.num}
          </span>
          <div
            className="role-icon w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{
              color: role.accent,
              background: role.accentSoft,
              borderColor: `${role.accent}33`,
            }}
          >
            {role.icon}
          </div>
        </div>

        <span
          className="role-label text-[8px] font-bold tracking-[0.22em] uppercase block mb-2.5"
          style={{ color: role.accent }}
        >
          {role.label}
        </span>

        <h3 className="role-headline text-xl font-bold text-white mb-2.5">{role.headline}</h3>

        <p className="text-sm text-white/40 leading-relaxed">{role.sub}</p>

        <div className="role-bar mt-6">
          <span className="role-bar-fill" style={{ background: `linear-gradient(90deg, ${role.accent}, transparent)` }} />
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <GsapReveal y={20} duration={0.55}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-sky-400/60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400/80" />
                </span>
                <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/30">
                  How it works
                </p>
              </div>
            </GsapReveal>
            <GsapReveal delay={0.1} y={28} duration={0.7}>
              <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-xl">
                Three roles.{" "}
                <span className="font-serif-italic text-white/35" style={{ fontWeight: 400 }}>One private</span>{" "}
                payroll.
              </h2>
            </GsapReveal>
          </div>
        </div>

        <GsapStagger
          className="grid md:grid-cols-3 gap-4"
          stagger={0.1}
          duration={0.7}
          y={32}
          scale={0.95}
          ease="back.out(1.4)"
          delay={0.1}
        >
          {ROLES.map((role) => (
            <RoleCard key={role.label} role={role} />
          ))}
        </GsapStagger>
      </div>
    </section>
  );
}
