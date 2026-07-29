// Client helper for the server-authoritative gem wallet (/api/wallet).
// getWallet() reads the balance + history; applyGems() credits/debits atomically
// on the server (which refuses overspend). When unauthenticated / offline it
// falls back to a local best-effort balance so the prototype still works — but the
// server is the source of truth for logged-in guests.

const LKEY = "baroness-wallet"; // shared fallback key (also used by lib/state)

export type GemTx = { delta: number; reason: string; balance_after: number; created_at: string };

function localBalance(): number {
  if (typeof window === "undefined") return 250;
  try { const v = localStorage.getItem(LKEY); return v != null ? Number(JSON.parse(v)) : 250; } catch { return 250; }
}
function setLocal(n: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LKEY, JSON.stringify(n)); } catch { /* noop */ }
}

/** Current balance + recent transactions (server → local fallback). */
export async function getWallet(): Promise<{ balance: number; transactions: GemTx[] }> {
  try {
    const r = await fetch("/api/wallet", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      if (typeof j.balance === "number") { setLocal(j.balance); return { balance: j.balance, transactions: j.transactions || [] }; }
    }
  } catch { /* offline / unauthenticated */ }
  return { balance: localBalance(), transactions: [] };
}

/**
 * Apply a signed gem delta (positive = earn, negative = spend).
 * Returns the new balance, or `null` if it would overspend (rejected).
 */
export async function applyGems(delta: number, reason = ""): Promise<number | null> {
  try {
    const r = await fetch("/api/wallet", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ delta, reason }),
    });
    if (r.ok) { const j = await r.json(); if (typeof j.balance === "number") { setLocal(j.balance); return j.balance; } }
    if (r.status === 400) return null; // server rejected (insufficient)
  } catch { /* offline / unauthenticated → local best-effort below */ }
  const next = localBalance() + delta;
  if (next < 0) return null;
  setLocal(next);
  return next;
}
