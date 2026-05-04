"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  href?: string;
  strength?: number;
  as?: "a" | "div";
}

export default function MagneticButton({
  children,
  className,
  href,
  strength = 0.32,
  as = "a",
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - (r.left + r.width / 2);
      const py = e.clientY - (r.top + r.height / 2);
      tx = px * strength;
      ty = py * strength;
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
    };

    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      if (active) return;
      active = true;
      raf = requestAnimationFrame(tick);
    };

    const onLeaveStop = () => {
      onLeave();
      setTimeout(() => {
        if (Math.abs(cx) < 0.5 && Math.abs(cy) < 0.5) {
          cancelAnimationFrame(raf);
          active = false;
          el.style.transform = "translate3d(0,0,0)";
        }
      }, 400);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeaveStop);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeaveStop);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  if (as === "a" && href) {
    return (
      <a ref={ref} href={href} className={className} style={{ display: "inline-flex" }}>
        {children}
      </a>
    );
  }
  return (
    <div ref={ref} className={className} style={{ display: "inline-flex" }}>
      {children}
    </div>
  );
}
