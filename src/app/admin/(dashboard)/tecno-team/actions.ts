"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  tecnoTeamProfileSchema,
  teamMemberSchema,
  type TecnoTeamProfileInput,
  type TeamMemberInput,
} from "@/lib/validations/tecno-team";
import { logActivity } from "@/lib/services/activity-log";
import { getOrCreateTecnoTeamProfile } from "@/lib/services/tecno-team";
import { storage } from "@/lib/services/storage";
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

export async function updateTecnoTeamProfile(input: TecnoTeamProfileInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = tecnoTeamProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const current = await getOrCreateTecnoTeamProfile();
  await prisma.tecnoTeamProfile.update({
    where: { id: current.id },
    data: { ...parsed.data, contactEmail: parsed.data.contactEmail || null },
  });

  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "TecnoTeamProfile", entityId: current.id });
  revalidatePath("/tecno-team");
  revalidatePath("/admin/tecno-team");
  return { success: true };
}

export async function createTeamMember(input: TeamMemberInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const member = await prisma.teamMember.create({
    data: { ...parsed.data, websiteUrl: parsed.data.websiteUrl || null },
  });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "TeamMember", entityId: member.id, metadata: { name: member.name } });
  revalidatePath("/tecno-team");
  revalidatePath("/admin/tecno-team");
  return { success: true };
}

export async function updateTeamMember(id: string, input: TeamMemberInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const current = await prisma.teamMember.findUnique({ where: { id } });

  // Only delete the old photo after the new data (including the new
  // photoUrl/photoPublicId) has been safely committed — never before, per
  // "delete the old asset only after the new asset is safely stored."
  await prisma.teamMember.update({
    where: { id },
    data: { ...parsed.data, websiteUrl: parsed.data.websiteUrl || null },
  });

  if (current?.photoPublicId && current.photoPublicId !== parsed.data.photoPublicId) {
    await storage.delete(current.photoPublicId, "image").catch((err) => {
      console.error("Team member photo cleanup failed:", err);
    });
  }

  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "TeamMember", entityId: id });
  revalidatePath("/tecno-team");
  revalidatePath("/admin/tecno-team");
  return { success: true };
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return { success: false, error: "Team member not found." };

  await prisma.teamMember.delete({ where: { id } });

  if (member.photoPublicId) {
    await storage.delete(member.photoPublicId, "image").catch((err) => {
      console.error("Team member photo cleanup failed:", err);
    });
  }

  await logActivity({ userId: user.id!, action: "DELETE", entityType: "TeamMember", entityId: id, metadata: { name: member.name } });
  revalidatePath("/tecno-team");
  revalidatePath("/admin/tecno-team");
  return { success: true };
}

export async function toggleTeamMemberPublished(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return { success: false, error: "Team member not found." };

  const updated = await prisma.teamMember.update({
    where: { id },
    data: { published: !member.published },
  });
  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "TeamMember",
    entityId: id,
  });
  revalidatePath("/tecno-team");
  revalidatePath("/admin/tecno-team");
  return { success: true };
}
