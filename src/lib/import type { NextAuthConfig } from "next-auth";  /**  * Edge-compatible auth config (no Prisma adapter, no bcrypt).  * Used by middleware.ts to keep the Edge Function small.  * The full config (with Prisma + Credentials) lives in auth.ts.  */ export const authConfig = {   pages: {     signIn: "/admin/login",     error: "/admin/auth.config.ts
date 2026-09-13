import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma adapter, no bcrypt).
 * Used by middleware.ts to keep the Edge Function small.
 * The full config (with Prisma + Credentials) lives in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
