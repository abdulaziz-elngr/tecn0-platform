"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";
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

export async function createService(input: ServiceInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const service = await prisma.service.create({ data: parsed.data });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "Service", entityId: service.id });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function updateService(id: string, input: ServiceInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  await prisma.service.update({ where: { id }, data: parsed.data });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Service", entityId: id });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return { success: false, error: "Service not found." };

  await prisma.service.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "Service", entityId: id, metadata: { title: service.title } });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function toggleServicePublished(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return { success: false, error: "Service not found." };

  const updated = await prisma.service.update({ where: { id }, data: { published: !service.published } });
  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "Service",
    entityId: id,
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}
