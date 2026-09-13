import { z } from "zod";
import { contentOwnerSchema } from "./content-owner";

export const serviceSchema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  description: z.string().min(10, "Description is required").max(2000),
  icon: z.string().max(60).optional().nullable(),
  features: z.array(z.string().min(1)).default([]),
  displayOrder: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
  owner: contentOwnerSchema,
});
export type ServiceInput = z.infer<typeof serviceSchema>;
