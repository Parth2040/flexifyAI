import crypto from "crypto";

/**
 * Polar Payments integration (dependency-free).
 *
 * All Polar HTTP calls and the webhook-signature check live in this one file so
 * they're easy to adjust once you add your access token / product IDs. Endpoints
 * and payload shapes follow the Polar API; verify against their docs
 * (https://docs.polar.sh) if a field name changes.
 */

// ── Environment / base URL ──────────────────────────────────────────────────
const ENVIRONMENT = process.env.POLAR_ENVIRONMENT || "sandbox";
const API_BASE =
  ENVIRONMENT === "production"
    ? "https://api.polar.sh"
    : "https://sandbox-api.polar.sh";

function getAccessToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set");
  return token;
}

// ── Plans → tokens mapping ──────────────────────────────────────────────────
// `productId` is read from env so the same code works across sandbox/production.
// Each successful payment credits `tokens` to the buyer's balance.
export interface PolarPlan {
  id: string;
  name: string;
  tokens: number;
  productId: string | undefined;
}

export const PLANS: PolarPlan[] = [
  {
    id: "starter",
    name: "Starter — 100 Credits",
    tokens: 100,
    productId: process.env.POLAR_PRODUCT_STARTER,
  },
  {
    id: "pro",
    name: "Pro — 500 Credits",
    tokens: 500,
    productId: process.env.POLAR_PRODUCT_PRO,
  },
  {
    id: "elite",
    name: "Elite — 6,000 Credits",
    tokens: 6000,
    productId: process.env.POLAR_PRODUCT_ELITE,
  },
];

/** Credits spent to generate (and unlock) one image. */
export const CREDITS_PER_GENERATION = 10;

export function getPlanById(id: string): PolarPlan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByProductId(productId: string): PolarPlan | undefined {
  return PLANS.find((p) => p.productId && p.productId === productId);
}

// ── Create a checkout ───────────────────────────────────────────────────────
export interface CheckoutResult {
  checkoutUrl: string;
  checkoutId?: string;
}

/**
 * Creates a Polar checkout and returns the hosted checkout URL.
 * `metadata` is echoed back on the webhook so we can attribute the payment to
 * the right user/plan.
 */
export async function createCheckout(params: {
  plan: PolarPlan;
  customer: { email: string; name: string };
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<CheckoutResult> {
  const { plan, customer, returnUrl, metadata } = params;

  if (!plan.productId) {
    throw new Error(
      `No Polar product configured for plan "${plan.id}". Set its POLAR_PRODUCT_* env var.`
    );
  }

  const res = await fetch(`${API_BASE}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [plan.productId],
      success_url: returnUrl,
      customer_email: customer.email,
      customer_name: customer.name,
      metadata,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Polar checkout failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { id?: string; url?: string };
  if (!data.url) {
    throw new Error("Polar did not return a checkout URL");
  }

  return { checkoutUrl: data.url, checkoutId: data.id };
}

// ── Webhook signature verification (Standard Webhooks) ──────────────────────
// Polar signs webhooks using the Standard Webhooks spec. The signed content is
// `${id}.${timestamp}.${rawBody}`, HMAC-SHA256 with the secret key, base64.
// The `webhook-signature` header is a space-separated list of `v1,<sig>` parts.
export function verifyWebhookSignature(
  rawBody: string,
  headers: {
    id?: string | null;
    timestamp?: string | null;
    signature?: string | null;
  }
): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET is not set");

  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  const signedContent = `${id}.${timestamp}.${rawBody}`;

  // Standard Webhooks secrets are base64 (optionally prefixed with "whsec_").
  // We also try the raw-utf8 secret as a fallback, so this works whether Polar
  // gives you a base64 or a plain secret string.
  const keys = [
    Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64"),
    Buffer.from(secret, "utf8"),
  ];

  // The header may contain multiple space-separated signatures ("v1,<sig>").
  const provided = signature.split(" ").map((part) => {
    const comma = part.indexOf(",");
    return comma >= 0 ? part.slice(comma + 1) : part;
  });

  return keys.some((key) => {
    const expected = crypto
      .createHmac("sha256", key)
      .update(signedContent)
      .digest("base64");
    return provided.some((sig) => {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
  });
}
