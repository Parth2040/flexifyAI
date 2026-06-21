import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signToken } from "@/lib/auth";
import { upsertGoogleUser, toSessionUser } from "@/lib/models/user";

/**
 * GET /api/auth/google/callback
 * Google redirects here with a `code`. We exchange it for tokens, fetch the
 * user's profile, upsert the user in MongoDB, create a session, and send the
 * user to the image generation page.
 */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("g_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(reason)}`
    );

  // Validate the CSRF state and presence of the authorization code.
  if (!code || !state || !storedState || state !== storedState) {
    return fail("Sign-in was interrupted. Please try again.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("Google sign-in is not configured.");
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange the authorization code for tokens.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", await tokenRes.text());
      return fail("Could not complete Google sign-in.");
    }

    const { access_token } = (await tokenRes.json()) as {
      access_token?: string;
    };
    if (!access_token) return fail("Could not complete Google sign-in.");

    // 2. Fetch the user's profile.
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!profileRes.ok) {
      console.error("Google userinfo failed:", await profileRes.text());
      return fail("Could not read your Google profile.");
    }

    const profile = (await profileRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    // 3. Upsert the user in MongoDB (typed + schema-validated).
    const stored = await upsertGoogleUser(profile);

    // 4. Create the session and redirect into the app.
    const token = signToken(toSessionUser(stored));

    const response = NextResponse.redirect(`${origin}/generate`);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    response.cookies.delete("g_oauth_state");
    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return fail("Something went wrong during sign-in.");
  }
}
