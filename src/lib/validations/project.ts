import { z } from "zod";
import { contentOwnerSchema } from "./content-owner";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectSchema = z.object({
  title: z.string().min(3, "Title is required").max(120),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(slugRegex, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
  shortDescription: z.string().min(10, "Short description is required").max(220),
  fullDescription: z.string().max(20000).optional().nullable(),
  category: z.string().min(1, "Category is required"),
  technologies: z.array(z.string().min(1)).default([]),
  role: z.string().max(120).optional().nullable(),
  projectDate: z.coerce.date().optional().nullable(),
  problem: z.string().max(8000).optional().nullable(),
  solution: z.string().max(8000).optional().nullable(),
  features: z.array(z.string().min(1)).default([]),
  challenges: z.string().max(8000).optional().nullable(),
  results: z.string().max(8000).optional().nullable(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  featuredImage: z.string().optional().nullable(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  owner: contentOwnerSchema,
});

export type ProjectInput = z.infer<typeof projectSchema>;

/** Deterministic slug generator used by the admin form's "generate from title" action. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
