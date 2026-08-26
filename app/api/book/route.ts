import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStr, isEmail, createRateLimiter, isBot, clientIp } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPOSIT_CENTS = 10000; // $100 consultation deposit

// Rules + limiter live in lib/booking.ts (unit-tested); the route owns the I/O.
const rateLimited = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

// Fast-track booking — NO login required (that's the point). Takes the booking
// details, records them best-effort, and (if Stripe is configured) returns a
// $100 deposit Checkout URL. The paid deposit is what locks the date.
export async function POST(req: NextRequest) {
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* noop */ }
  const str = sanitizeStr;
  const name = str(b.name, 120);
  const contact = str(b.contact, 200);
  const slot = str(b.slot, 120);
  if (!name || !contact) return NextResponse.json({ error: "Please give your name and how to reach you." }, { status: 400 });

  const base0 = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  // Honeypot: pretend success so bots don't adapt; record nothing.
  if (isBot(b)) {
    return NextResponse.json({ url: `${base0}/book/thanks?pending=1` });
  }
  const ip = clientIp(req.headers.get("x-forwarded-for"));
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests — please try again in a bit, or call us at 469-246-7217." }, { status: 429 });
  }

  // Qualifying-intake fields (Phase 1). All nullable — migration 011 adds
  // the columns; if it hasn't been run, the insert of unknown columns fails
  // and we fall back to the legacy column set below.
  const intake = {
    email: str(b.email) || null,
    phone: str(b.phone, 40) || null,
    instagram: str(b.instagram, 80) || null,
    size: str(b.size, 60) || null,
    style: str(b.style, 60) || null,
    color_mode: str(b.colorMode, 30) || null,
    budget: str(b.budget, 40) || null,
    first_tattoo: b.firstTattoo === true ? true : null,
    cover_up: b.coverUp === true ? true : null,
    reference_url: str(b.referenceUrl, 500) || null,
  };

  const booking = {
    name, contact, slot,
    artist_id: str(b.artistId, 60) || null,
    artist_name: str(b.artistName, 120) || "First available",
    placement: str(b.placement, 90) || null,
    idea: str(b.idea, 800) || null,
  };

  // Best-effort record (ignored if the bookings table doesn't exist yet).
  // Keep the row id so the Stripe webhook can reconcile the paid deposit
  // back onto this booking.
  let bookingId: string | null = null;
  try {
    const supabase = createClient();
    let { data: inserted, error } = await supabase
      .from("bookings")
      .insert({ ...booking, ...intake, status: "requested", created_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) {
      // Migration 011 not applied yet → retry with the legacy column set so
      // the booking is never lost.
      ({ data: inserted } = await supabase
        .from("bookings")
        .insert({ ...booking, status: "requested", created_at: new Date().toISOString() })
        .select("id")
        .single());
    }
    if (inserted?.id != null) bookingId = String(inserted.id);
  } catch { /* noop — degraded no-supabase path; webhook still emails the studio */ }

  const base = base0;

  // No Stripe → still a valid request; the studio will follow up with a deposit link.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ url: `${base}/book/thanks?pending=1` });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customerEmail = intake.email || (isEmail(contact) ? contact : undefined);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [{
        quantity: 1,
        price_data: { currency: "usd", unit_amount: DEPOSIT_CENTS, product_data: { name: "Baroness Tattoo — Consultation Deposit", description: "Applied to your piece · fully transferable · 48-hour notice" } },
      }],
      metadata: {
        type: "deposit",
        booking_id: bookingId ?? "",
        name, contact, slot,
        artist: booking.artist_name.slice(0, 90),
        placement: (booking.placement || "").slice(0, 90),
        idea: (booking.idea || "").slice(0, 480),
        // Phase-1 intake context so the studio email is useful even without DB access
        details: [
          intake.size && `Size: ${intake.size}`,
          intake.style && `Style: ${intake.style}`,
          intake.color_mode && `Color: ${intake.color_mode}`,
          intake.budget && `Budget: ${intake.budget}`,
          intake.first_tattoo && "First tattoo",
          intake.cover_up && "Cover-up",
          intake.instagram && `IG: ${intake.instagram}`,
        ].filter(Boolean).join(" · ").slice(0, 480),
        reference: (intake.reference_url || "").slice(0, 480),
      },
      success_url: `${base}/book/thanks?ok=1`,
      cancel_url: `${base}/book`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Could not start checkout." }, { status: 500 });
  }
}
