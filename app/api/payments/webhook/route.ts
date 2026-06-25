import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWebhookSignature, getPlanById, getPlanByProductId } from "@/lib/polar";
import { addTokens, markEventProcessed } from "@/lib/models/user";

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

  // 3. Idempotency — process each event id at most once.
  const eventId = request.headers.get("webhook-id");
  if (eventId && !(await markEventProcessed(eventId))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 4. Handle the event.
  try {
    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        metadata?: Record<string, string>;
        product_id?: string;
        product?: { id?: string };
      };
    };

    const type = event.type ?? "";
    const data = event.data ?? {};

    // Credit the buyer when their one-time order is paid.
    if (type === "order.paid") {
      const userId = data.metadata?.userId;
      const planId = data.metadata?.planId;
      const productId = data.product_id ?? data.product?.id;
      const plan =
        (planId ? getPlanById(planId) : undefined) ??
        (productId ? getPlanByProductId(productId) : undefined);

      if (userId && plan) {
        const balance = await addTokens(userId, plan.tokens, `plan:${plan.id}`);
        console.log(
          `[polar] Credited ${plan.tokens} tokens to ${userId} (new balance ${balance})`
        );
      } else {
        console.warn("[polar] Could not attribute payment:", {
          userId,
          planId,
          productId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
