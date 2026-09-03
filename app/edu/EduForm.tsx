"use client";

import { useState } from "react";

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-dark)", display: "block", margin: "16px 0 6px" };
const inputS: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid var(--gold-dark)", borderRadius: 4, background: "var(--paper)", fontFamily: "var(--body)", fontSize: 16, color: "var(--black)" };

const TRACKS = [
  ["restorative", "Restorative / paramedical tattooing"],
  ["fine-art", "Fine-art tattoo technique"],
  ["business", "The business of being an artist"],
  ["general", "All of it — keep me posted"],
] as const;

export default function EduForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<string>("general");
  const [experience, setExperience] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/edu", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, interest, experience, website }),
      });
      const j = await r.json();
      if (j.ok) setDone(true); else setErr(j.error || "Something went wrong — try again.");
    } catch { setErr("Network error — try again."); }
    setBusy(false);
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "30px 0" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--gold-dark)" }}>❦</div>
        <p style={{ fontFamily: "var(--body)", fontSize: 17, color: "#3a2f22", lineHeight: 1.6 }}>
          You&rsquo;re on the list. When the first seminars open, you hear about it before anyone else.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 12, padding: "24px 26px 28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><label style={label}>Name *</label><input style={inputS} value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label style={label}>Email *</label><input style={inputS} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      </div>
      <label style={label}>What calls to you?</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TRACKS.map(([v, t]) => (
          <button key={v} type="button" onClick={() => setInterest(v)}
            style={{ fontFamily: "var(--caps)", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", padding: "10px 14px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--gold)", background: interest === v ? "var(--gilt)" : "transparent", color: interest === v ? "var(--black)" : "var(--gold-dark)" }}>
            {t}
          </button>
        ))}
      </div>
      <label style={label}>Your background (optional)</label>
      <textarea style={{ ...inputS, minHeight: 80, resize: "vertical" }} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Artist? Apprentice? Nurse or aesthetician curious about restorative work? Tell us." />
      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, height: 0, width: 0, opacity: 0 }} />
      {err && <p style={{ color: "#a33", fontFamily: "var(--body)", marginTop: 12 }}>{err}</p>}
      <button type="submit" disabled={busy}
        style={{ width: "100%", marginTop: 20, fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "15px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Sending…" : "Join the Waitlist"}
      </button>
    </form>
  );
}
