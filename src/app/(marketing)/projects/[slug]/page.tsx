import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { trackEvent } from "@/lib/services/analytics";
import { GithubMark } from "@/components/ui/github-mark";
import { CONTENT_OWNER_LABELS } from "@/lib/validations/content-owner";
import { ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { displayOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug).catch(() => null);
  if (!project) return { title: "Project not found — Tecno Team" };

  return {
    title: `${project.title} — Tecno Team`,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: project.featuredImage ? [project.featuredImage] : undefined,
      type: "article",
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-[var(--slate)]">{children}</div>
    </section>
  );
}

export default async function ProjectCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  await trackEvent({ type: "PROJECT_VIEW", path: `/projects/${slug}`, projectId: project.id });

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">{project.category}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{project.title}</h1>
      <p className="mt-4 text-lg text-[var(--slate)]">{project.shortDescription}</p>
      {project.owner && (
        <p className="mt-2 text-sm text-[var(--slate)]">
          <span className="font-medium text-[var(--gold-deep)]">{CONTENT_OWNER_LABELS[project.owner]}</span> project
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {project.technologies.map((t) => (
          <span key={t} className="rounded-full bg-[var(--border)] px-3 py-1 text-xs text-[var(--slate)]">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--gold-deep)]"
          >
            <GithubMark className="h-4 w-4" /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--gold-deep)]"
          >
            <ExternalLink className="h-4 w-4" /> Live demo
          </a>
        )}
      </div>

      {project.fullDescription && <Section title="Overview">{project.fullDescription}</Section>}
      {project.problem && <Section title="Problem">{project.problem}</Section>}
      {project.solution && <Section title="Solution">{project.solution}</Section>}
      {project.features.length > 0 && (
        <Section title="Key features">
          <ul className="list-disc space-y-1 pl-5">
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      {project.role && <Section title="My role">{project.role}</Section>}
      {project.challenges && <Section title="Challenges">{project.challenges}</Section>}
      {project.results && <Section title="Results">{project.results}</Section>}

      {project.images.length > 0 && (
        <Section title="Gallery">
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.url}
                alt={img.alt ?? project.title}
                className="rounded-[var(--radius-md)] border border-[var(--border)]"
              />
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
