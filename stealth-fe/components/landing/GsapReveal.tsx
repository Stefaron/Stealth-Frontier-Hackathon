"use client";

import { useRef, type ReactNode } from "react";
import { useGsapEnter } from "@/hooks/useGsap";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
  threshold?: number;
}

export default function GsapReveal({
  children,
  className,
  delay,
  duration,
  y,
  x,
  scale,
  ease,
  threshold,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useGsapEnter(ref, { delay, duration, y, x, scale, ease, threshold });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
