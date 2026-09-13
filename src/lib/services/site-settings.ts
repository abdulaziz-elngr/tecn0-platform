import { prisma } from "@/lib/prisma";
import { cache } from "react";

/**
 * SiteSetting is a single-row table. This guarantees exactly one row exists.
 * Wrapped in React.cache() so the several places that need it per-request
 * (root layout metadata, root layout body for theme colors, navbar/footer/
 * sidebar/login logo) share one DB round trip instead of one each.
 */
export const getOrCreateSiteSettings = cache(async function getOrCreateSiteSettings() {
  const existing = await prisma.siteSetting.findFirst();
  if (existing) return existing;
  return prisma.siteSetting.create({ data: {} });
});
