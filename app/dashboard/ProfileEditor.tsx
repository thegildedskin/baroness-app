"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SetPassword from "./SetPassword";

type Artist = {
  id: string; slug: string; display_name: string; specialty: string | null;
  bio: string | null; public_note: string | null; portrait_url: string | null;
  accent: string | null; instagram_url: string | null; venue_url: string | null; is_published: boolean;
};
type Flash = { id: string; image_url: string; caption: string | null; sort_order: number };

export default function ProfileEditor({ artist, flash, isOwner, email }: {
  artist: Artist; flash: Flash[]; isOwner: boolean; email: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({
    display_name: artist.display_name ?? "", specialty: artist.specialty ?? "", bio: artist.bio ?? "",
    public_note: artist.public_note ?? "", instagram_url: artist.instagram_url ?? "",
    venue_url: artist.venue_url ?? "", accent: artist.accent ?? "", is_published: artist.is_published,
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setBusy(true); setStatus("");
    const { error } = await supabase.from("artists").update(form).eq("id", artist.id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Saved.");
    if (!error) router.refresh();
  }
  async function uploadPortrait(file: File) {
    setBusy(true); setStatus("Uploading portrait…");
    const path = `${artist.id}/portrait-${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("portraits").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const { data: pub } = supabase.storage.from("portraits").getPublicUrl(path);
    const { error } = await supabase.from("artists").update({ portrait_url: pub.publicUrl }).eq("id", artist.id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Portrait updated."); router.refresh();
  }
  async function addFlash(file: File) {
    setBusy(true); setStatus("Uploading image…");
    const path = `${artist.id}/${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("flash").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const { data: pub } = supabase.storage.from("flash").getPublicUrl(path);
    const { error } = await supabase.from("flash").insert({ artist_id: artist.id, image_url: pub.publicUrl, sort_order: flash.length });
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Image added."); router.refresh();
  }
  async function removeFlash(id: string) {
    setBusy(true);
    const { error } = await supabase.from("flash").delete().eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Removed."); router.refresh();
  }

  return (
    <main className="wrap" style={{ maxWidth: 760 }}>
      <p style={{ marginBottom: 12, display: "flex", gap: 18 }}>
        <Link href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</Link>
        {isOwner && <Link href="/dashboard" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>↑ All artists</Link>}
      </p>
      <h1 style={{ fontSize: 44 }}>Editing: {artist.display_name}</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 22px" }}>
        Signed in as {email} {isOwner ? "· House Owner" : ""}
      </p>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Your portrait</h3>
        {artist.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.portrait_url} alt="portrait" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 6, border: "1px solid var(--gold)" }} />
        ) : (<p style={{ color: "var(--grey)", marginBottom: 10 }}>No portrait yet.</p>)}
        <p style={{ marginTop: 12 }}>
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadPortrait(e.target.files[0])} />
        </p>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Details</h3>
        <label className="field"><span>Display name</span><input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} /></label>
        <label className="field"><span>Specialty</span><input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} /></label>
        <label className="field"><span>Bio</span>
          <textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} style={{ width: "100%", padding: 11, border: "1px solid var(--gold-dark)", borderRadius: 3, fontFamily: "var(--body)", fontSize: 16, background: "#fdf6e7" }} /></label>
        <label className="field"><span>Note to clients</span><input value={form.public_note} onChange={(e) => set("public_note", e.target.value)} /></label>
        <label className="field"><span>Instagram / profile link</span><input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} /></label>
        <label className="field"><span>venue.ink booking link</span><input value={form.venue_url} onChange={(e) => set("venue_url", e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px" }}>
          <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} />
          <span className="caps" style={{ fontSize: 11 }}>Published (visible to visitors)</span>
        </label>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Flash gallery</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
          {flash.map((f) => (
            <div key={f.id} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.image_url} alt={f.caption ?? "flash"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4, border: "1px solid var(--gold)" }} />
              <button onClick={() => removeFlash(f.id)} disabled={busy} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12 }}>
          <input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && addFlash(e.target.files[0])} />
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn" onClick={save} disabled={busy}>{busy ? "Working…" : "Save changes"}</button>
        {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</span>}
      </div>

      <div style={{ marginTop: 30 }}><SetPassword /></div>
      <form action="/auth/signout" method="post" style={{ marginTop: 6 }}>
        <button className="btn ghost" type="submit">Sign out</button>
      </form>
    </main>
  );
}
