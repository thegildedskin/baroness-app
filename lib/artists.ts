import { createStaticClient } from "@/lib/supabase/static";

// Public artist queries shared by /artists, /artists/[slug] and the sitemap.
// Uses the cookie-less anon client so the pages can be statically rendered
// and revalidated (ISR) — RLS already restricts reads to published artists
// and approved flash.

export type PublicFlash = { id: string; image_url: string; caption: string | null; sort_order: number };
export type PublicArtist = {
  id: string;
  slug: string;
  display_name: string;
  specialty: string | null;
  bio: string | null;
  public_note: string | null;
  portrait_url: string | null;
  instagram_url: string | null;
  flash: PublicFlash[];
};

const COLS = "id,slug,display_name,specialty,bio,public_note,portrait_url,instagram_url,flash(id,image_url,caption,sort_order)";

export async function fetchPublishedArtists(): Promise<PublicArtist[]> {
  try {
    const supabase = createStaticClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("artists")
      .select(COLS)
      .eq("is_published", true)
      .eq("flash.approved", true)
      .order("sort_order");
    return (data ?? []) as unknown as PublicArtist[];
  } catch {
    return [];
  }
}

export async function fetchArtistBySlug(slug: string): Promise<PublicArtist | null> {
  try {
    const supabase = createStaticClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("artists")
      .select(COLS)
      .eq("is_published", true)
      .eq("flash.approved", true)
      .eq("slug", slug)
      .maybeSingle();
    return (data ?? null) as unknown as PublicArtist | null;
  } catch {
    return null;
  }
}
