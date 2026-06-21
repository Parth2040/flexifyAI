import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signToken,
  verifyToken,
  type SessionUser,
} from "@/lib/auth";

/**
 * Cookie-backed session helpers for use inside Route Handlers and Server
 * Components. These read/write the httpOnly session cookie.
 */

/** Returns the signed-in user from the session cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/** Sign the user in by setting the session cookie. */
export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Sign the user out by clearing the session cookie. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type { SessionUser };
