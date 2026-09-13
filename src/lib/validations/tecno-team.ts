import { z } from "zod";

export const tecnoTeamProfileSchema = z.object({
  description: z.string().max(4000).optional().nullable(),
  mission: z.string().max(2000).optional().nullable(),
  vision: z.string().max(2000).optional().nullable(),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")).nullable(),
});
export type TecnoTeamProfileInput = z.infer<typeof tecnoTeamProfileSchema>;

export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  role: z.string().max(120).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  photoPublicId: z.string().optional().nullable(),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  displayOrder: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
