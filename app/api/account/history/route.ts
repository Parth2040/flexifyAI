import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserTransactions } from "@/lib/models/user";

/**
 * GET /api/account/history
 * Returns the signed-in user's credit usage/purchase history (newest first).
 */
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const transactions = await getUserTransactions(user.id);
  const history = transactions.map((t) => ({
    id: t._id?.toString(),
    type: t.type, // "purchase" | "spend"
    amount: t.amount,
    balanceAfter: t.balanceAfter,
    reason: t.reason,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ history });
}
