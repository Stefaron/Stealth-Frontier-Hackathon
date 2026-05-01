"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc: string;
}

const STATS: StatItem[] = [
  { value: 0,   suffix: "",  label: "Salary leaks",      desc: "Plaintext exposure on-chain" },
  { value: 4,   suffix: "",  label: "Umbra primitives",  desc: "Every primitive fully used" },
  { value: 3,   suffix: "",  label: "Roles",             desc: "Treasurer · Contributor · Auditor" },
  { value: 100, suffix: "%", label: "Auditor-ready",     desc: "Compliance built in by design" },
];

function Counter({ value, prefix = "", suffix = "", label, desc, index }: StatItem & { prefix?: string; index: number }) {
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(el); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || value === 0) { setCount(0); return; }
    const steps = 40;
    let step    = 0;
    const id = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.round(value * ease));
      if (step >= steps) clearInterval(id);
    }, 1200 / steps);
    return () => clearInterval(id);
  }, [started, value]);

  return (
    <div
      ref={ref}
      className={`py-10 md:py-14 ${index > 0 ? "border-t md:border-t-0 md:border-l border-[#d9d5cc] pl-0 md:pl-10" : ""} ${index === 0 ? "md:pr-10" : index === STATS.length - 1 ? "md:pl-10" : "md:px-10"}`}
    >
      <div className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold text-[#0c0b09] tracking-tight leading-none mb-1.5 tabular-nums">
        {prefix}{count}{suffix}
      </div>
      <p className="text-sm font-semibold text-[#0c0b09] mb-1">{label}</p>
      <p className="text-[11px] text-[#a09d98] tracking-wide">{desc}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-b border-[#d9d5cc]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Counter key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
