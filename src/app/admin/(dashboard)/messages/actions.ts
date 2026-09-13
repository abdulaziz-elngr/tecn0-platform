"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { logActivity } from "@/lib/services/activity-log";
import { revalidatePath } from "next/cache";
import type { MessageStatus } from "@prisma/client";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<ActionResult> {
  const user = await requireStaff();
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) return { success: false, error: "Message not found." };

  await prisma.message.update({ where: { id }, data: { status } });
  await logActivity({
    userId: user.id!,
    action: "UPDATE",
    entityType: "Message",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) return { success: false, error: "Message not found." };

  await prisma.message.delete({ where: { id } });
  await logActivity({
    userId: user.id!,
    action: "DELETE",
    entityType: "Message",
    entityId: id,
    metadata: { subject: message.subject },
  });
  revalidatePath("/admin/messages");
  return { success: true };
}
