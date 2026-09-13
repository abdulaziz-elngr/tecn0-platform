"use client";

import { CONTENT_OWNER_LABELS, type ContentOwnerValue } from "@/lib/validations/content-owner";

/**
 * Reused on Projects, Experience, Services, and Social Links (Phase 8/9/10/11/12
 * content ownership). An empty value means "unclassified" — never coerced to
 * a default, since existing records are intentionally left unclassified
 * until an admin picks one explicitly.
 */
export function OwnerSelect({
  value,
  onChange,
  label = "Belongs to",
  id = "owner",
}: {
  value: ContentOwnerValue | null | undefined;
  onChange: (value: ContentOwnerValue | null) => void;
  label?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? (e.target.value as ContentOwnerValue) : null)}
        className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
      >
        <option value="">Unclassified</option>
        {Object.entries(CONTENT_OWNER_LABELS).map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
