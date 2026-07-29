"use client";

// The Kingdom (ported from the design kit). Six tabs: Court (Baroness dialogue,
// court cards, butler-livery shop), Legend, Missions, Hunt (reads the Estate's
// curiosity finds), Achievements, and the Royal Ledger. The ledger table is
// wired to /api/ledger, and unlocking a livery mints it as a token — closing
// SPEC_blockchain_token_ledger end-to-end. Shared localStorage keys match the
// contract (baroness-butler-skins, baroness-curiosities). Kit CSS scoped .kgwrap.

import { useCallback, useEffect, useState } from "react";
import { loadState, saveState } from "@/lib/state";
import { getWallet, applyGems } from "@/lib/wallet";

type Skin = { id: string; nm: string; free?: number; gems?: number; tier?: string };
const SKINS: Skin[] = [
  { id: "baroque-dandy", nm: "Baroque Dandy", free: 1 },
  { id: "powdered-rebel", nm: "Powdered Rebel", gems: 120 },
  { id: "rebel-black", nm: "Rebel — Black", gems: 120 },
  { id: "rebel-eastasian", nm: "Rebel — East Asian", gems: 120 },
  { id: "doll-latino", nm: "Doll — Latino", gems: 90 },
  { id: "doll-middleeastern", nm: "Doll — Middle Eastern", gems: 90 },
  { id: "doll-southasian", nm: "Doll — South Asian", gems: 90 },
  { id: "doll-eastasian", nm: "Doll — East Asian", gems: 90 },
  { id: "porcelain-doll", nm: "Porcelain Doll", gems: 180 },
  { id: "gothic-noir", nm: "Gothic Noir", tier: "Royal" },
];

const CURIOS: [string, string, string][] = [
  ["moth", "🦋", "It courts the candlelight"],
  ["cat", "🐈‍⬛", "It patrols the floors"],
  ["rat", "🐀", "It scurries the skirting"],
  ["bat", "🦇", "It hangs in the rafters"],
  ["spider", "🕷", "It descends on silk"],
  ["crow", "🐦‍⬛", "It keeps Her Grace's watch"],
  ["snail", "🐌", "It wears a tiny crown, and hurries for no one"],
];

const CHOICES: [string, string, boolean][] = [
  ["Ask about ink", "Ink is not decoration, darling — it is autobiography written in the only medium you cannot pawn. Choose your chapter carefully.", false],
  ["Ask about the kingdom", "This kingdom? I built it from needles and spite. Every room remembers a debt; every creature keeps a secret. Find all seven and I may tell you mine.", false],
  ["Ask about the court", "My artists are not employees. They are a court — each with their own chambers, their own ledgers, their own devotees. Cross none of them.", false],
  ["Present your avatar", "Bold. I like bold. Bastien — fetch the register. This one commissions today.", true],
];

const COURT: [string, string, string][] = [
  ["Vivienne Duval", "Mistress of Thorns", "linear-gradient(160deg,#2b2140,#C8959A)"],
  ["Marceline Roux", "The Fine Hand", "linear-gradient(160deg,#3b2a1a,#D4B574)"],
  ["Odette Lachaise", "Keeper of Likeness", "linear-gradient(160deg,#161210,#8fa98f)"],
  ["The Rook", "Her Grace's crow · knows where things are hidden", "linear-gradient(160deg,#0c0a08,#5a2f5a)"],
];

const ACH: [string, string, string, boolean][] = [
  ["🔔", "First Ring", "Entered the estate", false],
  ["✒️", "First Blood", "Completed a sitting", false],
  ["👗", "Dressed for Court", "Wore a Court garment", false],
  ["🕯", "Keeper of Flames", "Visited 30 days running", true],
  ["🐦‍⬛", "The Rook's Favorite", "All seven curiosities", true],
  ["♛", "Baron / Baroness", "Own 5 Royal items", true],
  ["🩸", "Bodysuit Sovereign", "Complete a multi-year project", true],
  ["🗝", "Chapter & Verse", "Unlock all lore chapters", true],
];

const SAMPLE_ROWS = [
  { item: "Emerald Gold gown", rarity: "Royal · 61/100", rare: true, prov: "brn:item:7f3a…c2", holder: "@camille", trade: "◆ 240" },
  { item: "Ivory Gilt gown", rarity: "Royal · 38/100", rare: true, prov: "brn:item:2b91…e8", holder: "@ines", trade: "◆ 310" },
  { item: "Crimson Cloak", rarity: "Noble · 112/250", rare: false, prov: "brn:item:9c04…a1", holder: "@marcus", trade: "◆ 95" },
  { item: "Vivienne flash №4 (1/1 skin right)", rarity: "Unique", rare: true, prov: "brn:design:44d7…f0", holder: "@theo", trade: "$180" },
];

type BS = { owned: string[]; appointed: string };

const CSS = `
.kgwrap{max-width:1200px;margin:0 auto;padding:26px 22px 80px}
.kgwrap .kg-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.kgwrap .kg-eyebrow{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:var(--track-caps-wider);text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.kgwrap .kg-title{font-family:var(--display);font-size:40px;color:var(--cream);font-weight:600;line-height:var(--leading-tight)}
.kgwrap .purse{display:flex;gap:8px}
.kgwrap .pill{border:1px solid rgba(184,146,74,.45);border-radius:var(--radius-pill);padding:8px 16px;font-family:var(--caps);font-size:var(--text-label-sm);letter-spacing:.08em;text-transform:uppercase;color:var(--gold-pale)}
.kgwrap .pill .rose{color:var(--rose)}
.kgwrap .tabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px}
.kgwrap .tab{border:1px solid rgba(184,146,74,.4);background:transparent;color:#cbbfa4;border-radius:var(--radius-pill);padding:8px 17px;font-family:var(--caps);font-size:var(--text-label-sm);letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.kgwrap .tab:hover{border-color:var(--gold);color:var(--gold-pale)}
.kgwrap .tab.on{background:var(--gilt);color:var(--black);border-color:var(--gold-dark);font-weight:700}
.kgwrap .panel{border:1px solid rgba(184,146,74,.25);border-radius:var(--radius-xl);padding:20px 22px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))}
.kgwrap .panel+.panel{margin-top:14px}
.kgwrap .p-title{font-family:var(--display);font-size:20px;color:var(--cream);font-weight:600;margin-bottom:8px}
.kgwrap .muted{color:var(--quarter-muted);font-size:var(--text-fine);font-style:italic}
.kgwrap .kbtn{font-family:var(--caps);letter-spacing:var(--track-caps);text-transform:uppercase;font-size:var(--text-label-sm);color:var(--black);background:var(--gilt);border:var(--border-gold-dark);padding:10px 16px;border-radius:var(--radius-xs);cursor:pointer}
.kgwrap .kbtn.ghost{background:transparent;color:var(--gold)}
.kgwrap .kbtn.sm{padding:7px 11px;font-size:10px}
.kgwrap .kbtn:disabled{opacity:.4;cursor:default}
.kgwrap .baroness{display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start}
@media(max-width:760px){.kgwrap .baroness{grid-template-columns:1fr}}
.kgwrap .throne{aspect-ratio:3/4;border-radius:140px 140px 12px 12px;border:2px solid var(--gold);box-shadow:var(--frame-inset),var(--glow-gold);background:linear-gradient(160deg,var(--quarter-plum),#0c0a08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.kgwrap .throne .bl{font-family:var(--blackletter);font-size:74px;color:var(--gold-pale);text-shadow:0 4px 20px rgba(0,0,0,.6)}
.kgwrap .throne .nm{font-family:var(--caps);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.kgwrap .dlg{border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-xl);background:linear-gradient(180deg,rgba(184,146,74,.1),rgba(184,146,74,.03));padding:16px 18px;min-height:96px;margin-bottom:12px}
.kgwrap .dlg b{font-family:var(--caps);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:6px}
.kgwrap .dlg p{font-size:15px;font-style:italic;line-height:1.55}
.kgwrap .choices{display:flex;gap:8px;flex-wrap:wrap}
.kgwrap .court-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px}
.kgwrap .cc{border:1px solid rgba(184,146,74,.3);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.02);text-align:center}
.kgwrap .cc-art{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:var(--blackletter);font-size:34px;color:rgba(255,255,255,.85);position:relative;overflow:hidden}
.kgwrap .cc-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 6%}
.kgwrap .cc-lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:rgba(12,10,8,.55)}
.kgwrap .cc-price{font-family:var(--caps);font-size:10px;letter-spacing:.1em;color:var(--gold-pale);background:rgba(0,0,0,.55);border:1px solid rgba(184,146,74,.5);border-radius:var(--radius-pill);padding:4px 11px}
.kgwrap .cc-price.g::before{content:"◆ ";color:var(--rose)}
.kgwrap .cc .kbtn{margin:0 8px 10px;width:calc(100% - 16px)}
.kgwrap .cc-b{padding:9px 10px;font-size:12px}
.kgwrap .cc-b b{font-family:var(--display);font-size:15px;color:var(--cream);display:block}
.kgwrap .list{display:grid;gap:8px}
.kgwrap .row{display:flex;gap:10px;align-items:center;border:1px solid rgba(184,146,74,.2);border-radius:10px;padding:11px 14px;background:rgba(255,255,255,.02);font-size:14px;flex-wrap:wrap}
.kgwrap .row b{color:var(--cream)}
.kgwrap .row .sp{flex:1}
.kgwrap .reward{font-family:var(--caps);font-size:10px;letter-spacing:.08em;color:var(--gold-pale)}
.kgwrap .reward::before{content:"◆ ";color:var(--rose)}
.kgwrap .bar{height:8px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden;flex:1;min-width:80px}
.kgwrap .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold-dark),var(--gold-pale))}
.kgwrap .ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:11px}
.kgwrap .ach{border:1px solid rgba(184,146,74,.3);border-radius:12px;padding:14px;text-align:center;background:rgba(255,255,255,.02)}
.kgwrap .ach.locked{opacity:.4;filter:grayscale(.6)}
.kgwrap .ach .em{font-size:26px}
.kgwrap .ach b{font-family:var(--display);font-size:15px;color:var(--cream);display:block;margin:6px 0 2px}
.kgwrap .ach span{font-size:11px;color:var(--quarter-muted);font-style:italic}
.kgwrap .hunt-row{display:flex;gap:10px;align-items:center;border:1px solid rgba(184,146,74,.2);border-radius:10px;padding:10px 14px;background:rgba(255,255,255,.02);font-size:14px}
.kgwrap .hunt-row.got{border-color:rgba(159,196,143,.4)}
.kgwrap .hunt-row .em{font-size:20px;width:28px;text-align:center}
.kgwrap .hunt-row.hidden-c .em{filter:brightness(0) invert(.4)}
.kgwrap .tiers{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px}
.kgwrap .tier{border:1px solid rgba(184,146,74,.35);border-radius:var(--radius-xl);padding:16px;text-align:center}
.kgwrap .tier.hot{background:linear-gradient(180deg,rgba(184,146,74,.14),rgba(184,146,74,.04));box-shadow:var(--glow-gold)}
.kgwrap .tier .tn{font-family:var(--caps);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.kgwrap .tier .tp{font-family:var(--display);font-size:28px;color:var(--gold-pale);margin:6px 0}
.kgwrap .tier .tp small{font-size:12px;color:var(--quarter-muted)}
.kgwrap .tier ul{list-style:none;font-size:12.5px;color:var(--quarter-muted);margin:8px 0 12px;display:grid;gap:4px}
.kgwrap .tbl{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
.kgwrap .tbl th{text-align:left;padding:7px 9px;border-bottom:1px solid rgba(184,146,74,.5);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);font-family:var(--caps)}
.kgwrap .tbl td{padding:7px 9px;border-bottom:1px solid rgba(184,146,74,.14)}
.kgwrap .mono{font-family:monospace;font-size:11px;color:var(--quarter-muted)}
.kgwrap .chip{display:inline-block;border:1px solid rgba(184,146,74,.45);border-radius:var(--radius-pill);padding:2px 9px;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-family:var(--caps)}
.kgwrap .chip.rare{color:var(--rose);border-color:rgba(200,149,154,.6)}
.kgwrap .chapter{border-left:2px solid var(--gold-dark);padding:4px 0 4px 16px;margin-bottom:16px}
.kgwrap .chapter h3{font-family:var(--display);font-size:19px;color:var(--cream)}
.kgwrap .chapter p{font-size:14px;line-height:1.6;color:var(--quarter-text);margin-top:4px}
.kgwrap .chapter.locked{opacity:.5}
.kgwrap .chapter.locked p{filter:blur(3px);user-select:none}
.kgwrap .pane{display:none}.kgwrap .pane.on{display:block}
`;

type Row = { item: string; rarity: string; rare: boolean; prov: string; holder: string; trade: string };

export default function Kingdom() {
  const [tab, setTab] = useState("court");
  const [gems, setGems] = useState(250);
  const [bSay, setBSay] = useState("So. Another soul at my gates, wearing borrowed skin. Approach — let me see what you intend to become.");
  const [bs, setBs] = useState<BS>({ owned: ["baroque-dandy"], appointed: "baroque-dandy" });
  const [found, setFound] = useState<string[]>([]);
  const [collected, setCollected] = useState<string[]>([]);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<Row[]>(SAMPLE_ROWS);
  const [uid, setUid] = useState("guest");

  const loadLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/ledger");
      const j = await res.json();
      const minted: Row[] = (j.records || []).map((r: any) => ({
        item: r.name,
        rarity: `${r.tier} · ${r.mintNumber}/${r.totalMinted}`,
        rare: r.tier === "Royal" || r.kind === "design-provenance",
        prov: `brn:${r.kind === "design-provenance" ? "design" : "item"}:${String(r.txRef).slice(2, 6)}…${String(r.txRef).slice(-2)}`,
        holder: `@${String(r.owner).slice(2, 8)}`,
        trade: "— fresh mint",
      }));
      setRows([...minted, ...SAMPLE_ROWS]);
    } catch { /* keep samples */ }
  }, []);

  useEffect(() => {
    loadState<BS>("butler-skins", { owned: ["baroque-dandy"], appointed: "baroque-dandy" })
      .then((v) => setBs({ owned: v.owned || ["baroque-dandy"], appointed: v.appointed || "baroque-dandy" }));
    loadState<string[]>("curiosities", []).then(setFound);
    loadState<string[]>("curio-rewards", []).then(setCollected);
    getWallet().then((w) => setGems(w.balance)); // server-authoritative balance
    let id = "";
    try { id = localStorage.getItem("baroness-uid") || ""; if (!id) { id = "u" + Math.random().toString(36).slice(2, 8); localStorage.setItem("baroness-uid", id); } } catch { id = "guest"; }
    setUid(id);
    loadLedger();
  }, [loadLedger]);

  function persistBs(next: BS) {
    setBs(next);
    saveState("butler-skins", next);
  }

  async function mintLivery(s: Skin) {
    try {
      await fetch("/api/ledger", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "livery", name: s.nm, series: "Butler Livery", ownerUserId: uid, tier: s.tier || "Noble", image: `/livery/${s.id}.png` }),
      });
      loadLedger();
    } catch { /* noop */ }
  }

  async function onSkin(s: Skin) {
    const owned = !!s.free || bs.owned.includes(s.id);
    if (owned) { persistBs({ ...bs, appointed: s.id }); return; }
    if (s.gems) {
      const bal = await applyGems(-s.gems, `livery:${s.id}`); // server refuses overspend
      if (bal === null) { setBSay("Not enough gems."); return; }
      setGems(bal);
      persistBs({ owned: [...bs.owned, s.id], appointed: s.id });
      mintLivery(s); // minted into the royal record
    } else setBSay(`Ascend to ${s.tier} tier in the Royal Ledger.`);
  }

  async function claim(key: string, amount: number) {
    if (claimed[key]) return;
    setClaimed((c) => ({ ...c, [key]: true }));
    const bal = await applyGems(amount, `mission:${key}`);
    if (bal !== null) setGems(bal);
  }

  // reward for each curiosity found in the Estate (collectable once)
  async function collectCurio(id: string) {
    if (collected.includes(id)) return;
    const next = [...collected, id];
    setCollected(next);
    saveState("curio-rewards", next);
    const bal = await applyGems(20, `hunt:${id}`);
    if (bal !== null) setGems(bal);
  }

  const rookGot = found.length >= 7;

  return (
    <div className="kgwrap">
      <style>{CSS}</style>
      <header className="kg-head">
        <div><div className="kg-eyebrow">Beyond the Estate Walls</div><h1 className="kg-title">The Kingdom of the Gilded Skin</h1></div>
        <div className="purse">
          <a className="pill" href="/wallet" style={{ textDecoration: "none" }}><span className="rose">◆</span> <b>{gems}</b> gems</a>
          <span className="pill">♛ <b>3</b> Crowns</span>
          <a className="pill" href="/" style={{ textDecoration: "none" }}>← The Estate</a>
        </div>
      </header>

      <div className="tabs">
        {[["court", "The Court"], ["legend", "The Legend"], ["missions", "Missions"], ["hunt", "The Hunt"], ["ach", "Achievements"], ["ledger", "Royal Ledger"]].map(([k, label]) => (
          <button key={k} className={`tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {/* COURT */}
      <div className={`pane${tab === "court" ? " on" : ""}`}>
        <div className="panel">
          <div className="baroness">
            <div className="throne"><div className="bl">B</div><div className="nm">The Baroness · Her Grace</div><span className="muted">Awaiting her Meshy portrait</span></div>
            <div>
              <div className="dlg"><b>The Baroness</b><p>{bSay}</p></div>
              <div className="choices">
                {CHOICES.map(([label, say, primary]) => (
                  <button key={label} className={`kbtn${primary ? "" : " ghost"} sm`} onClick={() => setBSay(say)}>{label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="court-grid">
            <div className="cc"><div className="cc-art" style={{ background: "#cfccc6" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/livery/baroque-dandy.png" alt="Bastien" /></div><div className="cc-b"><b>Bastien</b><span className="muted">House Butler · many faces, one loyalty</span></div></div>
            {COURT.map(([nm, role, bg]) => (
              <div className="cc" key={nm}><div className="cc-art" style={{ background: bg }}>{nm[0]}</div><div className="cc-b"><b>{nm}</b><span className="muted">{role}</span></div></div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ marginTop: 14 }}>
          <div className="p-title">The Butler&apos;s Wardrobe</div>
          <p className="muted" style={{ marginBottom: 12 }}>Appoint Bastien&apos;s livery — it follows him through every room. Skins unlock with gems or tier. Purchases are minted into the royal record.</p>
          <div className="court-grid">
            {SKINS.map((s) => {
              const owned = !!s.free || bs.owned.includes(s.id);
              const on = bs.appointed === s.id;
              return (
                <div className="cc" key={s.id}>
                  <div className="cc-art" style={{ background: "#cfccc6" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/livery/${s.id}.png`} alt={s.nm} loading="lazy" />
                    {!owned && (
                      <span className="cc-lock"><span style={{ fontSize: 18 }}>🔒</span>{s.gems ? <span className="cc-price g">{s.gems}</span> : <span className="cc-price">{s.tier} tier</span>}</span>
                    )}
                  </div>
                  <div className="cc-b"><b>{s.nm}</b><span className="muted">{on ? "Appointed · serving now" : owned ? "In the wardrobe" : s.tier ? "Tier exclusive" : "Butler livery"}</span></div>
                  <button className={`kbtn sm${on ? "" : " ghost"}`} onClick={() => onSkin(s)}>{on ? "✦ Serving" : owned ? "Appoint" : s.gems ? "Unlock" : "Requires " + s.tier}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className={`pane${tab === "legend" ? " on" : ""}`}>
        <div className="panel">
          <div className="p-title">The Legend, in chapters</div>
          <div className="chapter"><h3>I. The Needle &amp; the Crown</h3><p>Before she was the Baroness she was a girl in Garland with a stick-and-poke kit and an unpaid debt to a man who owned every tattoo chair in three counties. She paid it in linework. Then she bought his building.</p></div>
          <div className="chapter"><h3>II. The Estate Rises</h3><p>Gold-framed mirrors from an estate sale in New Orleans. Velvet by the bolt. Not a fluorescent light to be found. The house was a dare: that luxury and ink belonged in the same room.</p></div>
          <div className={`chapter${rookGot ? "" : " locked"}`}><h3>III. The Seven Curiosities {!rookGot && <span className="chip">Unlocks at Hunt 7/7</span>}</h3><p>The moth was first. It arrived the night the doors opened and never left the candlelight, and the Baroness said let it stay, everything in this house gets to keep its obsessions.</p></div>
          <div className="chapter locked"><h3>IV. The Rook&apos;s Debt <span className="chip rare">Royal tier</span></h3><p>Hidden chapter — the crow&apos;s bargain with Her Grace, and what it fetched from the old shop the night it burned.</p></div>
        </div>
      </div>

      {/* MISSIONS */}
      <div className={`pane${tab === "missions" ? " on" : ""}`}>
        <div className="panel">
          <div className="p-title">Daily errands</div>
          <div className="list">
            <div className="row"><b>Ring the bell</b> — enter the estate <span className="sp" /><span className="reward">10</span><button className="kbtn sm" disabled={!!claimed.bell} onClick={() => claim("bell", 10)}>{claimed.bell ? "Claimed" : "Claim"}</button></div>
            <div className="row"><b>Conjure a design</b> in the Atelier <span className="sp" /><span className="reward">25</span><a className="kbtn sm ghost" href="/studio" style={{ textDecoration: "none" }}>Go</a></div>
            <div className="row"><b>Compliment another patron&apos;s ink</b> <span className="sp" /><span className="reward">15</span><button className="kbtn sm ghost">Go</button></div>
          </div>
          <div className="p-title" style={{ marginTop: 16 }}>Weekly commissions</div>
          <div className="list">
            <div className="row"><b>Book a consultation</b> — the only mission that matters, darling <span className="sp" /><span className="reward">200</span><a className="kbtn sm" href="/commission" style={{ textDecoration: "none" }}>Begin</a></div>
            <div className="row"><b>Dress your avatar</b> in a Court garment <span className="bar"><i style={{ width: "100%" }} /></span><span className="reward">40</span><span className="chip">Done</span></div>
            <div className="row"><b>Find 3 curiosities</b> <span className="bar"><i style={{ width: `${Math.min(found.length / 3 * 100, 100)}%` }} /></span><span className="reward">60</span><button className="kbtn sm" disabled={found.length < 3 || !!claimed.hunt3} onClick={() => claim("hunt3", 60)}>{claimed.hunt3 ? "Claimed" : "Claim"}</button></div>
          </div>
        </div>
      </div>

      {/* HUNT */}
      <div className={`pane${tab === "hunt" ? " on" : ""}`}>
        <div className="panel">
          <div className="p-title">The Seven Curiosities <span className="muted">· {found.length}/7 found</span></div>
          <p className="muted" style={{ marginBottom: 12 }}>Living things roam the estate. Touch them where you find them — the Rook is keeping score. Finding all seven unlocks Chapter III.</p>
          <div className="list">
            {CURIOS.map(([id, em, hint]) => {
              const got = found.includes(id);
              const done = collected.includes(id);
              return (
                <div key={id} className={`hunt-row${got ? " got" : " hidden-c"}`}>
                  <span className="em">{em}</span>
                  <span style={{ flex: 1 }}>{got ? <><b style={{ color: "var(--cream)" }}>Found</b> — {hint.toLowerCase()}</> : hint + "…"}</span>
                  {got && (done
                    ? <span className="chip">◆ collected</span>
                    : <button className="kbtn sm" onClick={() => collectCurio(id)}>Collect ◆ 20</button>)}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}><a className="kbtn ghost" href="/" style={{ textDecoration: "none" }}>Go hunting in the Estate →</a></div>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className={`pane${tab === "ach" ? " on" : ""}`}>
        <div className="panel">
          <div className="p-title">Honours of the house</div>
          <div className="ach-grid">
            {ACH.map(([em, nm, desc, locked]) => {
              const isLocked = locked && !(nm === "The Rook's Favorite" && rookGot);
              return (
                <div key={nm} className={`ach${isLocked ? " locked" : ""}`}><span className="em">{em}</span><b>{nm}</b><span>{desc}</span></div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROYAL LEDGER */}
      <div className={`pane${tab === "ledger" ? " on" : ""}`}>
        <div className="panel">
          <div className="p-title">Memberships</div>
          <div className="tiers">
            <div className="tier"><div className="tn">Patron</div><div className="tp">Free</div><ul><li>Missions &amp; hunts</li><li>House wardrobe</li><li>Gems by deed</li></ul><button className="kbtn ghost sm">Current</button></div>
            <div className="tier hot"><div className="tn">Noble</div><div className="tp">$4.99<small>/mo</small></div><ul><li>Noble garments &amp; looks</li><li>2× mission gems</li><li>Monthly flash drop</li></ul><button className="kbtn sm">Ascend</button></div>
            <div className="tier"><div className="tn">Royal</div><div className="tp">$12<small>/mo</small></div><ul><li>All of Noble</li><li>Royal vault &amp; hidden lore</li><li>Priority booking window</li><li>Item trading rights</li></ul><button className="kbtn sm">Ascend</button></div>
          </div>
        </div>
        <div className="panel">
          <div className="p-title">Provenance ledger <span className="chip">Blockchain-ready</span></div>
          <p className="muted" style={{ marginBottom: 8 }}>Every scarce item carries a signed provenance record — mint, owner, trades. The record format maps 1:1 onto an on-chain token when you&apos;re ready; until then the house is custodian.</p>
          <table className="tbl"><thead><tr><th>Item</th><th>Rarity</th><th>Provenance</th><th>Holder</th><th>Last trade</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}><td>{r.item}</td><td><span className={`chip${r.rare ? " rare" : ""}`}>{r.rarity}</span></td><td className="mono">{r.prov}</td><td>{r.holder}</td><td>{r.trade}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="kbtn ghost sm">Browse the exchange</button><button className="kbtn ghost sm">My holdings</button></div>
        </div>
      </div>
    </div>
  );
}
