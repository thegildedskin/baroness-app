"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MarketingTab, { type MktArtist, type MktSetting, type MktPost, type MktMetric, type MktSocial } from "./MarketingTab";
import CommerceTab from "./CommerceTab";
import BookingsTab from "./BookingsTab";

type Gallery = { id: string; image_url: string; caption: string | null };
type Pending = { id: string; image_url: string; artist_id: string; artists: { display_name: string } | { display_name: string }[] | null };
type Suggestion = { id: string; author_name: string | null; author_email: string | null; body: string; status: string; created_at: string };
type ArtistRow = { id: string; display_name: string; slug: string; is_published: boolean };
type ClientRow = { id: string; email: string | null; display_name: string | null; credits: number | null };
type ThreadRow = { id: string; artist_id: string; client_name: string; last_message_at: string; artists: { display_name: string } | { display_name: string }[] | null };

function aname(a: { display_name: string } | { display_name: string }[] | null): string {
  if (!a) return "—";
  return Array.isArray(a) ? (a[0]?.display_name ?? "—") : a.display_name;
}

const TABS = ["Bookings", "Marketing", "Commerce", "Gallery", "Approvals", "Suggestions", "People", "Messages"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPanel({ gallery, pending, suggestions, artists, clients, threads, mktArtists, mktSettings, mktPosts, mktMetrics, mktSocials }: {
  gallery: Gallery[]; pending: Pending[]; suggestions: Suggestion[]; artists: ArtistRow[]; clients: ClientRow[]; threads: ThreadRow[];
  mktArtists: MktArtist[]; mktSettings: MktSetting[]; mktPosts: MktPost[]; mktMetrics: MktMetric[]; mktSocials: MktSocial[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Bookings");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function uploadGallery(file: File) {
    setBusy(true); setStatus("Uploading…");
    const path = `${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("gallery").upload(path, file, { upsert: true });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery").insert({ image_url: pub.publicUrl, sort_order: gallery.length });
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Added to gallery."); router.refresh();
  }
  async function del(table: string, id: string) {
    setBusy(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Removed."); router.refresh();
  }
  async function approve(id: string) {
    setBusy(true);
    const { error } = await supabase.from("flash").update({ approved: true }).eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Approved."); router.refresh();
  }
  async function resolve(id: string) {
    setBusy(true);
    const { error } = await supabase.from("suggestions").update({ status: "reviewed" }).eq("id", id);
    setBusy(false); setStatus(error ? `Error: ${error.message}` : "Marked reviewed."); router.refresh();
  }

  // Hero KPIs — latest scorecard week (both locations combined) + operational counts
  const latestWeek = mktMetrics[0]?.week_start;
  const weekRows = mktMetrics.filter((m) => m.week_start === latestWeek);
  const wkInquiries = weekRows.reduce((a, m) => a + m.inquiries, 0);
  const wkDeposits = weekRows.reduce((a, m) => a + m.deposits, 0);
  const wkConv = wkInquiries > 0 ? Math.round((wkDeposits / wkInquiries) * 100) : null;
  const wkResp = weekRows.length ? Math.max(...weekRows.map((m) => m.avg_response_min ?? 0)) : null;
  const scheduled = mktPosts.filter((p) => p.status === "scheduled").length;
  const newSuggestions = suggestions.filter((s) => s.status === "new").length;

  return (
    <div className="hx">
      <style>{HX_CSS}</style>
      <div className="hx-shell">
        <header className="hx-hero">
          <div className="hx-hero-top">
            <div>
              <div className="hx-eyebrow">Baroness Tattoo · House Admin</div>
              <h1 className="hx-title">The Command Salon</h1>
            </div>
            <nav className="hx-heronav">
              <Link href="/">← The Estate</Link>
              <Link href="/dashboard">Artist roster</Link>
            </nav>
          </div>
          <div className="hx-kpis">
            <div className="hx-kpi"><div className="hx-kpi-label">Inquiries {latestWeek ? `wk ${latestWeek.slice(5)}` : "(no wk logged)"}</div><div className="hx-kpi-value">{latestWeek ? wkInquiries : "—"}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Deposits</div><div className="hx-kpi-value">{latestWeek ? wkDeposits : "—"}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Conversion</div><div className={`hx-kpi-value${wkConv !== null && wkConv < 25 ? " bad" : ""}`}>{wkConv === null ? "—" : `${wkConv}%`}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Response</div><div className={`hx-kpi-value${(wkResp ?? 0) > 60 ? " bad" : ""}`}>{wkResp == null ? "—" : `${wkResp}m`}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Posts queued</div><div className="hx-kpi-value">{scheduled}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Approvals due</div><div className={`hx-kpi-value${pending.length > 0 ? " warn" : ""}`}>{pending.length}</div></div>
          </div>
          <div className="hx-pills hx-mainnav">
            {TABS.map((t) => (
              <button key={t} className={`hx-pill${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
                {t}
                {t === "Approvals" && pending.length > 0 ? ` (${pending.length})` : ""}
                {t === "Suggestions" && newSuggestions > 0 ? ` (${newSuggestions})` : ""}
              </button>
            ))}
          </div>
          {status && <div className={`hx-status${status.startsWith("Error") ? " err" : ""}`}>{status}</div>}
        </header>

        <main className="hx-main">
          {tab === "Bookings" && <BookingsTab />}

          {tab === "Marketing" && (
            <MarketingTab artists={mktArtists} settings={mktSettings} posts={mktPosts} metrics={mktMetrics} socials={mktSocials} />
          )}

          {tab === "Commerce" && <CommerceTab settings={mktSettings} />}

          {tab === "Gallery" && (
            <div className="hx-card">
              <div className="hx-card-title">House gallery (public Gallery room)</div>
              <p style={{ marginBottom: 12 }}><input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadGallery(e.target.files[0])} /></p>
              {gallery.length === 0 ? <p className="hx-muted">No house images yet — the Gallery falls back to approved artist flash.</p> : (
                <div className="hx-imggrid">
                  {gallery.map((g) => (
                    <div key={g.id} className="hx-imgcell">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.image_url} alt="" />
                      <button onClick={() => del("gallery", g.id)} disabled={busy}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Approvals" && (
            <div className="hx-card">
              <div className="hx-card-title">Flash awaiting approval</div>
              {pending.length === 0 ? <p className="hx-muted">Nothing pending. All artist flash is approved.</p> : (
                <div className="hx-imggrid lg">
                  {pending.map((p) => (
                    <div key={p.id} className="hx-approve">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt="" />
                      <div className="hx-approve-meta">
                        <span>{aname(p.artists)}</span>
                        <div className="hx-row">
                          <button className="hx-btn sm" onClick={() => approve(p.id)} disabled={busy}>Approve</button>
                          <button className="hx-btn ghost sm" onClick={() => del("flash", p.id)} disabled={busy}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Suggestions" && (
            <div className="hx-card">
              <div className="hx-card-title">Suggestions</div>
              {suggestions.length === 0 ? <p className="hx-muted">No suggestions yet.</p> : (
                <div className="hx-list">
                  {suggestions.map((s) => (
                    <div key={s.id} className={`hx-listrow col${s.status !== "new" ? " dim" : ""}`}>
                      <div>{s.body}</div>
                      <div className="hx-muted">{s.author_name || "Anonymous"}{s.author_email ? ` · ${s.author_email}` : ""} · {new Date(s.created_at).toLocaleDateString()} · {s.status}</div>
                      <div className="hx-row">
                        {s.status === "new" && <button className="hx-btn sm" onClick={() => resolve(s.id)} disabled={busy}>Mark reviewed</button>}
                        <button className="hx-btn ghost sm" onClick={() => del("suggestions", s.id)} disabled={busy}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "People" && (
            <div className="hx-stack">
              <div className="hx-card">
                <div className="hx-card-title">Artists</div>
                <div className="hx-list">
                  {artists.map((a) => (
                    <div key={a.id} className="hx-listrow">
                      <strong>{a.display_name}</strong>
                      <span className="hx-muted">{a.is_published ? "published" : "hidden"}</span>
                      <span className="hx-spacer" />
                      <Link href={`/dashboard?id=${a.id}`} className="hx-link">Edit →</Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hx-card">
                <div className="hx-card-title">Clients ({clients.length})</div>
                {clients.length === 0 ? <p className="hx-muted">No client accounts yet.</p> : (
                  <div className="hx-list">
                    {clients.map((c) => (
                      <div key={c.id} className="hx-listrow">
                        <strong>{c.display_name || "—"}</strong>
                        <span className="hx-muted">{c.email}</span>
                        <span className="hx-spacer" />
                        <span className="hx-chip">{c.credits ?? 0} credits</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "Messages" && (
            <div className="hx-card">
              <div className="hx-card-title">Recent conversations</div>
              {threads.length === 0 ? <p className="hx-muted">No conversations yet.</p> : (
                <div className="hx-list">
                  {threads.map((t) => (
                    <div key={t.id} className="hx-listrow">
                      <strong>{t.client_name}</strong>
                      <span className="hx-muted">→ {aname(t.artists)}</span>
                      <span className="hx-spacer" />
                      <Link href={`/dashboard?id=${t.artist_id}`} className="hx-link">Open →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const HX_CSS = `
.hx{min-height:100vh;background:radial-gradient(1200px 500px at 20% -10%,#2b2140 0%,transparent 60%),radial-gradient(900px 420px at 95% 0%,#3b2a1a 0%,transparent 55%),#0d0b12;color:#e9e2d4;font-family:var(--body,ui-serif)}
.hx *{box-sizing:border-box}
.hx-shell{max-width:1180px;margin:0 auto;padding:28px 22px 80px}
.hx-hero{border:1px solid rgba(202,162,78,.35);border-radius:16px;padding:26px 28px 18px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));backdrop-filter:blur(6px);box-shadow:0 18px 60px rgba(0,0,0,.45)}
.hx-hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.hx-eyebrow{font-family:var(--caps,inherit);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#caa24e;margin-bottom:6px}
.hx-title{font-size:38px;margin:0 0 4px;color:#f3e9d2;font-weight:600}
.hx-heronav{display:flex;gap:16px}
.hx-heronav a{color:#caa24e;text-decoration:none;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-family:var(--caps,inherit)}
.hx-heronav a:hover{color:#f1dc97}
.hx-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:18px 0 16px}
.hx-kpi{border:1px solid rgba(202,162,78,.28);border-radius:12px;padding:12px 14px;background:linear-gradient(180deg,rgba(202,162,78,.10),rgba(202,162,78,.03))}
.hx-kpi-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#a5987f;font-family:var(--caps,inherit)}
.hx-kpi-value{font-size:26px;color:#f1dc97;margin-top:4px;font-weight:600}
.hx-kpi-value.bad{color:#e07a6a}.hx-kpi-value.warn{color:#e0b46a}
.hx-pills{display:flex;flex-wrap:wrap;gap:8px}
.hx-pill{border:1px solid rgba(202,162,78,.4);background:transparent;color:#cbbfa4;border-radius:999px;padding:8px 16px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;font-family:var(--caps,inherit);transition:all .15s}
.hx-pill:hover{border-color:#caa24e;color:#f1dc97}
.hx-pill.on{background:linear-gradient(180deg,#f1dc97,#caa24e);color:#191307;border-color:#caa24e;font-weight:700}
.hx-mainnav{margin-bottom:4px}
.hx-main{margin-top:20px}
.hx-stack{display:grid;gap:16px}
.hx-card{border:1px solid rgba(202,162,78,.25);border-radius:14px;padding:20px 22px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:0 10px 34px rgba(0,0,0,.3)}
.hx-card-title{font-size:17px;color:#f3e9d2;margin-bottom:10px;font-weight:600}
.hx-muted{color:#a5987f;font-size:13.5px;line-height:1.5}
.hx-error{color:#e07a6a;font-size:13.5px}
.hx-status{margin-top:10px;font-size:13.5px;color:#9fc48f}
.hx-status.err{color:#e07a6a}
.hx-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.hx-spacer{flex:1}
.hx-btn{border:none;border-radius:8px;padding:10px 16px;background:linear-gradient(180deg,#f1dc97,#caa24e);color:#191307;font-weight:700;font-size:13px;cursor:pointer;font-family:var(--caps,inherit);letter-spacing:.06em;text-transform:uppercase}
.hx-btn:hover{filter:brightness(1.08)}
.hx-btn:disabled{opacity:.5;cursor:default}
.hx-btn.ghost{background:transparent;border:1px solid rgba(202,162,78,.5);color:#caa24e}
.hx-btn.sm{padding:7px 12px;font-size:11px}
.hx-links{display:flex;gap:8px;flex-wrap:wrap}
.hx-link{color:#caa24e;text-decoration:none;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-family:var(--caps,inherit);border:1px solid rgba(202,162,78,.4);border-radius:999px;padding:8px 14px}
.hx-link:hover{border-color:#caa24e;color:#f1dc97}
.hx-field{display:grid;gap:5px;font-size:13px}
.hx-field>span{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#a5987f;font-family:var(--caps,inherit)}
.hx-field input,.hx-field select,.hx-field textarea{width:100%;padding:10px 12px;border:1px solid rgba(202,162,78,.35);border-radius:8px;background:rgba(13,11,18,.6);color:#e9e2d4;font-size:14px;font-family:var(--body,inherit)}
.hx-field input:focus,.hx-field select:focus,.hx-field textarea:focus{outline:none;border-color:#caa24e}
.hx-grid2{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-bottom:12px}
.hx-grid3{display:grid;gap:10px;grid-template-columns:1fr 1fr auto;align-items:end}
.hx-grid4{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:10px;align-items:end}
.hx-list{display:grid;gap:8px;margin:10px 0}
.hx-listrow{display:flex;gap:10px;align-items:center;border:1px solid rgba(202,162,78,.2);border-radius:10px;padding:11px 14px;background:rgba(255,255,255,.02);font-size:14.5px}
.hx-listrow.col{flex-direction:column;align-items:stretch;gap:6px}
.hx-listrow.dim{opacity:.6}
.hx-artistrow{border:1px solid rgba(202,162,78,.2);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,.02)}
.hx-artisthead{display:flex;gap:10px;align-items:baseline;margin-bottom:8px}
.hx-chip{display:inline-block;border:1px solid rgba(202,162,78,.45);border-radius:999px;padding:2px 10px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#caa24e;font-family:var(--caps,inherit)}
.hx-chip.st-posted{color:#9fc48f;border-color:rgba(159,196,143,.5)}
.hx-chip.st-scheduled{color:#8fb9d4;border-color:rgba(143,185,212,.5)}
.hx-table{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:8px}
.hx-table th{text-align:left;padding:8px 10px;border-bottom:1px solid rgba(202,162,78,.5);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#caa24e;font-family:var(--caps,inherit)}
.hx-table td{padding:8px 10px;border-bottom:1px solid rgba(202,162,78,.15)}
.hx-table td.bad{color:#e07a6a}
.hx-imggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.hx-imggrid.lg{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.hx-imgcell{position:relative;border-radius:10px;overflow:hidden;border:1px solid rgba(202,162,78,.3)}
.hx-imgcell img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.hx-imgcell button{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer}
.hx-approve{border:1px solid rgba(202,162,78,.3);border-radius:10px;overflow:hidden;background:rgba(255,255,255,.02)}
.hx-approve img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.hx-approve-meta{padding:10px 12px;display:grid;gap:8px;font-size:13.5px}
.hx-bars{display:grid;gap:6px}
.hx-barrow{display:grid;grid-template-columns:48px 1fr 88px;gap:10px;align-items:center;font-size:13px}
.hx-bardate{color:#a5987f}
.hx-bartrack{height:12px;border-radius:6px;background:rgba(255,255,255,.05);overflow:hidden}
.hx-barfill{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#8a6d33,#f1dc97)}
.hx-barval{text-align:right;color:#f1dc97}
@media(max-width:720px){.hx-title{font-size:28px}.hx-grid3{grid-template-columns:1fr}}
`;
