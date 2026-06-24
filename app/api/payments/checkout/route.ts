import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { createCheckout, getPlanById } from "@/lib/polar";

/**
 * POST /api/payments/checkout
 * Body: { planId }
 * Creates a Polar checkout for the signed-in user and returns the hosted
 * checkout URL to redirect to.
 */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (!process.env.POLAR_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add POLAR_ACCESS_TOKEN." },
      { status: 503 }
    );
  }

  try {
    const { planId } = (await request.json()) as { planId?: string };
    const plan = planId ? getPlanById(planId) : undefined;
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const { checkoutUrl } = await createCheckout({
      plan,
      customer: { email: user.email, name: user.name },
      returnUrl: `${origin}/payment/success`,
      // Echoed back on the webhook so we credit the right user/plan.
      metadata: { userId: user.id, planId: plan.id },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
