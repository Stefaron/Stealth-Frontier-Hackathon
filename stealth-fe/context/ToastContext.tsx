"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, durationMs?: number) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => "",
  dismissToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, durationMs = 5000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
      if (type !== "loading") {
        setTimeout(() => dismissToast(id), durationMs);
      }
      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { addToast, dismissToast } = useContext(ToastContext);
  return {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg, 8000),
    info: (msg: string) => addToast("info", msg),
    loading: (msg: string) => addToast("loading", msg),
    dismiss: dismissToast,
  };
}

export function useToasts() {
  return useContext(ToastContext).toasts;
}
