import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Tattoo FAQ — Pricing, Deposits, Walk-ins | Baroness Tattoo, Garland TX",
  description:
    "Answers from Baroness Tattoo in Garland, TX: tattoo pricing and minimums, the $100 deposit, pain, age requirements, touch-ups, walk-ins, cover-ups, gift cards and parking at Firewheel Town Center.",
  alternates: { canonical: "/faq" },
};

// The questions people actually call about — in the house voice, with the
// facts stated plainly. Rendered server-side and mirrored as FAQPage JSON-LD.
const FAQS: { q: string; a: React.ReactNode; plain: string }[] = [
  {
    q: "How much does a tattoo cost?",
    plain:
      "Minimums vary by artist; deposits are $100. The final price depends on size, placement, detail and how many sittings the piece needs. Tell us your idea and budget in the booking form and your artist will quote you before anything is scheduled.",
    a: (
      <>
        Minimums vary by artist; deposits are <strong>$100</strong>. Beyond that, the price of a piece depends on its size, placement,
        level of detail and how many sittings it needs. Tell us your idea and budget range in the <a href="/book">booking form</a> and
        your artist will give you a real quote before anything is scheduled — no surprises in the chair.
      </>
    ),
  },
  {
    q: "How do deposits work?",
    plain:
      "A $100 non-refundable deposit holds your appointment and is applied to your final price. You can reschedule up to 48 hours in advance and the deposit moves with you. No-shows and late cancellations forfeit the deposit.",
    a: (
      <>
        A <strong>$100 non-refundable deposit</strong> holds your appointment and is <strong>applied to your final price</strong> — it is not an
        extra fee. Need to move the date? Reschedule up to <strong>48 hours in advance</strong> and the deposit travels with you. No-shows and
        last-minute cancellations forfeit it; the chair was held for you.
      </>
    ),
  },
  {
    q: "Does it hurt?",
    plain:
      "Yes, somewhat — most clients describe it as a scratching or buzzing discomfort, very manageable. Bony spots (ribs, spine, ankles, hands) sting more than fleshy ones. Arrive rested, fed and hydrated and it is far easier.",
    a: (
      <>
        Honestly? Some. Most guests describe it as a hot scratch — irritating, not unbearable — and many are surprised how manageable it is.
        Bony places (ribs, spine, ankle, hands) bite harder than fleshy ones. Arrive rested, fed and hydrated and the sitting is far kinder;
        see <a href="/prep-guide">how to prepare</a>.
      </>
    ),
  },
  {
    q: "How old do I have to be?",
    plain:
      "18 or older, with a valid government-issued photo ID — no exceptions. Texas law does not allow tattooing minors except for medical cover-up reasons with notarized parental consent, which we do not offer.",
    a: (
      <>
        <strong>18+, with a valid government-issued photo ID</strong> — no exceptions, no matter who signs. Texas law is strict on tattooing
        minors, and the house is stricter. Bring your ID to every sitting; you will be asked.
      </>
    ),
  },
  {
    q: "Do you do touch-ups?",
    plain:
      "Yes. If your healed tattoo needs a minor touch-up, contact us — most healed-work touch-ups on our own pieces are quick and inexpensive or free within a reasonable window, provided aftercare was followed. Ask your artist for their policy.",
    a: (
      <>
        We stand behind the work. If a piece from our house heals with a spot that needs attention, reach out — minor touch-ups on our own
        work are quick and, within a reasonable window and with proper <a href="/aftercare">aftercare</a> followed, typically free or nearly so.
        Each artist sets their own policy; just ask.
      </>
    ),
  },
  {
    q: "Do you take walk-ins, or is it appointment only?",
    plain:
      "Walk-ins are welcome when a chair is free — Mon–Sat 12–8, Sun 12–6. For anything custom or larger than palm-size, book ahead with a deposit so your artist can prepare a design.",
    a: (
      <>
        Walk-ins are received at Her Grace&rsquo;s pleasure — meaning: gladly, when a chair is free. Hours are <strong>Mon–Sat 12–8, Sun 12–6</strong>.
        For custom work or anything larger than palm-size, <a href="/book">book ahead</a> so your artist can draw for you before you arrive.
      </>
    ),
  },
  {
    q: "How should I prepare for my appointment?",
    plain:
      "Sleep well, eat a real meal beforehand, hydrate, skip alcohol for 24 hours, wear loose clothing that exposes the placement, and bring your ID. Full guide at /prep-guide.",
    a: (
      <>
        Sleep, a real meal an hour or two before, plenty of water, no alcohol for 24 hours, loose clothing that bares the placement, and your ID.
        The full counsel — including what to bring for long sittings — lives in the <a href="/prep-guide">preparation guide</a>.
      </>
    ),
  },
  {
    q: "How do I take care of a new tattoo?",
    plain:
      "Gentle washing 2–3 times a day with fragrance-free soap, a thin layer of fragrance-free moisturizer, no soaking or sun for 2–3 weeks, and never pick the flakes. Full instructions at /aftercare.",
    a: (
      <>
        Gentle washing, thin moisturising, no pools, no sun, no picking — for two to three weeks. Your artist sends you home with instructions,
        and the complete regimen (day one through long-term) is written out in the <a href="/aftercare">aftercare guide</a>.
      </>
    ),
  },
  {
    q: "Can you cover up an old tattoo?",
    plain:
      "Usually, yes. Cover-ups depend on the darkness, density and size of the existing piece — send a clear photo through the booking form (check the cover-up box) and an artist will tell you honestly what is possible.",
    a: (
      <>
        Often, yes — and when we can&rsquo;t, we&rsquo;ll say so plainly. Dark, dense pieces limit the palette; sometimes a session of laser lightening
        first opens better doors. Tick the <strong>cover-up</strong> box in the <a href="/book">booking form</a> and attach a clear photo of the
        existing piece; an artist will assess it before you put any money down.
      </>
    ),
  },
  {
    q: "Do you sell gift cards?",
    plain:
      "Yes — $50, $100 and $250 gift cards at baronesstattoo.com/shop. The code arrives instantly by email and is redeemed in person at the studio toward any tattoo or purchase.",
    a: (
      <>
        We do — <strong>$50, $100 and $250</strong>, in the <a href="/shop">shop</a>. The code arrives instantly by email; the recipient presents
        it at the counter and it applies toward any tattoo or purchase. The rare gift that becomes permanent.
      </>
    ),
  },
  {
    q: "Where are you, and where do I park?",
    plain:
      "315 Coneflower Dr, Garland, TX 75040 — at Firewheel Town Center. Free parking is plentiful throughout Firewheel; park near Coneflower Dr and you are steps from the door.",
    a: (
      <>
        <strong>{STUDIO.address.full}</strong>, in <strong>Firewheel Town Center</strong>. Parking at Firewheel is free and plentiful — aim for the
        lots off Coneflower Drive and you&rsquo;re steps from our door. <a href={STUDIO.mapUrl} target="_blank" rel="noopener noreferrer">Directions</a>.
      </>
    ),
  },
  {
    q: "How do I book?",
    plain:
      "Use the booking form at baronesstattoo.com/book: tell us your idea, pick an artist (or let us match you), and pay the $100 deposit to lock your date. We reply to confirm your exact time. Or call (469) 246-7217.",
    a: (
      <>
        Three minutes in the <a href="/book">writing parlor</a>: your idea, your artist (or let the house match you), your deposit — and the date
        is yours. We reply to confirm the exact time. Prefer a voice? Call <a href={STUDIO.phoneHref}>{STUDIO.phone}</a>.
      </>
    ),
  },
];

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.plain },
    })),
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Questions for the House</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,50px)", lineHeight: 1.08, color: "var(--black)", margin: "8px 0 0" }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 16.5, fontStyle: "italic", color: "var(--grey)", maxWidth: 560, margin: "10px auto 0", lineHeight: 1.6 }}>
            Everything guests ask before their first sitting at {STUDIO.name} — {STUDIO.address.area}, {STUDIO.address.city}, {STUDIO.address.state}.
          </p>
        </div>

        <div style={{ marginTop: 36 }}>
          {FAQS.map((f) => (
            <details key={f.q} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "18px 22px", margin: "12px 0" }}>
              <summary style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--black)", cursor: "pointer", listStyle: "none" }}>
                <span style={{ color: "var(--gold-dark)", marginRight: 10 }}>❧</span>{f.q}
              </summary>
              <p style={{ fontFamily: "var(--body)", fontSize: 16, lineHeight: 1.65, color: "#3a2f22", margin: "12px 0 2px" }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 44 }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 19, color: "var(--grey)" }}>
            A question we haven&rsquo;t answered? Call <a href={STUDIO.phoneHref} style={{ color: "var(--gold-dark)" }}>{STUDIO.phone}</a> or write to{" "}
            <a href={`mailto:${STUDIO.email}`} style={{ color: "var(--gold-dark)" }}>{STUDIO.email}</a>.
          </p>
          <a href="/book" className="btn" style={{ marginTop: 16 }}>Book a Consultation</a>
        </div>
      </article>
    </main>
  );
}
