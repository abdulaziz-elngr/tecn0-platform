import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/card";
import { CertificateGrid } from "@/components/public/certificate-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates — Tecno Team",
  description: "Certifications and credentials earned by Abdulaziz El-Nagar.",
};

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const certificates = await prisma.certificate
    .findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
    })
    .catch(() => []);

  const categories = ["All", "AI", "IoT", "Programming", "Web", "Events", "Other"];

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Certificates</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Certifications</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          
            key={c}
            href={c === "All" ? "/certificates" : `/certificates?category=${c}`}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--slate)] transition-colors hover:border-[var(--gold)]"
          >
            {c}
          </a>
        ))}
      </div>

      {certificates.length === 0 ? (
        <div className="mt-12">
          <EmptyState title="No certificates published yet." description="Check back soon." />
        </div>
      ) : (
        <CertificateGrid
          certificates={certificates.map((c) => ({
            id: c.id,
            title: c.title,
            organization: c.organization,
            issueDate: c.issueDate.toISOString(),
            credentialId: c.credentialId,
            credentialUrl: c.credentialUrl,
            image: c.image,
            category: c.category,
            description: c.description,
          }))}
        />
      )}
    </main>
  );
}
