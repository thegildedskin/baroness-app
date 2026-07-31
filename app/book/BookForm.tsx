"use client";

import { useEffect, useMemo, useState } from "react";

export type BookArtist = { id: string; display_name: string; specialty: string | null; portrait_url: string | null };

const wrap: React.CSSProperties = { maxWidth: 640, margin: "0 auto", padding: "40px 22px 120px", color: "var(--black)" };
const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-dark)", display: "block", margin: "22px 0 8px" };
const inputS: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid var(--gold-dark)", borderRadius: 4, background: "var(--paper)", fontFamily: "var(--body)", fontSize: 16, color: "var(--black)" };
const chip = (on: boolean): React.CSSProperties => ({ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", padding: "9px 14px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--gold)", background: on ? "var(--gilt)" : "transparent", color: on ? "var(--black)" : "var(--gold-dark)" });

export default function BookForm({ artists }: { artists: BookArtist[] }) {
  const [artistId, setArtistId] = useState<string | null>(null); // null = first available
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [placement, setPlacement] = useState("");
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [slots, setSlots] = useState<string[]>([]);

  // build upcoming slots on the client (avoids SSR date mismatch)
  useEffect(() => {
    const out: string[] = [];
    const d = new Date();
    for (let i = 1; out.length < 8 && i < 20; i++) {
      const day = new Date(d);
      day.setDate(d.getDate() + i);
      const dow = day.getDay();
      if (dow === 0 || dow === 1) continue; // closed Sun/Mon
      const lbl = day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      out.push(`${lbl} · 2:00 pm`, `${lbl} · 5:30 pm`);
    }
    setSlots(out.slice(0, 8));
  }, []);

  const artistName = useMemo(() => (artistId ? artists.find((a) => a.id === artistId)?.display_name : "First available"), [artistId, artists]);

  async function submit() {
    setErr("");
    if (!name.trim() || !contact.trim()) { setErr("Please add your name and a way to reach you."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/book", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ artistId, artistName, slot, name, contact, placement, idea }),
      });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      setErr(j.error || "Something went wrong. Please try again.");
    } catch { setErr("Network error. Please try again."); }
    setBusy(false);
  }

  return (
    <div style={wrap}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...label, margin: "0 0 8px", color: "var(--gold-dark)" }}>Baroness Tattoo · Garland, TX</div>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 42, lineHeight: 1.05, color: "var(--black)", margin: 0 }}>Book a Consultation</h1>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, color: "var(--grey)", fontStyle: "italic", margin: "8px 0 0" }}>
          A $100 deposit holds the chair — applied to your piece, fully transferable, 48-hour notice. Under two minutes.
        </p>
      </div>

      {/* 1. Artist */}
      <div style={label}>1 · Who&rsquo;s your artist?</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={chip(artistId === null)} onClick={() => setArtistId(null)}>First available</button>
        {artists.map((a) => (
          <button key={a.id} style={chip(artistId === a.id)} onClick={() => setArtistId(a.id)} title={a.specialty || ""}>{a.display_name}</button>
        ))}
      </div>

      {/* 2. Time */}
      <div style={label}>2 · Pick a time</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
        {slots.length === 0 ? <span style={{ color: "var(--grey)", fontStyle: "italic", fontSize: 14 }}>Finding open chairs…</span>
          : slots.map((s) => (
            <button key={s} onClick={() => setSlot(s)} style={{ ...chip(slot === s), padding: "11px 8px", textAlign: "center" }}>{s}</button>
          ))}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 6 }}>Not sure? Leave it — we&rsquo;ll confirm a time when we reach out.</p>

      {/* 3. You */}
      <div style={label}>3 · Your details</div>
      <input style={inputS} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <div style={{ height: 10 }} />
      <input style={inputS} placeholder="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} />
      <div style={{ height: 10 }} />
      <select style={inputS} value={placement} onChange={(e) => setPlacement(e.target.value)}>
        <option value="">Placement (optional)</option>
        <option>Forearm</option><option>Upper arm / half sleeve</option><option>Full sleeve</option>
        <option>Chest</option><option>Back</option><option>Thigh</option><option>Ribs</option><option>Hand / neck</option><option>Other</option>
      </select>
      <div style={{ height: 10 }} />
      <textarea style={{ ...inputS, height: 88, resize: "none" }} placeholder="Your idea (optional) — subject, size, references…" value={idea} onChange={(e) => setIdea(e.target.value)} />

      {err && <p style={{ color: "#a33", fontSize: 14, marginTop: 12 }}>{err}</p>}

      {/* 4. Deposit */}
      <button
        onClick={submit}
        disabled={busy}
        style={{ marginTop: 22, width: "100%", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 14, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "18px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, boxShadow: "0 6px 18px rgba(20,14,8,.25)" }}
      >
        {busy ? "One moment…" : "Reserve with $100 deposit →"}
      </button>
      <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--grey)", marginTop: 14 }}>
        Prefer the scenic route? <a href="/commission" style={{ color: "var(--gold-dark)" }}>The full estate booking →</a>
      </p>
    </div>
  );
}
