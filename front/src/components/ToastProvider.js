"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import styles from "@/styles/Toast.module.css";

const ToastContext = createContext(null);
const TOAST_DURATION = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, type = "info") => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }].slice(-4));
    window.setTimeout(() => dismiss(id), TOAST_DURATION);
  }, [dismiss]);

  const value = useMemo(() => ({
    show,
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    info: (message) => show(message, "info"),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
              ? XCircle
              : Info;

          return (
            <div
              className={[styles.toast, styles[toast.type]].join(" ")}
              key={toast.id}
              role="status"
            >
              <Icon className={styles.icon} size={20} strokeWidth={1.8} />
              <p>{toast.message}</p>
              <button
                className={styles.closeButton}
                onClick={() => dismiss(toast.id)}
                type="button"
                aria-label="Dismiss notification"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
