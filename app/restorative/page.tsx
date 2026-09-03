import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import { STUDIO, SITE_URL } from "@/lib/studio";

// Restorative (paramedical) tattooing — Katherine's practice. Deliberately a
// different register from the rest of the site: quieter, warmer, no theatrics.
// This page exists to own the DFW search space for nipple-areola restoration,
// which the nearest comparable studio leaves without a landing page at all.

export const metadata: Metadata = {
  title: "3D Nipple & Areola Restorative Tattooing — Dallas / Garland, TX | Baroness Tattoo",
  description:
    "Realistic 3D nipple and areola tattooing after mastectomy and breast surgery, in Garland (DFW). A private, unhurried setting with a specialist trained in restorative paramedical tattooing. Free, confidential consultations.",
  alternates: { canonical: "/restorative" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, color: "var(--black)", margin: "36px 0 8px" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.7, color: "#3a2f22", margin: "10px 0" };

const FAQ = [
  {
    q: "What is restorative nipple-areola tattooing?",
    a: "A specialized form of paramedical tattooing that recreates a realistic, three-dimensional nipple and areola on the skin — most often after mastectomy and breast reconstruction. Careful shading, color theory and placement create the appearance of natural projection and tone, matched to you.",
  },
  {
    q: "Does it hurt?",
    a: "Most clients feel far less than they expect — reconstructed tissue often has reduced sensation, and the work is gentle by nature. Comfort is checked constantly, and the pace of the session is always yours.",
  },
  {
    q: "How long after surgery should I wait?",
    a: "Generally once your surgeon confirms the tissue is fully healed — commonly around 3 to 6 months after the final procedure. Bring your surgeon's guidance to the consultation and we'll plan around it.",
  },
  {
    q: "Is the consultation really private?",
    a: "Completely. Consultations happen one-on-one in a private room, with no photography and no obligation. Bring a support person if you'd like. Nothing about your visit is shared, ever.",
  },
  {
    q: "Do you work with scars from other surgeries?",
    a: "Ask us. Scar camouflage and skin-tone work is assessed case by case in consultation, because honest answers matter more here than optimistic ones.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function RestorativePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 680, margin: "0 auto", padding: "52px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Restorative Tattooing · {STUDIO.address.city}, TX</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(34px,5.5vw,46px)", lineHeight: 1.12, color: "var(--black)", margin: "10px 0 0" }}>
            The last step of healing,<br />done with an artist&rsquo;s hand.
          </h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", maxWidth: 540, margin: "16px auto 0" }}>
            3D nipple and areola tattooing after mastectomy and breast surgery —
            realistic, dignified, and entirely on your terms.
          </p>
        </div>

        <h2 style={h2}>For those who feel a part of themselves is missing</h2>
        <p style={p}>
          Surgery saves lives and leaves marks. For many people, the final piece of feeling
          whole again isn&rsquo;t medical at all — it&rsquo;s looking in the mirror and seeing
          yourself. Restorative nipple-areola tattooing uses fine-art shading and color to
          recreate a natural, three-dimensional appearance on reconstructed or scarred tissue.
          Done well, it is quietly astonishing.
        </p>

        <h2 style={h2}>Katherine&rsquo;s hands</h2>
        <p style={p}>
          This work at Baroness is done exclusively by <strong>Katherine</strong>, who trained
          in restorative paramedical tattooing under one of the pioneering restorative artists
          in DFW. It is treated here as its own discipline — separate room, separate pace,
          separate rules from everything else in the studio. No walk-in energy, no audience,
          no clock on the wall that matters.
        </p>

        <h2 style={h2}>How it works</h2>
        <p style={p}>
          <strong>1. A private, free consultation.</strong> One-on-one, in person or by phone —
          your history, your surgeon&rsquo;s guidance, your hopes, and honest answers about
          what&rsquo;s achievable on your skin.
        </p>
        <p style={p}>
          <strong>2. Color and design, matched to you.</strong> Tone, size, projection and
          placement are worked out together — including matching an existing side, or starting
          fresh on both.
        </p>
        <p style={p}>
          <strong>3. The session.</strong> Typically 1–2 hours in a private room. Most clients
          are surprised how gentle it is.
        </p>
        <p style={p}>
          <strong>4. Healing and a follow-up.</strong> Simple aftercare, then a check-in — small
          refinements after healing are part of the work, not an extra.
        </p>

        <h2 style={h2}>Questions, answered plainly</h2>
        {FAQ.map((f) => (
          <div key={f.q} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "16px 20px", margin: "10px 0" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: "var(--black)" }}>{f.q}</div>
            <p style={{ ...p, margin: "6px 0 0", fontSize: 16 }}>{f.a}</p>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <a
            href="/book?style=Restorative%20nipple-areola%20tattooing"
            style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "16px 30px", textDecoration: "none", boxShadow: "0 6px 18px rgba(20,14,8,.2)" }}
          >
            Request a Private Consultation
          </a>
          <p style={{ ...p, fontSize: 14.5, color: "var(--grey)", marginTop: 12 }}>
            Prefer to speak with a person first? Call or text {STUDIO.phone} and ask for Katherine.
            <br />Consultations are always free and always confidential.
          </p>
        </div>

        <p style={{ ...p, textAlign: "center", fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 26 }}>
          {STUDIO.name} · {STUDIO.address.full} · Surgeons and breast-care navigators: we welcome
          your referrals — reach us at {STUDIO.phone} to talk about your patients&rsquo; options.
        </p>
      </article>
    </main>
  );
}
