"use client";

import { usePathname } from "next/navigation";

// Persistent, unmissable booking CTA on every page — the fast track to the chair.
export default function BookButton() {
  const path = usePathname();
  if (path?.startsWith("/book")) return null;
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
