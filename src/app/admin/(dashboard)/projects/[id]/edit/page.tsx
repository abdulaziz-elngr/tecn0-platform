import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProjectForm } from "../../project-form";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Project — Tecno Team Admin" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <>
      <AdminTopbar title={`Edit — ${project.title}`} breadcrumb="Projects" />
      <main className="flex-1 overflow-y-auto p-6">
        <ProjectForm
          mode="edit"
          projectId={project.id}
          initial={{
            ...project,
            fullDescription: project.fullDescription ?? "",
            role: project.role ?? "",
            problem: project.problem ?? "",
            solution: project.solution ?? "",
            challenges: project.challenges ?? "",
            results: project.results ?? "",
            githubUrl: project.githubUrl ?? "",
            liveUrl: project.liveUrl ?? "",
            featuredImage: project.featuredImage ?? "",
            projectDate: project.projectDate ?? undefined,
          }}
        />
      </main>
    </>
  );
}
