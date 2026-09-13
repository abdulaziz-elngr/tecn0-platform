import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Activity Logs — Tecno Team Admin" };

export default async function AdminActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string }>;
}) {
  const { entityType, action } = await searchParams;

  const logs = await prisma.activityLog
    .findMany({
      where: {
        AND: [
          entityType ? { entityType } : {},
          action ? { action: action.toUpperCase() as never } : {},
        ],
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    .catch(() => []);

  const entityTypes = await prisma.activityLog
    .findMany({ distinct: ["entityType"], select: { entityType: true } })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Activity Logs" breadcrumb="Security" />
      <main className="flex-1 overflow-y-auto p-6">
        <form className="mb-6 flex gap-2" action="/admin/activity-logs" method="get">
          <select
            name="entityType"
            defaultValue={entityType ?? ""}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
          >
            <option value="">All entities</option>
            {entityTypes.map((e) => (
              <option key={e.entityType} value={e.entityType}>
                {e.entityType}
              </option>
            ))}
          </select>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
          >
            <option value="">All actions</option>
            {["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH", "SETTINGS_CHANGE"].map(
              (a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              )
            )}
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>

        {logs.length === 0 ? (
          <EmptyState title="No activity recorded yet." description="Admin actions will appear here as they happen." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--paper)] text-left text-xs text-[var(--slate)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-data text-xs text-[var(--slate)]">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{log.user?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3">
                      <Badge tone="gold">{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--slate)]">
                      {log.entityType}
                      {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                    </td>
                    <td className="px-4 py-3 font-data text-xs text-[var(--slate)]">
                      {log.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </>
  );
}
