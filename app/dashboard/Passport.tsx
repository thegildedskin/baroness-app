"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Entry = { id: string; title: string | null; artist_name: string | null; inked_on: string | null; notes: string | null; image_url: string | null };

export default function Passport({ userId, entries }: { userId: string; entries: Entry[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function add() {
    if (!title.trim() && !photo) { setStatus("Add a title or a photo."); return; }
    setBusy(true); setStatus("Saving…");
    let image_url: string | null = null;
    if (photo) {
      const p = `${userId}/${Date.now()}-${photo.name}`;
      const up = await supabase.storage.from("passport").upload(p, photo, { upsert: true });
      if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
      image_url = supabase.storage.from("passport").getPublicUrl(p).data.publicUrl;
    }
    const { error } = await supabase.from("ink_passport").insert({ user_id: userId, title: title.trim() || null, artist_name: artist.trim() || null, inked_on: date || null, notes: notes.trim() || null, image_url });
    setBusy(false);
    if (error) { setStatus(`Error: ${error.message}`); return; }
    setTitle(""); setArtist(""); setDate(""); setNotes(""); setPhoto(null); setStatus("Added to your passport.");
    router.refresh();
  }
  async function remove(id: string) { setBusy(true); await supabase.from("ink_passport").delete().eq("id", id); setBusy(false); router.refresh(); }

  const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 15 };
  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 22, marginBottom: 6 }}>Your Ink Passport</h3>
      <p style={{ color: "var(--grey)", marginBottom: 14, fontSize: 15 }}>A private record of the work you wear — the piece, the artist, the date, and the story.</p>
      {entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
          {entries.map((e) => (
            <div key={e.id} style={{ border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", background: "#fffdf6" }}>
              {e.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image_url} alt={e.title ?? "ink"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
              ) : <div style={{ aspectRatio: "1", background: "linear-gradient(135deg,#241c16,#161210)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-light)", fontSize: 26 }}>🖋</div>}
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.title || "Untitled"}</div>
                <div style={{ fontSize: 12, color: "var(--grey)" }}>{[e.artist_name, e.inked_on].filter(Boolean).join(" · ")}</div>
                {e.notes && <div style={{ fontSize: 12, color: "#5a4a3a", marginTop: 4 }}>{e.notes}</div>}
                <button className="btn ghost" style={{ padding: "5px 8px", fontSize: 9, marginTop: 6 }} onClick={() => remove(e.id)} disabled={busy}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Piece (e.g., Gilded peony, left forearm)" style={inp} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" style={{ ...inp, flex: 1, minWidth: 120 }} />
          <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={{ ...inp, width: "auto" }} />
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="The story behind it (optional)" style={inp} />
        <label style={{ fontSize: 13, color: "var(--grey)" }}>Photo: <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} /></label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn" onClick={add} disabled={busy}>{busy ? "Saving…" : "Add to passport"}</button>
          {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}
        </div>
      </div>
    </div>
  );
}
