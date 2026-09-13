"use server";

import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { limitLogin } from "@/lib/services/rate-limit";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/services/activity-log";
import { headers } from "next/headers";
import { AuthError } from "next-auth";

export interface LoginState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await limitLogin(`${ip}:${parsed.data.email}`);
  if (!rl.success) {
    return { error: "Too many login attempts. Try again in a few minutes." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      await logActivity({
        userId: user.id,
        action: "LOGIN",
        entityType: "User",
        entityId: user.id,
        ipAddress: ip,
      });
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  return { success: true };
}
