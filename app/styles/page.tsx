import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "../PublicHeader";
import { STYLE_PAGES } from "@/lib/styles";
import { STUDIO, SITE_URL } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Tattoo Styles — Fine Line, Realism, Cover-Ups & More | Baroness Tattoo, Garland TX",
  description:
    "The styles of the house: fine line, black & grey realism, illustrative, floral, cover-ups and script lettering — by fine-art trained tattoo artists in Garland, TX.",
  alternates: { canonical: "/styles" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };

export default function StylesIndexPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Styles", item: `${SITE_URL}/styles` },
    ],
  };
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>The House Repertoire · {STUDIO.address.city}, {STUDIO.address.state}</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.08, color: "var(--black)", margin: "8px 0 0" }}>
            Tattoo Styles
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 17, fontStyle: "italic", color: "var(--grey)", maxWidth: 620, margin: "10px auto 0", lineHeight: 1.6 }}>
            Every hand in the house trained in fine art before it held a machine. These are the disciplines we practice — each with its own page, its own rules, and its own honest counsel.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 22, marginTop: 44 }}>
          {STYLE_PAGES.map((s) => (
            <Link key={s.slug} href={`/styles/${s.slug}`} style={{ display: "block", textDecoration: "none", background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, padding: "26px 24px 24px", boxShadow: "0 10px 24px rgba(0,0,0,.1)" }}>
              <div style={{ ...label, fontSize: 10 }}>{s.kicker}</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, color: "var(--black)", margin: "6px 0 8px" }}>{s.name}</div>
              <p style={{ fontFamily: "var(--body)", fontSize: 14.5, fontStyle: "italic", lineHeight: 1.6, color: "var(--grey)", margin: 0 }}>{s.intro}</p>
              <div style={{ ...label, fontSize: 10, marginTop: 16 }}>Read the counsel →</div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 19, color: "var(--grey)" }}>
            Undecided between two? Tell us the idea — the style often chooses itself.
          </p>
          <a href="/book" className="btn" style={{ marginTop: 14 }}>Book a Consultation</a>
        </div>
      </div>
    </main>
  );
}
