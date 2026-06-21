import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signToken } from "@/lib/auth";
import { upsertEmailUser, toSessionUser } from "@/lib/models/user";

/**
 * POST /api/auth/login
 * Simplified email sign-in for the existing login form.
 *
 * NOTE: This is a lightweight, prototype-grade login — it identifies the user
 * by email and does NOT verify a password. Google sign-in (/api/auth/google)
 * is the secure path. Swap this out for real credential verification before
 * going to production.
 */
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    // Upsert the user record so their data is saved (typed + schema-validated).
    const stored = await upsertEmailUser(email.trim());
    const token = signToken(toSessionUser(stored));

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("Email login error:", error);
    return NextResponse.json(
      { error: "Could not sign you in. Please try again." },
      { status: 500 }
    );
  }
}
