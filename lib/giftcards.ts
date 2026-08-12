import { createHash } from "node:crypto";

// Gift cards — sold via Stripe Checkout (/api/checkout-gift), redeemed
// manually in-store. The code is a deterministic short-hash of the Stripe
// Checkout session id, so the webhook (which stores/emails it) and the
// thank-you page (which displays it) always agree without a DB round-trip.
// SERVER ONLY (node:crypto).

export const GIFT_AMOUNTS_CENTS = [5000, 10000, 25000] as const;

export function giftCardCode(sessionId: string): string {
  const h = createHash("sha256").update(sessionId).digest("hex").slice(0, 10).toUpperCase();
  return `BARONESS-${h.slice(0, 5)}-${h.slice(5)}`;
}
