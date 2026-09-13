import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, Badge, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CertificateRowActions } from "./certificate-row-actions";

export const metadata = { title: "Certificates — Tecno Team Admin" };

export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const { category, status } = await searchParams;

  const certificates = await prisma.certificate
    .findMany({
      where: {
        AND: [
          category ? { category } : {},
          status === "published" ? { published: true } : {},
          status === "draft" ? { published: false } : {},
        ],
      },
      orderBy: [{ displayOrder: "asc" }, { issueDate: "desc" }],
    })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Certificates" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-between">
          <form className="flex gap-2" action="/admin/certificates" method="get">
            <select
              name="category"
              defaultValue={category ?? ""}
              className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
            >
              <option value="">All categories</option>
              {["AI", "IoT", "Programming", "Web", "Events", "Other"].map((c) => (
                <option key={c} value={c}>
                  {c}
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
          <Link href="/admin/certificates/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Certificate
            </Button>
          </Link>
        </div>

        {certificates.length === 0 ? (
          <EmptyState
            title="No certificates yet."
            description="Add your first certificate to populate the public gallery."
            action={
              <Link href="/admin/certificates/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Add Certificate
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-[var(--slate)]">{c.organization}</p>
                  </div>
                  <Badge tone={c.published ? "success" : "default"}>
                    {c.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="mb-3 flex gap-2">
                  <Badge tone="gold">{c.category}</Badge>
                  {c.featured && <Badge>Featured</Badge>}
                </div>
                <CertificateRowActions id={c.id} title={c.title} published={c.published} featured={c.featured} />
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
