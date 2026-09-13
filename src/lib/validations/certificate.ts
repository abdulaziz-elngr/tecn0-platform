import { z } from "zod";

export const certificateSchema = z.object({
  title: z.string().min(2, "Title is required").max(160),
  organization: z.string().min(2, "Organization is required").max(160),
  issueDate: z.coerce.date({ message: "A valid issue date is required" }),
  credentialId: z.string().max(120).optional().nullable(),
  credentialUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  image: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(4000).optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
});
export type CertificateInput = z.infer<typeof certificateSchema>;

export const CERTIFICATE_CATEGORIES = ["AI", "IoT", "Programming", "Web", "Events", "Other"];
