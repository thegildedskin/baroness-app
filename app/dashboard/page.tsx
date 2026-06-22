import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: artist } = await supabase
    .from("artists")
    .select("display_name, slug, is_published")
    .eq("user_id", user.id)
    .maybeSingle();

  const isOwner = profile?.role === "owner";

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 44 }}>Artists&rsquo; Quarters</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 20px" }}>
        Signed in as {user.email} {isOwner ? "· House Owner" : ""}
      </p>

      <div className="card">
        {artist ? (
          <p>
            Your portrait page: <strong>{artist.display_name}</strong> (
            {artist.is_published ? "published" : "unpublished"}). Editing tools —
            bio, portrait, flash gallery, public note, and client messages — arrive
            in the next build phase.
          </p>
        ) : (
          <p>
            Your login isn&rsquo;t linked to an artist profile yet.{" "}
            {isOwner
              ? "As House Owner you'll be able to assign profiles from the admin panel (next phase)."
              : "Ask the House Owner to link your profile."}
          </p>
        )}
      </div>

      <form action="/auth/signout" method="post" style={{ marginTop: 24 }}>
        <button className="btn ghost" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
