import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierById, generateDiscountCode } from "@/lib/rewards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Redeem crown points for an in-studio discount code.
// POST { tier } → { code, valueCents, balance }
// Order of operations matters: spend the gems FIRST via apply_gems (atomic,
// refuses overspend, runs as the user), then mint the code with the service
// role. If the mint fails, refund the gems — the wallet ledger shows both
// legs, so nothing is ever silently lost.
export async function POST(req: NextRequest) {
  let body: { tier?: string } = {};
  try { body = await req.json(); } catch { /* noop */ }
  const tier = tierById(body.tier || "");
  if (!tier) return NextResponse.json({ error: "Unknown redemption tier." }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to redeem your crown points." }, { status: 401 });

  const { data: balance, error: spendErr } = await supabase.rpc("apply_gems", {
    p_delta: -tier.gems,
    p_reason: `redeem:$${(tier.valueCents / 100).toFixed(0)}-off`,
  });
  if (spendErr) {
    const insufficient = /insufficient/i.test(spendErr.message);
    return NextResponse.json(
      { error: insufficient ? `Not enough gems — that reward needs ◆${tier.gems}.` : spendErr.message },
      { status: insufficient ? 400 : 500 },
    );
  }

  try {
    const admin = createAdminClient();
    // Retry a couple of times on the (unlikely) unique-code collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = generateDiscountCode();
      const { error } = await admin.from("discount_codes").insert({
        code, user_id: user.id, value_cents: tier.valueCents, gems_spent: tier.gems,
      });
      if (!error) return NextResponse.json({ code, valueCents: tier.valueCents, balance });
      if (!/duplicate|unique/i.test(error.message)) throw error;
    }
    throw new Error("could not allocate a unique code");
  } catch (e) {
    // Mint failed (migration 015 missing, etc.) → refund the spend.
    try { await supabase.rpc("apply_gems", { p_delta: tier.gems, p_reason: "redeem:refund" }); } catch { /* ledger shows the spend either way */ }
    const msg = e instanceof Error ? e.message : "Redemption failed";
    return NextResponse.json({ error: `${msg} — your gems were refunded.` }, { status: 500 });
  }
}

// GET → the caller's codes (for the wallet page).
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data } = await supabase
    .from("discount_codes")
    .select("code,value_cents,redeemed_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ codes: data ?? [] });
}
