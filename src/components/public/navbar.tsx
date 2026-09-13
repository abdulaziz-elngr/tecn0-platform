"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Menu, X, Moon, Sun } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/certificates", label: "Certificates" },
  { href: "/services", label: "Services" },
  { href: "/tecno-team", label: "Tecno Team" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ logoUrl }: { logoUrl?: string | null } = {}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  // Close the drawer on Escape (accessibility requirement, spec §49).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--paper)]/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <BrandLogo logoUrl={logoUrl} imgClassName="h-26 w-auto object-contain" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                    active
                      ? "font-medium text-[var(--gold-deep)]"
                      : "text-[var(--slate)] hover:text-[var(--ink)]"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--slate)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer + overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] bg-[var(--panel)] p-6 shadow-[var(--shadow-lift)] transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-base font-semibold">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm",
                    active ? "font-medium text-[var(--gold-deep)]" : "text-[var(--slate)]"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
