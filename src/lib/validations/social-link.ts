import { z } from "zod";
import { contentOwnerSchema } from "./content-owner";

export const SOCIAL_PLATFORMS = [
  "GITHUB",
  "LINKEDIN",
  "WHATSAPP",
  "EMAIL",
  "FACEBOOK",
  "INSTAGRAM",
  "OTHER",
] as const;

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: z.string().min(1, "Label is required").max(60),
  url: z.string().min(1, "URL is required").max(500),
  enabled: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  owner: contentOwnerSchema,
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
