import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EmptyState } from "@/components/ui/card";
import { GithubMark } from "@/components/ui/github-mark";
import { ExternalLink } from "lucide-react";
import { CONTENT_OWNER_LABELS, type ContentOwnerValue } from "@/lib/validations/content-owner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Tecno Team",
  description: "IoT, embedded systems, and software projects by Abdulaziz El-Nagar.",
};

// Phase 9: Personal / Tecno Team / Both filter. "All" (the default) shows
// everything, including projects that haven't been classified yet — an
// unclassified project should never simply vanish from the public site.
const FILTERS: { key: "all" | ContentOwnerValue; label: string }[] = [
  { key: "all", label: "All" },
  { key: "PERSONAL", label: "Personal" },
  { key: "TECNO", label: "Tecno Team" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ owner?: string }>;
}) {
  const { owner: ownerParam } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.key === ownerParam)?.key ?? "all";

  const allProjects = await prisma.project
    .findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
    })
    .catch(() => []);

  const projects =
    activeFilter === "all"
      ? allProjects
      : allProjects.filter((p) => p.owner === activeFilter || p.owner === "BOTH");

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Projects</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Selected work</h1>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by owner">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/projects" : `/projects?owner=${f.key}`}
            role="tab"
            aria-selected={activeFilter === f.key}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold-deep)]"
                : "border-[var(--border)] text-[var(--slate)] hover:border-[var(--gold)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="mt-12">
          <EmptyState title="No projects here yet." description="Check back soon, or try a different filter." />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] p-5 transition-all hover:border-[var(--gold)] hover:shadow-[var(--shadow-lift)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--gold-deep)]">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="text-xs text-[var(--gold-deep)]">★ Featured</span>
                )}
              </div>
              <Link href={`/projects/${project.slug}`}>
                <h2 className="font-display text-lg font-semibold group-hover:text-[var(--gold-deep)]">
                  {project.title}
                </h2>
              </Link>
              <p className="mt-2 flex-1 text-sm text-[var(--slate)]">{project.shortDescription}</p>
              {project.owner && (
                <p className="mt-2 text-xs text-[var(--slate)]">{CONTENT_OWNER_LABELS[project.owner]}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--slate)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-sm font-medium text-[var(--gold-deep)]"
                >
                  View project →
                </Link>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                    <GithubMark className="h-4 w-4 text-[var(--slate)]" />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label="Live demo">
                    <ExternalLink className="h-4 w-4 text-[var(--slate)]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
