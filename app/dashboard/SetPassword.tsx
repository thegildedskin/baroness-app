"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetPassword() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) {
      setMsg("Error: use at least 6 characters.");
      return;
    }
    setBusy(true);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    setMsg(error ? `Error: ${error.message}` : "Password saved. You can sign in with it next time.");
    setPw("");
  }

  return (
    <form className="card" style={{ marginBottom: 22 }} onSubmit={submit}>
      <h3 style={{ fontSize: 22, marginBottom: 8 }}>Set a password</h3>
      <p style={{ color: "var(--grey)", marginBottom: 12, fontSize: 16 }}>
        Set a password so you can sign in directly next time, without waiting for an email link.
      </p>
      <label className="field">
        <span>New password</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </button>
        {msg && <span style={{ color: msg.startsWith("Error") ? "#a33" : "var(--gold-dark)" }}>{msg}</span>}
      </div>
    </form>
  );
}
