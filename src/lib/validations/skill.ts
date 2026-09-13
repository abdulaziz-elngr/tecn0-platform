import { z } from "zod";

export const skillCategorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  displayOrder: z.coerce.number().int().default(0),
});
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  categoryId: z.string().min(1, "Category is required"),
  proficiency: z.coerce.number().int().min(0).max(100).default(50),
  icon: z.string().max(60).optional().nullable(),
  published: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});
export type SkillInput = z.infer<typeof skillSchema>;
