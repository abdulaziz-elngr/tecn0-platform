import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { SocialLinksManager } from "./social-links-manager";

export const metadata = { title: "Social Links — Tecno Team Admin" };

export default async function AdminSocialLinksPage() {
  const links = await prisma.socialLink
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Social Links" breadcrumb="Configuration" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-2xl p-6">
          {links.length === 0 && (
            <EmptyState title="No social links yet." description="Add GitHub, LinkedIn, and more below." />
          )}
          <SocialLinksManager links={links} />
        </Card>
      </main>
    </>
  );
}
