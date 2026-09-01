import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import BookForm, { type BookArtist } from "./BookForm";
import { STUDIO } from "@/lib/studio";

// The page itself is dynamic (searchParams prefill artist/style), but the
// artist roster is cached for 5 minutes via the cookie-free static client, so
// most visits skip the Supabase round trip that was slowing the money page.
export const dynamic = "force-dynamic";

const getArtists = unstable_cache(
  async (): Promise<BookArtist[]> => {
    try {
      const supabase = createStaticClient();
      if (!supabase) return [];
      const { data } = await supabase
        .from("artists")
        .select("id,slug,display_name,specialty,portrait_url")
        .eq("is_published", true)
        .order("sort_order");
      return (data ?? []) as BookArtist[];
    } catch {
      return []; // Supabase unreachable — the form still works with "Match me".
    }
  },
  ["book-artists"],
  { revalidate: 300 },
);

export const metadata = {
  title: "Book a Tattoo Consultation in Garland, TX · Baroness Tattoo",
  description:
    "Book your tattoo at Baroness Tattoo, Firewheel Town Center, Garland TX. Tell us your idea, pick your artist — a $100 deposit (applied to your final price) holds the chair.",
  alternates: { canonical: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: { artist?: string; style?: string } }) {
  const artists = await getArtists();
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <BookForm artists={artists} initialArtist={searchParams?.artist || ""} initialStyle={searchParams?.style || ""} />
      {/* Server-rendered deposit policy + NAP so the page carries real,
          crawlable content beyond the client form. */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 22px 70px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--body)", fontSize: 14, fontStyle: "italic", color: "var(--grey)", lineHeight: 1.6 }}>
          {STUDIO.depositPolicy}
          <br />
          {STUDIO.name} · {STUDIO.address.full} · {STUDIO.phone} · Mon–Sat 12–8, Sun 12–6
        </p>
      </section>
    </main>
  );
}
