"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AvatarRender, type AvatarConfig } from "../avatar/AvatarRender";
import { SECTIONS, composePrompt, type CreatorSelection } from "../avatar/creatorOptions";

// "Create from scratch / from image" — a tag→prompt→AI-image likeness builder.
// Sits beside the premade-looks gallery (see AvatarBuilder's mode toggle).
export default function AvatarCreator({ artistId, initial, table = "artists" }: {
  artistId: string; initial: Partial<AvatarConfig> | null; table?: string;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState<CreatorSelection>({});
  const [text, setText] = useState("");
  const [refImage, setRefImage] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ style: true, gender: true });
  const [result, setResult] = useState<string | null>(initial?.likenessUrl ?? null);
  const [busy, setBusy] = useState<"" | "gen" | "save">("");
  const [status, setStatus] = useState("");

  function toggleTag(key: string, id: string, multi?: boolean) {
    setSel((cur) => {
      if (multi) {
        const arr = Array.isArray(cur[key]) ? [...(cur[key] as string[])] : [];
        const i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1); else arr.push(id);
        return { ...cur, [key]: arr };
      }
      return { ...cur, [key]: cur[key] === id ? undefined : id };
    });
  }
  function isPicked(key: string, id: string) {
    const v = sel[key];
    return Array.isArray(v) ? v.includes(id) : v === id;
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setRefImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function generate() {
    setBusy("gen"); setStatus("");
    try {
      const prompt = composePrompt(sel, text);
      const res = await fetch("/api/ai-avatar", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, image: refImage, portrait: true }),
      });
      const data = await res.json();
      if (data.image) { setResult(data.image); setStatus(""); }
      else setStatus(data.error || "Could not generate. Try again.");
    } catch { setStatus("Generation failed. Try again."); }
    setBusy("");
  }

  async function save() {
    if (!result) { setStatus("Generate a likeness first."); return; }
    setBusy("save"); setStatus("");
    try {
      let url = result;
      // Upload data URLs to the 'avatars' bucket; remote URLs are saved as-is.
      if (result.startsWith("data:")) {
        const blob = await (await fetch(result)).blob();
        const path = `${artistId}-${Date.now()}.png`;
        const up = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/png" });
        if (up.error) {
          setBusy("");
          setStatus("Couldn't save image — ask the house to create a public 'avatars' storage bucket in Supabase.");
          return;
        }
        url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const avatar = { ...(initial || {}), likenessUrl: url, look: null };
      const { error } = await supabase.from(table).update({ avatar }).eq("id", artistId);
      setStatus(error ? `Error: ${error.message}` : "Likeness saved.");
    } catch { setStatus("Save failed. Try again."); }
    setBusy("");
  }

  const previewCfg: Partial<AvatarConfig> = { ...(initial || {}), likenessUrl: result ?? undefined };

  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
      <div style={{ flex: "0 0 auto", width: 220 }}>
        <div style={{ position: "relative" }}>
          {result ? <AvatarRender config={previewCfg} size={220} fullBody /> : (
            <div style={{ width: 220, height: 220 * 470 / 200, borderRadius: 14, border: "3px dashed var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--gold-dark)", background: "#efe3c6", fontSize: 13, padding: 16 }}>
              {busy === "gen" ? "Conjuring your likeness…" : "Pick traits and press Create"}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={generate} disabled={busy !== ""}>{busy === "gen" ? "Creating…" : "✨ Create"}</button>
          <button className="btn ghost" onClick={save} disabled={busy !== "" || !result}>{busy === "save" ? "Saving…" : "Save likeness"}</button>
        </div>
        {status && <p style={{ marginTop: 8, fontSize: 13, color: status.startsWith("Error") || status.startsWith("Couldn") || status.includes("failed") ? "#a33" : "var(--gold-dark)" }}>{status}</p>}
      </div>

      <div style={{ flex: 1, minWidth: 300 }}>
        {/* Reference image (create from image) */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", width: 64, height: 64, borderRadius: 10, border: "2px dashed var(--gold-dark)", background: refImage ? `center/cover no-repeat url(${refImage})` : "#fdf6e7", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark)", fontSize: 22, flexShrink: 0 }}>
            {refImage ? "" : "+"}
          </div>
          <div style={{ fontSize: 12, color: "var(--grey)" }}>
            <div className="caps" style={{ fontSize: 10, color: "var(--gold-dark)" }}>Create from image (optional)</div>
            Upload a photo to base the likeness on. {refImage && <button onClick={() => setRefImage(null)} style={{ marginLeft: 6, fontSize: 11, color: "#a33", background: "none", border: "none", cursor: "pointer" }}>remove</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} style={{ display: "none" }} />
        </div>

        {/* Free text */}
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
          placeholder="Optional — describe the look in your own words (colours, mood, accessories…)"
          style={{ width: "100%", height: 64, background: "#fdf6e7", border: "1px solid var(--gold)", borderRadius: 8, padding: 10, fontSize: 13, resize: "none", marginBottom: 14 }} />

        {/* Tag sections */}
        {SECTIONS.map((s) => {
          const isOpen = open[s.key] ?? false;
          const count = Array.isArray(sel[s.key]) ? (sel[s.key] as string[]).length : sel[s.key] ? 1 : 0;
          return (
            <div key={s.key} style={{ borderBottom: "1px solid rgba(139,111,53,.3)" }}>
              <button onClick={() => setOpen((o) => ({ ...o, [s.key]: !isOpen }))}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", background: "none", border: "none", cursor: "pointer" }}>
                <span className="caps" style={{ fontSize: 11, color: "var(--gold-dark)", letterSpacing: ".12em" }}>
                  {s.label}{s.multi ? " (multi)" : ""}{count > 0 && <span style={{ color: "var(--black)" }}> · {count}</span>}
                </span>
                <span style={{ color: "var(--gold-dark)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
              </button>
              {isOpen && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingBottom: 12 }}>
                  {s.options.map((o) => {
                    const picked = isPicked(s.key, o.id);
                    return (
                      <button key={o.id} onClick={() => toggleTag(s.key, o.id, s.multi)} className="caps"
                        style={{ fontSize: 11, letterSpacing: ".04em", padding: "7px 12px", borderRadius: 999, cursor: "pointer",
                          border: "1px solid var(--gold-dark)", background: picked ? "var(--gold)" : "transparent", color: picked ? "var(--black)" : "var(--gold-dark)" }}>
                        {picked ? "✓ " : ""}{o.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <p style={{ fontSize: 11, color: "var(--grey)", marginTop: 10 }}>The bare / sleeveless / tattoo tags tell the AI to show off your ink.</p>
      </div>
    </div>
  );
}
