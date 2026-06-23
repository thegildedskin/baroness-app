import { createClient } from "@/lib/supabase/server";
import EstateApp, { type Artist } from "./EstateApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  let artists: Artist[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select(
        "id,slug,display_name,specialty,bio,public_note,portrait_url,instagram_url,venue_url,avatar, flash(id,image_url,sort_order)"
      )
      .eq("is_published", true)
      .order("sort_order");
    artists = (data ?? []) as unknown as Artist[];
  } catch {
    // Supabase not reachable — render the estate with no artists.
  }

  return <EstateApp artists={artists} />;
}
