"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--panel)",
          color: "var(--ink)",
          border: "1px solid var(--border)",
        },
      }}
    />
  );
}

export { toast } from "sonner";
