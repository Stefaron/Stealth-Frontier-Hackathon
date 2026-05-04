"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export { gsap };

interface RevealOpts {
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
  once?: boolean;
  threshold?: number;
}

export function useGsapEnter(
  ref: React.RefObject<HTMLElement | null>,
  opts: RevealOpts = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      delay = 0,
      duration = 0.7,
      y = 30,
      x = 0,
      scale = 1,
      ease = "power3.out",
      once = true,
      threshold = 0.15,
    } = opts;

    gsap.set(el, { opacity: 0, y, x, scale: scale === 1 ? 1 : scale });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration,
            ease,
            delay,
          });
          if (once) io.unobserve(el);
        } else if (!once) {
          gsap.to(el, { opacity: 0, y, x, scale, duration: duration * 0.6, ease: "power3.in" });
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

interface StaggerOpts {
  delay?: number;
  stagger?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  ease?: string;
  threshold?: number;
}

export function useGsapStagger(
  containerRef: React.RefObject<HTMLElement | null>,
  childSelector: string,
  opts: StaggerOpts = {}
) {
  const fired = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || fired.current) return;

    const items = el.querySelectorAll<HTMLElement>(childSelector);
    if (items.length === 0) return;

    const {
      delay = 0.05,
      stagger = 0.08,
      duration = 0.65,
      y = 28,
      x = 0,
      scale,
      ease = "power3.out",
      threshold = 0.12,
    } = opts;

    const fromVars: gsap.TweenVars = { opacity: 0, y, x };
    if (scale !== undefined) fromVars.scale = scale;
    gsap.set(items, fromVars);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fired.current = true;
          const toVars: gsap.TweenVars = {
            opacity: 1,
            y: 0,
            x: 0,
            duration,
            stagger,
            ease,
            delay,
          };
          if (scale !== undefined) toVars.scale = 1;
          gsap.to(items, toVars);
          io.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useGsapCharReveal(
  ref: React.RefObject<HTMLElement | null>,
  trigger: unknown
) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".char");
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: "power2.out" }
    );
  }, [trigger, ref]);
}
