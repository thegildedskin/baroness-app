"use client";

// The Purse — a read-only view of the server-authoritative gem wallet: current
// balance + the transaction ledger (earns and spends). Data from /api/wallet.

import { useEffect, useState } from "react";
import { getWallet, type GemTx } from "@/lib/wallet";
import { REDEMPTION_TIERS } from "@/lib/rewards";

type Code = { code: string; value_cents: number; redeemed_at: string | null; created_at: string };

function prettyReason(r: string): string {
  if (!r) return "Adjustment";
  const [kind, ...rest] = r.split(":");
  const label = rest.join(":").replace(/-/g, " ");
  const map: Record<string, string> = { livery: "Butler livery", mission: "Mission reward", quarters: "Quarters ware", redeem: "Favor redeemed", commission: "Booking reward", hunt: "Curiosity found", community: "Community royalty" };
  const head = map[kind] || kind.replace(/-/g, " ");
  return label ? `${head} · ${label}` : head;
}
const fmtDate = (s: string) => { try { return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; } };

// group transactions by calendar day, preserving newest-first order
function groupByDay(txs: GemTx[]): { day: string; net: number; items: GemTx[] }[] {
  const groups: { day: string; net: number; items: GemTx[] }[] = [];
  const index = new Map<string, number>();
  for (const t of txs) {
    const day = fmtDate(t.created_at) || "Earlier";
    let g = index.get(day);
    if (g === undefined) { g = groups.length; index.set(day, g); groups.push({ day, net: 0, items: [] }); }
    groups[g].items.push(t);
    groups[g].net += t.delta;
  }
  return groups;
}

export default function Wallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txs, setTxs] = useState<GemTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<Code[]>([]);
  const [redeeming, setRedeeming] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");

  useEffect(() => {
    getWallet().then((w) => { setBalance(w.balance); setTxs(w.transactions); setLoading(false); });
    fetch("/api/redeem").then((r) => (r.ok ? r.json() : { codes: [] })).then((j) => setCodes(j.codes || [])).catch(() => { /* signed out */ });
  }, []);

  async function redeem(tierId: string) {
    setRedeeming(tierId);
    setRedeemMsg("");
    try {
      const r = await fetch("/api/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tier: tierId }) });
      const j = await r.json();
      if (!r.ok) { setRedeemMsg(j.error || "Redemption failed."); }
      else {
        setBalance(j.balance);
        setRedeemMsg(`Minted: ${j.code} — present it at the counter.`);
        setCodes((c) => [{ code: j.code, value_cents: j.valueCents, redeemed_at: null, created_at: new Date().toISOString() }, ...c]);
        getWallet().then((w) => setTxs(w.transactions)); // refresh ledger with the spend
      }
    } catch { setRedeemMsg("Network error — nothing was spent."); }
    setRedeeming("");
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "var(--space-10) var(--space-8)", color: "var(--quarter-text)" }}>
      <div style={{ fontFamily: "var(--caps)", fontSize: "var(--text-label-sm)", letterSpacing: "var(--track-caps-wide)", textTransform: "uppercase", color: "var(--gold)" }}>
        The Kingdom · Your Purse
      </div>
      <h1 style={{ margin: "6px 0 0", fontFamily: "var(--display)", fontWeight: 700, fontSize: "var(--text-hero)", lineHeight: "var(--leading-tight)", color: "var(--cream)" }}>
        The Purse
      </h1>

      {/* balance */}
      <div style={{ marginTop: "var(--space-8)", border: "1px solid var(--gold)", borderRadius: "var(--radius-xl)", padding: "26px 28px", background: "linear-gradient(180deg,rgba(184,146,74,.14),rgba(184,146,74,.03))", boxShadow: "var(--glow-gold)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--caps)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)" }}>Gems in the coffer</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 52, color: "var(--gold-pale)", fontWeight: 700, marginTop: 6 }}>
          <span style={{ color: "var(--rose)" }}>◆</span> {balance ?? "…"}
        </div>
      </div>

      {/* redemption — gems become real discounts (the retention loop) */}
      <div style={{ marginTop: "var(--space-6)", border: "1px solid var(--gold)", borderRadius: "var(--radius-xl)", background: "linear-gradient(180deg,rgba(184,146,74,.10),rgba(184,146,74,.02))", padding: "16px 18px" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--cream)", fontWeight: 600, marginBottom: 4 }}>Her Grace&rsquo;s favors</div>
        <p style={{ fontStyle: "italic", color: "var(--quarter-muted)", fontSize: 12.5, margin: "0 0 12px" }}>
          Trade crown points for real discounts — codes are honored at the counter, on sittings and merch.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {REDEMPTION_TIERS.map((t) => {
            const afford = (balance ?? 0) >= t.gems;
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(184,146,74,.25)", borderRadius: 10, padding: "10px 12px" }}>
                <span style={{ flex: 1, fontSize: 14.5 }}>{t.label}</span>
                <span style={{ fontFamily: "var(--caps)", fontSize: 12, color: "var(--gold-pale)" }}>◆{t.gems}</span>
                <button
                  disabled={!afford || redeeming === t.id}
                  onClick={() => redeem(t.id)}
                  style={{ fontFamily: "var(--caps)", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", padding: "8px 14px", borderRadius: 3, cursor: afford ? "pointer" : "default", opacity: afford ? 1 : 0.4, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)" }}
                >
                  {redeeming === t.id ? "Minting…" : "Redeem"}
                </button>
              </div>
            );
          })}
        </div>
        {redeemMsg && <p style={{ marginTop: 10, fontSize: 13.5, color: redeemMsg.startsWith("Minted") ? "#9fc48f" : "#e0a06a" }}>{redeemMsg}</p>}
        {codes.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: "var(--caps)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Your codes</div>
            {codes.map((c) => (
              <div key={c.code} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5, padding: "4px 0" }}>
                <span style={{ fontFamily: "monospace", letterSpacing: 1, color: c.redeemed_at ? "var(--quarter-muted)" : "var(--gold-pale)", textDecoration: c.redeemed_at ? "line-through" : "none" }}>{c.code}</span>
                <span style={{ color: "var(--quarter-muted)" }}>${(c.value_cents / 100).toFixed(0)} off{c.redeemed_at ? " · used" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ledger */}
      <div style={{ marginTop: "var(--space-6)", border: "1px solid rgba(184,146,74,.28)", borderRadius: "var(--radius-xl)", background: "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))", padding: "16px 18px" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--cream)", fontWeight: 600, marginBottom: 10 }}>The ledger of the purse</div>
        {loading ? (
          <p style={{ fontStyle: "italic", color: "var(--quarter-muted)", fontSize: 13 }}>Counting the coffer…</p>
        ) : txs.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "var(--quarter-muted)", fontSize: 13, lineHeight: 1.6 }}>
            No entries yet. Sign in and the house will keep your purse across every room and device — earn gems from missions, spend them on liveries and wares. (Signed out, your purse is kept only on this device.)
          </p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {groupByDay(txs).map((g) => (
              <div key={g.day}>
                {/* day header with net */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid rgba(184,146,74,.3)", paddingBottom: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: "var(--caps)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)" }}>{g.day}</span>
                  <span style={{ fontFamily: "var(--caps)", fontSize: 11, color: g.net >= 0 ? "#9fc48f" : "#e0a06a" }}>{g.net >= 0 ? "+" : "−"}◆{Math.abs(g.net)} net</span>
                </div>
                {g.items.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 2px", fontSize: 14 }}>
                    <span style={{ flex: 1, color: "var(--quarter-text)" }}>{prettyReason(t.reason)}</span>
                    <span style={{ fontFamily: "var(--caps)", fontWeight: 700, minWidth: 60, textAlign: "right", color: t.delta >= 0 ? "#9fc48f" : "#e0a06a" }}>
                      {t.delta >= 0 ? "+" : "−"}◆{Math.abs(t.delta)}
                    </span>
                    <span style={{ minWidth: 54, textAlign: "right", color: "var(--gold-pale)", fontFamily: "var(--caps)", fontSize: 12 }}>{t.balance_after}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ marginTop: "var(--space-6)", textAlign: "center" }}>
        <a href="/kingdom" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold-dark)" }}>← Return to the Kingdom</a>
      </p>
    </div>
  );
}
