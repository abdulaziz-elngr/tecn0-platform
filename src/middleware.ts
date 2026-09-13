import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Layer 1 of defense-in-depth auth (spec §8). This blocks unauthenticated
 * requests to /admin/* at the edge, before any page or server action runs.
 * Layer 2 (server-side session check inside each admin page/layout) and
 * layer 3 (authorization checks inside individual server actions) are
 * implemented separately — this middleware alone is never treated as
 * sufficient on its own.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
