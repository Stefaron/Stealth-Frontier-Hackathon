"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < 1024) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      const dx = tx - cx;
      const dy = ty - cy;
      cx += dx * 0.14;
      cy += dy * 0.14;
      el.style.transform = `translate3d(${cx - 180}px, ${cy - 180}px, 0)`;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        active = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden />;
}
