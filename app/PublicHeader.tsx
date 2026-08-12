// Slim shared header for the public content pages (artists, shop, reviews,
// faq, gallery, prep guide, aftercare) so they don't dead-end. Cream/estate
// styling to match the homepage. Server-rendered — the funnel is always
// visible without entering the estate experience.

const link: React.CSSProperties = {
  fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
  color: "var(--gold-dark)", textDecoration: "none",
};

export default function PublicHeader() {
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        padding: "12px 22px", background: "rgba(245,233,211,.92)", backdropFilter: "blur(6px)",
        borderBottom: "1px solid var(--gold)",
      }}
    >
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Baroness Tattoo" style={{ height: 30, width: "auto" }} />
      </a>
      <nav style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <a href="/artists" style={link}>Artists</a>
        <a href="/styles" style={link}>Styles</a>
        <a href="/gallery" style={link}>Gallery</a>
        <a href="/shop" style={link}>Shop</a>
        <a href="/reviews" style={link}>Reviews</a>
        <a href="/faq" style={link}>FAQ</a>
        <a href="/aftercare" style={link}>Aftercare</a>
        <a href="/book" style={{ ...link, color: "var(--black)", background: "linear-gradient(180deg,var(--gold-light),var(--gold))", border: "1px solid var(--gold-dark)", borderRadius: 999, padding: "9px 16px" }}>✦ Book</a>
      </nav>
    </header>
  );
}
