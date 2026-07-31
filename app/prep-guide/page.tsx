import PublicHeader from "../PublicHeader";

export const metadata = {
  title: "Prepare for Your Sitting · Baroness Tattoo Estate",
  description: "How to prepare for your tattoo — the day before, the day of, what to bring, and how to prime your skin.",
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, color: "var(--black)", margin: "36px 0 6px" };
const h3: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold-dark)", margin: "18px 0 4px" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.65, color: "#3a2f22", margin: "4px 0" };
const li: React.CSSProperties = { ...p, margin: "3px 0" };

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 12, padding: "22px 26px", margin: "14px 0" }}>{children}</div>;
}

export default function PrepGuidePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>By Appointment of Her Grace</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: "var(--black)", margin: "8px 0 0" }}>Preparing for Your Sitting</h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", marginTop: 8 }}>
            A little ceremony beforehand and your ink settles cleaner, heals kinder, and holds its crown for years. Follow the house&rsquo;s counsel.
          </p>
        </div>

        <h2 style={h2}>The Day Before</h2>
        <Card>
          <h3 style={h3}>No spirits, no substances</h3>
          <p style={p}>Alcohol and recreational substances thin the blood — more bleeding, muddier saturation, a harder sitting. Abstain for 24 hours before.</p>
          <h3 style={h3}>Hydrate &amp; moisturise</h3>
          <p style={p}>Drink water generously the day before and the morning of; supple, well-watered skin takes ink far better than parched skin.</p>
          <h3 style={h3}>Rest</h3>
          <p style={p}>A full night&rsquo;s sleep steadies the body for the chair and blunts the sting. Arrive rested, not frayed.</p>
          <h3 style={h3}>Avoid the sun</h3>
          <p style={p}>No sunburn, tanning beds, or tanning lotions on the area. Burnt or freshly tanned skin cannot be tattooed and will send you home.</p>
        </Card>

        <h2 style={h2}>The Day Of</h2>
        <Card>
          <h3 style={h3}>Eat a proper meal</h3>
          <p style={p}>Come with a full stomach — a good meal within a couple of hours keeps your blood sugar level through a long session.</p>
          <h3 style={h3}>Dress comfortably</h3>
          <p style={p}>Loose, dark clothing that bares the area easily and won&rsquo;t cling to fresh ink afterward.</p>
          <h3 style={h3}>Come clean</h3>
          <p style={p}>Shower before you arrive; clean skin is a kindness to your artist and to your healing.</p>
          <h3 style={h3}>Leave the shaving to us</h3>
          <p style={p}>No need to shave the area yourself — the studio will prep and shave it sterilely at the chair.</p>
        </Card>

        <h2 style={h2}>What to Bring</h2>
        <Card>
          <p style={li}>• <strong>Snacks &amp; a drink</strong> — for longer sittings, keep sugar and water within reach.</p>
          <p style={li}>• <strong>ID, payment &amp; a good humour</strong> — a valid ID, your deposit&rsquo;s balance, and patience.</p>
          <p style={li}>• <strong>Entertainment</strong> — headphones, a book, something to pass the hours.</p>
          <p style={li}>• <strong>Aftercare</strong> — the balm or second-skin your artist recommends, ready for the walk home.</p>
        </Card>

        <h2 style={h2}>Priming the Canvas</h2>
        <p style={p}>Beyond the day-of ritual, the skin itself can be readied. Think of it as a two-week regimen that leaves the dermis hydrated, barrier-intact, and calm before the needle.</p>

        <Card>
          <h3 style={h3}>Pre-session — the 7–14 days before</h3>
          <p style={p}>A gentle daily &ldquo;prep serum&rdquo; of barrier-builders and humectants:</p>
          <p style={li}>• <strong>Panthenol (pro-vitamin B5), 2–5%</strong> — strengthens the barrier and holds water without grease.</p>
          <p style={li}>• <strong>Niacinamide (vitamin B3), 2–4%</strong> — barrier support and even tone, so line work reads clearly.</p>
          <p style={li}>• <strong>Hyaluronic acid (low-weight), 0.5–1%</strong> — draws water into the dermis where ink will settle.</p>
          <p style={li}>• <strong>Centella asiatica / madecassoside (CICA)</strong> — primes the skin&rsquo;s repair response ahead of the controlled trauma.</p>
          <p style={li}>• <strong>Allantoin &amp; bisabolol</strong> — gentle anti-inflammatories that lower baseline reactivity.</p>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)" }}>Apply daily for the two weeks before, plus a good fragrance-free moisturiser.</p>
        </Card>

        <Card>
          <h3 style={h3}>Day-of — at the chair</h3>
          <p style={li}>• <strong>Caffeine, 1–3%</strong> — a mild vasoconstrictor: less bleeding, cleaner saturation.</p>
          <p style={li}>• <strong>Witch hazel (alcohol-free)</strong> — degreases the surface and lifts excess sebum.</p>
          <p style={li}>• <strong>Glycerin in a light water-gel</strong> — hydration through the session without the petrolatum problem.</p>
          <p style={li}>• <strong>Vitamin E (tocopherol), low %</strong> — antioxidant support; pairs well with numbing creams.</p>
        </Card>

        <Card>
          <h3 style={{ ...h3, color: "#8a2b2b" }}>Keep well away before a session</h3>
          <p style={li}>• <strong>AHAs, BHAs, mandelic acid</strong> — none within 7–10 days; a compromised surface takes ink unevenly.</p>
          <p style={li}>• <strong>Retinoids &amp; retinol</strong> — stop 2–4 weeks out; they thin the epidermis and slow healing.</p>
          <p style={li}>• <strong>Sensitising essential oils</strong> (citrus, peppermint, eucalyptus) — irritation under a tattoo is permanent.</p>
          <p style={li}>• <strong>Heavy occlusives at session time</strong> (petrolatum, mineral oil, beeswax) — they&rsquo;re pushed back out by the needle.</p>
          <p style={li}>• <strong>Salicylic acid / keratolytics</strong> — same trouble as acids, and unpredictable with numbing cream.</p>
          <p style={li}>• <strong>Hydroquinone, kojic acid &amp; other brighteners</strong> — they alter how pigment behaves while healing.</p>
          <p style={li}>• <strong>Alcohol-based astringents at the chair</strong> — over-dry the skin and leave it brittle.</p>
        </Card>

        <p style={{ ...p, textAlign: "center", marginTop: 28 }}>
          <a href="/aftercare" style={{ ...label, color: "var(--gold-dark)" }}>Read the Aftercare rite →</a>
        </p>
        <p style={{ ...p, textAlign: "center", fontSize: 12.5, color: "var(--grey)", fontStyle: "italic" }}>
          Guidance only — the house is not your physician. If you take blood thinners or have a skin condition, consult your doctor first.
        </p>
      </article>
    </main>
  );
}
