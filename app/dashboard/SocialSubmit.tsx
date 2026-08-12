"use client";

// "Submit to studio social" — the 20-second path for an artist to hand the
// house a finished piece for Instagram/Facebook. Picks a photo from their
// flash gallery (or uploads a new one), adds an optional caption note, and
// files it as a *drafted* row in marketing_posts. The owner reviews, edits
// and publishes it from House Admin → Marketing (nothing goes out without
// their say-so). Requires migration 009 (artist insert/delete policies).

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type MarketingPost = {
  id: string;
  caption: string;
  media_url: string | null;
  status: string;
  created_at: string;
  scheduled_for: string | null;
  published_at: string | null;
};

type Flash = { id: string; image_url: string; caption: string | null; sort_order: number };

const STATUS_LABEL: Record<string, string> = {
  idea: "With the house for review",
  drafted: "With the house for review",
  scheduled: "Approved · scheduled",
  posted: "Posted",
};

export default function SocialSubmit({ artistId, artistName, flash, posts }: {
  artistId: string; artistName: string; flash: Flash[]; posts: MarketingPost[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function uploadPhoto(file: File) {
    setBusy(true); setStatus("Uploading photo…");
    const path = `${artistId}/social-${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("flash").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const url = supabase.storage.from("flash").getPublicUrl(path).data.publicUrl;
    setSelected(url);
    setBusy(false); setStatus("Photo ready — add a note and submit.");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (!selected) { setStatus("Error: pick a photo of the finished work first."); return; }
    setBusy(true); setStatus("Sending to the house…");
    const { error } = await supabase.from("marketing_posts").insert({
      artist_id: artistId,
      platform: "instagram",
      location: "garland",
      caption: caption.trim() || `New work by ${artistName} — Baroness Tattoo.`,
      media_url: selected,
      media_note: `Submitted by ${artistName} from the artist dashboard`,
      status: "drafted",
    });
    setBusy(false);
    if (error) { setStatus(`Error: ${error.message}`); return; }
    setSelected(null); setCaption("");
    setStatus("Sent — the house will review and post it.");
    router.refresh();
  }

  async function withdraw(id: string) {
    setBusy(true);
    const { error } = await supabase.from("marketing_posts").delete().eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Withdrawn.");
    if (!error) router.refresh();
  }

  const thumb = (url: string): React.CSSProperties => ({
    width: "100%", aspectRatio: "1", objectFit: "cover", display: "block",
    borderRadius: 4, cursor: "pointer",
    border: selected === url ? "3px solid var(--gold-dark)" : "1px solid var(--gold)",
    boxShadow: selected === url ? "0 0 0 2px rgba(184,146,74,.35)" : "none",
  });

  return (
    <>
      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 6 }}>Submit to studio social</h3>
        <p style={{ color: "var(--grey)", marginBottom: 14, fontSize: 15 }}>
          Twenty seconds: pick a photo of finished work, add a note if you like, send it in.
          The house reviews it and posts it to the studio&rsquo;s Instagram/Facebook — with your name on it.
        </p>

        <div className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", marginBottom: 8 }}>1 · Pick a photo</div>
        {flash.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 8, marginBottom: 10 }}>
            {flash.map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f.id}
                src={f.image_url}
                alt={f.caption ?? "flash"}
                style={thumb(f.image_url)}
                onClick={() => setSelected(selected === f.image_url ? null : f.image_url)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
          </div>
        )}
        <p style={{ fontSize: 13, color: "var(--grey)", marginBottom: 6 }}>
          {flash.length > 0 ? "…or upload a new photo:" : "Upload a photo of the finished piece:"}
        </p>
        <input ref={fileRef} type="file" accept="image/*" disabled={busy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
        {selected && !flash.some((f) => f.image_url === selected) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected} alt="upload preview" style={{ ...thumb(selected), width: 120, marginTop: 10 }} />
        )}

        <div className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "16px 0 8px" }}>2 · Caption note (optional)</div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          placeholder="e.g. Healed fine-line peony, 6 weeks — client loved it"
          style={{ width: "100%", padding: 11, border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 15 }}
        />

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
          <button className="btn" onClick={submit} disabled={busy || !selected}>{busy ? "Working…" : "Send to the house"}</button>
          {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 20, marginBottom: 10 }}>Your submissions</h3>
        {posts.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>Nothing submitted yet. Your first one takes twenty seconds.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
            {posts.map((p) => (
              <li key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid rgba(139,111,53,.25)", paddingBottom: 8 }}>
                {p.media_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.media_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, border: "1px solid var(--gold)" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
                ) : (
                  <span style={{ width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--gold)", borderRadius: 4, color: "var(--gold-dark)" }}>✦</span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.caption}</span>
                  <span style={{ fontSize: 12, color: "var(--grey)" }}>
                    {new Date(p.created_at).toLocaleDateString()} · {STATUS_LABEL[p.status] ?? p.status}
                    {p.published_at ? ` · went out ${p.published_at.slice(0, 10)}` : ""}
                  </span>
                </span>
                {(p.status === "idea" || p.status === "drafted") && (
                  <button onClick={() => withdraw(p.id)} disabled={busy} className="caps"
                    style={{ fontSize: 9, letterSpacing: ".08em", padding: "5px 9px", borderRadius: 3, cursor: "pointer", border: "1px solid var(--gold-dark)", background: "transparent", color: "var(--gold-dark)" }}>
                    Withdraw
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
