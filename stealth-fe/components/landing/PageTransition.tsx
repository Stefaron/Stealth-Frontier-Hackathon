"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/hooks/useGsap";

export default function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { y: 14, opacity: 0.85 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}
