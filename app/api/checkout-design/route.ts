import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const PRICE_CENTS = 800; // export a design to your avatar + profile showcase

export async function POST(req: NextRequest) {
  let designId = "";
  try { designId = (await req.json()).designId; } catch { /* noop */ }
  if (!designId) return NextResponse.json({ error: "Missing design." }, { status: 400 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 500 });

  const admin = createAdminClient();
  const { data: d } = await admin.from("designs").select("id, title, user_id").eq("id", designId).single();
  if (!d) return NextResponse.json({ error: "Design not found." }, { status: 404 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: PRICE_CENTS, product_data: { name: `Tattoo export — ${d.title || "design"}` } } }],
    metadata: { type: "design_export", designId: d.id, userId: d.user_id ?? "" },
    success_url: `${base}/dashboard?exported=1`,
    cancel_url: `${base}/dashboard`,
  });
  return NextResponse.json({ url: session.url });
}
