import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";

export const metadata: Metadata = {
  title: "Tattoo Aftercare Guide — Day 1 to Fully Healed | Baroness Tattoo, Garland TX",
  description:
    "The complete tattoo aftercare regimen from Baroness Tattoo in Garland, TX: the first 24 hours, days 2–14, long-term care, warning signs and product recommendations.",
  alternates: { canonical: "/aftercare" },
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
      <PublicHeader />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Go Forth, Inked Warrior</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: "var(--black)", margin: "8px 0 0" }}>Aftercare</h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", marginTop: 8 }}>
            A tattoo is an open wound wearing a crown. Tend it well for a month and it will hold its colour and line for a lifetime.
          </p>
        </div>

        <h2 style={h2}>Day One — The First 24 Hours</h2>
        <Card>
          <p style={p}>Your artist will send you home dressed — either a breathable bandage or a <strong>second-skin adhesive film</strong>. Follow whichever they applied:</p>
          <p style={li}>• <strong>Second-skin film</strong> — leave it on as instructed (often 1–3 days). A pocket of plasma and loose ink under the film is normal and even good; it looks alarming and isn&rsquo;t. Peel it off slowly under warm running water, pulling flat along the skin, never straight up.</p>
          <p style={li}>• <strong>Standard wrap</strong> — remove after 2–4 hours. Wash with clean hands, lukewarm water and a fragrance-free soap, pat dry with a clean paper towel, and leave it uncovered to breathe overnight if you can.</p>
          <p style={li}>• Sleep on clean sheets, ideally not on the fresh piece. A little seep onto the pillowcase the first night is normal.</p>
          <p style={li}>• No moisturiser needed on day one unless the skin feels tight and dry — the wound wants air first.</p>
        </Card>

        <h2 style={h2}>Days 2–14 — The Working Fortnight</h2>
        <Card>
          <p style={li}>• <strong>Wash gently 2–3 times a day</strong> — lukewarm water, fragrance-free mild soap, clean hands only. No cloths, sponges or loofahs.</p>
          <p style={li}>• <strong>Pat dry</strong> with a clean paper towel; never rub, never share a bath towel with a fresh tattoo.</p>
          <p style={li}>• <strong>Moisturise thinly</strong> once dry — a whisper-thin layer of fragrance-free, <strong>petroleum-free</strong> lotion or healing balm, 2–3 times a day. Too much suffocates the skin; too little lets it crack. (Never petroleum products — see the house rule below.)</p>
          <p style={li}>• Around days 3–6 it will <strong>peel and itch</strong> like a sunburn. This is the skin turning over. <strong>Do not pick, do not scratch</strong> — slap lightly around it if the itch maddens you. Pulled flakes take ink with them.</p>
          <p style={li}>• <strong>No soaking</strong> — no baths, pools, hot tubs, lakes or ocean until fully closed (2–3 weeks). Quick showers are fine; don&rsquo;t let the stream pound the piece.</p>
          <p style={li}>• <strong>No sun</strong> on the healing skin, and no sunscreen yet either — cover it loosely instead.</p>
          <p style={li}>• <strong>Loose, clean clothing</strong> over the area; friction and trapped sweat are the enemies of a clean heal. Skip the gym for the first several days, and wash promptly after sweating once you return.</p>
          <p style={li}>• A dull, cloudy look in week two is the &ldquo;milk skin&rdquo; phase — the finished colour returns as the deeper layers settle.</p>
        </Card>

        <h2 style={h2}>Long Term — Keeping the Crown</h2>
        <Card>
          <p style={li}>• The surface closes in about <strong>2 weeks</strong>; the deeper skin settles over <strong>4–6 weeks</strong>. Judge the final result then, not before.</p>
          <p style={li}>• <strong>Sunscreen is the single best thing you can do for a healed tattoo.</strong> UV is what fades ink. SPF 30+ on exposed pieces, every time, forever.</p>
          <p style={li}>• Keep the skin moisturised as a habit — supple skin keeps line-work crisp.</p>
          <p style={li}>• If a healed piece has a spot that needs attention, ask us about a <strong>touch-up</strong> — minor ones on our own work are quick, and often free within a reasonable window. See the <a href="/faq" style={{ color: "var(--gold-dark)" }}>FAQ</a>.</p>
        </Card>

        <h2 style={h2}>Warning Signs — When to Seek a Doctor</h2>
        <Card>
          <p style={p}>Some redness, warmth, swelling and tenderness for the first couple of days is a normal part of healing. These are not:</p>
          <p style={li}>• <strong>Spreading redness</strong> or red streaks radiating from the tattoo after day 2–3</p>
          <p style={li}>• <strong>Increasing pain, heat or swelling</strong> instead of decreasing</p>
          <p style={li}>• <strong>Thick yellow/green discharge</strong> or a foul smell (thin clear seepage early on is normal)</p>
          <p style={li}>• <strong>Fever, chills</strong> or swollen lymph nodes</p>
          <p style={li}>• An intensely itchy, bumpy <strong>rash</strong> that may signal an ink allergy</p>
          <p style={{ ...p, marginTop: 8 }}>Any of these — see a doctor promptly, and tell your artist too. Infections caught early are a small matter; ignored, they cost you the tattoo and more.</p>
        </Card>

        <h2 style={h2}>What to Use — The House Recommendations</h2>
        <Card>
          <p style={li}>• <strong>Wash:</strong> any fragrance-free, antibacterial or mild liquid soap (unscented Dial, Dr. Bronner&rsquo;s Baby Unscented, or similar).</p>
          <p style={li}>• <strong>Moisturiser — petroleum-free, always:</strong> a fragrance-free <strong>water-based</strong> lotion or a dedicated petroleum-free tattoo balm, in whisper-thin layers. Look for skin-repair ingredients the house trusts: <strong>panthenol</strong> (pro-vitamin B5), <strong>hyaluronic acid</strong>, <strong>centella asiatica (CICA)</strong>, allantoin, bisabolol.</p>
          <p style={li}>• <strong>The house rule — no petroleum on ink, ever:</strong> no Vaseline, no Aquaphor, no A+D, no mineral-oil or beeswax-heavy ointments, fresh or healed. Heavy occlusives suffocate the healing skin, trap bacteria, and can pull ink out with them — they are the reason so many tattoos heal patchy.</p>
          <p style={li}>• <strong>Also avoid:</strong> alcohol, hydrogen peroxide, Neosporin, scented lotions, and anything with exfoliants (AHAs/BHAs, retinoids) on or near the piece while it heals.</p>
          <p style={{ ...p, marginTop: 8 }}>
            The house keeps its chosen wash, balm and second-skin film in-studio and in <a href="/shop" style={{ color: "var(--gold-dark)" }}>the shop</a> — ask your artist at the sitting.
          </p>
        </Card>

        <div style={{ textAlign: "center", marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/shop" style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 2, padding: "13px 26px", textDecoration: "none" }}>
            Her Grace&rsquo;s Recommended Aftercare →
          </a>
          <a href="/prep-guide" style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12, color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 2, padding: "13px 26px", textDecoration: "none" }}>
            Preparing for a Sitting
          </a>
        </div>
        <p style={{ ...p, textAlign: "center", fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 18 }}>
          General guidance only — the house is not your physician. When in doubt, ask your artist or a doctor.
        </p>
      </article>
    </main>
  );
}
