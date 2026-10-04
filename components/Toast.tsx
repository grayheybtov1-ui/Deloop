"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 shadow-xl backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-slate-900/95 border-emerald-500/40 text-emerald-400"
                  : toast.type === "error"
                  ? "bg-slate-900/95 border-red-500/40 text-red-400"
                  : "bg-slate-900/95 border-blue-500/40 text-blue-400"
              }`}
            >
              <div className="mt-0.5">
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-semibold text-slate-100">{toast.title}</h4>
                {toast.message && <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
