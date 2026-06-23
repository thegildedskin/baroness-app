"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarRender, OPTIONS, DEFAULT_AVATAR, type AvatarConfig } from "../avatar/AvatarRender";

const CATS: { key: keyof AvatarConfig; label: string }[] = [
  { key: "face", label: "Face shape" }, { key: "skin", label: "Skin" },
  { key: "hair", label: "Hair style" }, { key: "hairColor", label: "Hair colour" },
  { key: "eyes", label: "Eyes" }, { key: "eyeColor", label: "Eye colour" },
  { key: "brows", label: "Brows" }, { key: "mouth", label: "Mouth" },
  { key: "outfit", label: "Attire" }, { key: "bg", label: "Backdrop" },
];

export default function AvatarBuilder({ artistId, initial, entitled }: {
  artistId: string; initial: Partial<AvatarConfig> | null; entitled: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [cfg, setCfg] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, ...(initial || {}) });
  const [cat, setCat] = useState<keyof AvatarConfig>("face");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  function pick(key: keyof AvatarConfig, opt: { id: string; premium?: boolean }) {
    if (opt.premium && !entitled) { setStatus("That's a premium look — unlock coming soon."); return; }
    setStatus("");
    setCfg((c) => ({ ...c, [key]: opt.id }));
  }
  async function save() {
    setBusy(true); setStatus("");
    const { error } = await supabase.from("artists").update({ avatar: cfg }).eq("id", artistId);
    setBusy(false);
    setStatus(error ? `Error: ${error.message}` : "Avatar saved.");
    if (!error) router.refresh();
  }

  const opts = OPTIONS[cat] || [];
  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 24, marginBottom: 14 }}>Your avatar</h3>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 auto" }}><AvatarRender config={cfg} size={168} /></div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {CATS.map((cc) => (
              <button key={cc.key} onClick={() => setCat(cc.key)}
                className="caps"
                style={{ fontSize: 9, letterSpacing: ".12em", padding: "6px 9px", borderRadius: 2, cursor: "pointer",
                  border: "1px solid var(--gold-dark)", background: cat === cc.key ? "var(--gold)" : "transparent", color: cat === cc.key ? "var(--black)" : "var(--gold-dark)" }}>
                {cc.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {opts.map((o) => {
              const selected = cfg[cat] === o.id;
              const locked = o.premium && !entitled;
              return (
                <button key={o.id} onClick={() => pick(cat, o)} title={o.label}
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 3, cursor: locked ? "not-allowed" : "pointer",
                    border: selected ? "2px solid var(--gold-dark)" : "1px solid var(--gold)", background: selected ? "rgba(184,146,74,.18)" : "#fdf6e7", opacity: locked ? 0.6 : 1, fontFamily: "var(--body)", fontSize: 14 }}>
                  {o.swatch && <span style={{ width: 16, height: 16, borderRadius: "50%", background: o.swatch, border: "1px solid var(--gold-dark)", display: "inline-block" }} />}
                  {o.label}{o.premium && <span style={{ fontSize: 11 }}>{locked ? "🔒" : "★"}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
            <button className="btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save avatar"}</button>
            {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}
          </div>
          {!entitled && <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 8 }}>★ Premium looks unlock with a membership (payments coming soon).</p>}
        </div>
      </div>
    </div>
  );
}
