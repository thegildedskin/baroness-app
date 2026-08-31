"use client";

import { usePathname } from "next/navigation";

// Floating booking CTA for deep pages that lack a persistent header.
// Hidden where a Book CTA is already on screen: the booking flow itself, the
// homepage (top nav + hero CTA + it collided with the contact bar), and the
// public content pages that carry PublicHeader's ✦ Book pill.
const COVERED = ["/book", "/", "/artists", "/styles", "/gallery", "/shop", "/reviews", "/faq", "/aftercare", "/prep-guide"];

export default function BookButton() {
  const path = usePathname() || "/";
  if (COVERED.some((p) => (p === "/" ? path === "/" : path.startsWith(p)))) return null;
  return (
    <a
      href="/book"
      aria-label="Book a consultation"
      style={{
        position: "fixed", right: 18, bottom: 18, zIndex: 9999,
        fontFamily: "var(--caps)", fontSize: 12.5, letterSpacing: ".12em", textTransform: "uppercase",
        color: "var(--black)", background: "linear-gradient(180deg,var(--gold-light),var(--gold))",
        border: "1px solid var(--gold-dark)", borderRadius: 999, padding: "13px 22px", textDecoration: "none",
        boxShadow: "0 8px 22px rgba(0,0,0,.4)",
      }}
    >
      ✦ Book a Sitting
    </a>
  );
}
