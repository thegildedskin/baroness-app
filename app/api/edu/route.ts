import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStr, isEmail, createRateLimiter, isBot, clientIp } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Academy waitlist intake — same tested hardening as /api/book and /api/careers.
const rateLimited = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

export async function POST(req: NextRequest) {
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* noop */ }

  if (isBot(b)) return NextResponse.json({ ok: true });
  if (rateLimited(clientIp(req.headers.get("x-forwarded-for")))) {
    return NextResponse.json({ error: "Too many submissions — try again later." }, { status: 429 });
  }

  const name = sanitizeStr(b.name, 120);
  const email = sanitizeStr(b.email, 200).toLowerCase();
  if (!name || !isEmail(email)) {
    return NextResponse.json({ error: "Please give your name and a valid email." }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("edu_waitlist").insert({
      name,
      email,
      interest: sanitizeStr(b.interest, 60) || "general",
      experience: sanitizeStr(b.experience, 1000) || null,
    });
    if (error && !/duplicate|unique/i.test(error.message)) throw error;
    return NextResponse.json({ ok: true }); // duplicates count as success — they're on the list
  } catch {
    return NextResponse.json({ error: "Could not submit right now — try again shortly." }, { status: 500 });
  }
}
