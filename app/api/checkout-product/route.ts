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
  type StripeBits = { stripe_account_id: string | null; payouts_enabled: boolean | null };
  type ProdRow = { id: string; title: string; price_cents: number; artist_id: string; is_active: boolean; kind: string | null; claimable?: boolean | null; artists: StripeBits | StripeBits[] | null };
  const cols = "id, title, price_cents, artist_id, is_active, kind, artists(stripe_account_id, payouts_enabled)";
  let p: ProdRow | null = null;
  {
    const res = await admin.from("products").select(`${cols}, claimable`).eq("id", productId).single();
    p = (res.data ?? null) as ProdRow | null;
    // Pre-migration-012 path (no claimable column yet): retry without it.
    if (!p && res.error) {
      const retry = await admin.from("products").select(cols).eq("id", productId).single();
      p = (retry.data ?? null) as ProdRow | null;
    }
  }
  if (!p || !p.is_active) return NextResponse.json({ error: "Not available." }, { status: 404 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const a = Array.isArray(p.artists) ? p.artists[0] : p.artists;
  // Flash "claim this design": the purchase claims the one-off design and
  // doubles as the session deposit — the webhook + thank-you page read
  // kind/claimable from metadata to say so.
  const isFlashClaim = p.kind === "flash" && !!p.claimable;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: p.price_cents,
        product_data: {
          name: isFlashClaim ? `${p.title} — flash design + session deposit` : p.title,
        },
      },
    }],
    metadata: { type: "product", productId: p.id, artistId: p.artist_id, kind: p.kind ?? "", claimable: isFlashClaim ? "1" : "" },
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
