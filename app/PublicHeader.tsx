// Slim shared header for the public content pages (gallery, prep guide, aftercare)
// so they don't dead-end. Cream/estate styling to match the homepage.

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
      <nav style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <a href="/gallery" style={link}>Gallery</a>
        <a href="/prep-guide" style={link}>Prep</a>
        <a href="/aftercare" style={link}>Aftercare</a>
        <a href="/" style={link}>The Estate</a>
        <a href="/book" style={{ ...link, color: "var(--black)", background: "linear-gradient(180deg,var(--gold-light),var(--gold))", border: "1px solid var(--gold-dark)", borderRadius: 999, padding: "9px 16px" }}>✦ Book</a>
      </nav>
    </header>
  );
}
