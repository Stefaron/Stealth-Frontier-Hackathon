"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  desc: string;
  ord: string;
  accent: string;
  icon: ReactNode;
}

const STATS: Stat[] = [
  {
    value: 0,
    suffix: "",
    label: "Salary leaks",
    desc: "Plaintext exposure on-chain",
    ord: "01",
    accent: "#a78bfa",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M5.5 5.5l-2.5 2.5 2.5 2.5M10.5 5.5l2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: 4,
    suffix: "",
    label: "Umbra primitives",
    desc: "Every primitive fully used",
    ord: "02",
    accent: "#38bdf8",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L13.5 4.5V11L8 14L2.5 11V4.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 5L11 6.5V9.5L8 11L5 9.5V6.5L8 5Z" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    value: 3,
    suffix: "",
    label: "Roles",
    desc: "Treasurer · Contributor · Auditor",
    ord: "03",
    accent: "#34d399",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 13c0-2 1.5-3.2 3-3.2M14 13c0-2-1.5-3.2-3-3.2M5 13.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 100,
    suffix: "%",
    label: "Auditor-ready",
    desc: "Compliance built in by design",
    ord: "04",
    accent: "#fbbf24",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L13 4v4.5c0 3.5-2.5 5.5-5 6.5-2.5-1-5-3-5-6.5V4l5-2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function StatItem({ stat, i }: { stat: Stat; i: number }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), i * 220);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [i]);

  useEffect(() => {
    if (!visible || stat.value === 0) {
      setCount(0);
      return;
    }
    const steps = 60;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.round(stat.value * ease));
      if (step >= steps) clearInterval(id);
    }, 1500 / steps);
    return () => clearInterval(id);
  }, [visible, stat.value]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  const delay = i * 220;
  const fillRatio = stat.value === 0 ? 1 : count / stat.value;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
      className="stat-item group relative pt-10 pb-12 px-6 md:px-8 cursor-default"
      style={
        {
          "--accent": stat.accent,
          "--mx": `${pos.x}%`,
          "--my": `${pos.y}%`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(60px) scale(0.94)",
          filter: visible ? "blur(0px)" : "blur(8px)",
          transition: `opacity 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.7s ease ${delay}ms`,
        } as CSSProperties
      }
    >
      <span className="stat-spotlight" />
      <span
        className="stat-divider"
        style={{ display: i > 0 ? "block" : "none" }}
      />
      <span className="stat-rule" />
      <span
        className="stat-rule-fill"
        style={{
          width: visible ? "100%" : "0%",
          transition: `width 1.1s cubic-bezier(0.16,1,0.3,1) ${delay + 150}ms`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-9">
          <span className="font-mono text-[9px] tracking-[0.28em] text-white/20 select-none">
            {stat.ord}
          </span>
          <div
            className="stat-icon w-7 h-7 rounded-lg border flex items-center justify-center"
            style={{
              color: stat.accent,
              borderColor: `${stat.accent}33`,
              background: `${stat.accent}10`,
            }}
          >
            {stat.icon}
          </div>
        </div>

        <div className="relative mb-5">
          <div
            className="stat-number font-bold tabular-nums leading-none"
            style={{
              fontSize: "clamp(3.25rem, 4.5vw, 5.5rem)",
              color: "#ffffff",
            }}
          >
            {count}
            <span style={{ color: stat.accent, opacity: 0.85 }}>{stat.suffix}</span>
          </div>
          <div
            className="stat-glow"
            style={{
              background: `radial-gradient(60% 80% at 30% 50%, ${stat.accent}40, transparent 70%)`,
            }}
          />
        </div>

        <div className="stat-progress mb-5">
          <span
            className="stat-progress-fill"
            style={{
              transform: `scaleX(${fillRatio})`,
              background: `linear-gradient(90deg, ${stat.accent}, ${stat.accent}55)`,
              transition: `transform 1.5s cubic-bezier(0.16,1,0.3,1) ${delay + 150}ms`,
            }}
          />
        </div>

        <p className="stat-label text-sm font-semibold text-white/70 mb-2 transition-colors duration-300">
          {stat.label}
        </p>
        <p className="text-[11px] text-white/30 tracking-wide leading-relaxed">{stat.desc}</p>
      </div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="relative border-b border-white/[0.06] overflow-hidden pt-20 md:pt-28 pb-6 md:pb-10">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, rgba(167,139,250,0.6), transparent 35%), radial-gradient(circle at 85% 50%, rgba(56,189,248,0.6), transparent 35%)",
        }}
      />
      <div className="max-w-7xl mx-auto relative px-6 md:px-8">
        <div className="flex items-center gap-2.5 mb-12 md:mb-16">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-violet-400/60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400/80" />
          </span>
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/30">
            By the numbers
          </p>
          <span className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/[0.04] to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4">
          {STATS.map((s, i) => (
            <StatItem key={s.label} stat={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
