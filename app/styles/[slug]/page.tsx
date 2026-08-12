import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "../../PublicHeader";
import { STYLE_PAGES, getStylePage, type StylePage } from "@/lib/styles";
import { fetchPublishedArtists, type PublicArtist } from "@/lib/artists";
import { STUDIO, SITE_URL } from "@/lib/studio";

// Statically generated from the const array in lib/styles.ts; the artist
// match + flash strip revalidate hourly like the artist pages.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return STYLE_PAGES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const style = getStylePage(params.slug);
  if (!style) return { title: "Styles · Baroness Tattoo" };
  return {
    title: style.metaTitle,
    description: style.metaDescription,
    alternates: { canonical: `/styles/${style.slug}` },
    openGraph: {
      title: style.h1,
      description: style.metaDescription,
      url: `${SITE_URL}/styles/${style.slug}`,
    },
  };
}

/** Artists whose specialty/bio mentions this style. Empty = no clean match. */
function matchArtists(style: StylePage, artists: PublicArtist[]): PublicArtist[] {
  return artists.filter((a) => {
    const hay = `${a.specialty ?? ""} ${a.bio ?? ""}`.toLowerCase();
    return style.matchTerms.some((t) => hay.includes(t));
  });
}

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const bodyP: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.7, color: "#3a2f22", margin: "0 0 18px" };

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div style={{ textAlign: "center", margin: "56px 0 22px" }}>
      <div style={label}>{kicker}</div>
      <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 29, color: "var(--black)", margin: "2px 0 4px" }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "2px auto 0", maxWidth: 280, color: "var(--gold-dark)" }}>
        <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,transparent,var(--gold-dark))" }} />
        <span>❦</span>
        <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,var(--gold-dark),transparent)" }} />
      </div>
    </div>
  );
}

export default async function StylePageRoute({ params }: { params: { slug: string } }) {
  const style = getStylePage(params.slug);
  if (!style) notFound();

  const allArtists = await fetchPublishedArtists();
  const matched = matchArtists(style, allArtists);
  const showAll = matched.length === 0;
  const artists = showAll ? allArtists : matched;

  // A strip of approved flash from the artists shown (approved-only is
  // already enforced by RLS + the lib/artists query).
  const flash = artists
    .flatMap((a) => (a.flash ?? []).map((f) => ({ ...f, artist: a.display_name })))
    .slice(0, 8);

  const bookHref = `/book?style=${encodeURIComponent(style.bookStyle)}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Styles", item: `${SITE_URL}/styles` },
      { "@type": "ListItem", position: 3, name: style.h1, item: `${SITE_URL}/styles/${style.slug}` },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: style.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 90px" }}>
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ ...label, fontSize: 10, marginBottom: 18 }}>
          <Link href="/" style={{ color: "var(--gold-dark)", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <Link href="/styles" style={{ color: "var(--gold-dark)", textDecoration: "none" }}>Styles</Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <span style={{ color: "var(--grey)" }}>{style.name}</span>
        </nav>

        <div style={{ textAlign: "center" }}>
          <div style={label}>{style.kicker} · {STUDIO.address.city}, {STUDIO.address.state}</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(34px,5.5vw,48px)", lineHeight: 1.1, color: "var(--black)", margin: "8px 0 0" }}>
            {style.h1}
          </h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 17.5, fontStyle: "italic", color: "var(--grey)", maxWidth: 620, margin: "12px auto 0", lineHeight: 1.6 }}>
            {style.intro}
          </p>
          <a href={bookHref} className="btn" style={{ marginTop: 22 }}>Book {style.name} Work</a>
        </div>

        {/* the essay */}
        <div style={{ maxWidth: 680, margin: "44px auto 0" }}>
          {style.paragraphs.map((p, i) => (
            <p key={i} style={i === 0 ? { ...bodyP, fontSize: 18 } : bodyP}>{p}</p>
          ))}
        </div>

        {/* artists who work in this style */}
        <SectionHead kicker="Whose Hands" title={showAll ? "The House Artists" : `Artists Working in ${style.name}`} />
        {showAll && artists.length > 0 && (
          <p style={{ textAlign: "center", fontFamily: "var(--body)", fontSize: 15, fontStyle: "italic", color: "var(--grey)", margin: "0 0 20px" }}>
            Every resident of the house takes {style.name.toLowerCase()} commissions — tell us the idea and we&rsquo;ll match the hand.
          </p>
        )}
        {artists.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 18 }}>
            {artists.map((a) => {
              const img = a.portrait_url || a.flash?.[0]?.image_url || null;
              return (
                <Link key={a.id} href={`/artists/${a.slug}`} style={{ display: "block", textDecoration: "none", background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,.1)" }}>
                  <div style={{ height: 180, background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`${a.display_name} — ${style.name.toLowerCase()} tattoo artist at Baroness Tattoo, Garland TX`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 52, color: "var(--gold-light)" }}>{(a.display_name?.trim()?.[0] ?? "B").toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ padding: "12px 12px 16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--caps)", fontSize: 14, letterSpacing: ".04em", color: "var(--black)" }}>{a.display_name}</div>
                    <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 13.5, color: "var(--grey)", marginTop: 3 }}>{a.specialty || "Custom tattoo artist"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: "center", fontFamily: "var(--body)", fontStyle: "italic", fontSize: 16, color: "var(--grey)" }}>
            The portraits are being hung — meanwhile, <a href={bookHref} style={{ color: "var(--gold-dark)" }}>tell us your idea</a> and the house will match you.
          </p>
        )}

        {/* flash strip */}
        {flash.length > 0 && (
          <>
            <SectionHead kicker="From the Sketchbooks" title="Available Flash" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
              {flash.map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={f.id} src={f.image_url} alt={f.caption || `${style.name} tattoo flash by ${f.artist} — Baroness Tattoo, Garland TX`} loading="lazy" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", border: "1px solid var(--gold)", borderRadius: 4 }} />
              ))}
            </div>
            <p style={{ textAlign: "center", fontFamily: "var(--body)", fontSize: 14, fontStyle: "italic", color: "var(--grey)", marginTop: 14 }}>
              See more in the <Link href="/gallery" style={{ color: "var(--gold-dark)" }}>gallery</Link> and each artist&rsquo;s <Link href="/artists" style={{ color: "var(--gold-dark)" }}>portfolio</Link>.
            </p>
          </>
        )}

        {/* style FAQs */}
        <SectionHead kicker="Asked of the House" title={`${style.name} Questions`} />
        <div>
          {style.faqs.map((f) => (
            <details key={f.q} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "16px 20px", margin: "10px 0" }}>
              <summary style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18.5, color: "var(--black)", cursor: "pointer", listStyle: "none" }}>
                <span style={{ color: "var(--gold-dark)", marginRight: 10 }}>❧</span>{f.q}
              </summary>
              <p style={{ fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.65, color: "#3a2f22", margin: "10px 0 2px" }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* book CTA */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 19, color: "var(--grey)" }}>
            {STUDIO.name} · {STUDIO.address.area}, {STUDIO.address.city}, {STUDIO.address.state} · walk-ins welcome, custom work by appointment.
          </p>
          <a href={bookHref} className="btn" style={{ marginTop: 14 }}>Book a {style.name} Consultation</a>
          <p style={{ fontFamily: "var(--body)", fontSize: 13.5, fontStyle: "italic", color: "var(--grey)", marginTop: 12 }}>
            {STUDIO.depositPolicy}
          </p>
        </div>
      </article>
    </main>
  );
}
