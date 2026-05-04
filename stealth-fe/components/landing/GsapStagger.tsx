"use client";

import { useRef, type ReactNode } from "react";
import { useGsapStagger } from "@/hooks/useGsap";

interface Props {
  children: ReactNode;
  className?: string;
  childSelector?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
}

export default function GsapStagger({
  children,
  className,
  childSelector = ":scope > *",
  delay,
  stagger,
  duration,
  y,
  x,
  scale,
  ease,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useGsapStagger(ref, childSelector, { delay, stagger, duration, y, x, scale, ease });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
