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
};
export type MktMetric = {
  week_start: string; location: string; inquiries: number;
  avg_response_min: number | null; deposits: number; reviews_added: number; notes: string | null;
};

const LOCATIONS = ["garland", "plano"] as const;
const PLATFORMS = ["instagram", "tiktok", "facebook", "google", "email", "other"] as const;
const STATUSES = ["idea", "drafted", "scheduled", "posted"] as const;

const SETTING_LABELS: Record<string, string> = {
  studio_venue_url: "Studio Venue Ink link (house register)",
  booking_promise: "Booking promise (shown on the public site)",
  google_review_url_garland: "Google review link — Garland",
  google_review_url_plano: "Google review link — Plano",
  meta_business_url: "Meta Business Suite link",
  google_business_url: "Google Business Profile link",
  venue_dashboard_url: "Venue Ink dashboard link",
};

const card: React.CSSProperties = { background: "linear-gradient(180deg,#fdf6e7,#ece0c6)", border: "1px solid var(--gold)", borderRadius: 8, padding: 16 };
const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fffdf6", fontSize: 14, fontFamily: "var(--body)" };
const lbl: React.CSSProperties = { fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold-dark)", fontFamily: "var(--caps)" };
const btnSm: React.CSSProperties = { padding: "8px 12px", fontSize: 10 };

function mondayOf(d: Date): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  return x.toISOString().slice(0, 10);
}

export default function MarketingTab({ artists, settings, posts, metrics }: {
  artists: MktArtist[]; settings: MktSetting[]; posts: MktPost[]; metrics: MktMetric[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // ---- settings state ----
  const [settingDraft, setSettingDraft] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const k of Object.keys(SETTING_LABELS)) m[k] = settings.find((s) => s.key === k)?.value ?? "";
    return m;
  });

  // ---- artist link state ----
  const [artistDraft, setArtistDraft] = useState<Record<string, { instagram_url: string; venue_url: string }>>(() => {
    const m: Record<string, { instagram_url: string; venue_url: string }> = {};
    for (const a of artists) m[a.id] = { instagram_url: a.instagram_url ?? "", venue_url: a.venue_url ?? "" };
    return m;
  });

  // ---- post planner state ----
  const [postFilter, setPostFilter] = useState<string>("all");
  const [np, setNp] = useState({ location: "garland", platform: "instagram", artist_id: "", caption: "", media_note: "", scheduled_for: "", status: "idea" });

  // ---- scorecard state ----
  const [mRow, setMRow] = useState({ week_start: mondayOf(new Date()), location: "garland", inquiries: "", avg_response_min: "", deposits: "", reviews_added: "", notes: "" });

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

  async function addPost() {
    if (!np.caption.trim()) { setStatus("Error: the post needs a caption/idea."); return; }
    setBusy(true); setStatus("Adding post…");
    const { error } = await supabase.from("marketing_posts").insert({
      location: np.location, platform: np.platform, artist_id: np.artist_id || null,
      caption: np.caption.trim(), media_note: np.media_note.trim() || null,
      scheduled_for: np.scheduled_for || null, status: np.status,
    });
    if (!error) setNp((s) => ({ ...s, caption: "", media_note: "", scheduled_for: "" }));
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
    <div style={{ display: "grid", gap: 16 }}>
      {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}

      {/* QUICK LINKS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {quicklinks.map(([label, url]) => url ? (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="btn ghost" style={btnSm}>{label} ↗</a>
        ) : null)}
      </div>

      {/* ACCOUNTS & LINKS */}
      <div style={card}>
        <h3 style={{ fontSize: 22, marginBottom: 4 }}>Accounts &amp; links</h3>
        <p style={{ fontSize: 13.5, color: "var(--grey)", marginBottom: 12 }}>
          These power the public funnel: artist Venue Ink links feed every &ldquo;Book with this Artist&rdquo; button and the Writing Parlor registers; review links are for the post-session review text.
        </p>
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          {Object.keys(SETTING_LABELS).map((k) => (
            <label key={k} style={{ display: "grid", gap: 4 }}>
              <span style={lbl}>{SETTING_LABELS[k]}</span>
              <input style={inp} value={settingDraft[k]} onChange={(e) => setSettingDraft((s) => ({ ...s, [k]: e.target.value }))} />
            </label>
          ))}
          <div><button className="btn" style={btnSm} onClick={saveSettings} disabled={busy}>Save settings</button></div>
        </div>
        <h4 style={{ fontSize: 17, marginBottom: 8 }}>Per-artist booking &amp; social links</h4>
        <div style={{ display: "grid", gap: 10 }}>
          {artists.map((a) => (
            <div key={a.id} style={{ border: "1px solid rgba(139,111,53,.3)", borderRadius: 6, padding: "10px 12px", background: "#fffdf6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong>{a.display_name}</strong>
                <span style={{ fontSize: 12, color: "var(--grey)" }}>{a.is_published ? "published" : "hidden"}{!artistDraft[a.id]?.venue_url && " · ⚠ no Venue Ink link — falls back to house register"}</span>
              </div>
              <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 1fr auto", alignItems: "end" }}>
                <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Venue Ink link</span>
                  <input style={inp} value={artistDraft[a.id]?.venue_url ?? ""} onChange={(e) => setArtistDraft((s) => ({ ...s, [a.id]: { ...s[a.id], venue_url: e.target.value } }))} />
                </label>
                <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Instagram</span>
                  <input style={inp} value={artistDraft[a.id]?.instagram_url ?? ""} onChange={(e) => setArtistDraft((s) => ({ ...s, [a.id]: { ...s[a.id], instagram_url: e.target.value } }))} />
                </label>
                <button className="btn" style={btnSm} onClick={() => saveArtist(a.id)} disabled={busy}>Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POST PLANNER */}
      <div style={card}>
        <h3 style={{ fontSize: 22, marginBottom: 4 }}>Post planner</h3>
        <p style={{ fontSize: 13.5, color: "var(--grey)", marginBottom: 12 }}>
          The 90-day plans call for 3–4 posts per artist per week (healed work &gt; fresh ink) and 5–6 on the house accounts. Plan here, post in the apps, then mark posted.
        </p>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "110px 120px 1fr", marginBottom: 6 }}>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Location</span>
            <select style={inp} value={np.location} onChange={(e) => setNp((s) => ({ ...s, location: e.target.value }))}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Platform</span>
            <select style={inp} value={np.platform} onChange={(e) => setNp((s) => ({ ...s, platform: e.target.value }))}>
              {PLATFORMS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Artist (optional)</span>
            <select style={inp} value={np.artist_id} onChange={(e) => setNp((s) => ({ ...s, artist_id: e.target.value }))}>
              <option value="">— house account —</option>
              {artists.map((a) => <option key={a.id} value={a.id}>{a.display_name}</option>)}
            </select>
          </label>
        </div>
        <label style={{ display: "grid", gap: 3, marginBottom: 6 }}><span style={lbl}>Caption / idea</span>
          <textarea style={{ ...inp, minHeight: 56 }} value={np.caption} onChange={(e) => setNp((s) => ({ ...s, caption: e.target.value }))} placeholder="e.g. Healed fine-line florals by Anna — carousel: healed at 6 weeks vs day 1. CTA: link in bio." />
        </label>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 150px 120px auto", alignItems: "end", marginBottom: 12 }}>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Media note (which asset)</span>
            <input style={inp} value={np.media_note} onChange={(e) => setNp((s) => ({ ...s, media_note: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Scheduled for</span>
            <input style={inp} type="date" value={np.scheduled_for} onChange={(e) => setNp((s) => ({ ...s, scheduled_for: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Status</span>
            <select style={inp} value={np.status} onChange={(e) => setNp((s) => ({ ...s, status: e.target.value }))}>
              {STATUSES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <button className="btn" style={btnSm} onClick={addPost} disabled={busy}>Add</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["all", ...STATUSES].map((f) => (
            <button key={f} onClick={() => setPostFilter(f)} className="caps"
              style={{ fontSize: 10, padding: "6px 10px", cursor: "pointer", borderRadius: 2, border: "1px solid var(--gold-dark)", background: postFilter === f ? "var(--gold)" : "transparent", color: postFilter === f ? "var(--black)" : "var(--gold-dark)" }}>
              {f}
            </button>
          ))}
        </div>
        {filteredPosts.length === 0 ? <p style={{ color: "var(--grey)" }}>Nothing here yet.</p> : (
          <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
            {filteredPosts.map((p) => {
              const artist = artists.find((a) => a.id === p.artist_id);
              return (
                <li key={p.id} style={{ border: "1px solid rgba(139,111,53,.3)", borderRadius: 6, padding: "10px 12px", background: p.status === "posted" ? "rgba(168,196,162,.15)" : "#fffdf6" }}>
                  <div style={{ fontSize: 15 }}>{p.caption}</div>
                  <div style={{ fontSize: 12, color: "var(--grey)", margin: "4px 0 8px" }}>
                    {p.location} · {p.platform} · {artist ? artist.display_name : "house"} · {p.scheduled_for ? `for ${p.scheduled_for}` : "unscheduled"} · {p.status}
                    {p.media_note ? ` · asset: ${p.media_note}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.status !== "posted" && <button className="btn" style={btnSm} onClick={() => setPostStatus(p.id, "posted")} disabled={busy}>Mark posted</button>}
                    {p.status === "idea" && <button className="btn ghost" style={btnSm} onClick={() => setPostStatus(p.id, "scheduled")} disabled={busy}>Mark scheduled</button>}
                    <button className="btn ghost" style={btnSm} onClick={() => delPost(p.id)} disabled={busy}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* WEEKLY SCORECARD */}
      <div style={card}>
        <h3 style={{ fontSize: 22, marginBottom: 4 }}>Weekly scorecard</h3>
        <p style={{ fontSize: 13.5, color: "var(--grey)", marginBottom: 12 }}>
          The two numbers that matter: first-response time (target &lt; 60 min) and inquiry → deposit conversion (target 25%+). Fill this in each Sunday — 15 minutes.
        </p>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "140px 110px 90px 110px 90px 90px 1fr auto", alignItems: "end", marginBottom: 12 }}>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Week of (Mon)</span>
            <input style={inp} type="date" value={mRow.week_start} onChange={(e) => setMRow((s) => ({ ...s, week_start: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Location</span>
            <select style={inp} value={mRow.location} onChange={(e) => setMRow((s) => ({ ...s, location: e.target.value }))}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Inquiries</span>
            <input style={inp} type="number" min={0} value={mRow.inquiries} onChange={(e) => setMRow((s) => ({ ...s, inquiries: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Resp. (min)</span>
            <input style={inp} type="number" min={0} value={mRow.avg_response_min} onChange={(e) => setMRow((s) => ({ ...s, avg_response_min: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Deposits</span>
            <input style={inp} type="number" min={0} value={mRow.deposits} onChange={(e) => setMRow((s) => ({ ...s, deposits: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Reviews</span>
            <input style={inp} type="number" min={0} value={mRow.reviews_added} onChange={(e) => setMRow((s) => ({ ...s, reviews_added: e.target.value }))} />
          </label>
          <label style={{ display: "grid", gap: 3 }}><span style={lbl}>Notes</span>
            <input style={inp} value={mRow.notes} onChange={(e) => setMRow((s) => ({ ...s, notes: e.target.value }))} />
          </label>
          <button className="btn" style={btnSm} onClick={saveMetric} disabled={busy}>Save week</button>
        </div>
        {metrics.length === 0 ? <p style={{ color: "var(--grey)" }}>No weeks logged yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Week", "Location", "Inquiries", "Resp. min", "Deposits", "Conv.", "Reviews", "Notes"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1.5px solid var(--gold-dark)", fontFamily: "var(--caps)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold-dark)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => {
                  const conv = m.inquiries > 0 ? Math.round((m.deposits / m.inquiries) * 100) : null;
                  const slow = (m.avg_response_min ?? 0) > 60;
                  const lowConv = conv !== null && conv < 25;
                  return (
                    <tr key={`${m.week_start}-${m.location}`}>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)" }}>{m.week_start}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)" }}>{m.location}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)" }}>{m.inquiries}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)", color: slow ? "#a33" : undefined }}>{m.avg_response_min ?? "—"}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)" }}>{m.deposits}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)", color: lowConv ? "#a33" : undefined }}>{conv === null ? "—" : `${conv}%`}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)" }}>{m.reviews_added}</td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid rgba(139,111,53,.2)", color: "var(--grey)" }}>{m.notes ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
