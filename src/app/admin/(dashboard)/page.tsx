import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getViewsByDay } from "@/lib/services/analytics";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderKanban, Award, Newspaper, Mail, Eye, Plus } from "lucide-react";

export const metadata = { title: "Dashboard — Tecno Team Admin" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Abdulaziz";

  const [stats, recentMessages, recentProjects, recentLogs, views7d] = await Promise.all([
    getDashboardStats().catch(() => null),
    prisma.message
      .findMany({ orderBy: { createdAt: "desc" }, take: 5 })
      .catch(() => []),
    prisma.project
      .findMany({ orderBy: { createdAt: "desc" }, take: 5 })
      .catch(() => []),
    prisma.activityLog
      .findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } })
      .catch(() => []),
    getViewsByDay(7).catch(() => []),
  ]);

  const statCards = [
    { label: "Total Page Views", value: stats?.totalViews ?? "—", icon: Eye },
    { label: "Projects", value: stats?.projectCount ?? "—", icon: FolderKanban },
    { label: "Certificates", value: stats?.certificateCount ?? "—", icon: Award },
    { label: "Blog Posts", value: stats?.blogPostCount ?? "—", icon: Newspaper },
    { label: "Unread Messages", value: stats?.unreadMessages ?? "—", icon: Mail },
  ];

  return (
    <>
      <AdminTopbar title={`Good morning, ${firstName} 👋`} userName={session?.user?.name} />
      <main className="flex-1 overflow-y-auto p-6">
        {!stats && (
          <Card className="mb-6 border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4 text-sm text-[var(--danger)]">
            Unable to load live stats — check that DATABASE_URL is set and the database is
            reachable. The dashboard shell still renders so you can navigate.
          </Card>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {statCards.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--gold)]/15">
                <Icon className="h-4 w-4 text-[var(--gold-deep)]" />
              </div>
              <p className="font-display text-2xl font-semibold">{value}</p>
              <p className="text-xs text-[var(--slate)]">{label}</p>
            </Card>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link href="/admin/projects/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </Link>
          <Link href="/admin/certificates/new">
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" /> Add Certificate
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" /> Write Article
            </Button>
          </Link>
          <Link href="/admin/profile">
            <Button size="sm" variant="secondary">
              Update Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 font-display text-sm font-semibold">Views — last 7 days</h2>
            {views7d.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--slate)]">
                No analytics events recorded yet.
              </p>
            ) : (
              <div className="flex h-40 items-end gap-2">
                {views7d.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-[4px] bg-[var(--gold)]"
                      style={{ height: `${Math.max(8, d.count * 6)}px` }}
                    />
                    <span className="text-[10px] text-[var(--slate)] font-data">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Recent messages</h2>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No messages yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentMessages.map((m) => (
                  <li key={m.id} className="text-sm">
                    <p className="font-medium">{m.subject}</p>
                    <p className="text-xs text-[var(--slate)]">
                      {m.name} · {m.email}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Recent projects</h2>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No projects yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentProjects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-xs text-[var(--slate)]">
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 font-display text-sm font-semibold">Recent activity</h2>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No activity recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 font-data text-xs">
                {recentLogs.map((log) => (
                  <li key={log.id} className="flex justify-between text-[var(--slate)]">
                    <span>
                      {log.user?.name ?? "Unknown"} · {log.action} · {log.entityType}
                    </span>
                    <span>{log.createdAt.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
