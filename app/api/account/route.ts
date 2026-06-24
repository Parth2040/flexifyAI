import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserTokens } from "@/lib/models/user";

/**
 * GET /api/account
 * Returns the signed-in user plus their live token balance (read from the DB,
 * not the cookie, so it reflects purchases immediately).
 */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null, tokens: 0 }, { status: 401 });
  }
  const tokens = await getUserTokens(user.id);
  return NextResponse.json({ user, tokens });
}
