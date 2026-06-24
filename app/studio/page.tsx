"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REGIONS = [
  { id: "head", label: "Head", x: 86, y: 8, w: 28, h: 28 },
  { id: "chest", label: "Chest", x: 74, y: 56, w: 52, h: 34 },
  { id: "torso", label: "Torso", x: 78, y: 92, w: 44, h: 40 },
  { id: "l-arm", label: "Left arm", x: 48, y: 56, w: 22, h: 48 },
  { id: "r-arm", label: "Right arm", x: 130, y: 56, w: 22, h: 48 },
  { id: "l-forearm", label: "Left forearm", x: 44, y: 106, w: 20, h: 44 },
  { id: "r-forearm", label: "Right forearm", x: 136, y: 106, w: 20, h: 44 },
  { id: "l-leg", label: "Left leg", x: 80, y: 136, w: 18, h: 70 },
  { id: "r-leg", label: "Right leg", x: 102, y: 136, w: 18, h: 70 },
];

const MOTIFS: Record<string, string> = {
  Rose: "M0,28 C-22,8 -10,-20 0,-6 C10,-20 22,8 0,28 Z",
  Heart: "M0,26 C-26,4 -16,-18 0,-4 C16,-18 26,4 0,26 Z",
  Star: "M0,-26 L7,-8 26,-8 11,4 17,24 0,12 -17,24 -11,4 -26,-8 -7,-8 Z",
  Dagger: "M0,-28 L4,-6 4,16 0,28 -4,16 -4,-6 Z M-10,-6 L10,-6",
};

export default function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const undoStack = useRef<string[]>([]);
  const [placement, setPlacement] = useState("");
  const [color, setColor] = useState("#1a1a1a");
  const [size, setSize] = useState(4);
  const [eraser, setEraser] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  function ctx() { return canvasRef.current?.getContext("2d") || null; }
  useEffect(() => { const c = ctx(); if (c && canvasRef.current) { c.fillStyle = "#fffdf6"; c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height); } }, []);

  function snapshot() { const cv = canvasRef.current; if (cv) { undoStack.current.push(cv.toDataURL()); if (undoStack.current.length > 25) undoStack.current.shift(); } }
  function pos(e: React.PointerEvent) { const cv = canvasRef.current!; const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) }; }
  function down(e: React.PointerEvent) { const c = ctx(); if (!c) return; snapshot(); drawing.current = true; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y); }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return; const c = ctx(); if (!c) return; const p = pos(e);
    c.lineCap = "round"; c.lineJoin = "round"; c.lineWidth = size;
    c.strokeStyle = eraser ? "#fffdf6" : color; if (eraser) c.lineWidth = size * 3;
    c.lineTo(p.x, p.y); c.stroke();
  }
  function up() { drawing.current = false; }
  function undo() { const prev = undoStack.current.pop(); const c = ctx(); const cv = canvasRef.current; if (prev && c && cv) { const img = new Image(); img.onload = () => c.drawImage(img, 0, 0); img.src = prev; } }
  function clear() { const c = ctx(); const cv = canvasRef.current; if (c && cv) { snapshot(); c.fillStyle = "#fffdf6"; c.fillRect(0, 0, cv.width, cv.height); } }
  function stamp(key: string) {
    const c = ctx(); const cv = canvasRef.current; if (!c || !cv) return; snapshot();
    c.save(); c.translate(cv.width / 2, cv.height / 2); c.scale(2.4, 2.4);
    c.strokeStyle = color; c.lineWidth = 2; c.lineCap = "round";
    const p = new Path2D(MOTIFS[key]); c.stroke(p); c.restore();
  }
  function uploadRef(file: File) {
    const c = ctx(); const cv = canvasRef.current; if (!c || !cv) return; snapshot();
    const img = new Image(); img.onload = () => { c.globalAlpha = 0.4; const s = Math.min(cv.width / img.width, cv.height / img.height); const w = img.width * s, h = img.height * s; c.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h); c.globalAlpha = 1; };
    img.src = URL.createObjectURL(file);
  }
  function exportStencil() {
    const cv = canvasRef.current; if (!cv) return;
    const off = document.createElement("canvas"); off.width = cv.width; off.height = cv.height;
    const oc = off.getContext("2d")!; oc.drawImage(cv, 0, 0);
    const d = oc.getImageData(0, 0, off.width, off.height); const px = d.data;
    for (let i = 0; i < px.length; i += 4) { const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; const v = lum < 150 ? 0 : 255; px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255; }
    oc.putImageData(d, 0, 0);
    const a = document.createElement("a"); a.href = off.toDataURL("image/png"); a.download = `baroness-stencil${placement ? "-" + placement : ""}.png`; a.click();
  }
  async function save() {
    const cv = canvasRef.current; if (!cv) return;
    setBusy(true); setStatus("Saving…");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); setStatus("Sign in (Quarters) to save your design."); return; }
    const blob: Blob | null = await new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
    if (!blob) { setBusy(false); setStatus("Could not read the canvas."); return; }
    const path = `${user.id}/${Date.now()}.png`;
    const up = await supabase.storage.from("designs").upload(path, blob, { upsert: true, contentType: "image/png" });
    if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
    const url = supabase.storage.from("designs").getPublicUrl(path).data.publicUrl;
    const { data: ins, error } = await supabase.from("designs").insert({ user_id: user.id, title: title.trim() || "Untitled design", placement: placement || null, image_url: url }).select("id").single();
    setBusy(false);
    if (error) { setStatus(`Error: ${error.message}`); return; }
    setSavedId(ins.id); setStatus("Saved to your designs — now export it to wear on your avatar.");
  }
  async function exportToAvatar() {
    if (!savedId) { setStatus("Save your design first."); return; }
    setBusy(true); setStatus("Opening secure checkout…");
    try {
      const r = await fetch("/api/checkout-design", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ designId: savedId }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setStatus(d.error || "Could not start checkout.");
    } catch { setStatus("Could not start checkout."); }
    setBusy(false);
  }
  async function aiGenerate() {
    if (!aiPrompt.trim()) return;
    setBusy(true); setStatus("Summoning a design…");
    try {
      const r = await fetch("/api/ai-tattoo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt }) });
      const d = await r.json();
      if (d.image) {
        const c = ctx(); const cv = canvasRef.current!;
        snapshot(); const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => { const s = Math.min(cv.width / img.width, cv.height / img.height); const w = img.width * s, h = img.height * s; c!.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h); };
        img.src = d.image; setStatus("Design placed — refine it by hand.");
      } else setStatus(d.error || "AI design isn't available yet.");
    } catch { setStatus("AI design isn't available yet."); }
    setBusy(false);
  }

  const tool: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 10, letterSpacing: ".08em", padding: "8px 10px", borderRadius: 3, cursor: "pointer", border: "1px solid var(--gold-dark)", background: "#fdf6e7", color: "var(--gold-dark)" };
  return (
    <main className="wrap" style={{ maxWidth: 960 }}>
      <p style={{ marginBottom: 12 }}><a href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← The Estate</a></p>
      <h1 style={{ fontSize: 44 }}>The Tattoo Atelier</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 18px" }}>Design · place · export a stencil</p>

      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div className="card" style={{ flex: "0 0 auto" }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Placement</h3>
          <svg viewBox="0 0 200 210" width="200" height="210" style={{ background: "#efe3c6", borderRadius: 8 }}>
            <g fill="#cdbfa0">
              <circle cx="100" cy="22" r="14" /><rect x="78" y="38" width="44" height="8" rx="4" />
              <rect x="74" y="46" width="52" height="86" rx="14" /><rect x="50" y="50" width="20" height="56" rx="10" /><rect x="130" y="50" width="20" height="56" rx="10" />
              <rect x="46" y="100" width="18" height="52" rx="9" /><rect x="136" y="100" width="18" height="52" rx="9" />
              <rect x="80" y="130" width="18" height="76" rx="9" /><rect x="102" y="130" width="18" height="76" rx="9" />
            </g>
            {REGIONS.map((r) => (
              <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} rx="5" onClick={() => setPlacement(r.label)}
                fill={placement === r.label ? "rgba(184,146,74,.5)" : "rgba(184,146,74,0)"} stroke={placement === r.label ? "#8b6f35" : "transparent"} style={{ cursor: "pointer" }}>
                <title>{r.label}</title>
              </rect>
            ))}
          </svg>
          <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 6 }}>{placement ? `Placing on: ${placement}` : "Tap a body area"}</p>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setEraser(false); }} title="Colour" />
            <label style={{ fontSize: 12 }}>Size <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
            <button style={{ ...tool, background: eraser ? "var(--gold)" : "#fdf6e7", color: eraser ? "#1a1a1a" : "var(--gold-dark)" }} onClick={() => setEraser((v) => !v)}>Eraser</button>
            <button style={tool} onClick={undo}>Undo</button>
            <button style={tool} onClick={clear}>Clear</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {Object.keys(MOTIFS).map((m) => <button key={m} style={tool} onClick={() => stamp(m)}>+ {m}</button>)}
            <label style={{ ...tool }}>Trace image<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadRef(e.target.files[0])} /></label>
          </div>
          <canvas ref={canvasRef} width={360} height={460} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
            style={{ width: "100%", maxWidth: 360, touchAction: "none", border: "1px solid var(--gold)", borderRadius: 6, background: "#fffdf6", cursor: "crosshair" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 12 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design title" style={{ flex: 1, minWidth: 140, padding: "9px 11px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 15 }} />
            <button className="btn" onClick={save} disabled={busy}>Save</button>
            <button className="btn ghost" onClick={exportStencil}>Export stencil</button>
            {savedId && <button className="btn" onClick={exportToAvatar} disabled={busy} title="Wear this design on your 3D/2D avatar and showcase it on your profile">Export to my avatar ($8)</button>}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="AI: describe a design (e.g., rococo filigree heart)" style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 14 }} />
            <button className="btn ghost" onClick={aiGenerate} disabled={busy}>✦ AI</button>
          </div>
          {status && <p style={{ marginTop: 8, color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</p>}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 16 }}>Stencil export converts your design to clean black-and-white lines you can take to your artist. Saved designs live in your account.</p>
    </main>
  );
}
