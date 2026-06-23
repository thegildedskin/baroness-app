import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const m = e instanceof Error ? e.message : "invalid signature";
    return NextResponse.json({ error: `Webhook error: ${m}` }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const artistId = session.metadata?.artistId;
    if (artistId) {
      const admin = createAdminClient();
      await admin.from("artists").update({ premium: true }).eq("id", artistId);
    }
  }
  return NextResponse.json({ received: true });
}
