"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type MktArtist = {
  id: string; display_name: string; is_published: boolean;
  instagram_url: string | null; venue_url: string | null;
};
export type MktSetting = { key: string; value: string | null };
export type MktPost = {
  id: string; location: string; platform: string; artist_id: string | null;
  caption: string; media_note: string | null; scheduled_for: string | null; status: string; created_at: string;
  media_url: string | null; social_account_id: string | null; published_at: string | null;
  external_post_id: string | null; publish_error: string | null;
};
export type MktMetric = {
  week_start: string; location: string; inquiries: number;
  avg_response_min: number | null; deposits: number; reviews_added: number; notes: string | null;
};
export type MktSocial = {
  id: string; platform: string; label: string; external_id: string; access_token: string; connected_at: string;
};

const LOCATIONS = ["garland", "plano"] as const;
const PLATFORMS = ["instagram", "tiktok", "facebook", "google", "email", "other"] as const;
const STATUSES = ["idea", "drafted", "scheduled", "posted"] as const;
const AUTO_PLATFORMS = ["instagram", "facebook"];

const SETTING_LABELS: Record<string, string> = {
  studio_venue_url: "Studio Venue Ink link (house register)",
  booking_promise: "Booking promise (shown on the public site)",
  google_review_url_garland: "Google review link — Garland",
  google_review_url_plano: "Google review link — Plano",
  meta_business_url: "Meta Business Suite link",
  google_business_url: "Google Business Profile link",
  venue_dashboard_url: "Venue Ink dashboard link",
};

function mondayOf(d: Date): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

export default function MarketingTab({ artists, settings, posts, metrics, socials }: {
  artists: MktArtist[]; settings: MktSetting[]; posts: MktPost[]; metrics: MktMetric[]; socials: MktSocial[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const [settingDraft, setSettingDraft] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const k of Object.keys(SETTING_LABELS)) m[k] = settings.find((s) => s.key === k)?.value ?? "";
    return m;
  });
  const [artistDraft, setArtistDraft] = useState<Record<string, { instagram_url: string; venue_url: string }>>(() => {
    const m: Record<string, { instagram_url: string; venue_url: string }> = {};
    for (const a of artists) m[a.id] = { instagram_url: a.instagram_url ?? "", venue_url: a.venue_url ?? "" };
    return m;
  });
  const [postFilter, setPostFilter] = useState<string>("all");
  const [np, setNp] = useState({ location: "garland", platform: "instagram", artist_id: "", caption: "", media_note: "", media_url: "", scheduled_for: "", status: "idea", social_account_id: "" });
  const [mRow, setMRow] = useState({ week_start: mondayOf(new Date()), location: "garland", inquiries: "", avg_response_min: "", deposits: "", reviews_added: "", notes: "" });
  const [na, setNa] = useState({ platform: "instagram", label: "", external_id: "", access_token: "" });

  const filteredPosts = useMemo(
    () => posts.filter((p) => postFilter === "all" || p.status === postFilter),
    [posts, postFilter]
  );

  function flag(error: { message: string } | null, ok: string) {
    setBusy(false);
    setStatus(error ? `Error: ${error.message}` : ok);
    if (!error) router.refresh();
  }

  async function saveSettings() {
    setBusy(true); setStatus("Saving settings…");
    const rows = Object.entries(settingDraft).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    flag(error, "Settings saved.");
  }
  async function saveArtist(id: string) {
    setBusy(true); setStatus("Saving links…");
    const d = artistDraft[id];
    const { error } = await supabase.from("artists").update({ instagram_url: d.instagram_url || null, venue_url: d.venue_url || null }).eq("id", id);
    flag(error, "Artist links saved.");
  }
  async function addAccount() {
    if (!na.external_id.trim() || !na.access_token.trim()) { setStatus("Error: account id and access token are both required."); return; }
    setBusy(true); setStatus("Connecting account…");
    const { error } = await supabase.from("social_accounts").insert({
      platform: na.platform, label: na.label.trim() || na.platform,
      external_id: na.external_id.trim(), access_token: na.access_token.trim(),
    });
    if (!error) setNa({ platform: "instagram", label: "", external_id: "", access_token: "" });
    flag(error, "Account connected.");
  }
  async function delAccount(id: string) {
    setBusy(true);
    const { error } = await supabase.from("social_accounts").delete().eq("id", id);
    flag(error, "Account removed.");
  }
  async function addPost() {
    if (!np.caption.trim()) { setStatus("Error: the post needs a caption/idea."); return; }
    setBusy(true); setStatus("Adding post…");
    const { error } = await supabase.from("marketing_posts").insert({
      location: np.location, platform: np.platform, artist_id: np.artist_id || null,
      caption: np.caption.trim(), media_note: np.media_note.trim() || null,
      media_url: np.media_url.trim() || null, social_account_id: np.social_account_id || null,
      scheduled_for: np.scheduled_for || null, status: np.status,
    });
    if (!error) setNp((s) => ({ ...s, caption: "", media_note: "", media_url: "", scheduled_for: "" }));
    flag(error, "Post added to the planner.");
  }
  async function setPostStatus(id: string, st: string) {
    setBusy(true);
    const { error } = await supabase.from("marketing_posts").update({ status: st }).eq("id", id);
    flag(error, st === "posted" ? "Marked posted." : "Updated.");
  }
  async function delPost(id: string) {
    setBusy(true);
    const { error } = await supabase.from("marketing_posts").delete().eq("id", id);
    flag(error, "Removed.");
  }
  async function publishNow(id: string) {
    setBusy(true); setStatus("Publishing…");
    try {
      const res = await fetch("/api/social/publish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ postId: id }) });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setBusy(false);
      setStatus(data.ok ? "Published. 🎉" : `Error: ${data.error ?? "publish failed"}`);
      router.refresh();
    } catch {
      setBusy(false); setStatus("Error: could not reach the publish API.");
    }
  }
  async function saveMetric() {
    setBusy(true); setStatus("Saving week…");
    const { error } = await supabase.from("marketing_metrics").upsert({
      week_start: mRow.week_start, location: mRow.location,
      inquiries: Number(mRow.inquiries) || 0,
      avg_response_min: mRow.avg_response_min === "" ? null : Number(mRow.avg_response_min),
      deposits: Number(mRow.deposits) || 0,
      reviews_added: Number(mRow.reviews_added) || 0,
      notes: mRow.notes.trim() || null,
      updated_at: new Date().toISOString(),
    });
    flag(error, "Week saved to the scorecard.");
  }

  const quicklinks: [string, string][] = [
    ["Venue Ink dashboard", settingDraft.venue_dashboard_url],
    ["Meta Business Suite", settingDraft.meta_business_url],
    ["Google Business Profile", settingDraft.google_business_url],
  ];

  return (
    <div className="hx-stack">
      {status && <div className={`hx-status${status.startsWith("Error") ? " err" : ""}`}>{status}</div>}

      <div className="hx-links">
        {quicklinks.map(([label, url]) => url ? (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="hx-link">{label} ↗</a>
        ) : null)}
      </div>

      {/* CONNECTED SOCIAL ACCOUNTS */}
      <div className="hx-card">
        <div className="hx-card-title">Connected social accounts (auto-publishing)</div>
        <p className="hx-muted">
          Instagram Business + Facebook Page publish directly from the planner. Connect with a long-lived token from your own Meta app (Standard Access — no app review needed for your own accounts; see the setup guide). Scheduled posts go out daily via the site&rsquo;s cron. TikTok posts stay manual.
        </p>
        {socials.length > 0 && (
          <div className="hx-list">
            {socials.map((s) => (
              <div key={s.id} className="hx-listrow">
                <span className="hx-chip">{s.platform}</span>
                <strong>{s.label}</strong>
                <span className="hx-muted">id {s.external_id} · token …{s.access_token.slice(-6)}</span>
                <button className="hx-btn ghost sm" onClick={() => delAccount(s.id)} disabled={busy}>Disconnect</button>
              </div>
            ))}
          </div>
        )}
        <div className="hx-grid4">
          <label className="hx-field"><span>Platform</span>
            <select value={na.platform} onChange={(e) => setNa((s) => ({ ...s, platform: e.target.value }))}>
              <option value="instagram">instagram</option><option value="facebook">facebook</option>
            </select>
          </label>
          <label className="hx-field"><span>Label</span><input value={na.label} onChange={(e) => setNa((s) => ({ ...s, label: e.target.value }))} placeholder="Baroness Garland IG" /></label>
          <label className="hx-field"><span>{na.platform === "instagram" ? "IG user ID" : "Page ID"}</span><input value={na.external_id} onChange={(e) => setNa((s) => ({ ...s, external_id: e.target.value }))} /></label>
          <label className="hx-field"><span>Access token</span><input value={na.access_token} onChange={(e) => setNa((s) => ({ ...s, access_token: e.target.value }))} type="password" /></label>
        </div>
        <button className="hx-btn" onClick={addAccount} disabled={busy}>Connect account</button>
      </div>

      {/* ACCOUNTS & LINKS */}
      <div className="hx-card">
        <div className="hx-card-title">Site &amp; funnel links</div>
        <div className="hx-grid2">
          {Object.keys(SETTING_LABELS).map((k) => (
            <label key={k} className="hx-field"><span>{SETTING_LABELS[k]}</span>
              <input value={settingDraft[k]} onChange={(e) => setSettingDraft((s) => ({ ...s, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        <button className="hx-btn" onClick={saveSettings} disabled={busy}>Save settings</button>
      </div>

      <div className="hx-card">
        <div className="hx-card-title">Per-artist booking &amp; social links</div>
        <div className="hx-list">
          {artists.map((a) => (
            <div key={a.id} className="hx-artistrow">
              <div className="hx-artisthead">
                <strong>{a.display_name}</strong>
                <span className="hx-muted">{a.is_published ? "published" : "hidden"}{!artistDraft[a.id]?.venue_url && " · ⚠ no Venue Ink link"}</span>
              </div>
              <div className="hx-grid3">
                <label className="hx-field"><span>Venue Ink link</span>
                  <input value={artistDraft[a.id]?.venue_url ?? ""} onChange={(e) => setArtistDraft((s) => ({ ...s, [a.id]: { ...s[a.id], venue_url: e.target.value } }))} />
                </label>
                <label className="hx-field"><span>Instagram</span>
                  <input value={artistDraft[a.id]?.instagram_url ?? ""} onChange={(e) => setArtistDraft((s) => ({ ...s, [a.id]: { ...s[a.id], instagram_url: e.target.value } }))} />
                </label>
                <div className="hx-field"><span>&nbsp;</span><button className="hx-btn" onClick={() => saveArtist(a.id)} disabled={busy}>Save</button></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POST PLANNER */}
      <div className="hx-card">
        <div className="hx-card-title">Post planner</div>
        <p className="hx-muted">Instagram/Facebook posts publish for real — &ldquo;Publish now&rdquo; or set status <em>scheduled</em> with a date and the daily cron sends it. Instagram needs a public JPEG URL in &ldquo;Image URL&rdquo;.</p>
        <div className="hx-grid4">
          <label className="hx-field"><span>Location</span>
            <select value={np.location} onChange={(e) => setNp((s) => ({ ...s, location: e.target.value }))}>{LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          </label>
          <label className="hx-field"><span>Platform</span>
            <select value={np.platform} onChange={(e) => setNp((s) => ({ ...s, platform: e.target.value }))}>{PLATFORMS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          </label>
          <label className="hx-field"><span>Artist (optional)</span>
            <select value={np.artist_id} onChange={(e) => setNp((s) => ({ ...s, artist_id: e.target.value }))}>
              <option value="">— house account —</option>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.display_name}</option>)}
            </select>
          </label>
          <label className="hx-field"><span>Publish via</span>
            <select value={np.social_account_id} onChange={(e) => setNp((s) => ({ ...s, social_account_id: e.target.value }))}>
              <option value="">auto (first match)</option>
              {socials.filter((s) => s.platform === np.platform).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <label className="hx-field"><span>Caption</span>
          <textarea rows={3} value={np.caption} onChange={(e) => setNp((s) => ({ ...s, caption: e.target.value }))} placeholder="Healed fine-line florals by Anna — healed at 6 weeks vs day 1. Book: link in bio." />
        </label>
        <div className="hx-grid4">
          <label className="hx-field"><span>Image URL (public JPEG)</span><input value={np.media_url} onChange={(e) => setNp((s) => ({ ...s, media_url: e.target.value }))} placeholder="https://…/photo.jpg" /></label>
          <label className="hx-field"><span>Media note</span><input value={np.media_note} onChange={(e) => setNp((s) => ({ ...s, media_note: e.target.value }))} /></label>
          <label className="hx-field"><span>Scheduled for</span><input type="date" value={np.scheduled_for} onChange={(e) => setNp((s) => ({ ...s, scheduled_for: e.target.value }))} /></label>
          <label className="hx-field"><span>Status</span>
            <select value={np.status} onChange={(e) => setNp((s) => ({ ...s, status: e.target.value }))}>{STATUSES.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          </label>
        </div>
        <button className="hx-btn" onClick={addPost} disabled={busy}>Add to planner</button>

        <div className="hx-pills" style={{ marginTop: 14 }}>
          {["all", ...STATUSES].map((f) => (
            <button key={f} className={`hx-pill${postFilter === f ? " on" : ""}`} onClick={() => setPostFilter(f)}>{f}</button>
          ))}
        </div>
        {filteredPosts.length === 0 ? <p className="hx-muted">Nothing here yet.</p> : (
          <div className="hx-list">
            {filteredPosts.map((p) => {
              const artist = artists.find((a) => a.id === p.artist_id);
              const canAuto = AUTO_PLATFORMS.includes(p.platform);
              return (
                <div key={p.id} className="hx-listrow col">
                  <div>{p.caption}</div>
                  <div className="hx-muted">
                    {p.location} · {p.platform} · {artist ? artist.display_name : "house"} · {p.scheduled_for ? `for ${p.scheduled_for}` : "unscheduled"} · <span className={`hx-chip st-${p.status}`}>{p.status}</span>
                    {p.published_at ? ` · went out ${p.published_at.slice(0, 16).replace("T", " ")}` : ""}
                    {p.media_url ? " · 🖼" : canAuto && p.platform === "instagram" ? " · ⚠ no image URL (IG needs one)" : ""}
                  </div>
                  {p.publish_error && <div className="hx-error">Publish error: {p.publish_error}</div>}
                  <div className="hx-row">
                    {canAuto && p.status !== "posted" && <button className="hx-btn sm" onClick={() => publishNow(p.id)} disabled={busy}>Publish now</button>}
                    {!canAuto && p.status !== "posted" && <button className="hx-btn sm" onClick={() => setPostStatus(p.id, "posted")} disabled={busy}>Mark posted</button>}
                    {canAuto && p.status === "idea" && <button className="hx-btn ghost sm" onClick={() => setPostStatus(p.id, "scheduled")} disabled={busy}>Schedule (cron sends it)</button>}
                    {canAuto && p.status !== "posted" && <button className="hx-btn ghost sm" onClick={() => setPostStatus(p.id, "posted")} disabled={busy}>Mark posted manually</button>}
                    <button className="hx-btn ghost sm" onClick={() => delPost(p.id)} disabled={busy}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WEEKLY SCORECARD */}
      <div className="hx-card">
        <div className="hx-card-title">Weekly scorecard</div>
        <p className="hx-muted">Targets: first response &lt; 60 min · inquiry → deposit ≥ 25%. Fill in each Sunday.</p>
        <div className="hx-grid4">
          <label className="hx-field"><span>Week of (Mon)</span><input type="date" value={mRow.week_start} onChange={(e) => setMRow((s) => ({ ...s, week_start: e.target.value }))} /></label>
          <label className="hx-field"><span>Location</span>
            <select value={mRow.location} onChange={(e) => setMRow((s) => ({ ...s, location: e.target.value }))}>{LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          </label>
          <label className="hx-field"><span>Inquiries</span><input type="number" min={0} value={mRow.inquiries} onChange={(e) => setMRow((s) => ({ ...s, inquiries: e.target.value }))} /></label>
          <label className="hx-field"><span>Response (min)</span><input type="number" min={0} value={mRow.avg_response_min} onChange={(e) => setMRow((s) => ({ ...s, avg_response_min: e.target.value }))} /></label>
          <label className="hx-field"><span>Deposits</span><input type="number" min={0} value={mRow.deposits} onChange={(e) => setMRow((s) => ({ ...s, deposits: e.target.value }))} /></label>
          <label className="hx-field"><span>Reviews added</span><input type="number" min={0} value={mRow.reviews_added} onChange={(e) => setMRow((s) => ({ ...s, reviews_added: e.target.value }))} /></label>
          <label className="hx-field"><span>Notes</span><input value={mRow.notes} onChange={(e) => setMRow((s) => ({ ...s, notes: e.target.value }))} /></label>
          <div className="hx-field"><span>&nbsp;</span><button className="hx-btn" onClick={saveMetric} disabled={busy}>Save week</button></div>
        </div>
        {metrics.length === 0 ? <p className="hx-muted">No weeks logged yet.</p> : (
          <table className="hx-table">
            <thead><tr><th>Week</th><th>Loc</th><th>Inquiries</th><th>Resp min</th><th>Deposits</th><th>Conv.</th><th>Reviews</th><th>Notes</th></tr></thead>
            <tbody>
              {metrics.map((m) => {
                const conv = m.inquiries > 0 ? Math.round((m.deposits / m.inquiries) * 100) : null;
                return (
                  <tr key={`${m.week_start}-${m.location}`}>
                    <td>{m.week_start}</td><td>{m.location}</td><td>{m.inquiries}</td>
                    <td className={(m.avg_response_min ?? 0) > 60 ? "bad" : ""}>{m.avg_response_min ?? "—"}</td>
                    <td>{m.deposits}</td>
                    <td className={conv !== null && conv < 25 ? "bad" : ""}>{conv === null ? "—" : `${conv}%`}</td>
                    <td>{m.reviews_added}</td><td className="hx-muted">{m.notes ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
