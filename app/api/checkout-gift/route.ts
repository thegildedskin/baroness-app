import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { GIFT_AMOUNTS_CENTS } from "@/lib/giftcards";

export const runtime = "nodejs";

// Gift-card checkout — preset amounts only ($50/$100/$250), following the
// /api/checkout-product pattern. The webhook (metadata type='gift_card')
// records the card in gift_cards and emails the studio + purchaser the code.
// Redemption is manual, in-store.
export async function POST(req: NextRequest) {
  let amountCents = 0;
  try { amountCents = Number((await req.json()).amountCents); } catch { /* noop */ }
  if (!(GIFT_AMOUNTS_CENTS as readonly number[]).includes(amountCents)) {
    return NextResponse.json({ error: "Invalid gift card amount." }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments not configured yet." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const dollars = amountCents / 100;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: {
          name: `Baroness Tattoo — $${dollars} Gift Card`,
          description: "Redeemable in-studio toward any tattoo or purchase. Code delivered after payment.",
        },
      },
    }],
    metadata: { type: "gift_card", amount_cents: String(amountCents) },
    success_url: `${base}/shop/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/shop`,
  });
  return NextResponse.json({ url: session.url });
}
