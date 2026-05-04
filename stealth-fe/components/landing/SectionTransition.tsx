"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  parallax?: number;
}

export default function SectionTransition({ children, className = "", parallax = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translate3d(0, 40px, 0)";
    el.style.willChange = "transform, opacity";

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition =
            "opacity 900ms cubic-bezier(0.16,1,0.3,1), transform 900ms cubic-bezier(0.16,1,0.3,1)";
          el.style.opacity = "1";
          el.style.transform = "translate3d(0, 0, 0)";
          io.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);

    let raf = 0;
    const onScroll = () => {
      if (!parallax || !inner) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = r.top + r.height / 2 - vh / 2;
        const ratio = Math.max(-1, Math.min(1, center / vh));
        inner.style.transform = `translate3d(0, ${-ratio * parallax}px, 0)`;
      });
    };
    if (parallax) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return () => {
      io.disconnect();
      if (parallax) window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [parallax]);

  return (
    <div ref={ref} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
