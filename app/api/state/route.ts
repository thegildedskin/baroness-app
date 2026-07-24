import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared player state — one key-value row per (user, key). See lib/state.ts and
// supabase/baroness-state.sql. Unauthenticated callers get 401; the client lib
// then falls back to localStorage, so the prototype works with or without login.
const KEYS = new Set(["wallet", "curiosities", "butler-skins", "artist-works", "my-quarters"]);

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!KEYS.has(key)) return NextResponse.json({ error: "unknown key" }, { status: 400 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data, error } = await supabase.from("player_state").select("value").eq("user_id", user.id).eq("key", key).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ value: data?.value ?? null });
}

export async function POST(req: NextRequest) {
  let body: { key?: string; value?: unknown } = {};
  try { body = await req.json(); } catch { /* noop */ }
  const key = body.key || "";
  if (!KEYS.has(key)) return NextResponse.json({ error: "unknown key" }, { status: 400 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { error } = await supabase
    .from("player_state")
    .upsert({ user_id: user.id, key, value: body.value ?? null, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
