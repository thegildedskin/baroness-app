import Link from "next/link";

export const metadata = { title: "Page Not Found · Baroness Tattoo" };

// A wrong turn in the estate — dark rococo, kept simple.
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--estate-black)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold)" }}>❦</div>
        <div style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: "10px 0 6px" }}>404</div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 40, color: "var(--cream)", margin: 0, lineHeight: 1.1 }}>
          This wing doesn&rsquo;t exist
        </h1>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, color: "var(--gold-light)", fontStyle: "italic", lineHeight: 1.6, margin: "14px 0 0" }}>
          You&rsquo;ve wandered past the last candle. Let us walk you back to the entrance hall.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 2, padding: "13px 22px", textDecoration: "none" }}>Return to the Estate</Link>
          <Link href="/book" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", border: "1px solid var(--gold-dark)", borderRadius: 2, padding: "13px 22px", textDecoration: "none" }}>Book a Consultation</Link>
        </div>
      </div>
    </main>
  );
}
