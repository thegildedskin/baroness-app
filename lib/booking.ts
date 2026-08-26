// Pure funnel logic for /api/book — extracted so it's unit-testable (tests/booking.test.ts).
// No I/O here: the route owns Stripe/Supabase; this owns validation + throttling rules.

/** Trim + truncate an untrusted value; non-strings become "". */
export function sanitizeStr(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function isEmail(v: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

/**
 * Sliding-window in-memory rate limiter (per key, usually per IP).
 * Per-serverless-instance by design — good enough to blunt drive-by spam;
 * move to Redis/Postgres if real abuse appears (see docs/AUDIT §risks).
 */
export function createRateLimiter(opts: { limit: number; windowMs: number; maxKeys?: number; now?: () => number }) {
  const { limit, windowMs, maxKeys = 5000, now = Date.now } = opts;
  const hits = new Map<string, number[]>();
  return function rateLimited(key: string): boolean {
    const t = now();
    const recent = (hits.get(key) || []).filter((x) => t - x < windowMs);
    if (recent.length >= limit) { hits.set(key, recent); return true; }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > maxKeys) hits.clear(); // crude memory cap
    return false;
  };
}

/** Honeypot check: the hidden "website" field is never filled by humans. */
export function isBot(body: Record<string, unknown>): boolean {
  return sanitizeStr(body.website, 500).length > 0;
}

/** First client IP from the forwarded-for chain, or "unknown". */
export function clientIp(forwardedFor: string | null): string {
  return (forwardedFor || "").split(",")[0].trim() || "unknown";
}
