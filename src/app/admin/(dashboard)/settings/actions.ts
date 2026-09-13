"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  siteSettingSchema,
  seoSettingSchema,
  brandingSchema,
  type SiteSettingInput,
  type SeoSettingInput,
  type BrandingInput,
} from "@/lib/validations/settings";
import { logActivity } from "@/lib/services/activity-log";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
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

export async function updateSiteSettings(input: SiteSettingInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = siteSettingSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const current = await getOrCreateSiteSettings();
  await prisma.siteSetting.update({
    where: { id: current.id },
    data: { ...parsed.data, contactEmail: parsed.data.contactEmail || null },
  });

  await logActivity({ userId: user.id!, action: "SETTINGS_CHANGE", entityType: "SiteSetting", entityId: current.id });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Branding — Tecno Team logo/favicon (spec: "Add the real Tecno Team logo
 * through the Admin Dashboard", "Do not hardcode the logo"). ADMIN-only:
 * gated by requireAdmin(), not requireStaff(), since this is identity, not
 * content. Deletes the previous Cloudinary asset (by publicId) whenever it
 * is replaced or removed, so old logos don't accumulate as orphaned files.
 */
export async function updateBranding(input: BrandingInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const current = await getOrCreateSiteSettings();

  // Best-effort cleanup of whatever asset each field is replacing. A delete
  // failure (e.g. Cloudinary not configured yet, or the asset was the
  // bundled local fallback with no publicId) must never block saving the
  // new value — log and continue, per "handle deletion failures safely."
  const replacements: Array<[string | null | undefined, string | null | undefined]> = [
    [current.logoPublicId, parsed.data.logoPublicId],
    [current.logoDarkPublicId, parsed.data.logoDarkPublicId],
    [current.faviconPublicId, parsed.data.faviconPublicId],
  ];
  for (const [oldId, newId] of replacements) {
    if (oldId && oldId !== newId) {
      await storage.delete(oldId, "image").catch((err) => {
        console.error("Branding asset cleanup failed:", err);
      });
    }
  }

  await prisma.siteSetting.update({
    where: { id: current.id },
    data: {
      logoUrl: parsed.data.logoUrl || null,
      logoPublicId: parsed.data.logoPublicId || null,
      logoDarkUrl: parsed.data.logoDarkUrl || null,
      logoDarkPublicId: parsed.data.logoDarkPublicId || null,
      faviconUrl: parsed.data.faviconUrl || null,
      faviconPublicId: parsed.data.faviconPublicId || null,
    },
  });

  await logActivity({
    userId: user.id!,
    action: "SETTINGS_CHANGE",
    entityType: "SiteSetting",
    entityId: current.id,
    metadata: { section: "branding" },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSeoSettings(input: SeoSettingInput): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = seoSettingSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const current = await getOrCreateSiteSettings();
  await prisma.siteSetting.update({
    where: { id: current.id },
    data: { ...parsed.data, canonicalUrl: parsed.data.canonicalUrl || null },
  });

  await logActivity({ userId: user.id!, action: "SETTINGS_CHANGE", entityType: "SiteSetting", entityId: current.id, metadata: { section: "seo" } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
  return { success: true };
}
