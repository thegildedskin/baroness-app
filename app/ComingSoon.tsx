// A tasteful "the room is being prepared" page for wings of the estate that
// are paused behind the experiments flag (lib/flags.ts). Deliberately free of
// hooks so it can be rendered from server pages and client pages alike.

import Link from "next/link";

const btn = (solid: boolean): React.CSSProperties => ({
  fontFamily: "var(--caps, inherit)",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontSize: 11,
  textDecoration: "none",
  borderRadius: 3,
  padding: "12px 18px",
  border: "1px solid #8b6f35",
  color: solid ? "#1a1a1a" : "#e8cf86",
  background: solid ? "linear-gradient(180deg,#d4b574,#b8924a)" : "transparent",
});

export default function ComingSoon({
  title = "This chamber is being prepared",
  note,
}: {
  title?: string;
  note?: string;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 22px",
        textAlign: "center",
        color: "#f5e9d3",
        background:
          "radial-gradient(900px 420px at 50% -12%, rgba(184,146,74,.16), transparent 60%), linear-gradient(180deg, #14100c 0%, #1d1712 100%)",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        <div aria-hidden style={{ fontSize: 38, color: "#caa24e", lineHeight: 1 }}>❦</div>
        <h1
          style={{
            fontFamily: "var(--display, serif)",
            fontWeight: 600,
            fontSize: 38,
            lineHeight: 1.1,
            margin: "16px 0 10px",
            color: "#f3e9d2",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: "var(--body, serif)",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.65,
            color: "#cbbfa4",
            margin: 0,
          }}
        >
          {note ??
            "Her Grace has drawn the curtains on this room while the artisans work. It will reopen in a future season of the estate."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <Link href="/" style={btn(false)}>← Return to the Estate</Link>
          <Link href="/book" style={btn(true)}>✦ Book a Consultation</Link>
        </div>
      </div>
    </main>
  );
}
