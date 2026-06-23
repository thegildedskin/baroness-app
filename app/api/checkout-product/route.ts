import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const PLATFORM_FEE_PCT = 15; // house keeps this % of each artist sale

export async function POST(req: NextRequest) {
  let productId = "";
  try { productId = (await req.json()).productId; } catch { /* noop */ }
  if (!productId) return NextResponse.json({ error: "Missing product." }, { status: 400 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments not configured yet." }, { status: 500 });

  const admin = createAdminClient();
  const { data: p } = await admin.from("products").select("id, title, price_cents, artist_id, is_active, artists(stripe_account_id, payouts_enabled)").eq("id", productId).single();
  if (!p || !p.is_active) return NextResponse.json({ error: "Not available." }, { status: 404 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const a = Array.isArray(p.artists) ? p.artists[0] : p.artists;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: p.price_cents, product_data: { name: p.title } } }],
    metadata: { type: "product", productId: p.id, artistId: p.artist_id },
    success_url: `${base}/shop/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/`,
  };
  if (a?.stripe_account_id && a?.payouts_enabled) {
    params.payment_intent_data = {
      application_fee_amount: Math.round(p.price_cents * PLATFORM_FEE_PCT / 100),
      transfer_data: { destination: a.stripe_account_id },
    };
  }
  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
