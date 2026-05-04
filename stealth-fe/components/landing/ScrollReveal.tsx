"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "down" | "left" | "right" | "scale" | "blur" | "rotate" | "fade";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  distance?: number;
  duration?: number;
  once?: boolean;
}

const FROM: Record<Variant, (d: number) => CSSProperties> = {
  up:     (d) => ({ opacity: 0, transform: `translate3d(0, ${d}px, 0)` }),
  down:   (d) => ({ opacity: 0, transform: `translate3d(0, -${d}px, 0)` }),
  left:   (d) => ({ opacity: 0, transform: `translate3d(-${d}px, 0, 0)` }),
  right:  (d) => ({ opacity: 0, transform: `translate3d(${d}px, 0, 0)` }),
  scale:  ()  => ({ opacity: 0, transform: "scale(0.92)" }),
  blur:   ()  => ({ opacity: 0, filter: "blur(14px)", transform: "translate3d(0,12px,0)" }),
  rotate: ()  => ({ opacity: 0, transform: "perspective(900px) rotateX(14deg) translate3d(0,18px,0)" }),
  fade:   ()  => ({ opacity: 0 }),
};

const TO: Record<Variant, CSSProperties> = {
  up:     { opacity: 1, transform: "translate3d(0,0,0)" },
  down:   { opacity: 1, transform: "translate3d(0,0,0)" },
  left:   { opacity: 1, transform: "translate3d(0,0,0)" },
  right:  { opacity: 1, transform: "translate3d(0,0,0)" },
  scale:  { opacity: 1, transform: "scale(1)" },
  blur:   { opacity: 1, filter: "blur(0px)", transform: "translate3d(0,0,0)" },
  rotate: { opacity: 1, transform: "perspective(900px) rotateX(0deg) translate3d(0,0,0)" },
  fade:   { opacity: 1 },
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  distance = 22,
  duration = 700,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (style: CSSProperties) => {
      Object.entries(style).forEach(([k, v]) => {
        (el.style as unknown as Record<string, string>)[k] = String(v);
      });
    };

    apply(FROM[variant](distance));
    el.style.willChange = "transform, opacity, filter";

    const ease = "cubic-bezier(0.16,1,0.3,1)";
    const trans = `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}, filter ${duration}ms ${ease}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => {
            el.style.transition = trans;
            apply(TO[variant]);
          }, delay);
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.style.transition = trans;
          apply(FROM[variant](distance));
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, variant, distance, duration, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
