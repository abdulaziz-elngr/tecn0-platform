"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Sparkles,
  History,
  Award,
  Briefcase,
  Newspaper,
  Mail,
  BarChart3,
  Search,
  Share2,
  Settings,
  ShieldCheck,
  ScrollText,
  LogOut,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

// Grouped per Phase 19 (Admin UX): visually separates Personal-identity
// screens from Tecno Team, day-to-day Content, and System/config — without
// duplicating any screens, since ownership (Personal/Tecno/Both) is a field
// on Projects/Experience/Services/Social Links rather than separate CMSs.
const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: typeof User }[] }[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Personal",
    items: [
      { href: "/admin/profile", label: "Personal Profile", icon: User },
      { href: "/admin/experience", label: "Experience", icon: History },
    ],
  },
  {
    label: "Tecno Team",
    items: [{ href: "/admin/tecno-team", label: "Team Profile & Members", icon: Users }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/social-links", label: "Social Links", icon: Share2 },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/settings", label: "Branding & Settings", icon: Settings },
      { href: "/admin/security", label: "Security", icon: ShieldCheck },
      { href: "/admin/activity-logs", label: "Activity Logs", icon: ScrollText },
    ],
  },
];

export function AdminSidebar({ logoUrl }: { logoUrl?: string | null } = {}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)] md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-6">
        <BrandLogo logoUrl={logoUrl} imgClassName="h-8 w-auto object-contain" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label || "root"} className="mb-3">
            {group.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--slate)]/70">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[var(--gold)]/15 font-medium text-[var(--gold-deep)]"
                          : "text-[var(--slate)] hover:bg-[var(--border)] hover:text-[var(--ink)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <form action={logoutAction} className="border-t border-[var(--border)] p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--slate)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </form>
    </aside>
  );
}
