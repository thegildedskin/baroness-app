"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Gallery = { id: string; image_url: string; caption: string | null };
type Pending = { id: string; image_url: string; artist_id: string; artists: { display_name: string } | { display_name: string }[] | null };
type Suggestion = { id: string; author_name: string | null; author_email: string | null; body: string; status: string; created_at: string };
type ArtistRow = { id: string; display_name: string; slug: string; is_published: boolean };
type ClientRow = { id: string; email: string | null; display_name: string | null; credits: number | null };
type ThreadRow = { id: string; artist_id: string; client_name: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };

function aname(a: { display_name: string } | { display_name: string }[] | null): string {
  if (!a) return "—";
  return Array.isArray(a) ? (a[0]?.display_name ?? "—") : a.display_name;
}

const TABS = ["Gallery", "Approvals", "Suggestions", "People", "Messages"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPanel({ gallery, pending, suggestions, artists, clients, threads }: {
  gallery: Gallery[]; pending: Pending[]; suggestions: Suggestion[]; artists: ArtistRow[]; clients: ClientRow[]; threads: ThreadRow[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Gallery");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function uploadGallery(file: File) {
    setBusy(true); setStatus("Uploading…");
    const path = `${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("gallery").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery").insert({ image_url: pub.publicUrl, sort_order: gallery.length });
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Added to gallery."); router.refresh();
  }
  async function del(table: string, id: string) {
    setBusy(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Removed."); router.refresh();
  }
  async function approve(id: string) {
    setBusy(true);
    const { error } = await supabase.from("flash").update({ approved: true }).eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Approved."); router.refresh();
  }
  async function resolve(id: string) {
    setBusy(true);
    const { error } = await supabase.from("suggestions").update({ status: "reviewed" }).eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Marked reviewed."); router.refresh();
  }

  const card: React.CSSProperties = { background: "linear-gradient(180deg,#fdf6e7,#ece0c6)", border: "1px solid var(--gold)", borderRadius: 8, padding: 16 };

  return (
    <main className="wrap" style={{ maxWidth: 980 }}>
      <p style={{ marginBottom: 12, display: "flex", gap: 18 }}>
        <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link>
        <Link href="/dashboard" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>↑ Artist roster</Link>
      </p>
      <h1 style={{ fontSize: 46 }}>House Admin</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 18px" }}>
        {artists.length} artists · {clients.length} clients · {pending.length} awaiting approval · {suggestions.filter(s => s.status === "new").length} new suggestions
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="caps"
            style={{ fontSize: 10, letterSpacing: ".12em", padding: "9px 14px", borderRadius: 2, cursor: "pointer",
              border: "1px solid var(--gold-dark)", background: tab === t ? "var(--gold)" : "transparent", color: tab === t ? "var(--black)" : "var(--gold-dark)" }}>
            {t}{t === "Approvals" && pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        ))}
        {status && <span style={{ alignSelf: "center", color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}
      </div>

      {tab === "Gallery" && (
        <div style={card}>
          <h3 style={{ fontSize: 22, marginBottom: 10 }}>House gallery (shown in the public Gallery room)</h3>
          <p style={{ marginBottom: 12 }}><input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadGallery(e.target.files[0])} /></p>
          {gallery.length === 0 ? <p style={{ color: "var(--grey)" }}>No house images yet — the Gallery falls back to approved artist flash.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
              {gallery.map((g) => (
                <div key={g.id} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image_url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4, border: "1px solid var(--gold)" }} />
                  <button onClick={() => del("gallery", g.id)} disabled={busy} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Approvals" && (
        <div style={card}>
          <h3 style={{ fontSize: 22, marginBottom: 10 }}>Flash awaiting approval</h3>
          {pending.length === 0 ? <p style={{ color: "var(--grey)" }}>Nothing pending. All artist flash is approved.</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {pending.map((p) => (
                <div key={p.id} style={{ border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", background: "#fffdf6" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 13 }}>{aname(p.artists)}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button className="btn" style={{ padding: "8px 12px", fontSize: 10 }} onClick={() => approve(p.id)} disabled={busy}>Approve</button>
                      <button className="btn ghost" style={{ padding: "8px 12px", fontSize: 10 }} onClick={() => del("flash", p.id)} disabled={busy}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Suggestions" && (
        <div style={card}>
          <h3 style={{ fontSize: 22, marginBottom: 10 }}>Suggestions</h3>
          {suggestions.length === 0 ? <p style={{ color: "var(--grey)" }}>No suggestions yet.</p> : (
            <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
              {suggestions.map((s) => (
                <li key={s.id} style={{ border: "1px solid var(--gold)", borderRadius: 6, padding: "10px 12px", background: s.status === "new" ? "#fffdf6" : "rgba(168,196,162,.12)" }}>
                  <div style={{ fontSize: 16, color: "#3a322a" }}>{s.body}</div>
                  <div style={{ fontSize: 12, color: "var(--grey)", margin: "4px 0 8px" }}>{s.author_name || "Anonymous"}{s.author_email ? ` · ${s.author_email}` : ""} · {new Date(s.created_at).toLocaleDateString()} · {s.status}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {s.status === "new" && <button className="btn" style={{ padding: "7px 11px", fontSize: 10 }} onClick={() => resolve(s.id)} disabled={busy}>Mark reviewed</button>}
                    <button className="btn ghost" style={{ padding: "7px 11px", fontSize: 10 }} onClick={() => del("suggestions", s.id)} disabled={busy}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "People" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={card}>
            <h3 style={{ fontSize: 22, marginBottom: 10 }}>Artists</h3>
            <ul style={{ listStyle: "none", display: "grid", gap: 6 }}>
              {artists.map((a) => (
                <li key={a.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{a.display_name} <span style={{ color: "var(--grey)", fontSize: 13 }}>({a.is_published ? "published" : "hidden"})</span></span>
                  <Link href={`/dashboard?id=${a.id}`} className="caps" style={{ fontSize: 10, color: "var(--gold-dark)" }}>Edit →</Link>
                </li>
              ))}
            </ul>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 22, marginBottom: 10 }}>Clients ({clients.length})</h3>
            {clients.length === 0 ? <p style={{ color: "var(--grey)" }}>No client accounts yet.</p> : (
              <ul style={{ listStyle: "none", display: "grid", gap: 6 }}>
                {clients.map((c) => (
                  <li key={c.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{c.display_name || "—"} <span style={{ color: "var(--grey)", fontSize: 13 }}>{c.email}</span></span>
                    <span style={{ fontSize: 13, color: "var(--gold-dark)" }}>{c.credits ?? 0} credits</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "Messages" && (
        <div style={card}>
          <h3 style={{ fontSize: 22, marginBottom: 10 }}>Recent conversations</h3>
          {threads.length === 0 ? <p style={{ color: "var(--grey)" }}>No conversations yet.</p> : (
            <ul style={{ listStyle: "none", display: "grid", gap: 6 }}>
              {threads.map((t) => (
                <li key={t.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(139,111,53,.25)", paddingBottom: 6 }}>
                  <span><strong>{t.client_name}</strong> → {aname(t.artists)}</span>
                  <Link href={`/dashboard?id=${t.artist_id}`} className="caps" style={{ fontSize: 10, color: "var(--gold-dark)" }}>Open →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
