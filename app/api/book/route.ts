import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPOSIT_CENTS = 10000; // $100 consultation deposit

// Fast-track booking — NO login required (that's the point). Takes the booking
// details, records them best-effort, and (if Stripe is configured) returns a
// $100 deposit Checkout URL. The paid deposit is what locks the date.
export async function POST(req: NextRequest) {
  let b: Record<string, string> = {};
  try { b = await req.json(); } catch { /* noop */ }
  const name = (b.name || "").trim();
  const contact = (b.contact || "").trim();
  const slot = (b.slot || "").trim();
  if (!name || !contact) return NextResponse.json({ error: "Please give your name and how to reach you." }, { status: 400 });

  const booking = {
    name, contact, slot,
    artist_id: b.artistId || null,
    artist_name: b.artistName || "First available",
    placement: b.placement || null,
    idea: (b.idea || "").slice(0, 800) || null,
  };

  // Best-effort record (ignored if the bookings table doesn't exist yet).
  try {
    const supabase = createClient();
    await supabase.from("bookings").insert({ ...booking, status: "requested", created_at: new Date().toISOString() });
  } catch { /* noop */ }

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  // No Stripe → still a valid request; the studio will follow up with a deposit link.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ url: `${base}/book/thanks?pending=1` });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: isEmail ? contact : undefined,
      line_items: [{
        quantity: 1,
        price_data: { currency: "usd", unit_amount: DEPOSIT_CENTS, product_data: { name: "Baroness Tattoo — Consultation Deposit", description: "Applied to your piece · fully transferable · 48-hour notice" } },
      }],
      metadata: {
        name, contact, slot,
        artist: booking.artist_name.slice(0, 90),
        placement: (booking.placement || "").slice(0, 90),
        idea: (booking.idea || "").slice(0, 480),
      },
      success_url: `${base}/book/thanks?ok=1`,
      cancel_url: `${base}/book`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Could not start checkout." }, { status: 500 });
  }
}
