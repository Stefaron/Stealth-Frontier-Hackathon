"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 0,   suffix: "",  label: "Plaintext salary leaks" },
  { value: 4,   suffix: "",  label: "Umbra primitives used" },
  { value: 3,   suffix: "",  label: "Roles, one platform" },
  { value: 100, suffix: "%", label: "Auditor-ready by design" },
];

function Counter({ value, prefix = "", suffix = "", label }: Stat & { prefix?: string }) {
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || value === 0) {
      setCount(0);
      return;
    }
    const duration = 1100;
    const steps    = 36;
    let step       = 0;

    const id = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * ease));
      if (step >= steps) clearInterval(id);
    }, duration / steps);

    return () => clearInterval(id);
  }, [started, value]);

  return (
    <div ref={ref} className="text-center md:text-left">
      <div className="text-[2.75rem] md:text-[3.5rem] font-bold text-[#0d0d0d] tracking-tight leading-none mb-1.5 tabular-nums">
        {prefix}{count}{suffix}
      </div>
      <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#9ca3af]">
        {label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
        {STATS.map((s) => (
          <Counter key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
