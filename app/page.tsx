import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EstateApp, { type Artist, type SiteSettings } from "./EstateApp";
import { STUDIO } from "@/lib/studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Baroness Tattoo — Fine Art Tattoo Studio in Garland, TX (Firewheel)",
  description:
    "Fine line, black & grey realism and illustrative fine-art tattoos at Firewheel Town Center, Garland TX. 5.0★ across 31 Google reviews. Walk-ins welcome; book with a $100 deposit.",
  alternates: { canonical: "/" },
};

const FUNNEL_LINKS = [
  { href: "/artists", label: "Artists" },
  { href: "/styles", label: "Styles" },
  { href: "/book", label: "Book" },
  { href: "/shop", label: "Shop" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/aftercare", label: "Aftercare" },
];

export default async function Home() {
  let artists: Artist[] = [];
  let gallery: string[] = [];
  let settings: SiteSettings = {};
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select(
        "id,slug,display_name,specialty,bio,public_note,portrait_url,instagram_url,venue_url,avatar, flash(id,image_url,sort_order), products(id,title,description,price_cents,kind,preview_url,is_active)"
      )
      .eq("is_published", true)
      .eq("flash.approved", true) // only studio-approved flash on the public site
      .order("sort_order");
    artists = (data ?? []) as unknown as Artist[];
    const { data: g } = await supabase.from("gallery").select("image_url").order("sort_order");
    gallery = (g ?? []).map((x: { image_url: string }) => x.image_url);
    const { data: s } = await supabase.from("site_settings").select("key,value").in("key", ["studio_venue_url", "booking_promise"]);
    for (const row of s ?? []) {
      if (row.key === "studio_venue_url" && row.value) settings.studio_venue_url = row.value;
      if (row.key === "booking_promise" && row.value) settings.booking_promise = row.value;
    }
  } catch {
    // Supabase not reachable — render the estate with no artists.
  }

  return (
    <>
      {/* Server-rendered funnel nav — always visible over the estate, no
          bell-ringing required, and present in the crawled HTML. */}
      <nav className="funnel-nav" aria-label="Site">
        {FUNNEL_LINKS.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>

      <EstateApp artists={artists} gallery={gallery} settings={settings} />

      {/* SEO footer: real NAP + funnel links in the server HTML. The estate
          overlay (position:fixed) covers it visually; it is not display:none —
          crawlers and no-JS readers get the studio's facts and artist names. */}
      <footer className="seo-footer">
        <h2>{STUDIO.name} — Fine Art Tattoo Studio in Garland, TX</h2>
        <p>
          {STUDIO.address.full} ({STUDIO.address.area}) · <a href={STUDIO.phoneHref}>{STUDIO.phone}</a> ·{" "}
          <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
        </p>
        <p>Hours: Mon–Sat 12–8 PM · Sun 12–6 PM · 5.0★ across {STUDIO.rating.count} Google reviews</p>
        <p>Styles: {STUDIO.styles.join(", ")}</p>
        {artists.length > 0 && (
          <p>
            Artists:{" "}
            {artists.map((a, i) => (
              <span key={a.id}>
                {i > 0 && " · "}
                <a href={`/artists/${a.slug}`}>{a.display_name}</a>
              </span>
            ))}
          </p>
        )}
        <p>
          <a href="/book">Book a consultation</a> · <a href="/artists">Artists</a> · <a href="/styles">Styles</a> · <a href="/gallery">Gallery</a> ·{" "}
          <a href="/shop">Shop &amp; gift cards</a> · <a href="/reviews">Reviews</a> · <a href="/faq">FAQ</a> ·{" "}
          <a href="/aftercare">Aftercare</a> · <a href="/prep-guide">Prep guide</a>
        </p>
      </footer>
    </>
  );
}
