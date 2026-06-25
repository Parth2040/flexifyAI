import type { NextRequest } from "next/server";

/**
 * Returns the app's base origin (scheme + host), used to build OAuth redirect
 * URIs and payment return URLs.
 *
 * Prefers NEXT_PUBLIC_APP_URL, falling back to the incoming request origin.
 * Defensively ensures the result has a scheme and no trailing slash — a missing
 * scheme (e.g. "my-app.vercel.app") otherwise produces an invalid redirect_uri
 * that Google rejects with `invalid_request`.
 */
export function getOrigin(request: NextRequest): string {
  let origin = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).trim();
  if (!/^https?:\/\//i.test(origin)) {
    origin = `https://${origin}`;
  }
  return origin.replace(/\/+$/, "");
}
