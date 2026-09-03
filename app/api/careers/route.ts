import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStr, isEmail, createRateLimiter, isBot, clientIp } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Careers application intake — same hardening as /api/book (tested lib/booking):
// honeypot, per-IP rate limit, sanitized fields, best-effort insert.
const rateLimited = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

export async function POST(req: NextRequest) {
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* noop */ }

  if (isBot(b)) return NextResponse.json({ ok: true }); // pretend success, record nothing
  if (rateLimited(clientIp(req.headers.get("x-forwarded-for")))) {
    return NextResponse.json({ error: "Too many submissions — try again later." }, { status: 429 });
  }

  const name = sanitizeStr(b.name, 120);
  const email = sanitizeStr(b.email, 200);
  if (!name || !isEmail(email)) {
    return NextResponse.json({ error: "Please give your name and a valid email." }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("job_applications").insert({
      name,
      email: email.toLowerCase(),
      phone: sanitizeStr(b.phone, 40) || null,
      instagram: sanitizeStr(b.instagram, 80) || null,
      role: sanitizeStr(b.role, 60) || "Tattoo Artist",
      years_experience: sanitizeStr(b.years, 40) || null,
      licensed: b.licensed === true ? true : b.licensed === false ? false : null,
      portfolio_url: sanitizeStr(b.portfolio, 400) || null,
      message: sanitizeStr(b.message, 2000) || null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not submit right now — email us at hello@baronesstattoo.com instead." },
      { status: 500 },
    );
  }
}
