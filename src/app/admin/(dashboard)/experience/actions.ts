"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { experienceSchema, type ExperienceInput } from "@/lib/validations/experience";
import { logActivity } from "@/lib/services/activity-log";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] = issue.message;
  return out;
}

export async function createExperience(input: ExperienceInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const entry = await prisma.experience.create({ data: parsed.data });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "Experience", entityId: entry.id });
  revalidatePath("/admin/experience");
  revalidatePath("/about");
  return { success: true };
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  await prisma.experience.update({ where: { id }, data: parsed.data });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Experience", entityId: id });
  revalidatePath("/admin/experience");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const entry = await prisma.experience.findUnique({ where: { id } });
  if (!entry) return { success: false, error: "Entry not found." };

  await prisma.experience.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "Experience", entityId: id, metadata: { title: entry.title } });
  revalidatePath("/admin/experience");
  revalidatePath("/about");
  return { success: true };
}

export async function togglePublishedExperience(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const entry = await prisma.experience.findUnique({ where: { id } });
  if (!entry) return { success: false, error: "Entry not found." };

  const updated = await prisma.experience.update({
    where: { id },
    data: { published: !entry.published },
  });
  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "Experience",
    entityId: id,
  });
  revalidatePath("/admin/experience");
  revalidatePath("/about");
  return { success: true };
}

export async function reorderExperience(orderedIds: string[]): Promise<ActionResult> {
  const user = await requireStaff();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.experience.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Experience", metadata: { reordered: orderedIds.length } });
  revalidatePath("/admin/experience");
  revalidatePath("/about");
  return { success: true };
}
