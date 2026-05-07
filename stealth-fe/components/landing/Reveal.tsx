"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  delay?: number;
  y?: number;
  blur?: boolean;
}

export default function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  y = 18,
  blur = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;
    if (blur) el.style.filter = "blur(6px)";
    el.style.willChange = "opacity, transform, filter";

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = `opacity 750ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 750ms cubic-bezier(0.16,1,0.3,1) ${delay}ms${
            blur ? `, filter 750ms cubic-bezier(0.16,1,0.3,1) ${delay}ms` : ""
          }`;
          el.style.opacity = "1";
          el.style.transform = "translate3d(0, 0, 0)";
          if (blur) el.style.filter = "blur(0)";
          io.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y, blur]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
