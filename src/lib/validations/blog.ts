import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title is required").max(160),
  slug: z.string().min(3).max(160).regex(slugRegex, "Use lowercase, hyphen-separated words"),
  excerpt: z.string().min(10, "Excerpt is required").max(400),
  content: z.string().min(20, "Content is required"),
  coverImage: z.string().optional().nullable(),
  categoryName: z.string().max(80).optional().nullable(),
  tagNames: z.array(z.string().min(1)).default([]),
  readingTimeMins: z.coerce.number().int().min(1).max(180).default(3),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;
