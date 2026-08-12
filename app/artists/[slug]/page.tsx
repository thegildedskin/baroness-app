import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHeader from "../../PublicHeader";
import { fetchArtistBySlug, fetchPublishedArtists } from "@/lib/artists";
import { STUDIO, SITE_URL } from "@/lib/studio";

// Static + ISR (hourly): indexable artist pages that stay fresh without a
// deploy. New artists published after a build resolve on first request
// (dynamicParams defaults to true).
export const revalidate = 3600;

export async function generateStaticParams() {
  const artists = await fetchPublishedArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const artist = await fetchArtistBySlug(params.slug);
  if (!artist) return { title: "Artist · Baroness Tattoo" };
  const specialty = artist.specialty || "Tattoo Artist";
  const title = `${artist.display_name} — ${specialty} | Baroness Tattoo, Garland TX`;
  const description =
    (artist.bio ? artist.bio.slice(0, 150).trim() + (artist.bio.length > 150 ? "…" : " ") : `${artist.display_name} tattoos at Baroness Tattoo, Firewheel Town Center. `) +
    ` Book with ${artist.display_name} in Garland, TX.`;
  const img = artist.portrait_url || artist.flash?.[0]?.image_url;
  return {
    title,
    description,
    alternates: { canonical: `/artists/${artist.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/artists/${artist.slug}`,
      type: "profile",
      ...(img ? { images: [{ url: img }] } : {}),
    },
  };
}

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };

export default async function ArtistPage({ params }: { params: { slug: string } }) {
  const artist = await fetchArtistBySlug(params.slug);
  if (!artist) notFound();

  const portfolio = [...(artist.flash ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const portrait = artist.portrait_url || portfolio[0]?.image_url || null;

  // Person JSON-LD tying the artist to the studio's local entity.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.display_name,
    jobTitle: artist.specialty || "Tattoo Artist",
    url: `${SITE_URL}/artists/${artist.slug}`,
    ...(portrait ? { image: portrait } : {}),
    ...(artist.instagram_url ? { sameAs: [artist.instagram_url] } : {}),
    worksFor: { "@type": "TattooParlor", name: STUDIO.name, address: STUDIO.address.full, telephone: STUDIO.phone },
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 90px" }}>
        {/* portrait + intro */}
        <div style={{ display: "flex", gap: 36, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 300px", maxWidth: "100%" }}>
            <div style={{ position: "relative", height: 360, background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", boxShadow: "0 14px 34px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portrait} alt={`${artist.display_name} — ${artist.specialty || "tattoo artist"} at Baroness Tattoo, Garland TX`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 84, color: "var(--gold-light)" }}>
                  {(artist.display_name?.trim()?.[0] ?? "B").toUpperCase()}
                </span>
              )}
              <span style={{ position: "absolute", inset: 12, border: "2px solid var(--gold)", borderRadius: 3, pointerEvents: "none" }} />
            </div>
          </div>
          <div style={{ flex: "1 1 380px" }}>
            <div style={label}>Of the House of Baroness · {STUDIO.address.city}, {STUDIO.address.state}</div>
            <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.06, color: "var(--black)", margin: "8px 0 0" }}>
              {artist.display_name}
            </h1>
            <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 20, color: "var(--gold-dark)", marginTop: 6 }}>
              {artist.specialty || "Custom tattoo artist"}
            </div>
            <p style={{ fontFamily: "var(--body)", fontSize: 17, lineHeight: 1.65, color: "#3a2f22", marginTop: 16, whiteSpace: "pre-line" }}>
              {artist.bio || `${artist.display_name} tattoos at ${STUDIO.name} in ${STUDIO.address.area}, ${STUDIO.address.city}. Portfolio below — bring them your idea and they'll design the rest.`}
            </p>
            {artist.public_note && (
              <div style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, padding: "14px 18px", marginTop: 16 }}>
                <div style={{ ...label, fontSize: 9.5, marginBottom: 4 }}>A note left for you</div>
                <span style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 17, color: "#3a2f22" }}>{artist.public_note}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 22 }}>
              <a
                href={`/book?artist=${encodeURIComponent(artist.slug)}`}
                style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "15px 28px", textDecoration: "none", boxShadow: "0 6px 18px rgba(20,14,8,.25)" }}
              >
                Book with {artist.display_name} →
              </a>
              {artist.instagram_url && (
                <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 11, color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 3, padding: "13px 20px", textDecoration: "none" }}>
                  Instagram
                </a>
              )}
            </div>
            <p style={{ fontFamily: "var(--body)", fontSize: 13.5, fontStyle: "italic", color: "var(--grey)", marginTop: 12 }}>
              {STUDIO.depositPolicy}
            </p>
          </div>
        </div>

        {/* portfolio */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, color: "var(--black)", textAlign: "center" }}>Portfolio</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "6px auto 26px", maxWidth: 320, color: "var(--gold-dark)" }}>
            <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,transparent,var(--gold-dark))" }} />
            <span>❦</span>
            <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,var(--gold-dark),transparent)" }} />
          </div>
          {portfolio.length === 0 ? (
            <p style={{ textAlign: "center", fontFamily: "var(--body)", fontStyle: "italic", fontSize: 17, color: "var(--grey)" }}>
              New work is being framed — see their Instagram meanwhile, or ask to view their book in the studio.
            </p>
          ) : (
            <div style={{ columns: "3 240px", columnGap: 16 }}>
              {portfolio.map((f) => (
                <figure key={f.id} style={{ breakInside: "avoid", margin: "0 0 16px", border: "3px solid var(--gold)", borderRadius: 4, overflow: "hidden", background: "var(--velvet)", boxShadow: "0 10px 24px rgba(0,0,0,.18), inset 0 0 0 1px var(--gold-dark)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.image_url} alt={f.caption || `Tattoo by ${artist.display_name} — Baroness Tattoo, Garland TX`} loading="lazy" style={{ display: "block", width: "100%", height: "auto" }} />
                </figure>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a
            href={`/book?artist=${encodeURIComponent(artist.slug)}`}
            style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "16px 32px", textDecoration: "none", boxShadow: "0 6px 18px rgba(20,14,8,.25)" }}
          >
            Book with {artist.display_name} — $100 deposit
          </a>
          <p style={{ fontFamily: "var(--body)", fontSize: 14, fontStyle: "italic", color: "var(--grey)", marginTop: 12 }}>
            {STUDIO.name} · {STUDIO.address.full} · {STUDIO.phone}
          </p>
          <a href="/artists" style={{ ...label, textDecoration: "none" }}>← All artists</a>
        </div>
      </div>
    </main>
  );
}
