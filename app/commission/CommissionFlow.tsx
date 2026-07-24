"use client";

// The Commission — the $100-deposit conversion flow (ported from the design kit).
// 4 steps: style quiz + live matcher (merges works published via the Artist Hub
// classifier), artist match, brief, reserve. Reynard/Bastien narrates as a
// photoreal talking bust (typed speech, viseme lip-sync, blinks) with an SVG
// doll fallback. Tokens come from globals.css; kit CSS is scoped under .cmwrap.

import { useCallback, useEffect, useRef, useState } from "react";
import { loadState } from "@/lib/state";

const QSTYLES = [
  "Traditional", "Neo-Traditional", "Realism", "Fine Line", "Blackwork",
  "Japanese", "Watercolor", "Geometric", "Chicano", "Dark Fantasy",
];
const TEMPERAMENTS = ["Delicate", "Bold", "Dark", "Ornate", "Minimal"];

type Artist = { id: string; n: string; spec: string; c1: string; c2: string; styles: string[] };
const ARTISTS: Artist[] = [
  { id: "viv", n: "Vivienne Duval", spec: "Neo-traditional · florals & daggers", c1: "#2b2140", c2: "#C8959A", styles: ["Neo-Traditional", "Traditional", "Dark Fantasy"] },
  { id: "mar", n: "Marceline Roux", spec: "Fine line · ornamental & script", c1: "#3b2a1a", c2: "#D4B574", styles: ["Fine Line", "Geometric", "Blackwork"] },
  { id: "ode", n: "Odette Lachaise", spec: "Realism · portraits & fauna", c1: "#161210", c2: "#8fa98f", styles: ["Realism", "Japanese", "Chicano"] },
];

type Work = { t: string; a: string; st: string[]; vb: string[]; c: string };
const WORKS_BASE: Work[] = [
  { t: "Dagger through gilded rose", a: "viv", st: ["Neo-Traditional", "Traditional"], vb: ["Bold", "Ornate"], c: "#8e2433,#2b2140" },
  { t: "Thorned peony chest piece", a: "viv", st: ["Neo-Traditional", "Dark Fantasy"], vb: ["Dark", "Bold"], c: "#2b2140,#C8959A" },
  { t: "Serpent & candelabra", a: "viv", st: ["Dark Fantasy", "Blackwork"], vb: ["Dark", "Ornate"], c: "#161210,#8B6F35" },
  { t: "Filigree sternum ornament", a: "mar", st: ["Fine Line", "Geometric"], vb: ["Delicate", "Ornate"], c: "#3b2a1a,#D4B574" },
  { t: "Single-needle script collar", a: "mar", st: ["Fine Line"], vb: ["Delicate", "Minimal"], c: "#241c16,#e9e2d4" },
  { t: "Sacred geometry forearm band", a: "mar", st: ["Geometric", "Blackwork"], vb: ["Minimal", "Bold"], c: "#131019,#B8924A" },
  { t: "Portrait of a matriarch", a: "ode", st: ["Realism"], vb: ["Bold", "Dark"], c: "#170f0a,#8fa98f" },
  { t: "Koi through storm water", a: "ode", st: ["Japanese", "Realism"], vb: ["Bold", "Ornate"], c: "#2a3f63,#C8959A" },
  { t: "Payasa & roses, b&g", a: "ode", st: ["Chicano", "Realism"], vb: ["Dark", "Ornate"], c: "#232028,#a5987f" },
  { t: "Watercolor moth study", a: "viv", st: ["Watercolor"], vb: ["Delicate"], c: "#2f8f86,#C8959A" },
];

const SLOTS: [string, boolean][] = [
  ["Thu 6:00 pm", true], ["Thu 7:30 pm", false], ["Fri 2:00 pm", true], ["Fri 5:00 pm", true],
  ["Sat 11:00 am", false], ["Sat 2:00 pm", true], ["Sat 4:30 pm", true], ["Sun 1:00 pm", true],
];

const LINES: [string, string][] = [
  ["Welcome. I am Bastien, keeper of this house. Tell me what moves you, and I shall find the hand to match it.", "neutral"],
  ["Ah — excellent taste. These three artists suit your leanings; choose whose portfolio calls to you.", "intrigued"],
  ["Very good. Give me the particulars — placement, scale, budget — and I will carry them to the chambers.", "pleased"],
  ["Nearly done. Choose your hour; a modest deposit and the chair is yours.", "pleased"],
];

const BUSTS = ["rig-portrait", "caucasian", "black", "latino", "eastasian", "southasian", "middleeastern"];
const LIDS: Record<string, [string, string]> = {
  "rig-portrait": ["#c08a5e", "#a06f47"], caucasian: ["#e0b795", "#c39a76"], black: ["#54382a", "#3d2818"],
  latino: ["#c08a5e", "#a06f47"], eastasian: ["#e2b483", "#c29465"], southasian: ["#93613e", "#7a4e30"], middleeastern: ["#c08a5e", "#a06f47"],
};

function viseme(ch: string) {
  if (/[mbp]/i.test(ch)) return "m-closed";
  if (/[ow]/i.test(ch)) return "m-round";
  if (/[aeiu]/i.test(ch)) return "m-open";
  if (/[a-z]/i.test(ch)) return "m-mid";
  return "m-closed";
}

const CSS = `
.cmwrap{max-width:1200px;margin:0 auto;padding:26px 22px 70px}
.cmwrap .cm-head{text-align:center;margin-bottom:18px}
.cmwrap .cm-eyebrow{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:var(--track-caps-wider);text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.cmwrap .cm-title{font-family:var(--display);font-size:40px;color:var(--cream);font-weight:600;line-height:var(--leading-tight)}
.cmwrap .steps{display:flex;justify-content:center;gap:6px;margin:16px 0 22px;flex-wrap:wrap}
.cmwrap .stp{display:flex;gap:8px;align-items:center;font-family:var(--caps);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--quarter-muted);border:1px solid rgba(184,146,74,.25);border-radius:var(--radius-pill);padding:7px 15px}
.cmwrap .stp b{width:18px;height:18px;border-radius:50%;border:1px solid rgba(184,146,74,.5);display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:var(--gold)}
.cmwrap .stp.on{color:var(--gold-pale);border-color:var(--gold)}
.cmwrap .stp.on b{background:var(--gilt);color:var(--black);border-color:var(--gold-dark)}
.cmwrap .stp.done b{background:rgba(184,146,74,.3)}
.cmwrap .cm-grid{display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:start}
@media(max-width:900px){.cmwrap .cm-grid{grid-template-columns:1fr}}
.cmwrap .butler-panel{position:sticky;top:20px;border:1px solid rgba(184,146,74,.35);border-radius:var(--radius-tile);overflow:hidden;background:var(--velvet-door);box-shadow:var(--shadow-tile)}
.cmwrap .butler-stage{position:relative;padding:20px 20px 4px;display:flex;justify-content:center;background:radial-gradient(240px 180px at 50% 34%,rgba(255,200,110,.16),transparent 70%)}
.cmwrap .butler-frame{width:240px;border-radius:120px 120px 12px 12px;border:2px solid var(--gold);box-shadow:var(--frame-inset),var(--glow-gold);overflow:hidden;background:linear-gradient(180deg,#1c1410,#0d0a08)}
.cmwrap #butlerSvg{display:block;width:100%;animation:cmsway 6s ease-in-out infinite}
@keyframes cmsway{0%,100%{transform:rotate(-.6deg)}50%{transform:rotate(.6deg)}}
.cmwrap .butler-pick{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:10px 8px 2px}
.cmwrap .bp{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.2);padding:0;background-size:230%;background-position:center 14%;background-color:#2a2118;font-size:13px;color:var(--gold-pale)}
.cmwrap .bp.on{border-color:var(--gold-pale);box-shadow:0 0 0 2px rgba(184,146,74,.5)}
.cmwrap .photo-rig{position:relative;animation:cmsway 7.5s ease-in-out infinite;transform-origin:50% 85%}
.cmwrap .photo-rig img{width:100%;display:block}
.cmwrap .plid{position:absolute;width:10%;height:3.4%;border-radius:14% 14% 50% 50%/20% 20% 95% 95%;transform-origin:top;transform:scaleY(0);transition:transform .085s ease-in;border-bottom:1px solid rgba(30,15,8,.4);filter:blur(.3px)}
.cmwrap .blinking .plid{transform:scaleY(1)}
.cmwrap .halfblink .plid{transform:scaleY(.55)}
.cmwrap .halfblink .lid{transform:scaleY(.6)}
.cmwrap .pmouth{position:absolute;left:50%;top:51.8%;transform:translateX(-50%);width:10.5%;height:0;border-radius:48%/60%;background:radial-gradient(75% 70% at 50% 42%,#5a2f28 0%,#2a1512 55%,#1a0c0a 100%);box-shadow:inset 0 2px 4px rgba(0,0,0,.7),0 1px 2px rgba(90,40,30,.35);transition:height .06s ease-out,width .06s ease-out;filter:blur(.35px);overflow:hidden}
.cmwrap .pmouth::before{content:"";position:absolute;left:14%;right:14%;top:0;height:26%;border-radius:0 0 40% 40%;background:linear-gradient(180deg,#e8ded0,#c9bda9);opacity:0}
.cmwrap .m-open .pmouth::before{opacity:.92}
.cmwrap .m-mid .pmouth{height:2%}
.cmwrap .m-open .pmouth{height:4.2%}
.cmwrap .m-round .pmouth{height:3.6%;width:6.5%;border-radius:50%}
.cmwrap .plaque{margin:14px 18px 18px;border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-xl);background:linear-gradient(180deg,rgba(184,146,74,.1),rgba(184,146,74,.03));padding:13px 15px;min-height:104px}
.cmwrap .plaque b{font-family:var(--caps);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:5px}
.cmwrap #say{font-size:14px;font-style:italic;line-height:1.55;color:var(--quarter-text)}
.cmwrap #say::after{content:"▌";color:var(--gold);animation:cmblinkc 1s steps(1) infinite}
.cmwrap #say.donetalk::after{content:""}
@keyframes cmblinkc{50%{opacity:0}}
.cmwrap .brow{transition:transform .3s;transform-origin:center}
.cmwrap .lid{transform-origin:center;transform:scaleY(0);transition:transform .12s}
.cmwrap .blinking .lid{transform:scaleY(1)}
.cmwrap .exp-intrigued #browL{transform:translateY(-3.5px) rotate(-6deg)}
.cmwrap .exp-pleased #browL,.cmwrap .exp-pleased #browR{transform:translateY(-1.5px)}
.cmwrap .exp-regret #browL{transform:rotate(9deg) translateY(-1px)}
.cmwrap .exp-regret #browR{transform:rotate(-9deg) translateY(-1px)}
.cmwrap .mouth{display:none}
.cmwrap .m-closed .mouth-closed,.cmwrap .m-mid .mouth-mid,.cmwrap .m-open .mouth-open,.cmwrap .m-round .mouth-round{display:block}
.cmwrap .pane{display:none}.cmwrap .pane.on{display:block}
.cmwrap .panel{border:1px solid rgba(184,146,74,.28);border-radius:var(--radius-tile);padding:24px 26px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));box-shadow:0 10px 34px rgba(0,0,0,.3)}
.cmwrap .p-title{font-family:var(--display);font-size:24px;color:var(--cream);font-weight:600;margin-bottom:4px}
.cmwrap .p-sub{font-size:var(--text-fine);font-style:italic;color:var(--quarter-muted);margin-bottom:16px}
.cmwrap .lbl{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:var(--track-caps-wide);text-transform:uppercase;color:var(--gold);margin:16px 0 8px}
.cmwrap .chips{display:flex;gap:7px;flex-wrap:wrap}
.cmwrap .chip{font-family:var(--caps);font-size:10px;letter-spacing:.05em;text-transform:uppercase;padding:8px 14px;border-radius:var(--radius-pill);cursor:pointer;border:1px solid rgba(184,146,74,.45);background:transparent;color:#cbbfa4}
.cmwrap .chip.on{background:var(--gold);color:var(--black);border-color:var(--gold-dark)}
.cmwrap .cbtn{font-family:var(--caps);letter-spacing:var(--track-caps);text-transform:uppercase;font-size:var(--text-label);color:var(--black);background:var(--gilt);border:var(--border-gold-dark);padding:12px 22px;border-radius:var(--radius-xs);cursor:pointer}
.cmwrap .cbtn.ghost{background:transparent;color:var(--gold)}
.cmwrap .cbtn:disabled{opacity:.4;cursor:default}
.cmwrap .nav{display:flex;justify-content:space-between;margin-top:22px}
.cmwrap .artists{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.cmwrap .acard{border:1px solid rgba(184,146,74,.3);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.02);cursor:pointer;text-align:left;padding:0;transition:transform var(--dur-hover) var(--ease-tile)}
.cmwrap .acard:hover{transform:translateY(-3px)}
.cmwrap .acard.sel{border:2px solid var(--gold);box-shadow:var(--glow-gold)}
.cmwrap .acard-art{aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;font-family:var(--blackletter);font-size:38px;color:rgba(255,255,255,.85)}
.cmwrap .acard-body{padding:12px 14px}
.cmwrap .acard-name{font-family:var(--display);font-size:18px;color:var(--cream);font-weight:700}
.cmwrap .acard-spec{font-size:12px;font-style:italic;color:var(--quarter-muted);margin:2px 0 8px;display:block}
.cmwrap .match{display:inline-block;font-family:var(--caps);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-pale);border:1px solid rgba(184,146,74,.5);border-radius:var(--radius-pill);padding:3px 10px}
.cmwrap .match.hi{background:var(--gilt);color:var(--black);border-color:var(--gold-dark)}
.cmwrap .wks{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px}
.cmwrap .wk{border:1px solid rgba(184,146,74,.3);border-radius:10px;overflow:hidden;background:rgba(255,255,255,.02);text-align:left;padding:0;cursor:pointer;transition:transform var(--dur-hover) var(--ease-tile)}
.cmwrap .wk:hover{transform:translateY(-3px);box-shadow:var(--glow-gold)}
.cmwrap .wk-art{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-family:var(--blackletter);font-size:26px;color:rgba(255,255,255,.85)}
.cmwrap .wk-b{padding:8px 10px;font-size:12px}
.cmwrap .wk-b b{font-family:var(--display);font-size:14px;color:var(--cream);display:block}
.cmwrap .wk-b .by{font-size:10.5px;font-style:italic;color:var(--quarter-muted)}
.cmwrap .wk-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}
.cmwrap .wk-tag{font-family:var(--caps);font-size:7.5px;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-pill);padding:2px 7px;color:var(--gold)}
.cmwrap .grid2{display:grid;gap:12px;grid-template-columns:1fr 1fr}
@media(max-width:700px){.cmwrap .grid2{grid-template-columns:1fr}}
.cmwrap .fld{display:grid;gap:5px}
.cmwrap .fld>span{font-family:var(--caps);font-size:var(--text-label-xs);letter-spacing:.13em;text-transform:uppercase;color:var(--quarter-muted)}
.cmwrap .fld input,.cmwrap .fld select,.cmwrap .fld textarea{width:100%;padding:10px 12px;border:1px solid rgba(184,146,74,.4);border-radius:var(--radius-lg);background:rgba(13,11,18,.6);color:var(--quarter-text);font-size:var(--text-small);font-family:var(--body)}
.cmwrap .fld textarea{height:84px;resize:none}
.cmwrap .atelier-pull{display:flex;gap:12px;align-items:center;border:1px dashed rgba(184,146,74,.5);border-radius:var(--radius-xl);padding:12px 14px;margin-top:12px}
.cmwrap .atelier-pull .sq{width:52px;height:52px;border-radius:var(--radius-md);background:linear-gradient(160deg,var(--quarter-plum),var(--rose));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.cmwrap .atelier-pull p{font-size:12.5px;color:var(--quarter-muted);font-style:italic}
.cmwrap .slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.cmwrap .slot{font-family:var(--caps);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:11px 8px;border-radius:var(--radius-lg);cursor:pointer;border:1px solid rgba(184,146,74,.4);background:transparent;color:#cbbfa4;text-align:center}
.cmwrap .slot.on{background:var(--gilt);color:var(--black);border-color:var(--gold-dark)}
.cmwrap .slot.gone{opacity:.3;cursor:not-allowed;text-decoration:line-through}
.cmwrap .summary{border:1px solid rgba(184,146,74,.35);border-radius:var(--radius-xl);padding:16px 18px;margin-top:18px;background:rgba(184,146,74,.05)}
.cmwrap .sumrow{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid rgba(184,146,74,.15)}
.cmwrap .sumrow:last-child{border:none;font-weight:700;color:var(--gold-pale)}
.cmwrap .confetti{font-family:var(--display);font-size:28px;color:var(--gold-pale);text-align:center;margin:18px 0 6px}
`;

export default function CommissionFlow() {
  const [step, setStep] = useState(0);
  const [styles, setStyles] = useState<string[]>([]);
  const [vibe, setVibe] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [budget, setBudget] = useState("$300–$600");
  const [bust, setBust] = useState<string>("rig-portrait"); // "" => SVG doll
  const [livery, setLivery] = useState("");
  const [works, setWorks] = useState<Work[]>(WORKS_BASE);
  const [reserved, setReserved] = useState(false);

  // Bastien speech + expression
  const [say, setSay] = useState("");
  const [done, setDone] = useState(false);
  const [mouth, setMouth] = useState("m-closed");
  const [exp, setExp] = useState("neutral");
  const [blink, setBlink] = useState("");
  const talkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback((text: string, expr = "neutral") => {
    if (talkTimer.current) clearInterval(talkTimer.current);
    if (typeTimer.current) clearInterval(typeTimer.current);
    setExp(expr);
    setDone(false);
    setSay("");
    let i = 0;
    talkTimer.current = setInterval(() => { if (i < text.length) setMouth(viseme(text[i])); }, 80);
    typeTimer.current = setInterval(() => {
      if (i >= text.length) {
        if (typeTimer.current) clearInterval(typeTimer.current);
        if (talkTimer.current) clearInterval(talkTimer.current);
        setMouth("m-closed");
        setDone(true);
        return;
      }
      setSay((s) => s + text[i]);
      i++;
    }, 34);
  }, []);

  // blink loop
  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      const half = Math.random() < 0.35;
      setBlink(half ? "halfblink" : "blinking");
      to = setTimeout(() => setBlink(""), half ? 95 : 135);
    }, 2600 + Math.random() * 2200);
    return () => { clearInterval(id); clearTimeout(to); };
  }, []);

  // merge classifier-published works + appointed livery; opening line
  useEffect(() => {
    loadState<any[]>("artist-works", []).then((extra) => {
      const merged: Work[] = [];
      for (const w of extra || []) if (w && w.t && Array.isArray(w.st)) merged.push({ t: w.t, a: w.a || "viv", st: w.st, vb: w.vb || [], c: w.c || "#2b2140,#C8959A" });
      if (merged.length) setWorks([...merged, ...WORKS_BASE]);
    });
    loadState<any>("butler-skins", {}).then((bs) => {
      if (bs && bs.appointed) setLivery("Livery: " + String(bs.appointed).replace(/-/g, " "));
    });
    speak(LINES[0][0], LINES[0][1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(n: number) {
    setStep(n);
    speak(LINES[n][0], LINES[n][1]);
  }

  function toggleStyle(v: string) {
    if (styles.includes(v)) setStyles(styles.filter((x) => x !== v));
    else if (styles.length < 3) setStyles([...styles, v]);
    else { speak("Three at most, mon ami — restraint is its own art.", "regret"); }
  }

  function pickArtist(id: string, fromWork = false) {
    setArtist(id);
    const a = ARTISTS.find((x) => x.id === id)!;
    if (fromWork) { go(1); speak(`${a.n.split(" ")[0]}'s hand, then — her book already speaks your language.`, "pleased"); }
    else speak(`${a.n.split(" ")[0]} — a fine choice. Her book is honest and her linework finer still.`, "pleased");
  }

  // matcher
  const scoredWorks = (styles.length || vibe)
    ? works
        .map((w) => ({ ...w, sc: w.st.filter((s) => styles.includes(s)).length * 2 + (vibe && w.vb.includes(vibe) ? 1 : 0) }))
        .filter((w) => w.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 6)
    : [];

  const scoredArtists = ARTISTS
    .map((a) => ({ ...a, score: a.styles.filter((s) => styles.includes(s)).length }))
    .sort((a, b) => b.score - a.score);

  const artistName = artist ? ARTISTS.find((x) => x.id === artist)?.n : "—";
  const rootCls = `butler-frame ${mouth} exp-${exp} ${blink}`;

  return (
    <div className="cmwrap">
      <style>{CSS}</style>
      <header className="cm-head">
        <div className="cm-eyebrow">Baroness Tattoo · Begin Your Commission</div>
        <h1 className="cm-title">The Commission</h1>
        <div className="steps">
          {["Style", "Artist", "Brief", "Reserve"].map((label, i) => (
            <span key={label} className={`stp${i === step ? " on" : ""}${i < step ? " done" : ""}`}>
              <b>{i + 1}</b>{label}
            </span>
          ))}
        </div>
      </header>

      <div className="cm-grid">
        {/* Bastien */}
        <aside className="butler-panel">
          <div className="butler-stage">
            <div className={rootCls} id="frameRoot">
              {bust === "" ? (
                <DollSvg />
              ) : (
                <div className="photo-rig">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/bastien/${bust}.png`} alt="Bastien" />
                  <div className="plid" style={{ left: "36.3%", top: "33.5%", background: `linear-gradient(180deg,${(LIDS[bust] || LIDS["rig-portrait"])[0]},${(LIDS[bust] || LIDS["rig-portrait"])[1]})` }} />
                  <div className="plid" style={{ left: "55.8%", top: "33.5%", background: `linear-gradient(180deg,${(LIDS[bust] || LIDS["rig-portrait"])[0]},${(LIDS[bust] || LIDS["rig-portrait"])[1]})` }} />
                  <div className="pmouth" />
                </div>
              )}
            </div>
          </div>
          <div className="butler-pick" title="Choose your Bastien">
            {BUSTS.map((v) => (
              <button
                key={v}
                className={`bp${bust === v ? " on" : ""}`}
                title={`Bastien — ${v}`}
                style={{ backgroundImage: `url("/bastien/${v}.png")` }}
                onClick={() => { setBust(v); speak("At your service, mon cher. Shall we begin?", "pleased"); }}
              />
            ))}
            <button className={`bp${bust === "" ? " on" : ""}`} title="Animated doll (drawn)" onClick={() => { setBust(""); speak("The doll returns. How may I serve?", "pleased"); }}>✍</button>
          </div>
          <div className="plaque">
            <b>Bastien · House Butler</b>
            <div id="say" className={done ? "donetalk" : ""}>{say}</div>
            <div id="livery" style={{ marginTop: 8, fontFamily: "var(--caps)", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)" }}>{livery}</div>
          </div>
        </aside>

        <main>
          {/* Step 0 — Style */}
          <div className={`pane${step === 0 ? " on" : ""}`}>
            <div className="panel">
              <div className="p-title">What speaks to you?</div>
              <div className="p-sub">Choose up to three styles and a temperament — I shall match you to the right hand.</div>
              <div className="lbl">Styles</div>
              <div className="chips">
                {QSTYLES.map((s) => (
                  <button key={s} className={`chip${styles.includes(s) ? " on" : ""}`} onClick={() => toggleStyle(s)}>{s}</button>
                ))}
              </div>
              <div className="lbl">Temperament</div>
              <div className="chips">
                {TEMPERAMENTS.map((v) => (
                  <button key={v} className={`chip${vibe === v ? " on" : ""}`} onClick={() => setVibe(v)}>{v}</button>
                ))}
              </div>
              {(styles.length > 0 || vibe) && (
                <div style={{ marginTop: 4 }}>
                  <div className="lbl">From the house books — pieces that match</div>
                  <p style={{ fontSize: 12, fontStyle: "italic", color: "var(--quarter-muted)" }}>Every upload is classified by its artist with these same styles &amp; temperaments.</p>
                  <div className="wks">
                    {scoredWorks.length ? scoredWorks.map((w, i) => {
                      const ar = ARTISTS.find((x) => x.id === w.a)!;
                      return (
                        <button key={i} className="wk" title={`Commission ${ar.n}`} onClick={() => pickArtist(w.a, true)}>
                          <span className="wk-art" style={{ background: `linear-gradient(160deg,${w.c})` }}>B</span>
                          <span className="wk-b"><b>{w.t}</b><span className="by">by {ar.n}</span>
                            <span className="wk-tags">{[...w.st, ...w.vb].map((t, j) => <span key={j} className="wk-tag">{t}</span>)}</span>
                          </span>
                        </button>
                      );
                    }) : <p style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--quarter-muted)" }}>Nothing in the books matches yet — rare taste. Your artist will draw it custom.</p>}
                  </div>
                </div>
              )}
              <div className="nav"><span /><button className="cbtn" onClick={() => go(1)}>Meet your matches →</button></div>
            </div>
          </div>

          {/* Step 1 — Artist */}
          <div className={`pane${step === 1 ? " on" : ""}`}>
            <div className="panel">
              <div className="p-title">Your matches</div>
              <div className="p-sub">Ranked against your styles. Every artist reviews your brief personally.</div>
              <div className="artists">
                {scoredArtists.map((a, i) => {
                  const pct = styles.length ? Math.round(60 + (a.score / Math.max(styles.length, 1)) * 38) : 70;
                  return (
                    <button key={a.id} className={`acard${artist === a.id ? " sel" : ""}`} onClick={() => pickArtist(a.id)}>
                      <span className="acard-art" style={{ background: `linear-gradient(160deg,${a.c1},${a.c2})` }}>B</span>
                      <span className="acard-body">
                        <span className="acard-name">{a.n}</span>
                        <span className="acard-spec">{a.spec}</span>
                        <span className={`match${i === 0 && styles.length ? " hi" : ""}`}>{pct}% match</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="nav">
                <button className="cbtn ghost" onClick={() => go(0)}>← Style</button>
                <button className="cbtn" disabled={!artist} onClick={() => go(2)}>Compose the brief →</button>
              </div>
            </div>
          </div>

          {/* Step 2 — Brief */}
          <div className={`pane${step === 2 ? " on" : ""}`}>
            <div className="panel">
              <div className="p-title">The brief</div>
              <div className="p-sub">Everything your artist needs before the consultation.</div>
              <div className="grid2">
                <label className="fld"><span>Placement</span><select><option>Forearm — inner</option><option>Upper arm / half sleeve</option><option>Full sleeve</option><option>Chest</option><option>Back</option><option>Thigh</option><option>Ribs</option><option>Neck</option><option>Hand</option></select></label>
                <label className="fld"><span>Size</span><select defaultValue="Medium — 3–6&quot;"><option>Small — up to 3&quot;</option><option>Medium — 3–6&quot;</option><option>Large — 6–10&quot;</option><option>Extra large / multi-session</option></select></label>
                <label className="fld"><span>Budget</span><select value={budget} onChange={(e) => setBudget(e.target.value)}><option>$150–$300</option><option>$300–$600</option><option>$600–$1,200</option><option>$1,200+ / open</option></select></label>
                <label className="fld"><span>First tattoo?</span><select><option>No</option><option>Yes</option></select></label>
              </div>
              <label className="fld" style={{ marginTop: 12 }}><span>Describe the piece</span><textarea placeholder="Subject, meaning, references, must-haves…" /></label>
              <div className="atelier-pull"><div className="sq">✦</div><p><b style={{ color: "var(--gold-pale)" }}>Attach from the Atelier</b> — your saved design “Dagger &amp; Gilded Rose” will be included with this brief. <a href="/studio">Open the Atelier →</a></p></div>
              <div className="nav">
                <button className="cbtn ghost" onClick={() => go(1)}>← Artist</button>
                <button className="cbtn" onClick={() => go(3)}>Choose a time →</button>
              </div>
            </div>
          </div>

          {/* Step 3 — Reserve */}
          <div className={`pane${step === 3 ? " on" : ""}`}>
            <div className="panel">
              {reserved ? (
                <>
                  <div className="confetti">❦ The chair is yours ❦</div>
                  <p style={{ textAlign: "center", fontSize: 15, color: "var(--quarter-text)" }}>
                    Consultation with <b style={{ color: "var(--gold-pale)" }}>{artistName}</b> · {slot}<br />
                    <span style={{ fontSize: 13, color: "var(--quarter-muted)", fontStyle: "italic" }}>Deposit received. Your brief and Atelier design have been delivered to her chambers.</span>
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
                    <a className="cbtn ghost" href="/quarters" style={{ textDecoration: "none" }}>Visit your Quarters</a>
                    <a className="cbtn" href="/studio" style={{ textDecoration: "none" }}>Refine your design</a>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-title">Reserve your consultation</div>
                  <div className="p-sub">A $100 deposit holds the chair and counts toward your piece. Fully transferable, 48-hour notice.</div>
                  <div className="lbl">This week with <span style={{ color: "var(--gold-pale)" }}>{artistName}</span></div>
                  <div className="slots">
                    {SLOTS.map(([t, ok]) => (
                      <button key={t} className={`slot${ok ? "" : " gone"}${slot === t ? " on" : ""}`} disabled={!ok} onClick={() => setSlot(t)}>{t}</button>
                    ))}
                  </div>
                  <div className="summary">
                    <div className="sumrow"><span>Consultation (30 min)</span><span>Included</span></div>
                    <div className="sumrow"><span>Estimated piece</span><span>{budget}</span></div>
                    <div className="sumrow"><span>Deposit due today</span><span>$100</span></div>
                  </div>
                  <div className="nav">
                    <button className="cbtn ghost" onClick={() => go(2)}>← Brief</button>
                    <button className="cbtn" disabled={!slot} onClick={() => { setReserved(true); speak("Magnifique. I shall have the parlour warmed and the needles blessed. Your Quarters hold every detail.", "pleased"); }}>Reserve with $100 deposit</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// The drawn Bastien fallback (expression rig driven by the frame's exp-/m- classes).
function DollSvg() {
  return (
    <svg id="butlerSvg" viewBox="0 0 200 230">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ecc9a1" /><stop offset=".7" stopColor="#d8ab7c" /><stop offset="1" stopColor="#bf9066" /></linearGradient>
        <radialGradient id="cheek" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#c98a6a" stopOpacity=".5" /><stop offset="1" stopColor="#c98a6a" stopOpacity="0" /></radialGradient>
        <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2b20" /><stop offset="1" stopColor="#241c16" /></linearGradient>
        <radialGradient id="wig" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#f4f0e6" /><stop offset="1" stopColor="#c9c2b2" /></radialGradient>
      </defs>
      <path d="M28,230 L34,196 Q52,172 100,170 Q148,172 166,196 L172,230 Z" fill="url(#coat)" stroke="#8B6F35" strokeWidth="1.5" />
      <path d="M84,176 Q100,196 116,176 L112,230 L88,230 Z" fill="#f3efe4" />
      <path d="M92,182 Q100,192 108,182 M90,192 Q100,202 110,192 M92,202 Q100,210 108,202" stroke="#cfc8b6" fill="none" strokeWidth="2" />
      <path d="M60,200 Q66,186 78,180 M140,200 Q134,186 122,180" stroke="#B8924A" fill="none" strokeWidth="2" />
      <rect x="88" y="146" width="24" height="34" rx="10" fill="url(#skin)" />
      <g id="head">
        <ellipse cx="58" cy="112" rx="8" ry="12" fill="url(#skin)" /><ellipse cx="142" cy="112" rx="8" ry="12" fill="url(#skin)" />
        <path d="M100,44 Q144,44 144,100 Q144,138 126,154 Q113,165 100,165 Q87,165 74,154 Q56,138 56,100 Q56,44 100,44 Z" fill="url(#skin)" />
        <ellipse cx="74" cy="128" rx="12" ry="8" fill="url(#cheek)" /><ellipse cx="126" cy="128" rx="12" ry="8" fill="url(#cheek)" />
        <path d="M100,100 Q104,116 108,122 Q104,127 100,126" stroke="#a97c52" fill="none" strokeWidth="2" strokeLinecap="round" />
        <g id="wigG">
          <circle cx="58" cy="78" r="16" fill="url(#wig)" /><circle cx="142" cy="78" r="16" fill="url(#wig)" />
          <circle cx="55" cy="100" r="12" fill="url(#wig)" /><circle cx="145" cy="100" r="12" fill="url(#wig)" />
          <circle cx="56" cy="120" r="10" fill="url(#wig)" /><circle cx="144" cy="120" r="10" fill="url(#wig)" />
          <path d="M56,74 Q60,38 100,36 Q140,38 144,74 Q126,60 100,58 Q74,60 56,74 Z" fill="url(#wig)" />
          <circle cx="78" cy="48" r="13" fill="url(#wig)" /><circle cx="100" cy="44" r="14" fill="url(#wig)" /><circle cx="122" cy="48" r="13" fill="url(#wig)" />
        </g>
        <path id="browL" className="brow" d="M68,92 Q78,86 88,90" stroke="#7a6248" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path id="browR" className="brow" d="M112,90 Q122,86 132,92" stroke="#7a6248" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <g id="eyeL"><ellipse cx="79" cy="102" rx="9" ry="5.5" fill="#f6f1e6" /><circle cx="80" cy="102.5" r="4" fill="#5a3d26" /><circle cx="80" cy="102.5" r="1.8" fill="#1a1a1a" /><circle cx="81.4" cy="101" r="1" fill="#fff" /><ellipse className="lid" cx="79" cy="102" rx="9.4" ry="6" fill="url(#skin)" /></g>
        <g id="eyeR"><ellipse cx="121" cy="102" rx="9" ry="5.5" fill="#f6f1e6" /><circle cx="120" cy="102.5" r="4" fill="#5a3d26" /><circle cx="120" cy="102.5" r="1.8" fill="#1a1a1a" /><circle cx="121.4" cy="101" r="1" fill="#fff" /><ellipse className="lid" cx="121" cy="102" rx="9.4" ry="6" fill="url(#skin)" /></g>
        <g id="mouthG">
          <path className="mouth mouth-closed" d="M88,157 Q100,160 112,157" stroke="#8c5a44" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse className="mouth mouth-mid" cx="100" cy="158" rx="8" ry="4" fill="#5e3630" />
          <g className="mouth mouth-open"><ellipse cx="100" cy="159" rx="10" ry="7" fill="#4c2a26" /><path d="M92,155 Q100,158 108,155 L108,157 Q100,160 92,157 Z" fill="#f2ece0" /></g>
          <circle className="mouth mouth-round" cx="100" cy="158" r="5.5" fill="#4c2a26" />
        </g>
      </g>
    </svg>
  );
}
