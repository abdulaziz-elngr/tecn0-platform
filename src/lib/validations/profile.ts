import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  professionalTitle: z.string().min(2).max(160),
  heroHeadline: z.string().min(5).max(300),
  heroDescription: z.string().max(2000).optional().nullable(),
  aboutText: z.string().max(8000).optional().nullable(),
  shortIntro: z.string().max(500).optional().nullable(),
  profileImage: z.string().optional().nullable(),
  profileImagePublicId: z.string().optional().nullable(),
  cvUrl: z.string().optional().nullable(),
  cvPublicId: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().max(40).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  availability: z.string().max(120).optional().nullable(),
  currentFocus: z.string().max(1000).optional().nullable(),
  futureGoals: z.string().max(1000).optional().nullable(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
