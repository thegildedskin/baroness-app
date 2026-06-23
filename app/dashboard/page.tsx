import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ProfileEditor from "./ProfileEditor";
import SetPassword from "./SetPassword";
import ClientQuarters from "./ClientQuarters";

export const dynamic = "force-dynamic";

type Convo = { id: string; artist_id: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };

export default async function Dashboard({ searchParams }: { searchParams: { id?: string } }) {
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

  if (isOwner && !artistId) {
    const { data: artists } = await supabase.from("artists").select("id, display_name, slug, is_published").order("sort_order");
    return (
      <main className="wrap" style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: 12, display: "flex", gap: 18 }}><Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link><Link href="/admin" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>⚜ House Admin</Link></p>
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
    // Client Quarters (clients + any not-yet-linked user)
    const { data: cprofile } = await supabase
      .from("profiles")
      .select("display_name, avatar, credits, total_spent_cents, premium, rpm_url")
      .eq("id", user.id)
      .single();
    let convos: Convo[] = [];
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("threads")
        .select("id, artist_id, last_message_at, artists(display_name)")
        .eq("client_email", user.email)
        .order("last_message_at", { ascending: false })
        .limit(20);
      convos = (data ?? []) as unknown as Convo[];
    } catch {
      /* threads optional */
    }
    return <ClientQuarters userId={user.id} email={user.email!} profile={cprofile ?? null} convos={convos} />;
  }

  const { data: artist } = await supabase.from("artists").select("*").eq("id", artistId).single();
  const { data: flash } = await supabase.from("flash").select("id, image_url, caption, sort_order").eq("artist_id", artistId).order("sort_order");
  const { data: threads } = await supabase
    .from("threads")
    .select("id, client_name, client_email, created_at, last_message_at, messages(id, sender, body, created_at)")
    .eq("artist_id", artistId)
    .order("last_message_at", { ascending: false });
  const { data: products } = await supabase.from("products").select("id, title, description, price_cents, kind, preview_url, is_active").eq("artist_id", artistId).order("created_at", { ascending: false });
  if (!artist) return (<main className="wrap"><p>Artist not found.</p></main>);

  return (<ProfileEditor artist={artist} flash={flash ?? []} threads={threads ?? []} products={products ?? []} isOwner={!!isOwner} email={user.email!} />);
}
