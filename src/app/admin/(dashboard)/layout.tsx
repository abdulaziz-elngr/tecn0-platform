import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2: server-side session check. Middleware (layer 1) already blocks
  // unauthenticated requests to /admin/* at the edge; this re-checks on the
  // server for every render so the edge layer is never the sole gate.
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const settings = await getOrCreateSiteSettings().catch(() => null);

  return (
    <div className="flex min-h-screen bg-[var(--paper)]">
      <AdminSidebar logoUrl={settings?.logoUrl} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
