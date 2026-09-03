import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import CareersForm from "./CareersForm";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Careers — Tattoo Artist Jobs in Garland, TX | Baroness Tattoo",
  description:
    "Join the House of Baroness. We're always looking for exceptional tattoo artists, apprentices and front-of-house talent at Firewheel Town Center, Garland TX. Apply online.",
  alternates: { canonical: "/careers" },
};

const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.65, color: "#3a2f22" };

export default function CareersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <article style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" }}>
            Join the House · {STUDIO.address.city}, {STUDIO.address.state}
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: "var(--black)", margin: "8px 0 0" }}>Careers</h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", maxWidth: 540, margin: "12px auto 0" }}>
            The Baroness keeps a small court and chooses it carefully. If you hold your craft to a
            higher standard than the shop that trained you — we should talk.
          </p>
        </div>

        <div style={{ margin: "36px 0" }}>
          <p style={p}>
            <strong>Artists:</strong> booth-quality private stations in a studio unlike anything else in DFW,
            a front desk that qualifies and books your clients for you, your own page on this site with a direct
            booking link, and a house that actively markets your work. Bring your portfolio and your following —
            or just the portfolio, and let the house build the following.
          </p>
          <p style={{ ...p, marginTop: 12 }}>
            <strong>Apprentices &amp; front of house:</strong> we take both rarely, and we take them seriously.
            Show us why it should be you.
          </p>
        </div>

        <CareersForm />

        <p style={{ ...p, textAlign: "center", fontSize: 13.5, fontStyle: "italic", color: "var(--grey)", marginTop: 22 }}>
          Prefer to talk in person? {STUDIO.name} · {STUDIO.address.full} · {STUDIO.phone}
        </p>
      </article>
    </main>
  );
}
