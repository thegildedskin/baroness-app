"use client";

import { useState } from "react";
import { sendMessage } from "./actions";

export default function ArtistMessageForm({
  artistId,
  artistName,
}: {
  artistId: string;
  artistName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const res = await sendMessage({ artistId, clientName: name, clientEmail: email, body });
    setBusy(false);
    if (res?.error) setStatus(res.error);
    else {
      setDone(true);
      setName("");
      setEmail("");
      setBody("");
    }
  }

  if (!open) {
    return (
      <button className="btn ghost" style={{ marginTop: 6 }} onClick={() => setOpen(true)}>
        ✉ Send a private message
      </button>
    );
  }

  if (done) {
    return (
      <div className="msgform">
        <p style={{ margin: 0 }}>
          Your message has been delivered to {artistName}. They&rsquo;ll reach out to you directly.
        </p>
      </div>
    );
  }

  return (
    <form className="msgform" onSubmit={submit}>
      <div className="mf-title">Write to {artistName}</div>
      <input className="mf-in" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="mf-in" placeholder="Your email (so they can reply)" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
      <textarea className="mf-in" placeholder="Your message…" rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
      {status && <div style={{ color: "#a33", fontSize: 14 }}>{status}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
        <button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      <style>{`
        .msgform{margin-top:10px;background:rgba(168,196,162,.14);border:1px dashed var(--gold-dark);border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:8px}
        .mf-title{font-family:var(--caps);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-dark)}
        .mf-in{width:100%;padding:10px 12px;border:1px solid var(--gold-dark);border-radius:3px;background:#fdf6e7;font-family:var(--body);font-size:16px}
      `}</style>
    </form>
  );
}
