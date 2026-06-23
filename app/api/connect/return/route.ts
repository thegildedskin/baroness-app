import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const artistId = searchParams.get("artist");
  if (artistId && process.env.STRIPE_SECRET_KEY) {
    try {
      const admin = createAdminClient();
      const { data: a } = await admin.from("artists").select("stripe_account_id").eq("id", artistId).single();
      if (a?.stripe_account_id) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const acct = await stripe.accounts.retrieve(a.stripe_account_id);
        await admin.from("artists").update({ payouts_enabled: !!acct.charges_enabled }).eq("id", artistId);
      }
    } catch { /* noop */ }
  }
  return NextResponse.redirect(`${origin}/dashboard${artistId ? `?id=${artistId}` : ""}`);
}
