"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { socialLinkSchema, type SocialLinkInput } from "@/lib/validations/social-link";
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

export async function createSocialLink(input: SocialLinkInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const link = await prisma.socialLink.create({ data: parsed.data });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "SocialLink", entityId: link.id });
  revalidatePath("/admin/social-links");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateSocialLink(id: string, input: SocialLinkInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  await prisma.socialLink.update({ where: { id }, data: parsed.data });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "SocialLink", entityId: id });
  revalidatePath("/admin/social-links");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteSocialLink(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  await prisma.socialLink.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "SocialLink", entityId: id });
  revalidatePath("/admin/social-links");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleSocialLinkEnabled(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link) return { success: false, error: "Link not found." };

  await prisma.socialLink.update({ where: { id }, data: { enabled: !link.enabled } });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "SocialLink", entityId: id, metadata: { enabled: !link.enabled } });
  revalidatePath("/admin/social-links");
  revalidatePath("/", "layout");
  return { success: true };
}
