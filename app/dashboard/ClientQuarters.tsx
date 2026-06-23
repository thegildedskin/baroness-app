"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AvatarBuilder from "./AvatarBuilder";
import SetPassword from "./SetPassword";
import { AvatarRender, type AvatarConfig } from "../avatar/AvatarRender";

type Convo = { id: string; artist_id: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };
type Profile = { display_name: string | null; avatar: Partial<AvatarConfig> | null; credits: number | null; total_spent_cents: number | null; premium: boolean | null };

function artistName(c: Convo): string {
  const a = c.artists;
  if (!a) return "An artist";
  return Array.isArray(a) ? (a[0]?.display_name ?? "An artist") : a.display_name;
}

export default function ClientQuarters({ userId, email, profile, convos }: {
  userId: string; email: string; profile: Profile | null; convos: Convo[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [status, setStatus] = useState("");
  const credits = profile?.credits ?? 0;
  const spent = ((profile?.total_spent_cents ?? 0) / 100).toFixed(2);

  async function saveName() {
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", userId);
    setStatus(error ? `Error: ${error.message}` : "Saved.");
    if (!error) router.refresh();
  }
  const [sug, setSug] = useState("");
  const [sugStatus, setSugStatus] = useState("");
  async function submitSuggestion() {
    if (!sug.trim()) return;
    const { error } = await supabase.from("suggestions").insert({ author_name: name || null, author_email: email, body: sug.trim() });
    setSugStatus(error ? `Error: ${error.message}` : "Thank you — your note reached the house.");
    if (!error) setSug("");
  }

  const stat = (label: string, value: string, hint?: string) => (
    <div style={{ flex: "1 1 150px", background: "linear-gradient(180deg,#fdf6e7,#ece0c6)", border: "1px solid var(--gold)", borderRadius: 8, padding: "16px 18px" }}>
      <div className="caps" style={{ fontSize: 9, letterSpacing: ".18em", color: "var(--gold-dark)" }}>{label}</div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, color: "var(--black)" }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--grey)" }}>{hint}</div>}
    </div>
  );

  return (
    <main className="wrap" style={{ maxWidth: 820 }}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link>
      </p>
      <h1 style={{ fontSize: 46 }}>Your Quarters</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 22px" }}>
        {name ? `${name} · ` : ""}{email}
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        {stat("Credits & gifts", String(credits), "Earn via visits & achievements")}
        {stat("Total spent", `$${spent}`, "Across the house")}
        {stat("Conversations", String(convos.length), "With your artists")}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 10 }}>Your name</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How the house should address you"
            style={{ flex: 1, minWidth: 220, padding: "10px 12px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 16 }} />
          <button className="btn" onClick={saveName}>Save</button>
          {status && <span style={{ alignSelf: "center", color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</span>}
        </div>
      </div>

      <AvatarBuilder artistId={userId} table="profiles" canUnlock={false} initial={profile?.avatar ?? null} entitled={!!profile?.premium} />

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 12 }}>Your likeness in the estate</h3>
        <div style={{ display: "flex", justifyContent: "center", background: "radial-gradient(120% 90% at 50% 0%, #d6e6ef, #a9c4d4)", border: "1px solid var(--gold)", borderRadius: 10, padding: 18 }}>
          <AvatarRender config={profile?.avatar ?? null} size={220} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 12 }}>Your conversations</h3>
        {convos.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>No conversations yet. Message an artist from their profile in the Hall of Portraits.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
            {convos.map((c) => (
              <li key={c.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(139,111,53,.25)", paddingBottom: 6 }}>
                <span><strong>{artistName(c)}</strong></span>
                <span style={{ color: "var(--grey)", fontSize: 14 }}>{new Date(c.last_message_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Billing & purchases</h3>
        <p style={{ color: "var(--grey)" }}>No purchases on file yet. Your shop orders, premium membership, and stencil purchases will appear here once the boutique &amp; marketplace open.</p>
      </div>

      <div style={{ marginTop: 6 }}><SetPassword /></div>
      <form action="/auth/signout" method="post" style={{ marginTop: 6 }}><button className="btn ghost" type="submit">Sign out</button></form>
    </main>
  );
}
