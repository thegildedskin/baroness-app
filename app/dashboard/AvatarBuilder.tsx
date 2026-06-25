"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvatarRender, type AvatarConfig } from "../avatar/AvatarRender";
import { LOOKS_BY_GENDER, getLook, type Look } from "../avatar/looks";

export default function AvatarBuilder({ artistId, initial, entitled, table = "artists", canUnlock = true, rpmUrl = null }: {
  artistId: string; initial: Partial<AvatarConfig> | null; entitled: boolean; table?: string; canUnlock?: boolean; rpmUrl?: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const current = getLook(initial?.look);
  const [lookId, setLookId] = useState<string | null>(current?.id ?? null);
  const [gender, setGender] = useState<"female" | "male">(current?.gender ?? "female");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  function pick(look: Look) {
    if (look.premium && !entitled) { setStatus("That's a premium look — unlock to wear it."); return; }
    setStatus("");
    setLookId(look.id);
  }
  async function save() {
    if (!lookId) { setStatus("Choose a look first."); return; }
    setBusy(true); setStatus("");
    const { error } = await supabase.from(table).update({ avatar: { ...(initial || {}), look: lookId } }).eq("id", artistId);
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

  const looks = LOOKS_BY_GENDER[gender];
  const previewCfg: Partial<AvatarConfig> = { ...(initial || {}), look: lookId ?? undefined };

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 24, marginBottom: 4 }}>Your avatar</h3>
      <p style={{ fontSize: 13, color: "var(--grey)", marginBottom: 14 }}>Choose your likeness from the House wardrobe.</p>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 auto" }}>
          {lookId ? <AvatarRender config={previewCfg} size={200} fullBody /> : (
            <div style={{ width: 200, height: 200 * 470 / 200, borderRadius: 14, border: "3px solid var(--gold-dark)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--gold-dark)", background: "#efe3c6", fontSize: 13, padding: 16 }}>
              Pick a look to preview your likeness
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(["female", "male"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className="caps"
                style={{ fontSize: 10, letterSpacing: ".12em", padding: "7px 16px", borderRadius: 2, cursor: "pointer",
                  border: "1px solid var(--gold-dark)", background: gender === g ? "var(--gold)" : "transparent", color: gender === g ? "var(--black)" : "var(--gold-dark)" }}>
                {g === "female" ? "Ladies" : "Gentlemen"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {looks.map((look) => {
              const selected = lookId === look.id;
              const locked = look.premium && !entitled;
              return (
                <button key={look.id} onClick={() => pick(look)} title={look.label}
                  style={{ position: "relative", padding: 0, borderRadius: 6, cursor: locked ? "not-allowed" : "pointer", overflow: "hidden",
                    border: selected ? "3px solid var(--gold-dark)" : "1px solid var(--gold)", background: "#efe3c6", opacity: locked ? 0.55 : 1 }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1.9", background: "#efe3c6" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={look.src} alt={look.label} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
                  </div>
                  <div className="caps" style={{ fontSize: 8, letterSpacing: ".08em", padding: "4px 2px", color: "var(--gold-dark)", background: "#fdf6e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {look.label}{look.premium && <span> {locked ? "🔒" : "★"}</span>}
                  </div>
                  {selected && <span style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--gold-dark)", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
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
              <p style={{ fontSize: 12, color: "var(--grey)", marginTop: 6 }}>Secure checkout via Stripe. Unlocks the full wardrobe.</p>
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
