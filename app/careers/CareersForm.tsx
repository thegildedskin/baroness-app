"use client";

import { useState } from "react";

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-dark)", display: "block", margin: "18px 0 6px" };
const inputS: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid var(--gold-dark)", borderRadius: 4, background: "var(--paper)", fontFamily: "var(--body)", fontSize: 16, color: "var(--black)" };

const ROLES = ["Tattoo Artist", "Apprentice", "Piercer", "Front of House", "Other"];

export default function CareersForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [years, setYears] = useState("");
  const [licensed, setLicensed] = useState<boolean | null>(null);
  const [portfolio, setPortfolio] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/careers", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, instagram, role, years, licensed, portfolio, message, website }),
      });
      const j = await r.json();
      if (j.ok) setDone(true);
      else setErr(j.error || "Something went wrong — try again.");
    } catch { setErr("Network error — try again."); }
    setBusy(false);
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 28, color: "var(--gold-dark)" }}>❦</div>
        <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, color: "var(--black)", margin: "8px 0 0" }}>Received with thanks</h2>
        <p style={{ fontFamily: "var(--body)", fontSize: 16.5, color: "#3a2f22", lineHeight: 1.6, marginTop: 10 }}>
          Your application is in the house&rsquo;s hands. If your work speaks to us, we&rsquo;ll reach out — usually within a week or two.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 12, padding: "26px 28px 30px" }}>
      <label style={label}>Your name *</label>
      <input style={inputS} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={label}>Email *</label>
          <input style={inputS} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label style={label}>Phone</label>
          <input style={inputS} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={label}>Position</label>
          <select style={inputS} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Years of experience</label>
          <input style={inputS} value={years} onChange={(e) => setYears(e.target.value)} placeholder="e.g. 4" />
        </div>
      </div>
      <label style={label}>Instagram / portfolio</label>
      <input style={inputS} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" />
      <input style={{ ...inputS, marginTop: 8 }} value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="Portfolio link (optional)" />
      <label style={label}>Texas license?</label>
      <div style={{ display: "flex", gap: 10 }}>
        {[["Yes", true], ["Not yet", false]].map(([t, v]) => (
          <button key={String(t)} type="button" onClick={() => setLicensed(v as boolean)}
            style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", padding: "10px 18px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--gold)", background: licensed === v ? "var(--gilt)" : "transparent", color: licensed === v ? "var(--black)" : "var(--gold-dark)" }}>
            {t as string}
          </button>
        ))}
      </div>
      <label style={label}>Tell us about yourself</label>
      <textarea style={{ ...inputS, minHeight: 110, resize: "vertical" }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your styles, your story, why the Baroness…" />
      {/* honeypot — humans never see this */}
      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, height: 0, width: 0, opacity: 0 }} />
      {err && <p style={{ color: "#a33", fontFamily: "var(--body)", marginTop: 14 }}>{err}</p>}
      <button type="submit" disabled={busy}
        style={{ width: "100%", marginTop: 22, fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "16px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Sending…" : "Submit Application"}
      </button>
    </form>
  );
}
