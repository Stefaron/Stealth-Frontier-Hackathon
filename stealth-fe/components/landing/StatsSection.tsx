"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 0,   suffix: "",  label: "Salary leaks",    desc: "Plaintext exposure on-chain",      ord: "01" },
  { value: 4,   suffix: "",  label: "Umbra primitives", desc: "Every primitive fully used",        ord: "02" },
  { value: 3,   suffix: "",  label: "Roles",            desc: "Treasurer · Contributor · Auditor", ord: "03" },
  { value: 100, suffix: "%", label: "Auditor-ready",   desc: "Compliance built in by design",     ord: "04" },
];

function StatItem({
  value, suffix, label, desc, ord, i,
}: (typeof STATS)[0] & { i: number }) {
  const [count, setCount]     = useState(0);
  const [visible, setVisible] = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), i * 90);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [i]);

  useEffect(() => {
    if (!visible || value === 0) { setCount(0); return; }
    const steps = 52;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.round(value * ease));
      if (step >= steps) clearInterval(id);
    }, 1400 / steps);
    return () => clearInterval(id);
  }, [visible, value]);

  const delay = i * 90;

  return (
    <div
      ref={ref}
      className={`relative pt-8 pb-12 ${i > 0 ? "md:border-l border-white/[0.06] md:pl-10" : ""} ${i < STATS.length - 1 ? "md:pr-10" : ""} border-t border-white/[0.06] md:border-t-0`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {/* Animated rule on top — desktop only */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div
        className="hidden md:block absolute top-0 left-0 h-px bg-white/50"
        style={{
          width: visible ? "100%" : "0%",
          transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${delay + 120}ms`,
        }}
      />

      {/* Ordinal */}
      <span className="block font-mono text-[9px] tracking-[0.24em] text-white/12 mb-8 select-none">
        {ord}
      </span>

      {/* Number */}
      <div
        className="font-bold text-white tabular-nums leading-none mb-4"
        style={{ fontSize: "clamp(3.25rem, 4.5vw, 5.5rem)" }}
      >
        {count}{suffix}
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-white/55 mb-1.5">{label}</p>

      {/* Desc */}
      <p className="text-[11px] text-white/22 tracking-wide leading-relaxed">{desc}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {STATS.map((s, i) => (
            <StatItem key={s.label} {...s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
