import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "gold" | "success" | "danger" }) {
  const tones = {
    default: "bg-[var(--border)] text-[var(--slate)]",
    gold: "bg-[var(--gold)]/15 text-[var(--gold-deep)]",
    success: "bg-[var(--success)]/15 text-[var(--success)]",
    danger: "bg-[var(--danger)]/15 text-[var(--danger)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] px-6 py-16 text-center">
      <p className="font-display text-base font-semibold text-[var(--ink)]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--slate)]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-[var(--danger)]">
        Something went wrong
      </p>
      <p className="max-w-sm text-sm text-[var(--slate)]">{message}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-[var(--border)]", className)}
    />
  );
}
