import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Artist = {
  id: string;
  slug: string;
  display_name: string;
  specialty: string | null;
  is_published: boolean;
};

export default async function Home() {
  let artists: Artist[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("artists")
      .select("id,slug,display_name,specialty,is_published")
      .eq("is_published", true)
      .order("sort_order");
    artists = data ?? [];
  } catch {
    // Supabase not configured yet — render the shell anyway.
  }

  return (
    <main className="wrap">
      <p className="caps" style={{ fontSize: 12, color: "var(--gold-light)" }}>
        By Appointment of Her Grace · Garland, Texas
      </p>
      <h1 style={{ fontFamily: "var(--blackletter)", fontSize: 64, color: "var(--gold-dark)" }}>
        Baroness Tattoo
      </h1>
      <p style={{ fontStyle: "italic", fontSize: 20, color: "var(--gold-dark)" }}>
        &ldquo;Wear your crown.&rdquo;
      </p>

      <p style={{ margin: "24px 0", color: "var(--grey)" }}>
        This is the new app foundation. The full rococo estate experience will be
        ported here next. For now, you can sign in to the Artists&rsquo; Quarters.
      </p>

      <p style={{ display: "flex", gap: 12 }}>
        <Link className="btn" href="/login">
          Artists&rsquo; Quarters · Login
        </Link>
      </p>

      {artists.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2>Hall of Portraits</h2>
          <ul>
            {artists.map((a) => (
              <li key={a.id}>
                <strong>{a.display_name}</strong>
                {a.specialty ? ` — ${a.specialty}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
