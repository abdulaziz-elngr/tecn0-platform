import { z } from "zod";

export const siteSettingSchema = z.object({
  siteName: z.string().min(1).max(120),
  brandName: z.string().min(1).max(120),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #C9A227"),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #0B0B0B"),
  darkModeDefault: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  availabilityStatus: z.string().max(120).optional().nullable(),
});
export type SiteSettingInput = z.infer<typeof siteSettingSchema>;

// Branding: URLs are validated loosely (either an absolute http(s) URL from
// Cloudinary, or a local /path from the bundled fallback asset) since this
// field is only ever set by our own upload flow or removeLogo, never typed
// freely by a user.
const brandAsset = z
  .string()
  .refine((v) => v === "" || v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"), {
    message: "Must be a valid URL or local path.",
  })
  .optional()
  .nullable();

export const brandingSchema = z.object({
  logoUrl: brandAsset,
  logoPublicId: z.string().optional().nullable(),
  logoDarkUrl: brandAsset,
  logoDarkPublicId: z.string().optional().nullable(),
  faviconUrl: brandAsset,
  faviconPublicId: z.string().optional().nullable(),
});
export type BrandingInput = z.infer<typeof brandingSchema>;

export const seoSettingSchema = z.object({
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  metaKeywords: z.array(z.string()).default([]),
  ogTitle: z.string().max(160).optional().nullable(),
  ogDescription: z.string().max(300).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  twitterCard: z.string().max(60).optional().nullable(),
  canonicalUrl: z.string().url().optional().or(z.literal("")).nullable(),
  robotsIndex: z.boolean().default(true),
});
export type SeoSettingInput = z.infer<typeof seoSettingSchema>;
