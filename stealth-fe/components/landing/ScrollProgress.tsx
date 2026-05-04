"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? h.scrollTop / max : 0;
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
        if (dotRef.current) dotRef.current.style.left = `${p * 100}%`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
      <div className="absolute inset-0 bg-white/[0.04]" />
      <div
        ref={barRef}
        className="absolute inset-0 origin-left"
        style={{
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, #a78bfa 0%, #38bdf8 35%, #34d399 70%, #fbbf24 100%)",
          boxShadow: "0 0 12px rgba(167,139,250,0.5)",
        }}
      />
      <div
        ref={dotRef}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{
          left: "0%",
          background: "#fff",
          boxShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(167,139,250,0.6)",
        }}
      />
    </div>
  );
}
