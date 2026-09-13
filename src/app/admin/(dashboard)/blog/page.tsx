import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BlogRowActions } from "./blog-row-actions";

export const metadata = { title: "Blog — Tecno Team Admin" };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const posts = await prisma.blogPost
    .findMany({
      where: {
        AND: [
          q ? { title: { contains: q, mode: "insensitive" } } : {},
          status ? { status: status.toUpperCase() as never } : {},
        ],
      },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Blog" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <form className="flex gap-2" action="/admin/blog" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search articles…"
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-[var(--gold)]"
            />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button type="submit" variant="secondary" size="sm">
              Filter
            </Button>
          </form>
          <Link href="/admin/blog/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Write Article
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="No articles yet."
            description="Write your first post — it'll show up here as a draft until you publish it."
            action={
              <Link href="/admin/blog/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Write Article
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
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {p.title}
                      {p.featured && <Badge tone="gold" className="ml-2">Featured</Badge>}
                    </td>
                    <td className="px-4 py-3 text-[var(--slate)]">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status === "PUBLISHED" ? "success" : "default"}>
                        {p.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <BlogRowActions id={p.id} status={p.status} featured={p.featured} />
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
