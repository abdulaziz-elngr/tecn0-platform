import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/card";
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
          <a
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
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5 transition-colors hover:border-[var(--gold)]"
            >
              {cert.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="mb-4 h-32 w-full rounded-[var(--radius-md)] object-cover"
                />
              )}
              <p className="font-medium">{cert.title}</p>
              <p className="text-sm text-[var(--slate)]">{cert.organization}</p>
              <p className="mt-2 text-xs text-[var(--slate)] font-data">
                {cert.issueDate.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
