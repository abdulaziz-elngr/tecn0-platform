import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { ExperienceManager } from "./experience-manager";

export const metadata = { title: "Experience — Tecno Team Admin" };

export default async function AdminExperiencePage() {
  const entries = await prisma.experience
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Experience & Journey" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="p-5">
          {entries.length === 0 && (
            <EmptyState
              title="No timeline entries yet."
              description="Add your first milestone below — it becomes the public About timeline."
            />
          )}
          <ExperienceManager entries={entries} />
        </Card>
      </main>
    </>
  );
}
