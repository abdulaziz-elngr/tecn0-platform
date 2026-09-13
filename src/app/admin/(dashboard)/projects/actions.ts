"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";
import { logActivity } from "@/lib/services/activity-log";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProject(input: ProjectInput): Promise<ActionResult> {
  const user = await requireStaff();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZodErrors(parsed.error) };
  }

  const existing = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, fieldErrors: { slug: "A project with this slug already exists." } };
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      githubUrl: parsed.data.githubUrl || null,
      liveUrl: parsed.data.liveUrl || null,
    },
  });

  await logActivity({
    userId: user.id!,
    action: "CREATE",
    entityType: "Project",
    entityId: project.id,
    metadata: { title: project.title },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { success: true };
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
  const user = await requireStaff();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZodErrors(parsed.error) };
  }

  const conflict = await prisma.project.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflict) {
    return { success: false, fieldErrors: { slug: "A project with this slug already exists." } };
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...parsed.data,
      githubUrl: parsed.data.githubUrl || null,
      liveUrl: parsed.data.liveUrl || null,
    },
  });

  await logActivity({
    userId: user.id!,
    action: "UPDATE",
    entityType: "Project",
    entityId: id,
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const user = await requireStaff();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { success: false, error: "Project not found." };

  await prisma.project.delete({ where: { id } });

  await logActivity({
    userId: user.id!,
    action: "DELETE",
    entityType: "Project",
    entityId: id,
    metadata: { title: project.title },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { success: true };
}

export async function togglePublish(id: string): Promise<ActionResult> {
  const user = await requireStaff();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { success: false, error: "Project not found." };

  const updated = await prisma.project.update({
    where: { id },
    data: { published: !project.published },
  });

  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "Project",
    entityId: id,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { success: true };
}

export async function toggleFeatured(id: string): Promise<ActionResult> {
  const user = await requireStaff();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return { success: false, error: "Project not found." };

  await prisma.project.update({ where: { id }, data: { featured: !project.featured } });

  await logActivity({
    userId: user.id!,
    action: "UPDATE",
    entityType: "Project",
    entityId: id,
    metadata: { featured: !project.featured },
  });

  revalidatePath("/admin/projects");
  return { success: true };
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    out[String(issue.path[0])] = issue.message;
  }
  return out;
}
