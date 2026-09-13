import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getOrCreateTecnoTeamProfile } from "@/lib/services/tecno-team";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
import { BrandLogo } from "@/components/ui/brand-logo";
import { EmptyState } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tecno Team",
  description: "Tecno Team — the engineering brand behind Abdulaziz El-Nagar's software, IoT, and embedded systems work.",
};

export default async function TecnoTeamPage() {
  const [profile, settings, members, projects, services, socialLinks] = await Promise.all([
    getOrCreateTecnoTeamProfile(),
    getOrCreateSiteSettings(),
    prisma.teamMember.findMany({ where: { published: true }, orderBy: { displayOrder: "asc" } }).catch(() => []),
    prisma.project
      .findMany({
        where: { published: true, owner: { in: ["TECNO", "BOTH"] } },
        orderBy: { displayOrder: "asc" },
        take: 6,
      })
      .catch(() => []),
    prisma.service
      .findMany({ where: { published: true, owner: { in: ["TECNO", "BOTH"] } }, orderBy: { displayOrder: "asc" } })
      .catch(() => []),
    prisma.socialLink
      .findMany({ where: { enabled: true, owner: "TECNO" }, orderBy: { displayOrder: "asc" } })
      .catch(() => []),
  ]);

  const hasContent = profile.description || profile.mission || profile.vision;

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <BrandLogo logoUrl={settings.logoUrl} imgClassName="h-16 w-auto object-contain" />
        <p className="mt-4 text-sm font-medium text-[var(--gold-deep)]">The brand behind the work</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Tecno Team</h1>
        {profile.description ? (
          <p className="mt-4 max-w-2xl text-[var(--slate)]">{profile.description}</p>
        ) : (
          <p className="mt-4 max-w-2xl text-[var(--slate)]">
            Tecno Team is the engineering brand Abdulaziz El-Nagar builds under — spanning web
            platforms, IoT, and embedded-systems projects.
          </p>
        )}
      </div>

      {(profile.mission || profile.vision) && (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {profile.mission && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--gold-deep)]">Mission</h2>
              <p className="mt-2 text-sm text-[var(--slate)]">{profile.mission}</p>
            </div>
          )}
          {profile.vision && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--gold-deep)]">Vision</h2>
              <p className="mt-2 text-sm text-[var(--slate)]">{profile.vision}</p>
            </div>
          )}
        </div>
      )}

      {members.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold">Team</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5 text-center">
                {m.photoUrl ? (
                  <Image
                    src={m.photoUrl}
                    alt={m.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="mx-auto h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gold)]/15 text-lg font-semibold text-[var(--gold-deep)]">
                    {m.name.charAt(0)}
                  </div>
                )}
                <p className="mt-3 font-medium">{m.name}</p>
                {m.role && <p className="text-xs text-[var(--slate)]">{m.role}</p>}
                {m.bio && <p className="mt-2 text-sm text-[var(--slate)]">{m.bio}</p>}
                {m.websiteUrl && (
                  <a
                    href={m.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-[var(--gold-deep)]"
                  >
                    Visit profile →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Team projects</h2>
            <Link href="/projects?owner=TECNO" className="text-sm font-medium text-[var(--gold-deep)]">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5 transition-colors hover:border-[var(--gold)]"
              >
                <p className="font-display font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-[var(--slate)]">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold">Team services</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
                <h3 className="font-display font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--slate)]">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasContent && members.length === 0 && projects.length === 0 && services.length === 0 && (
        <div className="mt-16">
          <EmptyState
            title="Team details coming soon."
            description="Configure the Tecno Team profile from Admin → Tecno Team."
          />
        </div>
      )}

      <div className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t border-[var(--border)] pt-8">
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[var(--slate)] hover:text-[var(--gold-deep)]"
          >
            {link.label}
          </a>
        ))}
        {profile.contactEmail && (
          <a href={`mailto:${profile.contactEmail}`} className="text-sm font-medium text-[var(--gold-deep)]">
            {profile.contactEmail}
          </a>
        )}
      </div>
    </main>
  );
}
