import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import EduForm from "./EduForm";
import { STUDIO } from "@/lib/studio";

// The Baroness Academy — the education arm (the "Baroness.Art" project's home
// on this site). Deliberately broader than tattooing: fine-art technique,
// restorative/paramedical training, and the business of being an artist — so
// no instructor is pigeonholed into a single discipline. This page is the
// landing shell + waitlist; curriculum content plugs in when ready.

export const metadata: Metadata = {
  title: "The Baroness Academy — Tattoo & Restorative Artistry Education, DFW | Baroness Tattoo",
  description:
    "Seminars and mentorship from the House of Baroness in Garland, TX: fine-art tattoo technique, restorative and paramedical tattooing, and the business of being a working artist. Join the waitlist.",
  alternates: { canonical: "/edu" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, color: "var(--black)", margin: "34px 0 6px" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.68, color: "#3a2f22", margin: "8px 0" };

export default function EduPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <article style={{ maxWidth: 660, margin: "0 auto", padding: "52px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Baroness.Art · Education from the House</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(34px,5.5vw,46px)", lineHeight: 1.1, color: "var(--black)", margin: "10px 0 0" }}>
            The Baroness Academy
          </h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", maxWidth: 520, margin: "14px auto 0" }}>
            Craft is taught hand to hand. The Academy is where the house passes on what it knows —
            and it is not only about tattooing.
          </p>
        </div>

        <h2 style={h2}>Three disciplines, one standard</h2>
        <p style={p}>
          <strong>Fine-art technique.</strong> Composition, flow, value and color on the body&rsquo;s
          canvas — for working artists who want their next hundred tattoos to be better than their last.
        </p>
        <p style={p}>
          <strong>Restorative &amp; paramedical artistry.</strong> Nipple-areola restoration and
          scar work, taught with the gravity it deserves — technique, tissue knowledge, and the
          bedside craft that matters as much as the needle. Open to tattoo artists and, in time,
          to medical-adjacent professionals.
        </p>
        <p style={p}>
          <strong>The business of being an artist.</strong> Booking, pricing, a following that
          converts, and a career that outlasts trends — the machinery this studio runs on, taught plainly.
        </p>

        <h2 style={h2}>First seats</h2>
        <p style={p}>
          Seminars open in small rooms first — house artists, then the waitlist, then everyone else.
          Join it and you&rsquo;ll hear when the first dates are set. No spam; the house writes rarely
          and only when it matters.
        </p>

        <div style={{ marginTop: 22 }}>
          <EduForm />
        </div>

        <p style={{ ...p, textAlign: "center", fontSize: 13, fontStyle: "italic", color: "var(--grey)", marginTop: 24 }}>
          {STUDIO.name} · {STUDIO.address.full} · {STUDIO.phone}
        </p>
      </article>
    </main>
  );
}
