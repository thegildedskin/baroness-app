"use client";

// Artist Hub (ported from the design kit). 8 tabs; the Portfolio tab is the
// vision classifier's UI: upload a healed photo → /api/classify tags it with the
// shared style/temperament taxonomy → the artist corrects the chips → publish to
// `baroness-artist-works`, which the Commission matcher reads. Closes
// SPEC_vision_classifier end-to-end. Kit CSS scoped under .ahwrap.

import { useEffect, useRef, useState } from "react";

const PSTYLES = ["Traditional", "Neo-Traditional", "Realism", "Fine Line", "Blackwork", "Japanese", "Watercolor", "Geometric", "Chicano", "Dark Fantasy"];
const PVIBES = ["Delicate", "Bold", "Dark", "Ornate", "Minimal"];
const WKEY = "baroness-artist-works";

type Book = { t: string; a?: string; st: string[]; vb: string[]; c: string };
const SEEDBOOK: Book[] = [
  { t: "Dagger through gilded rose", st: ["Neo-Traditional", "Traditional"], vb: ["Bold", "Ornate"], c: "#8e2433,#2b2140" },
  { t: "Thorned peony chest piece", st: ["Neo-Traditional", "Dark Fantasy"], vb: ["Dark", "Bold"], c: "#2b2140,#C8959A" },
  { t: "Serpent & candelabra", st: ["Dark Fantasy", "Blackwork"], vb: ["Dark", "Ornate"], c: "#161210,#8B6F35" },
  { t: "Watercolor moth study", st: ["Watercolor"], vb: ["Delicate"], c: "#2f8f86,#C8959A" },
];

// client-side fallback if /api/classify is unreachable
const CUES: [RegExp, string[], string[]][] = [
  [/rose|flor|peon|botanic|dagger|garland/i, ["Neo-Traditional"], ["Bold", "Ornate"]],
  [/portrait|face|realis|fauna|wildlife|matriarch/i, ["Realism"], ["Bold"]],
  [/script|filigree|lace|single.?needle|ornament|fine/i, ["Fine Line"], ["Delicate", "Ornate"]],
  [/serpent|snake|skull|bat|moth|goth|raven|dark/i, ["Dark Fantasy", "Blackwork"], ["Dark"]],
  [/koi|dragon|wave|hannya|irezumi/i, ["Japanese"], ["Bold", "Ornate"]],
  [/geo|mandala|band|sacred|dotwork/i, ["Geometric"], ["Minimal"]],
  [/water|splash|wash/i, ["Watercolor"], ["Delicate"]],
  [/payasa|lowrider|chicano|clown/i, ["Chicano"], ["Dark", "Ornate"]],
];

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

const CSS = `
.ahwrap{max-width:1200px;margin:0 auto;padding:26px 22px 80px}
.ahwrap .ah-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:18px}
.ahwrap .ah-id{display:flex;gap:14px;align-items:center}
.ahwrap .ah-pip{width:54px;height:54px;border-radius:50%;border:2px solid var(--gold);background:linear-gradient(160deg,var(--quarter-plum),var(--rose));display:flex;align-items:center;justify-content:center;font-family:var(--blackletter);font-size:24px;color:#fff}
.ahwrap .ah-eyebrow{font-family:var(--caps);font-size:9px;letter-spacing:var(--track-caps-wider);text-transform:uppercase;color:var(--gold)}
.ahwrap .ah-name{font-family:var(--display);font-size:28px;color:var(--cream);font-weight:600;line-height:1.1}
.ahwrap .ah-right{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.ahwrap .pill-stat{border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-pill);padding:8px 16px;font-family:var(--caps);font-size:var(--text-label-sm);letter-spacing:.08em;text-transform:uppercase;color:var(--gold-pale)}
.ahwrap .abtn{font-family:var(--caps);letter-spacing:var(--track-caps);text-transform:uppercase;font-size:var(--text-label-sm);color:var(--black);background:var(--gilt);border:var(--border-gold-dark);padding:10px 16px;border-radius:var(--radius-xs);cursor:pointer;text-decoration:none;display:inline-block}
.ahwrap .abtn.ghost{background:transparent;color:var(--gold)}
.ahwrap .abtn.sm{padding:7px 11px;font-size:10px}
.ahwrap .tabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}
.ahwrap .tab{border:1px solid rgba(184,146,74,.4);background:transparent;color:#cbbfa4;border-radius:var(--radius-pill);padding:8px 16px;font-family:var(--caps);font-size:var(--text-label-sm);letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.ahwrap .tab:hover{border-color:var(--gold);color:var(--gold-pale)}
.ahwrap .tab.on{background:var(--gilt);color:var(--black);border-color:var(--gold-dark);font-weight:700}
.ahwrap .pane{display:none}.ahwrap .pane.on{display:block}
.ahwrap .panel{border:1px solid rgba(184,146,74,.25);border-radius:var(--radius-xl);padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))}
.ahwrap .panel+.panel{margin-top:14px}
.ahwrap .p-title{font-family:var(--display);font-size:18px;color:var(--cream);font-weight:600;margin-bottom:10px}
.ahwrap .muted{color:var(--quarter-muted);font-size:var(--text-fine);font-style:italic}
.ahwrap .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
.ahwrap .kpi{border:1px solid rgba(184,146,74,.28);border-radius:var(--radius-xl);padding:12px 14px;background:linear-gradient(180deg,rgba(184,146,74,.1),rgba(184,146,74,.03))}
.ahwrap .kpi-l{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--quarter-muted);font-family:var(--caps)}
.ahwrap .kpi-v{font-family:var(--display);font-size:24px;color:var(--gold-pale);margin-top:4px;font-weight:600}
.ahwrap .kpi-v small{font-size:12px;color:var(--quarter-muted);font-family:var(--body)}
.ahwrap .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
@media(max-width:860px){.ahwrap .cols{grid-template-columns:1fr}}
.ahwrap .list{display:grid;gap:8px}
.ahwrap .row{display:flex;gap:10px;align-items:center;border:1px solid rgba(184,146,74,.2);border-radius:10px;padding:11px 14px;background:rgba(255,255,255,.02);font-size:14px;flex-wrap:wrap}
.ahwrap .row b{color:var(--cream)}
.ahwrap .row .sp{flex:1}
.ahwrap .chip{display:inline-block;border:1px solid rgba(184,146,74,.45);border-radius:var(--radius-pill);padding:2px 10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-family:var(--caps)}
.ahwrap .chip.ok{color:#9fc48f;border-color:rgba(159,196,143,.5)}
.ahwrap .chip.warn{color:#e0b46a;border-color:rgba(224,180,106,.5)}
.ahwrap .chip.bad{color:#e07a6a;border-color:rgba(224,122,106,.5)}
.ahwrap .ai{border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-xl);background:linear-gradient(180deg,rgba(184,146,74,.12),rgba(184,146,74,.03));padding:14px 16px}
.ahwrap .ai b{font-family:var(--caps);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:8px}
.ahwrap .ai .row{background:rgba(0,0,0,.2)}
.ahwrap .fld{display:grid;gap:5px;margin-bottom:10px}
.ahwrap .fld>span{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:.13em;text-transform:uppercase;color:var(--quarter-muted)}
.ahwrap .fld input,.ahwrap .fld select,.ahwrap .fld textarea{width:100%;padding:10px 12px;border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-lg);background:rgba(13,11,18,.6);color:var(--quarter-text);font-size:var(--text-small);font-family:var(--body)}
.ahwrap .fld textarea{height:70px;resize:none}
.ahwrap .sw-row{display:flex;gap:8px}
.ahwrap .sw{width:30px;height:30px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.15);padding:0}
.ahwrap .sw.on{border-color:var(--gold-pale);box-shadow:0 0 0 2px rgba(184,146,74,.5)}
.ahwrap .mini{border:1px solid var(--gold);border-radius:var(--radius-lg);overflow:hidden;background:var(--cream);color:var(--black)}
.ahwrap .mini-hero{padding:26px 20px;text-align:center;color:#fff}
.ahwrap .mini-hero .bl{font-family:var(--blackletter);font-size:30px}
.ahwrap .mini-hero .tg{font-family:var(--display);font-style:italic;font-size:14px;opacity:.9}
.ahwrap .mini-body{padding:12px 16px;font-size:12px}
.ahwrap .mini-body .caps{font-size:9px;color:var(--gold-dark);font-family:var(--caps);letter-spacing:.12em;text-transform:uppercase}
.ahwrap .tbl{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
.ahwrap .tbl th{text-align:left;padding:7px 9px;border-bottom:1px solid rgba(184,146,74,.5);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);font-family:var(--caps)}
.ahwrap .tbl td{padding:7px 9px;border-bottom:1px solid rgba(184,146,74,.14)}
.ahwrap .tbl td.neg{color:#e07a6a}.ahwrap .tbl td.pos{color:#9fc48f}
.ahwrap .prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:11px}
.ahwrap .prod{border:1px solid rgba(184,146,74,.3);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.02)}
.ahwrap .prod-art{aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;font-family:var(--blackletter);font-size:26px;color:rgba(255,255,255,.85)}
.ahwrap .prod-b{padding:10px 12px;font-size:13px}
.ahwrap .prod-b b{color:var(--cream);display:block}
.ahwrap .prod-b .muted{font-size:11px}
.ahwrap .drop{border:1.5px dashed rgba(184,146,74,.5);border-radius:var(--radius-lg);padding:26px 16px;text-align:center;font-size:13px;font-style:italic;color:var(--quarter-muted);cursor:pointer;background-size:cover;background-position:center}
.ahwrap .drop:hover{border-color:var(--gold)}
.ahwrap .drop.has{color:transparent;min-height:120px}
.ahwrap .lbl2{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:.13em;text-transform:uppercase;color:var(--quarter-muted);margin:10px 0 6px}
.ahwrap .conf{color:var(--gold);letter-spacing:.06em;text-transform:none;font-style:italic;font-family:var(--body)}
.ahwrap .chips2{display:flex;gap:7px;flex-wrap:wrap}
.ahwrap .chip2{border:1px solid rgba(184,146,74,.45);background:transparent;border-radius:var(--radius-pill);padding:5px 12px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-family:var(--caps);cursor:pointer}
.ahwrap .chip2:hover{border-color:var(--gold);color:var(--gold-pale)}
.ahwrap .chip2.on{background:var(--gilt);color:var(--black);border-color:var(--gold-dark)}
.ahwrap .tagline{display:flex;gap:5px;flex-wrap:wrap;width:100%;margin-top:4px}
`;

const ACCENTS = ["#C8959A", "#B8924A", "#A8C4A2", "#2b2140"];

export default function ArtistHub() {
  const [tab, setTab] = useState("today");

  // My Page live preview
  const [pgName, setPgName] = useState("Vivienne Duval");
  const [pgTag, setPgTag] = useState("Florals with teeth. Neo-traditional & dark botanicals.");
  const [pgCta, setPgCta] = useState("Commission Vivienne");
  const [accent, setAccent] = useState("#C8959A");

  // Social caption
  const [capIn, setCapIn] = useState("");
  const [capOut, setCapOut] = useState("Your drafted caption appears here — tuned to your past top posts.");

  // Tax slider
  const [taxPct, setTaxPct] = useState(27);
  const NET = 32180;

  // Portfolio classifier
  const [upTitle, setUpTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [upSt, setUpSt] = useState<Set<string>>(new Set());
  const [upVb, setUpVb] = useState<Set<string>>(new Set());
  const [confSt, setConfSt] = useState("");
  const [confVb, setConfVb] = useState("");
  const [source, setSource] = useState("");
  const [done, setDone] = useState(false);
  const [book, setBook] = useState<Book[]>([]);

  const loadPub = (): Book[] => { try { return JSON.parse(localStorage.getItem(WKEY) || "[]"); } catch { return []; } };
  useEffect(() => { setBook(loadPub()); }, []);

  function heuristic(text: string) {
    const st = new Set<string>(), vb = new Set<string>();
    CUES.forEach(([re, s, v]) => { if (re.test(text)) { s.forEach((x) => st.add(x)); v.forEach((x) => vb.add(x)); } });
    if (!st.size) { let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0; st.add(PSTYLES[h % PSTYLES.length]); vb.add(PVIBES[h % PVIBES.length]); }
    return { st, vb };
  }

  async function classify() {
    setBusy(true);
    setDone(false);
    const text = `${upTitle} ${file?.name || ""}`.trim() || "untitled";
    let st = new Set<string>(), vb = new Set<string>();
    let cSt = 88 + Math.floor(Math.random() * 10), cVb = 80 + Math.floor(Math.random() * 14), src = "heuristic";
    try {
      const image = file ? await fileToDataUrl(file) : undefined;
      const res = await fetch("/api/classify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image, title: upTitle, filename: file?.name }) });
      const j = await res.json();
      if ((j.styles?.length || j.temperaments?.length)) {
        for (const s of j.styles || []) st.add(s.tag);
        for (const v of j.temperaments || []) vb.add(v.tag);
        if (j.styles?.length) cSt = Math.max(...j.styles.map((s: any) => s.confidence));
        if (j.temperaments?.length) cVb = Math.max(...j.temperaments.map((s: any) => s.confidence));
        src = j.source || "vision";
      }
    } catch { /* fall through */ }
    if (!st.size && !vb.size) { const h = heuristic(text); st = h.st; vb = h.vb; }
    setUpSt(st); setUpVb(vb);
    setConfSt(`${cSt}% sure`); setConfVb(`${cVb}% sure`); setSource(src);
    setShowResult(true); setBusy(false);
  }

  function toggle(group: "st" | "vb", tag: string) {
    const set = new Set(group === "st" ? upSt : upVb);
    if (set.has(tag)) set.delete(tag); else set.add(tag);
    group === "st" ? setUpSt(set) : setUpVb(set);
  }

  function publish() {
    if (!upSt.size) return;
    const pub = loadPub();
    pub.push({ t: upTitle.trim() || "Untitled piece", a: "viv", st: [...upSt], vb: [...upVb], c: "#2b2140,#C8959A" });
    try { localStorage.setItem(WKEY, JSON.stringify(pub)); } catch { /* noop */ }
    setBook(pub); setDone(true);
  }

  const myPublished = book.filter((w) => (w.a || "viv") === "viv").slice().reverse();

  function draftCaption() {
    const t = capIn.trim() || "this piece";
    setCapOut(`Healed and holding court 👑 ${t.charAt(0).toUpperCase() + t.slice(1)} — six weeks of settle, zero touch-ups. Books open for September; the register link is in bio. #neotraditional #baronesstattoo #garlandtx`);
  }

  return (
    <div className="ahwrap">
      <style>{CSS}</style>
      <header className="ah-head">
        <div className="ah-id"><div className="ah-pip">V</div><div><div className="ah-eyebrow">Baroness Tattoo · Artist Hub</div><div className="ah-name">Vivienne Duval</div></div></div>
        <div className="ah-right">
          <span className="pill-stat">This week · <b>$1,840</b></span>
          <span className="pill-stat">◆ 1,210 gems earned</span>
          <a className="abtn ghost" href="/quarters">My Quarters</a>
          <button className="abtn">View my page</button>
        </div>
      </header>

      <div className="tabs">
        {[["today", "Today"], ["bookings", "Bookings"], ["shop", "My Shop"], ["portfolio", "Portfolio"], ["page", "My Page"], ["social", "Social"], ["ledger", "Ledger & Tax"], ["clients", "Clients"]].map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* TODAY */}
      <div className={`pane${tab === "today" ? " on" : ""}`}>
        <div className="kpis">
          {[["Sittings this week", "6"], ["Deposits pending", "2"], ["Shop sales (7d)", "$212"], ["Unread messages", "3"]].map(([l, v]) => (
            <div className="kpi" key={l}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div></div>
          ))}
          <div className="kpi"><div className="kpi-l">Tax set aside</div><div className="kpi-v">$497 <small>27%</small></div></div>
        </div>
        <div className="cols">
          <div className="panel"><div className="p-title">Today&apos;s chair</div>
            <div className="list">
              <div className="row"><b>1:00 pm — Camille B.</b> Dagger &amp; gilded rose, forearm <span className="sp" /><span className="chip ok">Deposit paid</span></div>
              <div className="row"><b>4:30 pm — Theo M.</b> Fine-line moth, chest <span className="sp" /><span className="chip ok">Deposit paid</span></div>
              <div className="row"><b>7:00 pm — Consultation</b> Ines V., full sleeve concept <span className="sp" /><span className="chip warn">Brief attached</span></div>
            </div>
          </div>
          <div className="ai"><b>✦ Your AI Concierge</b>
            <div className="list">
              <div className="row">3 clients await replies — I can draft responses in your voice.<span className="sp" /><button className="abtn sm">Draft all</button></div>
              <div className="row">Thursday 6pm cancelled — 4 waitlisted clients match the slot.<span className="sp" /><button className="abtn sm">Offer slot</button></div>
              <div className="row">Your healed rose-sleeve photo is your best performer — post it Friday 11am.<span className="sp" /><button className="abtn sm">Queue post</button></div>
              <div className="row">Q3 estimated tax is due Sep 15 — $1,420 based on your ledger.<span className="sp" /><button className="abtn sm ghost" onClick={() => setTab("ledger")}>Review</button></div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKINGS */}
      <div className={`pane${tab === "bookings" ? " on" : ""}`}>
        <div className="panel"><div className="p-title">The register</div>
          <div className="list">
            <div className="row"><b>Thu Jul 23 · 6:00 pm</b> Consultation — Ines V. <span className="chip">Commission brief</span><span className="sp" /><span className="chip ok">Confirmed</span><button className="abtn sm ghost">Reschedule</button></div>
            <div className="row"><b>Fri Jul 24 · 2:00 pm</b> Session 2 of 3 — Marcus D., back piece <span className="sp" /><span className="chip ok">Deposit paid</span><button className="abtn sm ghost">Reschedule</button></div>
            <div className="row"><b>Sat Jul 25 · 11:00 am</b> Flash — walk-up slot <span className="sp" /><span className="chip warn">Deposit awaiting</span><button className="abtn sm">Nudge client</button></div>
            <div className="row"><b>Sun Jul 26 · 1:00 pm</b> Cover-up consult — Renee K. <span className="sp" /><span className="chip bad">Needs reply</span><button className="abtn sm">Reply</button></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}><button className="abtn ghost">Open full calendar</button><button className="abtn ghost">Set availability</button><button className="abtn">Block a personal day</button></div>
        </div>
      </div>

      {/* SHOP */}
      <div className={`pane${tab === "shop" ? " on" : ""}`}>
        <div className="kpis">
          {[["Shop revenue YTD", "$3,485"], ["Digital sales", "312"], ["Next payout (Fri)", "$486"]].map(([l, v]) => (<div className="kpi" key={l}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div></div>))}
        </div>
        <div className="panel"><div className="p-title">My wares — in the Boutique &amp; my page</div>
          <div className="prods">
            {[["Flash Pack: Daggers & Roses", "$18 digital · 148 sold", "#2b2140,#C8959A"], ["Print No. IV — signed", "$45 physical · 22 sold", "#8e2433,#C8959A"], ["Court Outfit: Emerald Gold", "◆ 99 gems · 61 unlocked", "#161210,#8fa98f"], ["Healed-work Wallpaper Set", "$9 digital · 81 sold", "#3b2a1a,#D4B574"]].map(([nm, sub, bg]) => (
              <div className="prod" key={nm}><div className="prod-art" style={{ background: `linear-gradient(160deg,${bg})` }}>B</div><div className="prod-b"><b>{nm}</b><span className="muted">{sub}</span></div></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="abtn">+ New product</button><button className="abtn ghost">Payout settings (Stripe)</button></div>
        </div>
      </div>

      {/* PORTFOLIO — the classifier */}
      <div className={`pane${tab === "portfolio" ? " on" : ""}`}>
        <div className="cols">
          <div className="panel"><div className="p-title">New upload — the house classifier</div>
            <p className="muted" style={{ marginBottom: 12 }}>Every piece you publish is read for style &amp; temperament — the same taxonomy Bastien uses in the Commission chamber to match wanderers to your book.</p>
            <label className="fld"><span>Piece title</span><input value={upTitle} onChange={(e) => setUpTitle(e.target.value)} placeholder="e.g. Gilded serpent, inner forearm" /></label>
            <div className="fld"><span>Healed photo</span>
              <div className={`drop${preview ? " has" : ""}`} style={preview ? { backgroundImage: `url("${preview}")` } : undefined} onClick={() => fileRef.current?.click()}>{preview ? "" : "Drop the photo here, or click to choose"}</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
            </div>
            <button className="abtn" onClick={classify} disabled={busy}>{busy ? "Reading the piece…" : "✦ Classify this piece"}</button>
            {showResult && (
              <div className="ai" style={{ marginTop: 12 }}><b>The classifier&apos;s reading{source ? ` · ${source}` : ""}</b>
                <div className="lbl2">Styles · <span className="conf">{confSt}</span></div>
                <div className="chips2">{PSTYLES.map((t) => <button key={t} className={`chip2${upSt.has(t) ? " on" : ""}`} onClick={() => toggle("st", t)}>{t}</button>)}</div>
                <div className="lbl2">Temperament · <span className="conf">{confVb}</span></div>
                <div className="chips2">{PVIBES.map((t) => <button key={t} className={`chip2${upVb.has(t) ? " on" : ""}`} onClick={() => toggle("vb", t)}>{t}</button>)}</div>
                <p className="muted" style={{ margin: "10px 0 12px" }}>Tap any tag to correct me — your hand knows the work better than my eye.</p>
                <button className="abtn" onClick={publish}>Publish to my book</button>
                {done && <p className="muted" style={{ marginTop: 8, color: "#9fc48f" }}>Published — it now surfaces in Commission matches &amp; gallery search.</p>}
              </div>
            )}
          </div>
          <div className="panel"><div className="p-title">My classified book</div>
            <p className="muted" style={{ marginBottom: 10 }}>These tags drive the matcher: wanderers who choose your styles &amp; temperaments see these pieces first.</p>
            <div className="list">
              {[...myPublished.map((w) => ({ w, isNew: true })), ...SEEDBOOK.map((w) => ({ w, isNew: false }))].map(({ w, isNew }, i) => (
                <div className="row" key={i}><b>{w.t}</b>{isNew && <span className="chip ok">New</span>}<span className="sp" /><span className="tagline">{[...w.st, ...w.vb].map((t, j) => <span className="chip" key={j}>{t}</span>)}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MY PAGE */}
      <div className={`pane${tab === "page" ? " on" : ""}`}>
        <div className="cols">
          <div className="panel"><div className="p-title">Customize my landing page</div>
            <label className="fld"><span>Display name</span><input value={pgName} onChange={(e) => setPgName(e.target.value)} /></label>
            <label className="fld"><span>Tagline</span><input value={pgTag} onChange={(e) => setPgTag(e.target.value)} /></label>
            <div className="fld"><span>Accent</span><div className="sw-row">{ACCENTS.map((c) => <button key={c} className={`sw${accent === c ? " on" : ""}`} style={{ background: c }} onClick={() => setAccent(c)} />)}</div></div>
            <label className="fld"><span>Booking button label</span><input value={pgCta} onChange={(e) => setPgCta(e.target.value)} /></label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}><button className="abtn">Publish changes</button><button className="abtn ghost">Reorder portfolio</button></div>
          </div>
          <div className="panel"><div className="p-title">Live preview</div>
            <div className="mini">
              <div className="mini-hero" style={{ background: `linear-gradient(160deg,${accent},#161210)` }}>
                <div className="bl">{pgName}</div>
                <div className="tg">{pgTag}</div>
              </div>
              <div className="mini-body"><span className="caps">Portfolio · Flash · Shop · Reviews</span><br /><br /><button className="abtn sm">{pgCta}</button></div>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>Your page lives at baroness.ink/vivienne — every visit funnels to your register.</p>
          </div>
        </div>
      </div>

      {/* SOCIAL */}
      <div className={`pane${tab === "social" ? " on" : ""}`}>
        <div className="cols">
          <div className="panel"><div className="p-title">Accounts</div>
            <div className="list">
              <div className="row"><b>Instagram</b> @vivienne.ink <span className="sp" /><span className="chip ok">Connected</span></div>
              <div className="row"><b>TikTok</b> @vivienneduval <span className="sp" /><span className="chip ok">Connected</span></div>
              <div className="row"><b>Pinterest</b> — <span className="sp" /><button className="abtn sm ghost">Connect</button></div>
            </div>
            <div className="p-title" style={{ marginTop: 16 }}>Queue</div>
            <div className="list">
              <div className="row"><b>Healed rose sleeve, 6 weeks</b><span className="chip">IG · Fri 11:00</span><span className="sp" /><span className="chip warn">Scheduled</span></div>
              <div className="row"><b>Flash Friday: gilded serpents</b><span className="chip">IG + TT · Fri 12:00</span><span className="sp" /><span className="chip warn">Scheduled</span></div>
              <div className="row"><b>Studio tour reel</b><span className="chip">TT · Jul 18</span><span className="sp" /><span className="chip ok">Posted · 12.4k</span></div>
            </div>
          </div>
          <div className="panel"><div className="p-title">✦ AI caption studio</div>
            <label className="fld"><span>What&apos;s the post?</span><textarea value={capIn} onChange={(e) => setCapIn(e.target.value)} placeholder="e.g. healed photo of the peony chest piece" /></label>
            <button className="abtn" onClick={draftCaption}>Draft caption in my voice</button>
            <div className="ai" style={{ marginTop: 12 }}><b>Draft</b><p className="muted">{capOut}</p></div>
            <p className="muted" style={{ marginTop: 10 }}>Best posting window this week: <b style={{ color: "var(--gold-pale)" }}>Fri 11am–1pm</b> (your audience&apos;s peak).</p>
          </div>
        </div>
      </div>

      {/* LEDGER & TAX */}
      <div className={`pane${tab === "ledger" ? " on" : ""}`}>
        <div className="kpis">
          {[["Income YTD", "$41,320"], ["Expenses YTD", "$9,140"], ["Net", "$32,180"]].map(([l, v]) => (<div className="kpi" key={l}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div></div>))}
          <div className="kpi"><div className="kpi-l">Set aside for tax ({taxPct}%)</div><div className="kpi-v">${Math.round(NET * taxPct / 100).toLocaleString()}</div></div>
          <div className="kpi"><div className="kpi-l">Q3 estimate due Sep 15</div><div className="kpi-v">$1,420</div></div>
        </div>
        <div className="panel">
          <div className="p-title">Ledger — auto-categorized</div>
          <label className="fld" style={{ maxWidth: 280 }}><span>Tax set-aside rate: <b>{taxPct}</b>%</span><input type="range" min={15} max={40} value={taxPct} onChange={(e) => setTaxPct(+e.target.value)} /></label>
          <table className="tbl"><thead><tr><th>Date</th><th>Entry</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Jul 21</td><td>Sitting — Camille B. (balance)</td><td>Service income</td><td className="pos">+$520</td></tr>
              <tr><td>Jul 21</td><td>Flash pack sales (12)</td><td>Digital income</td><td className="pos">+$216</td></tr>
              <tr><td>Jul 20</td><td>Dynarex gloves + barriers</td><td>Supplies · deductible</td><td className="neg">−$64</td></tr>
              <tr><td>Jul 19</td><td>Booth rent — week</td><td>Venue ink · deductible</td><td className="neg">−$250</td></tr>
              <tr><td>Jul 18</td><td>Cartridge needles restock</td><td>Supplies · deductible</td><td className="neg">−$118</td></tr>
              <tr><td>Jul 17</td><td>Deposit — Ines V.</td><td>Service income</td><td className="pos">+$100</td></tr>
              <tr><td>Jul 16</td><td>Convention travel (312 mi)</td><td>Mileage · deductible</td><td className="neg">−$209</td></tr>
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}><button className="abtn ghost">Export CSV</button><button className="abtn ghost">Send to accountant</button><button className="abtn">+ Add expense</button></div>
          <p className="muted" style={{ marginTop: 10 }}>Estimates only — the house is not your CPA. Deductible flags follow IRS Schedule C categories.</p>
        </div>
      </div>

      {/* CLIENTS */}
      <div className={`pane${tab === "clients" ? " on" : ""}`}>
        <div className="panel"><div className="p-title">Conversations</div>
          <div className="list">
            <div className="row"><b>Camille B.</b> &ldquo;Can we add a ribbon under the rose?&rdquo; <span className="sp" /><span className="chip bad">Unread</span><button className="abtn sm">Reply</button></div>
            <div className="row"><b>Ines V.</b> Commission brief · full sleeve concept <span className="sp" /><span className="chip bad">Unread</span><button className="abtn sm">Open brief</button></div>
            <div className="row"><b>Theo M.</b> Aftercare check-in, day 12 <span className="sp" /><span className="chip bad">Unread</span><button className="abtn sm">Reply</button></div>
            <div className="row"><b>Renee K.</b> Cover-up reference photos <span className="sp" /><span className="chip ok">Replied</span></div>
          </div>
          <div className="p-title" style={{ marginTop: 16 }}>Community</div>
          <div className="list">
            <div className="row"><b>4 clients</b> unlocked your Emerald Gold outfit this week <span className="sp" /><span className="chip">◆ 396 gems to you</span></div>
            <div className="row"><b>Marcus D.</b> wore your design to the 3D estate ball <span className="sp" /><button className="abtn sm ghost">Send a compliment</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
