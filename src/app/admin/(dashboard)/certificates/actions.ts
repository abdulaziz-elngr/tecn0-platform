"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { certificateSchema, type CertificateInput } from "@/lib/validations/certificate";
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

export async function createCertificate(input: CertificateInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = certificateSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const cert = await prisma.certificate.create({
    data: { ...parsed.data, credentialUrl: parsed.data.credentialUrl || null },
  });
  await logActivity({ userId: user.id!, action: "CREATE", entityType: "Certificate", entityId: cert.id, metadata: { title: cert.title } });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
  return { success: true };
}

export async function updateCertificate(id: string, input: CertificateInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = certificateSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  await prisma.certificate.update({
    where: { id },
    data: { ...parsed.data, credentialUrl: parsed.data.credentialUrl || null },
  });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Certificate", entityId: id });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
  return { success: true };
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return { success: false, error: "Certificate not found." };

  await prisma.certificate.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "Certificate", entityId: id, metadata: { title: cert.title } });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
  return { success: true };
}

export async function toggleCertificatePublished(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return { success: false, error: "Certificate not found." };

  const updated = await prisma.certificate.update({ where: { id }, data: { published: !cert.published } });
  await logActivity({
    userId: user.id!,
    action: updated.published ? "PUBLISH" : "UNPUBLISH",
    entityType: "Certificate",
    entityId: id,
  });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
  return { success: true };
}

export async function toggleCertificateFeatured(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) return { success: false, error: "Certificate not found." };

  await prisma.certificate.update({ where: { id }, data: { featured: !cert.featured } });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "Certificate", entityId: id, metadata: { featured: !cert.featured } });
  revalidatePath("/admin/certificates");
  return { success: true };
}
