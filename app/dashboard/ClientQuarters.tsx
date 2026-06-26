"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AvatarBuilder from "./AvatarBuilder";
import Passport from "./Passport";
import SetPassword from "./SetPassword";
import { AvatarRender, type AvatarConfig } from "../avatar/AvatarRender";
import { getLook } from "../avatar/looks";
import { ACHIEVEMENTS, tierFor, nextTier } from "@/lib/achievements";
import { claimAchievements } from "@/app/actions";

type Convo = { id: string; artist_id: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };
type Profile = { display_name: string | null; avatar: Partial<AvatarConfig> | null; credits: number | null; total_spent_cents: number | null; premium: boolean | null; rpm_url: string | null; avatar_tattoo: string | null };
type Entry = { id: string; title: string | null; artist_name: string | null; inked_on: string | null; notes: string | null; image_url: string | null };
type Design = { id: string; title: string | null; placement: string | null; image_url: string | null; created_at: string; exported?: boolean | null };

function artistName(c: Convo): string {
  const a = c.artists;
  if (!a) return "An artist";
  return Array.isArray(a) ? (a[0]?.display_name ?? "An artist") : a.display_name;
}

export default function ClientQuarters({ userId, email, profile, convos, passport, achievements, designs = [] }: {
  userId: string; email: string; profile: Profile | null; convos: Convo[]; passport: Entry[]; achievements: string[]; designs?: Design[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(profile?.display_name ?? "");

  async function deleteDesign(id: string) {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (!error) router.refresh();
  }
  async function exportDesign(id: string) {
    try {
      const r = await fetch("/api/checkout-design", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ designId: id }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      alert(d.error || "Could not start checkout.");
    } catch { alert("Could not start checkout."); }
  }
  async function wearDesign(d: Design) {
    const { error } = await supabase.from("profiles").update({ avatar_tattoo: d.image_url, avatar_tattoo_placement: d.placement }).eq("id", userId);
    if (!error) router.refresh();
  }
  async function removeTattoo() {
    const { error } = await supabase.from("profiles").update({ avatar_tattoo: null, avatar_tattoo_placement: null }).eq("id", userId);
    if (!error) router.refresh();
  }
  const [status, setStatus] = useState("");
  const credits = profile?.credits ?? 0;
  const spentCents = profile?.total_spent_cents ?? 0;
  const spent = (spentCents / 100).toFixed(2);
  const tier = tierFor(spentCents);
  const next = nextTier(spentCents);
  const earned = new Set(achievements);

  useEffect(() => {
    (async () => { try { const r = await claimAchievements(); if (r?.added) router.refresh(); } catch { /* noop */ } })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const pct = next ? Math.min(100, Math.round(((spentCents - tier.min) / (next.min - tier.min)) * 100)) : 100;

  return (
    <main className="wrap" style={{ maxWidth: 820 }}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link>
      </p>
      <h1 style={{ fontSize: 46 }}>Your Quarters</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 22px" }}>{name ? `${name} · ` : ""}{email}</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        {stat("Credits & gifts", String(credits), "Earned via achievements")}
        {stat("Total spent", `$${spent}`, "Across the house")}
        {stat("Designs created", String(designs.length), "In the Atelier")}
        {stat("Conversations", String(convos.length), "With your artists")}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 6 }}>Your standing — <span style={{ color: "var(--gold-dark)" }}>{tier.name}</span></h3>
        <div style={{ height: 10, background: "#e6dcc2", borderRadius: 6, overflow: "hidden", border: "1px solid var(--gold-dark)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,var(--gold),var(--gold-light))" }} />
        </div>
        <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 6 }}>
          {next ? `$${((next.min - spentCents) / 100).toFixed(2)} more to reach ${next.name}.` : "You hold the highest standing in the house. Bravo."}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 12 }}>Achievements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const has = earned.has(a.key);
            return (
              <div key={a.key} style={{ border: "1px solid var(--gold)", borderRadius: 8, padding: "10px 12px", background: has ? "rgba(184,146,74,.16)" : "#fffdf6", opacity: has ? 1 : 0.5 }}>
                <div style={{ fontSize: 22 }}>{a.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "var(--grey)" }}>{a.desc}</div>
                <div className="caps" style={{ fontSize: 9, color: "var(--gold-dark)", marginTop: 3 }}>{has ? "Earned" : `${a.points} pts`}</div>
              </div>
            );
          })}
        </div>
      </div>

      <AvatarBuilder artistId={userId} table="profiles" canUnlock={false} initial={profile?.avatar ?? null} entitled={!!profile?.premium} rpmUrl={profile?.rpm_url ?? null} />

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 12 }}>Your likeness in the estate</h3>
        <div style={{ display: "flex", justifyContent: "center", background: "radial-gradient(120% 90% at 50% 0%, #d6e6ef, #a9c4d4)", border: "1px solid var(--gold)", borderRadius: 10, padding: 18 }}>
          {(getLook(profile?.avatar?.look) || profile?.avatar?.likenessUrl) ? (
            <AvatarRender config={profile?.avatar ?? null} size={240} tattoo={profile?.avatar_tattoo ?? null} fullBody />
          ) : (
            <div style={{ textAlign: "center", color: "var(--gold-dark)", padding: "48px 20px", fontSize: 14 }}>
              Choose a look above, or create a likeness with AI, to set your full-length figure in the estate.
            </div>
          )}
        </div>
        {profile?.avatar_tattoo && (
          <p style={{ marginTop: 10, fontSize: 13, color: "var(--grey)", display: "flex", gap: 10, alignItems: "center" }}>
            Wearing one of your Atelier designs.
            <button onClick={removeTattoo} className="caps" style={{ fontSize: 9, letterSpacing: ".08em", padding: "4px 8px", borderRadius: 3, cursor: "pointer", border: "1px solid var(--gold-dark)", background: "transparent", color: "var(--gold-dark)" }}>Remove</button>
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <h3 style={{ fontSize: 22 }}>Your Atelier creations</h3>
          <Link href="/studio" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>+ Design a tattoo</Link>
        </div>
        {designs.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>No designs yet. Create one in <Link href="/studio">the Tattoo Atelier</Link> — every design you save is logged here.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
            {designs.map((d) => (
              <div key={d.id} style={{ border: "1px solid var(--gold)", borderRadius: 8, overflow: "hidden", background: "#fffdf6", position: "relative" }}>
                {d.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image_url} alt={d.title ?? "design"} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block", background: "#fff" }} />
                ) : (<div style={{ aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--grey)" }}>—</div>)}
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{d.title || "Untitled design"}</div>
                  <div style={{ fontSize: 11, color: "var(--gold-dark)" }}>{d.placement ? `${d.placement} · ` : ""}{new Date(d.created_at).toLocaleDateString()}</div>
                  {d.exported ? (
                    <button onClick={() => wearDesign(d)} className="caps" style={{ marginTop: 6, fontSize: 9, letterSpacing: ".08em", padding: "5px 8px", borderRadius: 3, cursor: "pointer", border: "1px solid var(--gold-dark)", background: "var(--gold)", color: "#1a1a1a" }}>Wear on avatar</button>
                  ) : (
                    <button onClick={() => exportDesign(d.id)} className="caps" style={{ marginTop: 6, fontSize: 9, letterSpacing: ".08em", padding: "5px 8px", borderRadius: 3, cursor: "pointer", border: "1px solid var(--gold-dark)", background: "transparent", color: "var(--gold-dark)" }}>Export to avatar ($8)</button>
                  )}
                </div>
                <button onClick={() => deleteDesign(d.id)} title="Remove" style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.55)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Passport userId={userId} entries={passport} />

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
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Leave a suggestion for the house</h3>
        <textarea value={sug} onChange={(e) => setSug(e.target.value)} rows={3} placeholder="An idea, a request, a wish for your next visit..." style={{ width: "100%", padding: 11, border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 16 }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
          <button className="btn" onClick={submitSuggestion}>Send to the house</button>
          {sugStatus && <span style={{ color: sugStatus.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{sugStatus}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Name</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="How the house should address you" style={{ flex: 1, minWidth: 220, padding: "10px 12px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 16 }} />
          <button className="btn" onClick={saveName}>Save</button>
          {status && <span style={{ alignSelf: "center", color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 22, marginBottom: 8 }}>Billing &amp; purchases</h3>
        <p style={{ color: "var(--grey)" }}>Your shop orders, premium membership, and stencil purchases will appear here.</p>
      </div>

      <div style={{ marginTop: 6 }}><SetPassword /></div>
      <form action="/auth/signout" method="post" style={{ marginTop: 6 }}><button className="btn ghost" type="submit">Sign out</button></form>
    </main>
  );
}
