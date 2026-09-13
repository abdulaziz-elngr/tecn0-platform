import { z } from "zod";
import { contentOwnerSchema } from "./content-owner";

export const EXPERIENCE_TYPES = ["PERSONAL", "EDUCATION", "WORK", "EVENT", "OTHER"] as const;

export const experienceSchema = z.object({
  year: z.string().min(2, "Year is required").max(20),
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().min(5, "Description is required").max(2000),
  category: z.string().max(60).optional().nullable(),
  icon: z.string().max(60).optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
  owner: contentOwnerSchema,
  entryType: z.enum(EXPERIENCE_TYPES).default("OTHER").optional().nullable(),
  organization: z.string().max(160).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  image: z.string().optional().nullable(),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;
