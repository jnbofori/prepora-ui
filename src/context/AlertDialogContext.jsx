import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertDialog } from "@/components/AlertDialog";

const AlertDialogContext = createContext(null);

function normalizeOptions(input, defaults) {
  if (typeof input === "string") {
    return {
      title: defaults.title,
      message: input,
      confirmText: defaults.confirmText,
      cancelText: defaults.cancelText,
    };
  }
  return {
    title: input.title ?? defaults.title,
    message: input.message ?? "",
    confirmText: input.confirmText ?? defaults.confirmText,
    cancelText: input.cancelText ?? defaults.cancelText,
  };
}

/**
 * @typedef {Object} AlertOptions
 * @property {string} [title]
 * @property {string} message
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 */

export function AlertDialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    variant: "confirm",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const pendingRef = useRef(null);

  const complete = useCallback((value) => {
    const p = pendingRef.current;
    pendingRef.current = null;
    setDialog((d) => ({ ...d, open: false }));
    if (p?.resolve) p.resolve(value);
  }, []);

  const confirm = useCallback((options) => {
    const o = normalizeOptions(options, {
      title: "Confirm",
      confirmText: "Yes",
      cancelText: "No",
    });
    return new Promise((resolve) => {
      pendingRef.current = { resolve, variant: "confirm" };
      setDialog({
        open: true,
        variant: "confirm",
        title: o.title,
        message: o.message,
        confirmText: o.confirmText,
        cancelText: o.cancelText,
      });
    });
  }, []);

  const alert = useCallback((options) => {
    const o = normalizeOptions(options, {
      title: "Notice",
      confirmText: "OK",
      cancelText: "Cancel",
    });
    return new Promise((resolve) => {
      pendingRef.current = { resolve, variant: "alert" };
      setDialog({
        open: true,
        variant: "alert",
        title: o.title,
        message: o.message,
        confirmText: o.confirmText,
        cancelText: o.cancelText,
      });
    });
  }, []);

  const error = useCallback((options) => {
    const o = normalizeOptions(options, {
      title: "Error",
      confirmText: "OK",
      cancelText: "Cancel",
    });
    return new Promise((resolve) => {
      pendingRef.current = { resolve, variant: "error" };
      setDialog({
        open: true,
        variant: "error",
        title: o.title,
        message: o.message,
        confirmText: o.confirmText,
        cancelText: o.cancelText,
      });
    });
  }, []);

  const handlePrimary = useCallback(() => {
    const v = pendingRef.current?.variant;
    if (v === "confirm") complete(true);
    else complete(undefined);
  }, [complete]);

  const handleDismiss = useCallback(() => {
    const v = pendingRef.current?.variant;
    if (v === "confirm") complete(false);
    else complete(undefined);
  }, [complete]);

  const value = useMemo(
    () => ({
      confirm,
      alert,
      error,
    }),
    [confirm, alert, error],
  );

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
      <AlertDialog
        open={dialog.open}
        variant={dialog.variant}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onPrimary={handlePrimary}
        onSecondary={() => complete(false)}
        onBackdrop={handleDismiss}
      />
    </AlertDialogContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error("useAlert must be used within an AlertDialogProvider.");
  }
  return ctx;
}
