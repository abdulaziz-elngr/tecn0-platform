import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Security — Tecno Team Admin" };

export default async function AdminSecurityPage() {
  const session = await auth();
  const recentLogins = await prisma.activityLog
    .findMany({
      where: { userId: session?.user?.id, action: "LOGIN" },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Security" breadcrumb="Configuration" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid max-w-2xl grid-cols-1 gap-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display text-sm font-semibold">Change password</h2>
            <ChangePasswordForm />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-display text-sm font-semibold">Recent logins</h2>
            {recentLogins.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No login history yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 font-data text-xs text-[var(--slate)]">
                {recentLogins.map((log) => (
                  <li key={log.id} className="flex justify-between">
                    <span>{log.ipAddress ?? "Unknown IP"}</span>
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
