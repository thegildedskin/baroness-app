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

  const [{ data: gallery }, { data: pending }, { data: suggestions }, { data: artists }, { data: clients }, { data: threads }] = await Promise.all([
    supabase.from("gallery").select("id, image_url, caption").order("sort_order"),
    supabase.from("flash").select("id, image_url, artist_id, artists(display_name)").eq("approved", false).order("created_at", { ascending: false }),
    supabase.from("suggestions").select("id, author_name, author_email, body, status, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("artists").select("id, display_name, slug, is_published").order("sort_order"),
    supabase.from("profiles").select("id, email, display_name, credits").eq("role", "client").limit(200),
    supabase.from("threads").select("id, artist_id, client_name, last_message_at, artists(display_name)").order("last_message_at", { ascending: false }).limit(30),
  ]);

  return (
    <AdminPanel
      gallery={gallery ?? []}
      pending={(pending ?? []) as never}
      suggestions={suggestions ?? []}
      artists={artists ?? []}
      clients={clients ?? []}
      threads={(threads ?? []) as never}
    />
  );
}
