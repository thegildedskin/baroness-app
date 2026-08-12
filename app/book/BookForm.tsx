"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type BookArtist = { id: string; slug: string; display_name: string; specialty: string | null; portrait_url: string | null };

const wrap: React.CSSProperties = { maxWidth: 640, margin: "0 auto", padding: "40px 22px 120px", color: "var(--black)" };
const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-dark)", display: "block", margin: "22px 0 8px" };
const inputS: React.CSSProperties = { width: "100%", padding: "13px 14px", border: "1px solid var(--gold-dark)", borderRadius: 4, background: "var(--paper)", fontFamily: "var(--body)", fontSize: 16, color: "var(--black)" };
const chip = (on: boolean): React.CSSProperties => ({ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", padding: "9px 14px", borderRadius: 999, cursor: "pointer", border: "1px solid var(--gold)", background: on ? "var(--gilt)" : "transparent", color: on ? "var(--black)" : "var(--gold-dark)" });
const checkRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--body)", fontSize: 15.5, color: "#3a2f22", marginTop: 10, cursor: "pointer" };
const primaryBtn = (busy: boolean): React.CSSProperties => ({ width: "100%", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 14, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "18px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, boxShadow: "0 6px 18px rgba(20,14,8,.25)" });
const ghostBtn: React.CSSProperties = { fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 11, color: "var(--gold-dark)", background: "transparent", border: "1px solid var(--gold)", borderRadius: 3, padding: "12px 18px", cursor: "pointer" };

const SIZES = ["XS — palm or smaller", "S", "M", "L — half sleeve +"];
const STYLES = ["Fine line", "Black & grey realism", "Illustrative / fine art", "Script / lettering", "Traditional", "Not sure yet"];
const BUDGETS = ["Under $200", "$200–$400", "$400–$800", "$800+", "Not sure yet"];
const STEPS = ["You", "The Vision", "Artist & Date"];

export default function BookForm({ artists, initialArtist = "", initialStyle = "" }: { artists: BookArtist[]; initialArtist?: string; initialStyle?: string }) {
  const [step, setStep] = useState(0);
  // step 1 — contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  // step 2 — the vision
  const [idea, setIdea] = useState("");
  const [placement, setPlacement] = useState("");
  const [size, setSize] = useState("");
  const [styleChoice, setStyleChoice] = useState("");
  const [colorMode, setColorMode] = useState("");
  const [budget, setBudget] = useState("");
  const [firstTattoo, setFirstTattoo] = useState(false);
  const [coverUp, setCoverUp] = useState(false);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [refStatus, setRefStatus] = useState<"" | "uploading" | "done" | "failed">("");
  const fileRef = useRef<HTMLInputElement>(null);
  // step 3 — artist + date
  const [artistId, setArtistId] = useState<string | null>(null); // null = match me
  const [date, setDate] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  // plumbing
  const [website, setWebsite] = useState(""); // honeypot — humans never see or fill this
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [minDate, setMinDate] = useState("");

  // honor /book?artist=<slug> from the artist pages
  useEffect(() => {
    if (!initialArtist) return;
    const match = artists.find((a) => a.slug === initialArtist || a.id === initialArtist);
    if (match) setArtistId(match.id);
  }, [initialArtist, artists]);

  // honor /book?style=… from the style pages: pick the matching option, or
  // carry an unknown value as its own option (bookings.style is free text).
  // Anything cover-up flavored also pre-ticks the cover-up box.
  useEffect(() => {
    if (!initialStyle) return;
    const v = initialStyle.trim();
    if (!v) return;
    if (/cover/i.test(v)) setCoverUp(true);
    const match = STYLES.find((s) => s.toLowerCase() === v.toLowerCase());
    if (match) setStyleChoice(match);
    else if (!/cover/i.test(v)) setStyleChoice(v);
  }, [initialStyle]);

  // compute "tomorrow" on the client (avoids SSR date mismatch)
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setMinDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  const artistName = useMemo(() => (artistId ? artists.find((a) => a.id === artistId)?.display_name : "First available"), [artistId, artists]);

  // Reference image → Supabase 'booking-refs' bucket (anon insert-only; see
  // migration 011). If the bucket/policy isn't live yet the upload fails and
  // we fall back to the paste-a-link field below.
  async function uploadRef(file: File) {
    setRefStatus("uploading");
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from("booking-refs").upload(path, file, { contentType: file.type || undefined });
      if (error) throw error;
      const { data } = supabase.storage.from("booking-refs").getPublicUrl(path);
      setReferenceUrl(data.publicUrl);
      setRefStatus("done");
    } catch {
      setRefStatus("failed");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function next() {
    setErr("");
    if (step === 0) {
      if (!name.trim()) { setErr("Please tell us your name."); return; }
      if (!email.trim() && !phone.trim()) { setErr("Please add an email or phone so we can reach you."); return; }
      if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("That email doesn't look right."); return; }
    }
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setErr("");
    setBusy(true);
    // Preferred day + window as a plain string; the studio confirms the exact
    // time when they reply. The paid deposit is what locks the date.
    const prettyDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "";
    const slot = [prettyDate, timeWindow].filter(Boolean).join(" · ");
    const contact = email.trim() || phone.trim();
    try {
      const r = await fetch("/api/book", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          artistId, artistName, slot, name, contact, placement, idea, website,
          email: email.trim(), phone: phone.trim(), instagram: instagram.trim(),
          size, style: styleChoice, colorMode, budget,
          firstTattoo, coverUp, referenceUrl,
        }),
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
          Tell us the vision, pick your artist, hold the chair. Under three minutes.
        </p>
      </div>

      {/* step markers */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => { if (i < step) setStep(i); }}
            style={{ ...chip(i === step), cursor: i < step ? "pointer" : "default", opacity: i <= step ? 1 : 0.45, border: "1px solid var(--gold)" }}
            aria-current={i === step ? "step" : undefined}
          >
            {i + 1} · {s}
          </button>
        ))}
      </div>

      {/* honeypot — visually hidden; bots that fill it are quietly dropped server-side */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} autoComplete="off" tabIndex={-1} aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />

      {/* ── STEP 1 · CONTACT ─────────────────────────────────────── */}
      {step === 0 && (
        <div>
          <div style={label}>Your name</div>
          <input style={inputS} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <div style={label}>Email</div>
          <input style={inputS} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <div style={label}>Phone <span style={{ opacity: 0.7 }}>(email or phone — at least one)</span></div>
          <input style={inputS} type="tel" placeholder="(469) 555-0100" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          <div style={label}>Instagram <span style={{ opacity: 0.7 }}>(optional)</span></div>
          <input style={inputS} placeholder="@yourhandle" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          {err && <p style={{ color: "#a33", fontSize: 14, marginTop: 12 }}>{err}</p>}
          <button onClick={next} style={{ ...primaryBtn(false), marginTop: 22 }}>Next · The Vision →</button>
        </div>
      )}

      {/* ── STEP 2 · THE VISION ──────────────────────────────────── */}
      {step === 1 && (
        <div>
          <div style={label}>The idea</div>
          <textarea style={{ ...inputS, height: 110, resize: "none" }} placeholder="What are we making? Subject, mood, meaning — anything helps." value={idea} onChange={(e) => setIdea(e.target.value)} />

          <div style={label}>Placement</div>
          <select style={inputS} value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="">Choose a placement (optional)</option>
            <option>Forearm</option><option>Upper arm / half sleeve</option><option>Full sleeve</option>
            <option>Chest</option><option>Back</option><option>Thigh</option><option>Ribs</option>
            <option>Calf / shin</option><option>Ankle / foot</option><option>Hand / neck</option><option>Other</option>
          </select>

          <div style={label}>Size</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SIZES.map((s) => (
              <button key={s} style={chip(size === s)} onClick={() => setSize(size === s ? "" : s)}>{s}</button>
            ))}
          </div>

          <div style={label}>Style</div>
          <select style={inputS} value={styleChoice} onChange={(e) => setStyleChoice(e.target.value)}>
            <option value="">Choose a style (optional)</option>
            {STYLES.map((s) => <option key={s}>{s}</option>)}
            {styleChoice && !STYLES.includes(styleChoice) && <option key={styleChoice}>{styleChoice}</option>}
          </select>

          <div style={label}>Color</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Black & grey", "Color"].map((c) => (
              <button key={c} style={chip(colorMode === c)} onClick={() => setColorMode(colorMode === c ? "" : c)}>{c}</button>
            ))}
          </div>

          <div style={label}>Budget</div>
          <select style={inputS} value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Choose a range (optional)</option>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>

          <label style={checkRow}>
            <input type="checkbox" checked={firstTattoo} onChange={(e) => setFirstTattoo(e.target.checked)} style={{ accentColor: "var(--gold-dark)", width: 17, height: 17 }} />
            This is my first tattoo
          </label>
          <label style={checkRow}>
            <input type="checkbox" checked={coverUp} onChange={(e) => setCoverUp(e.target.checked)} style={{ accentColor: "var(--gold-dark)", width: 17, height: 17 }} />
            This is a cover-up or rework
          </label>

          <div style={label}>Reference image <span style={{ opacity: 0.7 }}>(optional)</span></div>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadRef(f); }} style={{ fontFamily: "var(--body)", fontSize: 14 }} />
          {refStatus === "uploading" && <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 6 }}>Uploading…</p>}
          {refStatus === "done" && <p style={{ fontSize: 13, color: "var(--gold-dark)", marginTop: 6 }}>✦ Reference attached.</p>}
          {refStatus === "failed" && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 13, color: "#a33" }}>Upload unavailable — paste a link instead (Pinterest, Instagram, Google Drive…):</p>
              <input style={{ ...inputS, marginTop: 6 }} placeholder="https://…" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button onClick={() => setStep(0)} style={ghostBtn}>← Back</button>
            <button onClick={next} style={{ ...primaryBtn(false), flex: 1 }}>Next · Artist &amp; Date →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3 · ARTIST + DATE + DEPOSIT ─────────────────────── */}
      {step === 2 && (
        <div>
          <div style={label}>Your artist</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={chip(artistId === null)} onClick={() => setArtistId(null)}>Match me with the right artist</button>
            {artists.map((a) => (
              <button key={a.id} style={chip(artistId === a.id)} onClick={() => setArtistId(a.id)} title={a.specialty || ""}>{a.display_name}</button>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 6 }}>
            Undecided? <a href="/artists" style={{ color: "var(--gold-dark)" }}>Browse the artists&rsquo; portfolios</a> — or leave it to the house.
          </p>

          <div style={label}>Preferred day &amp; time window <span style={{ opacity: 0.7 }}>(optional)</span></div>
          <input type="date" style={inputS} min={minDate} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Preferred date" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button style={chip(timeWindow === "Afternoon")} onClick={() => setTimeWindow(timeWindow === "Afternoon" ? "" : "Afternoon")}>Afternoon · 12–4</button>
            <button style={chip(timeWindow === "Evening")} onClick={() => setTimeWindow(timeWindow === "Evening" ? "" : "Evening")}>Evening · 4–8</button>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--grey)", fontStyle: "italic", marginTop: 6 }}>
            Open Mon–Sat 12–8, Sun 12–6. We&rsquo;ll confirm your exact time when we reply — your deposit locks the date.
          </p>

          <div style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, padding: "16px 18px", marginTop: 22 }}>
            <div style={{ ...label, margin: "0 0 6px", fontSize: 10 }}>The deposit</div>
            <p style={{ fontFamily: "var(--body)", fontSize: 15, lineHeight: 1.55, color: "#3a2f22", margin: 0 }}>
              <strong>$100 non-refundable deposit, applied to your final price;</strong> reschedule up to 48 hours in advance. Booking {artistName === "First available" ? "with the first available artist" : `with ${artistName}`}.
            </p>
          </div>

          {err && <p style={{ color: "#a33", fontSize: 14, marginTop: 12 }}>{err}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
            <button onClick={submit} disabled={busy} style={{ ...primaryBtn(busy), flex: 1 }}>
              {busy ? "One moment…" : "Reserve with $100 deposit →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
