"use client";

import { useContext } from "react";
import { ToastContext } from "@/context/ToastContext";
import type { ToastItem } from "@/context/ToastContext";

const TYPE_CONFIG = {
  success: {
    bar: "bg-emerald-500",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconColor: "text-emerald-600",
  },
  error: {
    bar: "bg-red-500",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    iconColor: "text-red-600",
  },
  info: {
    bar: "bg-blue-500",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 6.5v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    iconColor: "text-blue-600",
  },
  loading: {
    bar: "bg-indigo-500",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
        <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    iconColor: "text-indigo-600",
  },
};

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const config = TYPE_CONFIG[item.type];
  return (
    <div className="relative flex items-start gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3.5 shadow-lg min-w-[280px] max-w-[380px] overflow-hidden animate-fade-in-up">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar}`} />
      <span className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>{config.icon}</span>
      <p className="flex-1 text-zinc-800 text-[12.5px] leading-snug pr-4">{item.message}</p>
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-900 transition-colors press"
        aria-label="Dismiss"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function Toaster() {
  const { toasts, dismissToast } = useContext(ToastContext);
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}
