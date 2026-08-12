import { createClient } from "@/lib/supabase/server";
import BookForm, { type BookArtist } from "./BookForm";
import { STUDIO } from "@/lib/studio";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book a Tattoo Consultation in Garland, TX · Baroness Tattoo",
  description:
    "Book your tattoo at Baroness Tattoo, Firewheel Town Center, Garland TX. Tell us your idea, pick your artist — a $100 deposit (applied to your final price) holds the chair.",
  alternates: { canonical: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: { artist?: string; style?: string } }) {
  let artists: BookArtist[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select("id,slug,display_name,specialty,portrait_url")
      .eq("is_published", true)
      .order("sort_order");
    artists = (data ?? []) as BookArtist[];
  } catch {
    // Supabase unreachable — the form still works with "Match me".
  }
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
