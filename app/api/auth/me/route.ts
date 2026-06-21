import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * GET /api/auth/me
 * Returns the currently signed-in user (or null). Used by client components to
 * know the auth state, since the session cookie is httpOnly.
 */
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}
