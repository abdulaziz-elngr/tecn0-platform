import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { SkillsManager } from "./skills-manager";

export const metadata = { title: "Skills — Tecno Team Admin" };

export default async function AdminSkillsPage() {
  const categories = await prisma.skillCategory
    .findMany({
      orderBy: { displayOrder: "asc" },
      include: { skills: { orderBy: { displayOrder: "asc" } } },
    })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Skills" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        {categories.length === 0 ? (
          <EmptyState
            title="No skill categories yet."
            description="Create a category (e.g. IoT / Embedded) to start adding skills."
          />
        ) : null}
        <Card className="p-5">
          <SkillsManager categories={categories} />
        </Card>
      </main>
    </>
  );
}
