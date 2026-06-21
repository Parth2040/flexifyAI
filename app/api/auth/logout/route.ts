import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
