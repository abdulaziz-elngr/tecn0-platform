import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/card";
import { CONTENT_OWNER_LABELS } from "@/lib/validations/content-owner";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Tecno Team",
  description: "Software, IoT, and embedded systems services offered by Abdulaziz El-Nagar.",
};

export default async function ServicesPage() {
  const services = await prisma.service
    .findMany({ where: { published: true }, orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Services</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">What I can build for you</h1>

      {services.length === 0 ? (
        <div className="mt-12">
          <EmptyState title="No services listed yet." description="Check back soon." />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] p-6"
            >
              <h2 className="font-display text-lg font-semibold">{service.title}</h2>
              {service.owner && (
                <p className="mt-0.5 text-xs font-medium text-[var(--gold-deep)]">
                  {CONTENT_OWNER_LABELS[service.owner]}
                </p>
              )}
              <p className="mt-2 text-sm text-[var(--slate)]">{service.description}</p>
              {service.features.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1.5 text-sm">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
        <p className="font-display text-lg font-semibold">Have a project in mind?</p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[var(--gold)] px-6 text-sm font-medium text-[var(--ink)] hover:bg-[var(--gold-deep)]"
        >
          Get in touch
        </Link>
      </div>
    </main>
  );
}
