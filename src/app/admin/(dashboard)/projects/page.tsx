import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectRowActions } from "./project-row-actions";

export const metadata = { title: "Projects — Tecno Team Admin" };

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category, status } = await searchParams;

  const projects = await prisma.project
    .findMany({
      where: {
        AND: [
          q ? { title: { contains: q, mode: "insensitive" } } : {},
          category ? { category } : {},
          status === "published" ? { published: true } : {},
          status === "draft" ? { published: false } : {},
        ],
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    })
    .catch(() => []);

  const categories = await prisma.project
    .findMany({ distinct: ["category"], select: { category: true } })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Projects" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <form className="flex flex-wrap gap-2" action="/admin/projects" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search projects…"
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-[var(--gold)]"
            />
            <select
              name="category"
              defaultValue={category ?? ""}
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <Button type="submit" variant="secondary" size="sm">
              Filter
            </Button>
          </form>
          <Link href="/admin/projects/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet."
            description="Create your first project to see it here and on the public site."
            action={
              <Link href="/admin/projects/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Add Project
                </Button>
              </Link>
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--paper)] text-left text-xs text-[var(--slate)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-[var(--slate)]">{p.category}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.published ? "success" : "default"}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.featured && <Badge tone="gold">Featured</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <ProjectRowActions
                        id={p.id}
                        title={p.title}
                        published={p.published}
                        featured={p.featured}
                      />
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
