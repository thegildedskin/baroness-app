"use client";

// Root error boundary — dark rococo, kept simple.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--estate-black, #0c0a08)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold, #B8924A)" }}>❦</div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 40, color: "var(--cream, #F5E9D3)", margin: "6px 0 0", lineHeight: 1.1 }}>
          A candle has gone out
        </h1>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, color: "var(--gold-light, #D4B574)", fontStyle: "italic", lineHeight: 1.6, margin: "14px 0 0" }}>
          Something in the house misbehaved. Try again — or return to the entrance hall while we relight it.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <button onClick={reset} style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--black, #1A1A1A)", background: "var(--gilt, #D4B574)", border: "1px solid var(--gold-dark, #8B6F35)", borderRadius: 2, padding: "13px 22px", cursor: "pointer" }}>Try Again</button>
          <a href="/" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold, #B8924A)", border: "1px solid var(--gold-dark, #8B6F35)", borderRadius: 2, padding: "13px 22px", textDecoration: "none" }}>Return to the Estate</a>
        </div>
      </div>
    </main>
  );
}
