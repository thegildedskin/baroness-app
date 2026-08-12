"use client";

import { useState } from "react";

// Client-side checkout triggers for /shop. Two flavours:
//  - BuyProductButton → POST /api/checkout-product (existing flow)
//  - GiftCardCard     → POST /api/checkout-gift (preset amounts)

const btn: React.CSSProperties = {
  fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12,
  color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)",
  borderRadius: 3, padding: "12px 22px", cursor: "pointer",
};

async function goCheckout(path: string, body: object, setBusy: (b: boolean) => void, setErr: (e: string) => void) {
  setErr("");
  setBusy(true);
  try {
    const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (j.url) { window.location.href = j.url; return; }
    setErr(j.error || "Checkout unavailable — please try again.");
  } catch {
    setErr("Network error — please try again.");
  }
  setBusy(false);
}

export function BuyProductButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <button style={{ ...btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => goCheckout("/api/checkout-product", { productId }, setBusy, setErr)}>
        {busy ? "One moment…" : "Buy"}
      </button>
      {err && <p style={{ color: "#a33", fontSize: 13, marginTop: 6 }}>{err}</p>}
    </div>
  );
}

export function GiftCardButton({ amountCents }: { amountCents: number }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <button style={{ ...btn, opacity: busy ? 0.6 : 1, width: "100%" }} disabled={busy} onClick={() => goCheckout("/api/checkout-gift", { amountCents }, setBusy, setErr)}>
        {busy ? "One moment…" : `Give $${amountCents / 100}`}
      </button>
      {err && <p style={{ color: "#a33", fontSize: 13, marginTop: 6 }}>{err}</p>}
    </div>
  );
}
