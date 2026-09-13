"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function AdminTopbar({
  title,
  breadcrumb,
  userName,
}: {
  title: string;
  breadcrumb?: string;
  userName?: string | null;
}) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-6">
      <div>
        {breadcrumb && <p className="text-xs text-[var(--slate)]">{breadcrumb}</p>}
        <h1 className="font-display text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--slate)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)]/15 text-sm font-semibold text-[var(--gold-deep)]">
          {(userName ?? "A")[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
