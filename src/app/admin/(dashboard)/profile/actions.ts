"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { logActivity } from "@/lib/services/activity-log";
import { storage } from "@/lib/services/storage";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { success: false, fieldErrors };
  }

  const previous = await prisma.profile.findUnique({ where: { userId: user.id! } });

  // Update the database FIRST — the new photo/CV URL is already a
  // successfully-uploaded Cloudinary asset by the time this action runs
  // (the upload already completed client-side). Only after this write
  // succeeds do we clean up whatever asset it replaced, so a failed update
  // never leaves the profile pointing at a deleted file.
  await prisma.profile.upsert({
    where: { userId: user.id! },
    update: { ...parsed.data, email: parsed.data.email || null },
    create: { userId: user.id!, ...parsed.data, email: parsed.data.email || null },
  });

  const cleanups: Array<[string | null | undefined, string | null | undefined]> = [
    [previous?.profileImagePublicId, parsed.data.profileImagePublicId],
    [previous?.cvPublicId, parsed.data.cvPublicId],
  ];
  for (const [oldId, newId] of cleanups) {
    if (oldId && oldId !== newId) {
      await storage.delete(oldId, "image").catch((err) => {
        console.error("Profile asset cleanup failed:", err);
      });
    }
  }

  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Profile", entityId: user.id });
  revalidatePath("/admin/profile");
  revalidatePath("/", "layout");
  revalidatePath("/about");
  return { success: true };
}
