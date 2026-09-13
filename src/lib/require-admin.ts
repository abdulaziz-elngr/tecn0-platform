import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Layer 2/3 of defense-in-depth auth. Call one of the guards below at the
 * top of every server action and every route handler that touches admin
 * data — never rely on middleware (layer 1, edge-only, session-existence
 * only) or the client hiding a button as the sole gate for a mutation.
 *
 * Both guards throw. `AuthError` carries an HTTP-style `status` so callers
 * (or a shared error boundary) can map it to a proper 401/403 instead of a
 * generic 500.
 */
export class AuthError extends Error {
  status: 401 | 403;
  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Resolves the caller from the server-side session, then re-reads their
 * role from the database rather than trusting the JWT's `role` claim in
 * isolation. The JWT is server-signed so it can't be forged by the client,
 * but a role can be downgraded or an account disabled after a token was
 * issued (up to the 8h session lifetime) — re-checking the DB means a
 * revoked admin loses access immediately instead of at next login.
 */
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("Unauthorized: you must be signed in as an admin.", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, image: true },
  });

  if (!dbUser) {
    // Account was deleted after the session/JWT was issued.
    throw new AuthError("Unauthorized: your account no longer exists.", 401);
  }

  return dbUser;
}

/**
 * ADMIN-only gate. Use for anything that affects the whole platform's
 * configuration, identity, or security posture: Settings, Branding,
 * Personal Profile, SEO, Social Links, Security, Users, Activity Logs,
 * Analytics.
 */
export async function requireAdmin() {
  const user = await getAuthenticatedUser();
  if (user.role !== "ADMIN") {
    throw new AuthError("Forbidden: this action requires an administrator.", 403);
  }
  return user;
}

/**
 * ADMIN or EDITOR gate. Use for day-to-day content management that an
 * editor should reasonably be trusted with: Projects, Skills, Experience,
 * Certificates, Services, Blog, and Messages.
 *
 * NOTE: this ADMIN/EDITOR split is a reasonable default, not a spec you
 * gave me — if editors should be blocked from some of these too (e.g.
 * deleting messages), tell me and I'll narrow it further per-action.
 */
export async function requireStaff() {
  const user = await getAuthenticatedUser();
  const allowed: Role[] = ["ADMIN", "EDITOR"];
  if (!allowed.includes(user.role)) {
    throw new AuthError("Forbidden: staff access required.", 403);
  }
  return user;
}
