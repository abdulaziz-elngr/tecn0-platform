import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required").max(160),
  message: z.string().min(10, "Message is too short").max(5000),
  // Honeypot field: real users never fill this in (hidden via CSS from sighted
  // users, but bots that fill every field will trip it). Must stay empty.
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
