// Client-side shared-state helper. API-first (persists per authenticated user via
// /api/state → Supabase), with a transparent localStorage fallback + mirror so the
// prototype works identically whether or not the guest is logged in / the DB is set up.
//
// Behaviour: loadState() tries the server, falls back to localStorage, then to the
// default. saveState() writes localStorage immediately (optimistic) and fires the
// server write in the background. Worst case (no auth / no DB) === today's localStorage.

export type StateKey = "wallet" | "curiosities" | "butler-skins" | "artist-works" | "my-quarters" | "curio-rewards";

const LOCAL: Record<StateKey, string> = {
  wallet: "baroness-wallet",
  curiosities: "baroness-curiosities",
  "butler-skins": "baroness-butler-skins",
  "artist-works": "baroness-artist-works",
  "my-quarters": "baroness-my-quarters",
  "curio-rewards": "baroness-curio-rewards",
};

function readLocal<T>(key: StateKey): T | undefined {
  if (typeof window === "undefined") return undefined;
  try { const v = localStorage.getItem(LOCAL[key]); return v ? (JSON.parse(v) as T) : undefined; } catch { return undefined; }
}
function writeLocal(key: StateKey, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL[key], JSON.stringify(value)); } catch { /* noop */ }
}

/** Load a value: server → localStorage → default. Also mirrors server value locally. */
export async function loadState<T>(key: StateKey, fallback: T): Promise<T> {
  try {
    const r = await fetch(`/api/state?key=${key}`, { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      if (j && j.value !== undefined && j.value !== null) {
        writeLocal(key, j.value);
        return j.value as T;
      }
    }
  } catch { /* offline / unauthenticated → local */ }
  const local = readLocal<T>(key);
  return local !== undefined ? local : fallback;
}

/** Persist a value: localStorage immediately, server in the background (best-effort). */
export function saveState(key: StateKey, value: unknown): void {
  writeLocal(key, value);
  try {
    fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value }),
      keepalive: true,
    }).catch(() => { /* ignore — local mirror already written */ });
  } catch { /* noop */ }
}
