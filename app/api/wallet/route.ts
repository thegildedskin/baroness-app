import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-authoritative gem wallet (see supabase/baroness-wallet.sql).
// GET  → { balance, transactions[] }   (also claims any pending funnel rewards)
// POST { delta, reason } → { balance }   (400 if it would overspend)
// Unauthenticated → 401; the client lib then falls back to a local best-effort balance.

/**
 * Claim pending funnel rewards (migration 013) for this user's email: the
 * Stripe webhook records deposit awards for guests who booked without an
 * account; the first authenticated wallet read applies them. Mark-claimed
 * FIRST (conditionally, via the admin client) so a concurrent request can't
 * double-apply; apply_gems runs as the user (auth.uid()) afterwards.
 */
async function claimPendingRewards(supabase: ReturnType<typeof createClient>, userId: string, email: string | null) {
  if (!email) return;
  try {
    const admin = createAdminClient();
    const { data: pending } = await admin
      .from("pending_rewards")
      .select("id,gems,reason")
      .eq("email", email.toLowerCase())
      .is("claimed_at", null)
      .limit(10);
    for (const p of pending ?? []) {
      const { data: won } = await admin
        .from("pending_rewards")
        .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
        .eq("id", p.id)
        .is("claimed_at", null) // atomic claim — loses gracefully to a concurrent request
        .select("id")
        .maybeSingle();
      if (won) await supabase.rpc("apply_gems", { p_delta: p.gems, p_reason: p.reason || "reward" });
    }
  } catch { /* migration 013 not applied / no service key — wallet still works */ }
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  await claimPendingRewards(supabase, user.id, user.email ?? null);

  const { data: last } = await supabase
    .from("gem_transactions").select("balance_after")
    .eq("user_id", user.id).order("id", { ascending: false }).limit(1).maybeSingle();
  const { data: txs } = await supabase
    .from("gem_transactions").select("delta,reason,balance_after,created_at")
    .eq("user_id", user.id).order("id", { ascending: false }).limit(25);

  return NextResponse.json({ balance: last?.balance_after ?? 250, transactions: txs ?? [] });
}

export async function POST(req: NextRequest) {
  let body: { delta?: number; reason?: string } = {};
  try { body = await req.json(); } catch { /* noop */ }
  const delta = Math.trunc(Number(body.delta) || 0);
  if (!delta) return NextResponse.json({ error: "delta required" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supabase.rpc("apply_gems", { p_delta: delta, p_reason: (body.reason || "").slice(0, 80) });
  if (error) {
    const insufficient = /insufficient/i.test(error.message);
    return NextResponse.json({ error: error.message }, { status: insufficient ? 400 : 500 });
  }
  return NextResponse.json({ balance: data });
}
