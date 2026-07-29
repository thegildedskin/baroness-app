import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-authoritative gem wallet (see supabase/baroness-wallet.sql).
// GET  → { balance, transactions[] }
// POST { delta, reason } → { balance }   (400 if it would overspend)
// Unauthenticated → 401; the client lib then falls back to a local best-effort balance.

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

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
