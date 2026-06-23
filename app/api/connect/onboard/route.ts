import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments not configured yet." }, { status: 500 });

  let artistId = "";
  try { artistId = (await req.json()).artistId || ""; } catch { /* noop */ }
  const admin = createAdminClient();
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  let artist: { id: string; stripe_account_id: string | null } | null = null;
  if (prof?.role === "owner" && artistId) {
    const { data } = await admin.from("artists").select("id, stripe_account_id").eq("id", artistId).single();
    artist = data;
  } else {
    const { data } = await admin.from("artists").select("id, stripe_account_id").eq("user_id", user.id).maybeSingle();
    artist = data;
  }
  if (!artist) return NextResponse.json({ error: "No artist profile is linked to your account." }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let acct = artist.stripe_account_id;
  if (!acct) {
    const created = await stripe.accounts.create({ type: "express", metadata: { artistId: artist.id } });
    acct = created.id;
    await admin.from("artists").update({ stripe_account_id: acct }).eq("id", artist.id);
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const link = await stripe.accountLinks.create({
    account: acct,
    refresh_url: `${base}/dashboard`,
    return_url: `${base}/api/connect/return?artist=${artist.id}`,
    type: "account_onboarding",
  });
  return NextResponse.json({ url: link.url });
}
