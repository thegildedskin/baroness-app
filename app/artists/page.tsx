import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "../PublicHeader";
import { fetchPublishedArtists } from "@/lib/artists";
import { STUDIO } from "@/lib/studio";

// Server-rendered, ISR'd hourly so artist changes appear without a deploy
// and search engines get real HTML.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tattoo Artists in Garland, TX — Fine Line & Black-and-Grey | Baroness Tattoo",
  description:
    "Meet the resident artists of Baroness Tattoo at Firewheel Town Center, Garland TX — fine line, black & grey realism and illustrative fine-art tattooers. View portfolios and book.",
  alternates: { canonical: "/artists" },
  openGraph: {
    title: "The Artists · Baroness Tattoo — Garland, TX",
    description: "Fine line, black & grey realism and illustrative fine-art tattoo artists at Firewheel Town Center.",
  },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };

export default async function ArtistsPage() {
  const artists = await fetchPublishedArtists();
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>The Portrait Salon · Garland, Texas</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.08, color: "var(--black)", margin: "8px 0 0" }}>
            The Artists
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 17, fontStyle: "italic", color: "var(--grey)", maxWidth: 620, margin: "10px auto 0", lineHeight: 1.6 }}>
            Fine line, black &amp; grey realism, and illustrative fine art — the resident artists of {STUDIO.name} at {STUDIO.address.area}, {STUDIO.address.city}, {STUDIO.address.state}.
          </p>
        </div>

        {artists.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontFamily: "var(--body)", fontStyle: "italic", fontSize: 18, color: "var(--grey)" }}>
              The portraits are being hung. Meanwhile, the register is open —
            </p>
            <a href="/book" className="btn" style={{ marginTop: 18 }}>Book a Consultation</a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 26, marginTop: 44 }}>
            {artists.map((a) => {
              const img = a.portrait_url || a.flash?.[0]?.image_url || null;
              return (
                <Link
                  key={a.id}
                  href={`/artists/${a.slug}`}
                  style={{ display: "block", textDecoration: "none", background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", boxShadow: "0 10px 26px rgba(0,0,0,.12)" }}
                >
                  <div style={{ height: 280, background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`${a.display_name} — tattoo artist at Baroness Tattoo, Garland TX`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 72, color: "var(--gold-light)" }}>
                        {(a.display_name?.trim()?.[0] ?? "B").toUpperCase()}
                      </span>
                    )}
                    <span style={{ position: "absolute", inset: 12, border: "2px solid var(--gold)", borderRadius: 3, pointerEvents: "none" }} />
                  </div>
                  <div style={{ padding: "18px 16px 22px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--caps)", fontSize: 17, letterSpacing: ".04em", color: "var(--black)" }}>{a.display_name}</div>
                    <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 15.5, color: "var(--grey)", marginTop: 5 }}>
                      {a.specialty || "Custom tattoo artist"}
                    </div>
                    <div style={{ ...label, fontSize: 10, marginTop: 12 }}>View portfolio →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 19, color: "var(--grey)" }}>
            Not sure whose hand suits your idea? Tell us the vision — we&rsquo;ll match you.
          </p>
          <a href="/book" className="btn" style={{ marginTop: 14 }}>Book a Consultation</a>
        </div>
      </div>
    </main>
  );
}
