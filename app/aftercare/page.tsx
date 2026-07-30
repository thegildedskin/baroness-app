export const metadata = {
  title: "Aftercare · Baroness Tattoo Estate",
  description: "How to care for your new tattoo — washing, moisturising, what to avoid, and the healing timeline.",
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, color: "var(--black)", margin: "36px 0 6px" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.65, color: "#3a2f22", margin: "6px 0" };
const li: React.CSSProperties = { ...p, margin: "3px 0" };

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 12, padding: "22px 26px", margin: "14px 0" }}>{children}</div>;
}

export default function AftercarePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Go Forth, Inked Warrior</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: "var(--black)", margin: "8px 0 0" }}>Aftercare</h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", marginTop: 8 }}>
            A tattoo is an open wound wearing a crown. Tend it well for a month and it will hold its colour and line for a lifetime.
          </p>
        </div>

        <h2 style={h2}>The First Day</h2>
        <Card>
          <p style={p}>Your artist will send you home dressed — either a breathable bandage or a <strong>second-skin film</strong>. Follow whichever they applied:</p>
          <p style={li}>• <strong>Second-skin film</strong> — leave it on as instructed (often 1–3 days). A little weeping and ink beneath it is normal. Peel it off slowly under warm running water.</p>
          <p style={li}>• <strong>Standard wrap</strong> — remove after 2–4 hours, then wash as below.</p>
        </Card>

        <h2 style={h2}>Washing &amp; Moisturising</h2>
        <Card>
          <p style={li}>• <strong>Wash gently</strong> 2–3 times a day with lukewarm water and a fragrance-free, mild soap. Use clean hands — no cloths or sponges.</p>
          <p style={li}>• <strong>Pat dry</strong> with a clean paper towel; never rub.</p>
          <p style={li}>• <strong>Moisturise thinly</strong> once dry — a fragrance-free healing balm or lotion, a whisper-thin layer. Too much suffocates the skin; too little lets it crack.</p>
          <p style={li}>• Keep this up for 2–3 weeks, until the peeling and flaking have fully passed.</p>
        </Card>

        <h2 style={h2}>What to Avoid</h2>
        <Card>
          <p style={li}>• <strong>No soaking</strong> — no baths, pools, hot tubs, lakes or ocean for 2–3 weeks. Showers are fine; don&rsquo;t let the stream pound the piece.</p>
          <p style={li}>• <strong>No sun or tanning</strong> on a healing tattoo — it fades fresh ink fast. Once healed, sunscreen keeps it crisp for good.</p>
          <p style={li}>• <strong>Do not pick or scratch</strong> the scabs and flakes — let them shed on their own, or you&rsquo;ll pull colour with them.</p>
          <p style={li}>• <strong>Loose clothing</strong> over the area; friction and sweat are the enemy of a clean heal.</p>
          <p style={li}>• Skip the gym and heavy sweating for the first few days.</p>
        </Card>

        <h2 style={h2}>The Healing</h2>
        <Card>
          <p style={p}>The surface closes in about <strong>2 weeks</strong>; the deeper skin settles over <strong>4–6 weeks</strong>. Expect itching and peeling in week one — resist it. A little dullness before it &ldquo;turns over&rdquo; is normal; the finished colour returns as it heals.</p>
          <p style={{ ...p, marginTop: 8 }}>Should you see spreading redness, swelling, heat, pus, or a fever — that is not the house&rsquo;s pageantry, it is a sign to see a doctor promptly.</p>
        </Card>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <a href="/shop" style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 2, padding: "13px 26px", textDecoration: "none" }}>
            Her Grace&rsquo;s Recommended Aftercare →
          </a>
        </div>
        <p style={{ ...p, textAlign: "center", fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 18 }}>
          Guidance only — the house is not your physician. When in doubt, ask your artist or a doctor.
        </p>
      </article>
    </main>
  );
}
