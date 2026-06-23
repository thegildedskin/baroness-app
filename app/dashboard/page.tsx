import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileEditor from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
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
  const isOwner = profile?.role === "owner";

  // Which artist are we editing?
  let artistId = searchParams.id;
  if (!artistId && !isOwner) {
    const { data: own } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    artistId = own?.id;
  }

  // Owner with no selection → show the roster to pick from.
  if (isOwner && !artistId) {
    const { data: artists } = await supabase
      .from("artists")
      .select("id, display_name, slug, is_published")
      .order("sort_order");
    return (
      <main className="wrap" style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: 12 }}>
          <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>
            ← The Estate
          </Link>
        </p>
        <h1 style={{ fontSize: 44 }}>Artists&rsquo; Quarters</h1>
        <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 20px" }}>
          Signed in as {user.email} · House Owner
        </p>
        <div className="card">
          <h3 style={{ fontSize: 22, marginBottom: 14 }}>Choose an artist to edit</h3>
          <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
            {(artists ?? []).map((a) => (
              <li key={a.id}>
                <Link href={`/dashboard?id=${a.id}`} style={{ textDecoration: "none" }}>
                  <strong>{a.display_name}</strong>{" "}
                  <span style={{ color: "var(--grey)" }}>
                    — {a.is_published ? "published" : "unpublished"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <form action="/auth/signout" method="post" style={{ marginTop: 24 }}>
          <button className="btn ghost" type="submit">Sign out</button>
        </form>
      </main>
    );
  }

  if (!artistId) {
    return (
      <main className="wrap" style={{ maxWidth: 640 }}>
        <p style={{ marginBottom: 12 }}>
          <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>
            ← The Estate
          </Link>
        </p>
        <h1 style={{ fontSize: 40 }}>Artists&rsquo; Quarters</h1>
        <div className="card" style={{ marginTop: 16 }}>
          <p>
            Your login isn&rsquo;t linked to an artist profile yet. Ask the House
            Owner to link your profile.
          </p>
        </div>
        <form action="/auth/signout" method="post" style={{ marginTop: 24 }}>
          <button className="btn ghost" type="submit">Sign out</button>
        </form>
      </main>
    );
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("id", artistId)
    .single();
  const { data: flash } = await supabase
    .from("flash")
    .select("id, image_url, caption, sort_order")
    .eq("artist_id", artistId)
    .order("sort_order");

  if (!artist) {
    return (
      <main className="wrap">
        <p>Artist not found.</p>
      </main>
    );
  }

  return (
    <ProfileEditor
      artist={artist}
      flash={flash ?? []}
      isOwner={!!isOwner}
      email={user.email!}
    />
  );
}
