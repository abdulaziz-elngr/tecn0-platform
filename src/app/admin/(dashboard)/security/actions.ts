"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { changePasswordSchema } from "@/lib/validations/auth";
import { logActivity } from "@/lib/services/activity-log";
import { limitPasswordChange } from "@/lib/services/rate-limit";
import bcrypt from "bcryptjs";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin();

  const rl = await limitPasswordChange(user.id!);
  if (!rl.success) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { success: false, error: "User not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  // Never log the password itself — only the fact that it changed.
  await logActivity({ userId: user.id!, action: "SETTINGS_CHANGE", entityType: "User", entityId: user.id, metadata: { changed: "password" } });

  return { success: true };
}
