"use server";

import { requireAdmin, requireStaff, AuthError } from "@/lib/require-admin";
import { storage } from "@/lib/services/storage";

const FOLDER_PREFIX = "tecno-platform";

/**
 * Server-side allowlist of every valid upload destination (spec: "do not
 * blindly trust a client-provided Cloudinary folder"). The client can send
 * a bare key ("branding") or the historical "tecno-platform/<key>" string
 * the existing forms already use — either way, only a key present here is
 * ever forwarded to Cloudinary. Anything else (path traversal, an
 * unexpected folder, an empty string) is rejected before storage.upload()
 * is even called.
 *
 * `adminOnly: true` = identity/branding assets (personal profile photo,
 * Tecno logo, favicon, SEO/OG image) — only an ADMIN can replace these.
 * Everything else is available to any authenticated staff member.
 */
const FOLDER_ALLOWLIST: Record<string, { adminOnly: boolean }> = {
  profile: { adminOnly: true },
  branding: { adminOnly: true },
  seo: { adminOnly: true },
  team: { adminOnly: true },
  certificates: { adminOnly: false },
  blog: { adminOnly: false },
};

function resolveFolder(rawFolder: string) {
  const key = rawFolder
    .trim()
    .toLowerCase()
    .replace(new RegExp(`^${FOLDER_PREFIX}/`), "");

  const entry = FOLDER_ALLOWLIST[key];
  if (!entry) {
    throw new Error("Invalid upload destination.");
  }
  return { key, path: `${FOLDER_PREFIX}/${key}`, adminOnly: entry.adminOnly };
}

export async function uploadImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
  const rawFolder = String(formData.get("folder") ?? "");

  let destination: ReturnType<typeof resolveFolder>;
  try {
    destination = resolveFolder(rawFolder);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Invalid upload destination." };
  }

  try {
    // Never trust a client-supplied role — this re-derives it from the
    // authenticated server session (and, underneath, the database).
    if (destination.adminOnly) {
      await requireAdmin();
    } else {
      await requireStaff();
    }
  } catch (err) {
    if (err instanceof AuthError) return { success: false, error: err.message };
    return { success: false, error: "Unauthorized." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided." };
  }

  try {
    const result = await storage.upload(file, destination.path);
    return { success: true, url: result.url, publicId: result.publicId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Upload failed." };
  }
}
