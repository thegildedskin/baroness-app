import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ProfileEditor from "./ProfileEditor";
import SetPassword from "./SetPassword";
import ClientQuarters from "./ClientQuarters";

export const dynamic = "force-dynamic";

type Convo = { id: string; artist_id: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };

export default async function Dashboard({ searchParams }: { searchParams: { id?: string; me?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isOwner = profile?.role === "owner";

  let artistId = searchParams.id;
  if (!artistId && !isOwner) {
    const { data: own } = await supabase.from("artists").select("id").eq("user_id", user.id).maybeSingle();
    artistId = own?.id;
  }

  if (isOwner && !artistId && searchParams.me !== "1") {
    const { data: artists } = await supabase.from("artists").select("id, display_name, slug, is_published").order("sort_order");
    return (
      <main className="wrap" style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: 12, display: "flex", gap: 18 }}><Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link><Link href="/admin" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>⚜ House Admin</Link><Link href="/dashboard?me=1" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>👤 My Quarters</Link></p>
        <h1 style={{ fontSize: 44 }}>Artists&rsquo; Quarters</h1>
        <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 20px" }}>Signed in as {user.email} · House Owner</p>
        <div className="card">
          <h3 style={{ fontSize: 22, marginBottom: 14 }}>Choose an artist to edit</h3>
          <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
            {(artists ?? []).map((a) => (
              <li key={a.id}><Link href={`/dashboard?id=${a.id}`}>{a.display_name} — {a.is_published ? "published" : "unpublished"}</Link></li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 24 }}><SetPassword /></div>
        <form action="/auth/signout" method="post" style={{ marginTop: 6 }}><button className="btn ghost" type="submit">Sign out</button></form>
      </main>
    );
  }

  if (!artistId) {
    // Client Quarters (clients + any not-yet-linked user).
    // All five reads are independent — run them in PARALLEL. Sequential awaits
    // here were the "My Quarters is slow" bug: 5 stacked round trips.
    const fetchConvos = async (): Promise<Convo[]> => {
      try {
        const admin = createAdminClient();
        const { data } = await admin
          .from("threads")
          .select("id, artist_id, last_message_at, artists(display_name)")
          .eq("client_email", user.email)
          .order("last_message_at", { ascending: false })
          .limit(20);
        return (data ?? []) as unknown as Convo[];
      } catch { return []; /* threads optional */ }
    };
    const [{ data: cprofile }, convos, { data: passport }, { data: achRows }, { data: designs }] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar, credits, total_spent_cents, premium, rpm_url, avatar_tattoo").eq("id", user.id).single(),
      fetchConvos(),
      supabase.from("ink_passport").select("id, title, artist_name, inked_on, notes, image_url").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_achievements").select("key").eq("user_id", user.id),
      supabase.from("designs").select("id, title, placement, image_url, created_at, exported").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    const achievements = (achRows ?? []).map((r: { key: string }) => r.key);
    return <ClientQuarters userId={user.id} email={user.email!} profile={cprofile ?? null} convos={convos} passport={passport ?? []} achievements={achievements} designs={designs ?? []} />;
  }

  // Independent reads → PARALLEL (same slow-quarters fix as the client path).
  // products uses "*" so new columns (e.g. claimable, migration 012) flow
  // through without breaking environments where the migration hasn't run yet;
  // marketing_posts is the artist's studio-social submissions (RLS-scoped).
  const [{ data: artist }, { data: flash }, { data: threads }, { data: products }, { data: marketingPosts }] = await Promise.all([
    supabase.from("artists").select("*").eq("id", artistId).single(),
    supabase.from("flash").select("id, image_url, caption, sort_order").eq("artist_id", artistId).order("sort_order"),
    supabase
      .from("threads")
      .select("id, client_name, client_email, created_at, last_message_at, messages(id, sender, body, created_at)")
      .eq("artist_id", artistId)
      .order("last_message_at", { ascending: false }),
    supabase.from("products").select("*").eq("artist_id", artistId).order("created_at", { ascending: false }),
    supabase
      .from("marketing_posts")
      .select("id, caption, media_url, status, created_at, scheduled_for, published_at")
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  if (!artist) return (<main className="wrap"><p>Artist not found.</p></main>);
  return (<ProfileEditor artist={artist} flash={flash ?? []} threads={threads ?? []} products={products ?? []} marketingPosts={marketingPosts ?? []} isOwner={!!isOwner} email={user.email!} userId={user.id} />);
}
