"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { skillSchema, skillCategorySchema, type SkillInput, type SkillCategoryInput } from "@/lib/validations/skill";
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

// ---- Categories ----

export async function createSkillCategory(input: SkillCategoryInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = skillCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const existing = await prisma.skillCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, fieldErrors: { slug: "Slug already exists." } };

  const category = await prisma.skillCategory.create({ data: parsed.data });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "SkillCategory", entityId: category.id });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSkillCategory(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const inUse = await prisma.skill.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return { success: false, error: "Move or delete the skills in this category first." };
  }
  await prisma.skillCategory.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "SkillCategory", entityId: id });
  revalidatePath("/admin/skills");
  return { success: true };
}

// ---- Skills ----

export async function createSkill(input: SkillInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const skill = await prisma.skill.create({ data: parsed.data });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "Skill", entityId: skill.id, metadata: { name: skill.name } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function updateSkill(id: string, input: SkillInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  await prisma.skill.update({ where: { id }, data: parsed.data });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Skill", entityId: id });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return { success: false, error: "Skill not found." };

  await prisma.skill.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "Skill", entityId: id, metadata: { name: skill.name } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function toggleSkillPublished(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return { success: false, error: "Skill not found." };

  const updated = await prisma.skill.update({ where: { id }, data: { published: !skill.published } });
  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "Skill",
    entityId: id,
  });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}

export async function reorderSkills(orderedIds: string[]): Promise<ActionResult> {
  const user = await requireStaff();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.skill.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Skill", metadata: { reordered: orderedIds.length } });
  revalidatePath("/admin/skills");
  revalidatePath("/");
  return { success: true };
}
