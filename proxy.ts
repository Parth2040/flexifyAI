import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/**
 * Proxy (formerly "middleware" — renamed in Next.js 16).
 *
 * Protects the image generation route: unauthenticated visitors are redirected
 * to /login. This is an optimistic cookie-only check; the /api/generate route
 * also verifies the session server-side as the real line of defense.
 */
export function proxy(request: NextRequest) {
  const user = verifyToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate/:path*", "/account/:path*"],
};
