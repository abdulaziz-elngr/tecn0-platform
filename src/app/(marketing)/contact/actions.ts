"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/message";
import { limitContact } from "@/lib/services/rate-limit";
import { headers } from "next/headers";
import { createHash } from "crypto";

export interface ContactState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""), // honeypot
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] !== "company") fieldErrors[String(issue.path[0])] = issue.message;
    }
    // Honeypot tripped — pretend success to the bot, do not insert anything.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) {
      return { success: true };
    }
    return { fieldErrors };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await limitContact(ip);
  if (!rl.success) {
    return { error: "Too many messages sent recently. Please try again later." };
  }

  // Store a hash of the IP, never the raw address, alongside the message —
  // enough for abuse investigation without keeping PII in the clear.
  const ipHash = createHash("sha256").update(ip).digest("hex");

  await prisma.message.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      ipHash,
    },
  });

  return { success: true };
}
