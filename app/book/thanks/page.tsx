export const metadata = { title: "The Chair Is Yours · Baroness Tattoo" };

export default function ThanksPage({ searchParams }: { searchParams: { pending?: string } }) {
  const pending = searchParams?.pending === "1";
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold-dark)" }}>❦</div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 40, color: "var(--black)", margin: "6px 0 0", lineHeight: 1.1 }}>
          {pending ? "Your request is in" : "The chair is yours"}
        </h1>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, color: "#3a2f22", lineHeight: 1.6, margin: "14px 0 0" }}>
          {pending
            ? "We’ve received your details and will reach out shortly with a deposit link to lock your date."
            : "Deposit received — your consultation is booked. We’ll be in touch with the particulars. Welcome to the estate."}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <a href="/" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 2, padding: "13px 22px", textDecoration: "none" }}>Return to the Estate</a>
          <a href="/gallery" style={{ fontFamily: "var(--caps)", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 2, padding: "13px 22px", textDecoration: "none" }}>See the Gallery</a>
        </div>
      </div>
    </main>
  );
}
