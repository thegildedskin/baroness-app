"use client";

// The Purse — a read-only view of the server-authoritative gem wallet: current
// balance + the transaction ledger (earns and spends). Data from /api/wallet.

import { useEffect, useState } from "react";
import { getWallet, type GemTx } from "@/lib/wallet";

function prettyReason(r: string): string {
  if (!r) return "Adjustment";
  const [kind, ...rest] = r.split(":");
  const label = rest.join(":").replace(/-/g, " ");
  const map: Record<string, string> = { livery: "Butler livery", mission: "Mission reward", quarters: "Quarters ware" };
  const head = map[kind] || kind.replace(/-/g, " ");
  return label ? `${head} · ${label}` : head;
}
const fmtDate = (s: string) => { try { return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; } };

export default function Wallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [txs, setTxs] = useState<GemTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWallet().then((w) => { setBalance(w.balance); setTxs(w.transactions); setLoading(false); });
  }, []);

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
          <div style={{ display: "grid", gap: 6 }}>
            {txs.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(184,146,74,.14)", padding: "8px 2px", fontSize: 14 }}>
                <span style={{ flex: 1, color: "var(--quarter-text)" }}>{prettyReason(t.reason)}</span>
                <span style={{ fontSize: 11, color: "var(--quarter-muted)", fontFamily: "var(--caps)", letterSpacing: ".08em" }}>{fmtDate(t.created_at)}</span>
                <span style={{ fontFamily: "var(--caps)", fontWeight: 700, minWidth: 60, textAlign: "right", color: t.delta >= 0 ? "#9fc48f" : "#e0a06a" }}>
                  {t.delta >= 0 ? "+" : "−"}◆{Math.abs(t.delta)}
                </span>
                <span style={{ minWidth: 54, textAlign: "right", color: "var(--gold-pale)", fontFamily: "var(--caps)", fontSize: 12 }}>{t.balance_after}</span>
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
