"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface TourStep {
  selector: string | null;
  title: string;
  body: ReactNode;
  position?: "auto" | "top" | "bottom";
}

interface Props {
  open: boolean;
  steps: TourStep[];
  onClose: () => void;
  onComplete?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;
const TOOLTIP_W = 360;
const TOOLTIP_GAP = 14;

export default function GuideTour({ open, steps, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Reset to step 0 when opening
  useEffect(() => {
    if (open) {
      setStep(0);
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [open]);

  // Compute target rect for current step
  useLayoutEffect(() => {
    if (!open) return;
    const cur = steps[step];
    if (!cur || !cur.selector) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(cur.selector!) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
      // Scroll into view if needed
      if (r.top < 80 || r.bottom > window.innerHeight - 80) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, step, steps]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!mounted || typeof document === "undefined") return null;

  const cur = steps[step];
  if (!cur) return null;

  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // Compute tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const spaceBelow = vh - (rect.top + rect.height);
    const placeTop = cur.position === "top" || (cur.position !== "bottom" && spaceBelow < 220);
    const top = placeTop ? rect.top - TOOLTIP_GAP : rect.top + rect.height + TOOLTIP_GAP;
    let left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    tooltipStyle = {
      position: "fixed",
      top,
      left,
      width: TOOLTIP_W,
      maxWidth: "calc(100vw - 24px)",
      transform: placeTop ? "translateY(-100%)" : "none",
    };
  } else {
    tooltipStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: TOOLTIP_W,
      maxWidth: "calc(100vw - 24px)",
      transform: "translate(-50%, -50%)",
    };
  }

  return createPortal(
    <>
      {/* Dim overlay w/ spotlight cutout */}
      <svg
        className="fixed inset-0 z-[9998] pointer-events-auto"
        width="100%"
        height="100%"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={14}
                ry={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(11,13,18,0.55)"
          mask="url(#tour-mask)"
          style={{ transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        />
        {rect && (
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx={14}
            ry={14}
            fill="none"
            stroke="rgba(99,102,241,0.7)"
            strokeWidth="1.5"
            style={{ transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          zIndex: 9999,
          background: "#ffffff",
          border: "1px solid #ececef",
          borderRadius: 16,
          boxShadow:
            "0 24px 56px -20px rgba(11,13,18,0.25), 0 4px 10px rgba(11,13,18,0.06)",
        }}
        className="animate-fade-in-up"
      >
        <div className="p-5">
          {/* Progress + step counter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`tour-progress-dot ${
                    i === step ? "is-current" : i < step ? "is-done" : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {step + 1} / {steps.length}
            </span>
          </div>

          <h3 className="text-[15.5px] font-semibold text-zinc-900 tracking-tight mb-1.5">
            {cur.title}
          </h3>
          <div className="text-[13px] text-zinc-600 leading-relaxed">{cur.body}</div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors press"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="press text-[12.5px] font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="press inline-flex items-center gap-1.5 bg-zinc-900 text-white text-[12.5px] font-semibold px-4 py-1.5 rounded-lg hover:bg-zinc-800 transition-all duration-200 group"
              >
                {isLast ? "Got it" : "Next"}
                {!isLast && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    <path d="M3 6h6m-2-2l2 2-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
