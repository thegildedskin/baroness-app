import { createClient } from "@/lib/supabase/server";
import EstateApp, { type Artist } from "./EstateApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  let artists: Artist[] = [];
  let gallery: string[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select(
        "id,slug,display_name,specialty,bio,public_note,portrait_url,instagram_url,venue_url,avatar, flash(id,image_url,sort_order), products(id,title,description,price_cents,kind,preview_url,is_active)"
      )
      .eq("is_published", true)
      .order("sort_order");
    artists = (data ?? []) as unknown as Artist[];
    const { data: g } = await supabase.from("gallery").select("image_url").order("sort_order");
    gallery = (g ?? []).map((x: { image_url: string }) => x.image_url);
  } catch {
    // Supabase not reachable — render the estate with no artists.
  }

  return <EstateApp artists={artists} gallery={gallery} />;
}
