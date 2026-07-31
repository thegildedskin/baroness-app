import { createClient } from "@/lib/supabase/server";
import BookForm, { type BookArtist } from "./BookForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book a Consultation · Baroness Tattoo",
  description: "Book your tattoo consultation at Baroness Tattoo, Garland TX — a $100 deposit holds the chair.",
};

export default async function BookPage() {
  let artists: BookArtist[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select("id,display_name,specialty,portrait_url")
      .eq("is_published", true)
      .order("sort_order");
    artists = (data ?? []) as BookArtist[];
  } catch {
    // Supabase unreachable — the form still works with "First available".
  }
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <BookForm artists={artists} />
    </main>
  );
}
