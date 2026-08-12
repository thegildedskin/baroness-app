import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import { getReviews } from "@/lib/reviews";
import { STUDIO } from "@/lib/studio";

// Revalidated hourly — live Google reviews when configured, curated sample
// otherwise (lib/reviews.ts).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Reviews — 5.0★ Tattoo Studio in Garland, TX | Baroness Tattoo",
  description:
    "Baroness Tattoo holds a 5.0-star rating across 31 Google reviews. Read what clients say about our fine line, black & grey and illustrative work at Firewheel Town Center, Garland TX.",
  alternates: { canonical: "/reviews" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const goldBtn: React.CSSProperties = { display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "14px 26px", textDecoration: "none", boxShadow: "0 6px 18px rgba(20,14,8,.25)" };
const ghostLink: React.CSSProperties = { display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12, color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 3, padding: "14px 26px", textDecoration: "none" };

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ color: "var(--gold-dark)", letterSpacing: 2 }}>
      {"★".repeat(Math.round(rating))}
    </span>
  );
}

export default async function ReviewsPage() {
  const data = await getReviews();
  const rating = data.rating ?? STUDIO.rating.value;
  const total = data.total ?? STUDIO.rating.count;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>The Guest Book · {STUDIO.address.city}, {STUDIO.address.state}</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.08, color: "var(--black)", margin: "8px 0 0" }}>Reviews</h1>
          <p style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--black)", margin: "16px 0 0" }}>
            <Stars rating={rating} /> <strong>{rating.toFixed(1)}</strong>
            <span style={{ fontFamily: "var(--body)", fontSize: 17, color: "var(--grey)", fontStyle: "italic" }}> · {total} Google reviews</span>
          </p>
          <p style={{ fontFamily: "var(--body)", fontSize: 16.5, fontStyle: "italic", color: "var(--grey)", maxWidth: 560, margin: "8px auto 0", lineHeight: 1.6 }}>
            Every guest leaves wearing a crown. Here is what they say once the ink has settled.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20, marginTop: 40 }}>
          {data.reviews.map((r, i) => (
            <figure key={i} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, padding: "22px 24px", margin: 0, boxShadow: "0 8px 22px rgba(0,0,0,.1)", display: "flex", flexDirection: "column" }}>
              <div><Stars rating={r.rating} /></div>
              <blockquote style={{ fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.6, color: "#3a2f22", margin: "10px 0 14px", flex: 1 }}>
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <figcaption style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold-dark)" }}>
                {r.author}{r.time ? <span style={{ color: "var(--grey)", textTransform: "none", letterSpacing: 0, fontFamily: "var(--body)", fontStyle: "italic" }}> · {r.time}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
          {/* NOTE for the owner: swap STUDIO.googleReviewsUrl (lib/studio.ts) for
              your real Google review short-link (GBP → "Ask for reviews"). */}
          <a href={STUDIO.googleReviewsUrl} target="_blank" rel="noopener noreferrer" style={ghostLink}>Read all reviews on Google</a>
          <a href={STUDIO.googleReviewsUrl} target="_blank" rel="noopener noreferrer" style={ghostLink}>Leave a review</a>
        </div>

        <div style={{ textAlign: "center", marginTop: 60, background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, padding: "34px 26px" }}>
          <div style={label}>Your Turn in the Chair</div>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 21, color: "var(--black)", margin: "8px auto 18px", maxWidth: 520 }}>
            Thirty-one five-star sittings and counting. Yours is next.
          </p>
          <a href="/book" style={goldBtn}>Book a Consultation</a>
        </div>
      </div>
    </main>
  );
}
