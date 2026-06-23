import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const PREMIUM_PRICE_CENTS = 1200; // $12.00 — edit to taste

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let artistId = "";
  try { artistId = (await req.json()).artistId; } catch { /* noop */ }
  if (!artistId) return NextResponse.json({ error: "Missing artist." }, { status: 400 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { data: art } = await supabase.from("artists").select("id, user_id").eq("id", artistId).single();
  const allowed = prof?.role === "owner" || (art && art.user_id === user.id);
  if (!art || !allowed) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments not configured yet." }, { status: 500 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: { currency: "usd", unit_amount: PREMIUM_PRICE_CENTS, product_data: { name: "Maison Baroness — Premium Looks" } },
    }],
    metadata: { artistId },
    success_url: `${base}/dashboard?id=${artistId}&premium=success`,
    cancel_url: `${base}/dashboard?id=${artistId}`,
  });
  return NextResponse.json({ url: session.url });
}
