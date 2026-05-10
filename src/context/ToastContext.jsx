import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  const content = (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[250] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 transition-all ${
            t.variant === "error"
              ? "bg-red-50 text-red-900 ring-red-200"
              : "bg-emerald-50 text-emerald-950 ring-emerald-200"
          }`}
          role="status"
        >
          <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-blue-gray-400 hover:bg-black/5 hover:text-blue-gray-700"
            aria-label="Dismiss"
            onClick={() => onDismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, variant) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((list) => [...list, { id, message, variant }]);
    const ms = variant === "error" ? 6000 : 4000;
    window.setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  const success = useCallback((message) => push(message, "success"), [push]);
  const error = useCallback((message) => push(message, "error"), [push]);

  const value = useMemo(() => ({ success, error }), [success, error]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return ctx;
}
