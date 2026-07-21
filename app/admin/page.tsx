import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") redirect("/dashboard");

  const [
    { data: gallery }, { data: pending }, { data: suggestions }, { data: artists }, { data: clients }, { data: threads },
    { data: mktArtists }, { data: mktSettings }, { data: mktPosts }, { data: mktMetrics }, { data: mktSocials },
  ] = await Promise.all([
    supabase.from("gallery").select("id, image_url, caption").order("sort_order"),
    supabase.from("flash").select("id, image_url, artist_id, artists(display_name)").eq("approved", false).order("created_at", { ascending: false }),
    supabase.from("suggestions").select("id, author_name, author_email, body, status, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("artists").select("id, display_name, slug, is_published").order("sort_order"),
    supabase.from("profiles").select("id, email, display_name, credits").eq("role", "client").limit(200),
    supabase.from("threads").select("id, artist_id, client_name, last_message_at, artists(display_name)").order("last_message_at", { ascending: false }).limit(30),
    supabase.from("artists").select("id, display_name, is_published, instagram_url, venue_url").order("sort_order"),
    supabase.from("site_settings").select("key, value"),
    supabase.from("marketing_posts").select("id, location, platform, artist_id, caption, media_note, scheduled_for, status, created_at, media_url, social_account_id, published_at, external_post_id, publish_error").order("scheduled_for", { ascending: true, nullsFirst: false }).limit(200),
    supabase.from("marketing_metrics").select("week_start, location, inquiries, avg_response_min, deposits, reviews_added, notes").order("week_start", { ascending: false }).limit(24),
    supabase.from("social_accounts").select("id, platform, label, external_id, access_token, connected_at").order("connected_at"),
  ]);

  return (
    <AdminPanel
      gallery={gallery ?? []}
      pending={(pending ?? []) as never}
      suggestions={suggestions ?? []}
      artists={artists ?? []}
      clients={clients ?? []}
      threads={(threads ?? []) as never}
      mktArtists={mktArtists ?? []}
      mktSettings={mktSettings ?? []}
      mktPosts={(mktPosts ?? []) as never}
      mktMetrics={mktMetrics ?? []}
      mktSocials={mktSocials ?? []}
    />
  );
}
