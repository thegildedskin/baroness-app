"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import QuartersShell, { type QTile } from "./QuartersShell";
import SetPassword from "./SetPassword";
import Messages from "./Messages";
import ProductManager from "./ProductManager";
import AvatarBuilder from "./AvatarBuilder";
import SocialSubmit, { type MarketingPost } from "./SocialSubmit";
import type { AvatarConfig } from "../avatar/AvatarRender";
import { EXPERIMENTS_ENABLED } from "@/lib/flags";

type Msg = { id: string; sender: string; body: string | null; created_at: string };
type Thread = { id: string; client_name: string; client_email: string | null; created_at: string; last_message_at: string; messages: Msg[] };
type Artist = {
  id: string; slug: string; display_name: string; specialty: string | null;
  bio: string | null; public_note: string | null; portrait_url: string | null;
  accent: string | null; instagram_url: string | null; venue_url: string | null; is_published: boolean;
  avatar?: Partial<AvatarConfig> | null; premium?: boolean | null; rpm_url?: string | null;
  stripe_account_id?: string | null; payouts_enabled?: boolean | null;
};
type Flash = { id: string; image_url: string; caption: string | null; sort_order: number };
type Product = { id: string; title: string; description: string | null; price_cents: number; kind: string; preview_url: string | null; is_active: boolean };

export default function ProfileEditor({ artist, flash, threads, products, marketingPosts = [], isOwner, email }: {
  artist: Artist; flash: Flash[]; threads: Thread[]; products: Product[]; marketingPosts?: MarketingPost[]; isOwner: boolean; email: string;
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
  // Links pasted without a scheme ("venue.ink/anna") would render as broken
  // relative URLs on the public site — quietly add https://.
  function normalizeUrl(v: string): string {
    const s = v.trim();
    if (!s) return s;
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  }
  async function save() {
    if (!form.display_name.trim()) { setStatus("Error: a display name is required."); return; }
    setBusy(true); setStatus("");
    const payload = {
      ...form,
      display_name: form.display_name.trim(),
      instagram_url: normalizeUrl(form.instagram_url),
      venue_url: normalizeUrl(form.venue_url),
    };
    const { error } = await supabase.from("artists").update(payload).eq("id", artist.id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Saved.");
    if (!error) { setForm(payload); router.refresh(); }
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
  async function connectPayouts() {
    setBusy(true); setStatus("");
    try {
      const r = await fetch("/api/connect/onboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ artistId: artist.id }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setStatus(d.error || "Could not start payout setup.");
    } catch { setStatus("Could not start payout setup."); }
    setBusy(false);
  }
  const [panel, setPanel] = useState("profile");
  const convoCount = threads.length;
  const pendingSocial = marketingPosts.filter((p) => p.status === "idea" || p.status === "drafted").length;
  const tiles: QTile[] = [
    { key: "profile", label: "Profile", desc: form.is_published ? "Published to the estate" : "Hidden from visitors", icon: "👤", accent: "#caa24e" },
    // The avatar creator is part of the paused experiments layer (lib/flags.ts).
    ...(EXPERIMENTS_ENABLED ? [{ key: "avatar", label: "Avatar", desc: "Your figure in the estate", icon: "🎭", accent: "#8f6fd4" } satisfies QTile] : []),
    { key: "flash", label: "Flash Gallery", desc: `${flash.length} piece${flash.length === 1 ? "" : "s"}`, icon: "⚡", accent: "#5f9ed4", badge: flash.length ? String(flash.length) : undefined },
    { key: "social", label: "Studio Social", desc: "Send finished work to the house feed", icon: "📣", accent: "#b76fd4", badge: pendingSocial ? String(pendingSocial) : undefined },
    { key: "shop", label: "Atelier Shop", desc: `${products.length} product${products.length === 1 ? "" : "s"}`, icon: "🛍", accent: "#4fae8a" },
    { key: "payouts", label: "Payouts", desc: artist.payouts_enabled ? "Stripe connected" : "Not connected", icon: "💰", accent: "#d4a04f" },
    { key: "messages", label: "Messages", desc: `${convoCount} conversation${convoCount === 1 ? "" : "s"}`, icon: "✉", accent: "#d4788f", badge: convoCount ? String(convoCount) : undefined },
    { key: "settings", label: "Account", desc: "Password & sign out", icon: "⚙", accent: "#7d8aa0" },
  ];

  return (
    <QuartersShell
      eyebrow={`Baroness Tattoo · Artists' Quarters${isOwner ? " · House Owner" : ""}`}
      title={artist.display_name}
      subtitle={`${form.specialty || "Custom tattoo artist"} · signed in as ${email}`}
      tiles={tiles}
      active={panel}
      onSelect={setPanel}
      topLinks={isOwner ? [{ href: "/dashboard", label: "All artists" }] : []}
    >
      {EXPERIMENTS_ENABLED && panel === "avatar" && (
        <AvatarBuilder artistId={artist.id} initial={artist.avatar ?? null} entitled={!!(artist.premium || isOwner)} rpmUrl={artist.rpm_url ?? null} />
      )}

      {panel === "social" && (
        <SocialSubmit artistId={artist.id} artistName={artist.display_name} flash={flash} posts={marketingPosts} />
      )}

      {panel === "profile" && (<>
      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Your portrait photo</h3>
        {artist.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.portrait_url} alt="portrait" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 6, border: "1px solid var(--gold)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
        ) : (<p style={{ color: "var(--grey)", marginBottom: 10 }}>No portrait yet — visitors see your initials until you add one.</p>)}
        <p style={{ marginTop: 12 }}><input type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadPortrait(f); }} /></p>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Details</h3>
        <label className="field"><span>Display name</span><input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} /></label>
        <label className="field"><span>Specialty</span><input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} /></label>
        <label className="field"><span>Bio</span><textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} style={{ width: "100%", padding: 11, border: "1px solid var(--gold-dark)", borderRadius: 3, fontFamily: "var(--body)", fontSize: 16, background: "#fdf6e7" }} /></label>
        <label className="field"><span>Note to clients</span><input value={form.public_note} onChange={(e) => set("public_note", e.target.value)} /></label>
        <label className="field"><span>Instagram / profile link</span><input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} /></label>
        <label className="field"><span>venue.ink booking link</span><input value={form.venue_url} onChange={(e) => set("venue_url", e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px" }}><input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} /><span className="caps" style={{ fontSize: 11 }}>Published (visible to visitors)</span></label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <button className="btn" onClick={save} disabled={busy}>{busy ? "Working…" : "Save changes"}</button>
        {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</span>}
      </div>
      </>)}

      {panel === "flash" && (
      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 14 }}>Flash gallery</h3>
        {flash.length === 0 ? (
          <p style={{ color: "var(--grey)", marginBottom: 4 }}>No pieces yet. Upload photos of your flash and finished work — they appear on your public profile.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
            {flash.map((f) => (
              <div key={f.id} style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.image_url} alt={f.caption ?? "flash"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4, border: "1px solid var(--gold)", background: "#efe3c6" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.25"; }} />
                <button onClick={() => removeFlash(f.id)} disabled={busy} title="Remove" style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: 12 }}><input type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) addFlash(f); }} /></p>
        {busy && <p style={{ fontSize: 13, color: "var(--gold-dark)" }}>Working…</p>}
        {status && <p style={{ fontSize: 13, color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</p>}
      </div>
      )}

      {panel === "shop" && <ProductManager artistId={artist.id} products={products} />}

      {panel === "payouts" && (
      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 24, marginBottom: 8 }}>Payouts</h3>
        {artist.payouts_enabled ? (
          <p style={{ color: "var(--gold-dark)" }}>✓ Payouts active — your shop sales are sent to your Stripe account automatically (the house keeps a 15% fee).</p>
        ) : (
          <>
            <p style={{ color: "var(--grey)", marginBottom: 10 }}>Connect a Stripe account to receive your shop earnings automatically.</p>
            <button className="btn" onClick={connectPayouts} disabled={busy}>{busy ? "Opening Stripe…" : "Connect payouts with Stripe"}</button>
          </>
        )}
        {status && <p style={{ marginTop: 10, fontSize: 14, color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{status}</p>}
      </div>
      )}

      {panel === "messages" && <Messages threads={threads} />}

      {panel === "settings" && (<>
      <div style={{ marginTop: 6 }}><SetPassword /></div>
      <form action="/auth/signout" method="post" style={{ marginTop: 6 }}><button className="btn ghost" type="submit">Sign out</button></form>
      </>)}
    </QuartersShell>
  );
}
