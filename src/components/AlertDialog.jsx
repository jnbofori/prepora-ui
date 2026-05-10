import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Modal dialog: confirm (two actions), alert / error (single dismiss).
 * Rendered via portal at document.body.
 */
export function AlertDialog({
  open,
  variant = "confirm",
  title = "",
  message = "",
  confirmText = "OK",
  cancelText = "Cancel",
  onPrimary,
  onSecondary,
  onBackdrop,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onBackdrop?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onBackdrop]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isConfirm = variant === "confirm";
  const isError = variant === "error";

  const content = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 transition-opacity"
        aria-label="Close"
        onClick={onBackdrop}
      />
      <div
        role={isConfirm ? "dialog" : "alertdialog"}
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-desc"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-blue-gray-100"
      >
        <h2
          id="alert-dialog-title"
          className={`text-lg font-semibold ${isError ? "text-red-700" : "text-blue-gray-900"}`}
        >
          {title}
        </h2>
        <p
          id="alert-dialog-desc"
          className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-blue-gray-600"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {isConfirm ? (
            <>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-blue-gray-700 transition-colors hover:bg-blue-gray-50"
                onClick={onSecondary}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-gray-900"
                onClick={onPrimary}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                isError ? "bg-red-600 hover:bg-red-700" : "bg-blue-gray-800 hover:bg-blue-gray-900"
              }`}
              onClick={onPrimary}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
