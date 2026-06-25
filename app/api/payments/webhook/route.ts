import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWebhookSignature, getPlanById, getPlanByProductId } from "@/lib/polar";
import { addTokens, markEventProcessed, getUserIdByEmail } from "@/lib/models/user";

/**
 * POST /api/payments/webhook
 * Polar calls this on payment events. We verify the signature, then on a
 * successful order credit the buyer's token balance.
 *
 * Configure the endpoint URL in the Polar dashboard:
 *   https://<your-domain>/api/payments/webhook
 */
export async function POST(request: NextRequest) {
  // 1. Read the RAW body — required for signature verification.
  const rawBody = await request.text();

  // 2. Verify the Standard Webhooks signature.
  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, {
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    });
  } catch (err) {
    console.error("Webhook verify error:", (err as Error).message);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Handle the event.
  try {
    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        id?: string;
        metadata?: Record<string, string>;
        product_id?: string;
        product?: { id?: string };
        items?: { product_id?: string }[];
        checkout?: { metadata?: Record<string, string> };
        customer?: { email?: string };
        customer_email?: string;
      };
    };

    const type = event.type ?? "";
    const data = event.data ?? {};
    console.log(`[polar] webhook received: ${type}`);

    // Credit on a paid order (one-time purchase). Polar may send order.paid
    // and/or order.created — we dedupe by ORDER id so we only credit once.
    if (type === "order.paid" || type === "order.created") {
      const orderId = data.id;
      // Order-level idempotency (independent of how many events arrive).
      if (orderId && !(await markEventProcessed(`order:${orderId}`))) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      const metadata = data.metadata ?? data.checkout?.metadata ?? {};
      const planId = metadata.planId;
      const productId =
        data.product_id ?? data.product?.id ?? data.items?.[0]?.product_id;
      const plan =
        (planId ? getPlanById(planId) : undefined) ??
        (productId ? getPlanByProductId(productId) : undefined);

      // Attribute to a user: metadata.userId first, else by customer email.
      let userId: string | undefined = metadata.userId;
      if (!userId) {
        const email = data.customer?.email ?? data.customer_email;
        if (email) userId = (await getUserIdByEmail(email)) ?? undefined;
      }

      if (userId && plan) {
        const balance = await addTokens(userId, plan.tokens, `plan:${plan.id}`);
        console.log(
          `[polar] ${type} → credited ${plan.tokens} to ${userId} (balance ${balance})`
        );
      } else {
        console.warn("[polar] could not attribute order:", {
          type,
          orderId,
          resolvedUser: userId ?? null,
          planId: planId ?? null,
          productId: productId ?? null,
          customerEmail: data.customer?.email ?? data.customer_email ?? null,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
