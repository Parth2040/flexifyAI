import crypto from "crypto";

/**
 * Pure, dependency-free session-token helpers.
 *
 * Kept separate from `lib/session.ts` (which imports `next/headers`) so this
 * module can be safely imported from `proxy.ts`, where `next/headers` is not
 * available. Tokens are signed with HMAC-SHA256 using AUTH_SECRET — no third
 * party auth library required.
 */

export const SESSION_COOKIE = "flexify_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface SessionPayload {
  user: SessionUser;
  exp: number; // unix seconds
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Falls back to an insecure dev secret so the app still runs before the
    // real AUTH_SECRET is provided. Sessions simply won't survive a secret
    // change — fine for local development.
    return "flexify-dev-insecure-secret-set-AUTH_SECRET";
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Create a signed session token for the given user. */
export function signToken(
  user: SessionUser,
  maxAgeSeconds = SESSION_MAX_AGE
): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const data = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest();
  return `${data}.${base64url(sig)}`;
}

/** Verify a session token. Returns the user, or null if invalid/expired. */
export function verifyToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;

  const data = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);

  const expectedSig = base64url(
    crypto.createHmac("sha256", getSecret()).update(data).digest()
  );

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64url(data).toString()) as SessionPayload;
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload.user ?? null;
  } catch {
    return null;
  }
}
