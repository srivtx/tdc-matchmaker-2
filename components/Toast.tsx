"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastData { id: string; type: ToastType; message: string; }
interface ToastContextType { show: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastContextType>({ show: () => {} });
export function useToast() { return useContext(ToastContext); }

const config = {
  success: {
    icon: CheckCircle,
    color: "var(--moss)",
    bg:    "var(--moss-soft)",
    label: "Success",
  },
  error: {
    icon: XCircle,
    color: "var(--ember)",
    bg:    "var(--ember-soft)",
    label: "Error",
  },
  info: {
    icon: Info,
    color: "var(--slate)",
    bg:    "var(--slate-soft)",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "var(--honey)",
    bg:    "var(--honey-soft)",
    label: "Notice",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, color, bg, label } = config[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto"
              >
                <div
                  className="relative overflow-hidden rounded-lg flex items-start gap-3 p-3.5"
                  style={{
                    background: "var(--bg-elevated)",
                    border: `1px solid ${color}`,
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: bg, color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div
                      className="font-mono text-[9px] uppercase tracking-[0.12em] mb-1"
                      style={{ color }}
                    >
                      {label}
                    </div>
                    <p className="text-[12px] text-[color:var(--ink-soft)] leading-[1.5]">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="p-1 text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
