"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AvatarRender, OPTIONS, DEFAULT_AVATAR, type AvatarConfig } from "../avatar/AvatarRender";

const CATS: { key: keyof AvatarConfig; label: string }[] = [
  { key: "face", label: "Face shape" }, { key: "skin", label: "Skin" },
  { key: "hair", label: "Hair style" }, { key: "hairColor", label: "Hair colour" },
  { key: "eyes", label: "Eyes" }, { key: "eyeColor", label: "Eye colour" },
  { key: "brows", label: "Brows" }, { key: "mouth", label: "Mouth" }, { key: "accessory", label: "Adornment" },
  { key: "outfit", label: "Attire" }, { key: "bg", label: "Backdrop" },
];

export default function AvatarBuilder({ artistId, initial, entitled, table = "artists", canUnlock = true, rpmUrl = null }: {
  artistId: string; initial: Partial<AvatarConfig> | null; entitled: boolean; table?: string; canUnlock?: boolean; rpmUrl?: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [cfg, setCfg] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, ...(initial || {}) });
  const [cat, setCat] = useState<keyof AvatarConfig>("face");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  function pick(key: keyof AvatarConfig, opt: { id: string; premium?: boolean }) {
    if (opt.premium && !entitled) { setStatus("That's a premium look — unlock to use it."); return; }
    setStatus("");
    setCfg((c) => ({ ...c, [key]: opt.id }));
  }
  async function save() {
    setBusy(true); setStatus("");
    const { error } = await supabase.from(table).update({ avatar: cfg }).eq("id", artistId);
    setBusy(false);
    setStatus(error ? `Error: ${error.message}` : "Avatar saved.");
    if (!error) router.refresh();
  }
  async function unlock() {
    setBusy(true); setStatus("");
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ artistId }) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setStatus(data.error || "Could not start checkout.");
    } catch { setStatus("Could not start checkout."); }
    setBusy(false);
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
              <button key={cc.key} onClick={() => setCat(cc.key)} className="caps"
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
          {!entitled && (canUnlock ? (
            <div style={{ marginTop: 10 }}>
              <button className="btn ghost" onClick={unlock} disabled={busy}>★ Unlock premium looks — $12</button>
              <p style={{ fontSize: 12, color: "var(--grey)", marginTop: 6 }}>Secure checkout via Stripe. Unlocks all premium hair, eyes, attire &amp; backdrops.</p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 8 }}>★ Premium looks unlock with a membership (coming soon).</p>
          ))}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(139,111,53,.3)" }}>
            <div className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", marginBottom: 6 }}>Full-body 3D avatar</div>
            {rpmUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rpmUrl.replace(".glb", ".png")} alt="3D avatar" style={{ width: 64, height: 64, borderRadius: 8, border: "1px solid var(--gold)", objectFit: "cover", background: "#241c16" }} />
                <Link className="btn ghost" href="/avatar/create">Update 3D avatar</Link>
              </div>
            ) : (
              <Link className="btn ghost" href="/avatar/create">Create a 3D avatar</Link>
            )}
            <p style={{ fontSize: 12, color: "var(--grey)", marginTop: 6 }}>Used as your character in the 3D estate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
