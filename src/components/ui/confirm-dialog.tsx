"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  destructive = true,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-lift)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-[var(--slate)]">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button
                variant={destructive ? "danger" : "primary"}
                size="sm"
                onClick={handleConfirm}
                loading={pending}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
