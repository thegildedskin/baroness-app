"use client";

// Applications inbox — job applications (/careers, migration 016) and the
// Academy waitlist (/edu, migration 017). Self-fetching like BookingsTab;
// owner-read RLS. Shows a hint instead of breaking if migrations aren't run.

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Application = {
  id: number; created_at: string; status: string;
  name: string; email: string; phone: string | null; instagram: string | null;
  role: string; years_experience: string | null; licensed: boolean | null;
  portfolio_url: string | null; message: string | null;
};
type WaitRow = { id: number; created_at: string; name: string; email: string; interest: string; experience: string | null };

const STATUSES = ["new", "reviewed", "interview", "hired", "declined"] as const;
const LABEL: Record<string, string> = { new: "New", reviewed: "Reviewed", interview: "Interview", hired: "Hired", declined: "Declined" };

export default function ApplicationsTab() {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [wait, setWait] = useState<WaitRow[]>([]);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setErr("");
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      setApps((data ?? []) as Application[]);
    } catch (e) {
      setApps([]);
      setErr(e instanceof Error ? e.message : "Could not load — has migration 016 been run?");
    }
    try {
      const { data } = await supabase.from("edu_waitlist").select("*").order("created_at", { ascending: false }).limit(300);
      setWait((data ?? []) as WaitRow[]);
    } catch { /* migration 017 optional */ }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: number, status: string) {
    setSavingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
      if (error) throw error;
      setApps((a) => (a ?? []).map((x) => (x.id === id ? { ...x, status } : x)));
    } catch (e) { setErr(e instanceof Error ? e.message : "Update failed"); }
    setSavingId(null);
  }

  const fmtDate = (s: string) => new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="hx-card">
        <div className="hx-card-title">Careers — applications ({(apps ?? []).filter((a) => a.status === "new").length} new)</div>
        {err && <p className="hx-muted" style={{ color: "#e07a6a" }}>{err}</p>}
        {apps === null ? (
          <p className="hx-muted">Opening the ledger…</p>
        ) : apps.length === 0 ? (
          <p className="hx-muted">No applications yet — they arrive from /careers automatically.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {apps.map((a) => (
              <div key={a.id} style={{ border: "1px solid rgba(184,146,74,.3)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong>{a.name}</strong>
                  <span className="hx-muted">{fmtDate(a.created_at)}</span>
                  <span className="hx-pill on" style={{ fontSize: 10, padding: "3px 10px" }}>{LABEL[a.status] || a.status}</span>
                  <span className="hx-muted" style={{ marginLeft: "auto", fontSize: 12 }}>{a.role}{a.years_experience ? ` · ${a.years_experience} yrs` : ""}{a.licensed === true ? " · TX licensed" : a.licensed === false ? " · not licensed" : ""}</span>
                </div>
                <div className="hx-muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {a.email}{a.phone ? ` · ${a.phone}` : ""}{a.instagram ? ` · @${a.instagram.replace(/^@/, "")}` : ""}
                  {a.portfolio_url ? <> · <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer">portfolio ↗</a></> : null}
                </div>
                {a.message && <div className="hx-muted" style={{ fontSize: 13, fontStyle: "italic", marginTop: 6 }}>&ldquo;{a.message}&rdquo;</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {STATUSES.filter((s) => s !== a.status).map((s) => (
                    <button key={s} className="hx-pill" disabled={savingId === a.id} onClick={() => setStatus(a.id, s)}>→ {LABEL[s]}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hx-card">
        <div className="hx-card-title">Academy waitlist ({wait.length})</div>
        {wait.length === 0 ? (
          <p className="hx-muted">Empty for now — signups arrive from /edu. When you open the first cohort, this is your invite list.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {wait.map((w) => (
              <div key={w.id} style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", fontSize: 13.5, borderBottom: "1px solid rgba(184,146,74,.15)", padding: "6px 2px" }}>
                <strong>{w.name}</strong>
                <span className="hx-muted">{w.email}</span>
                <span className="hx-pill on" style={{ fontSize: 9.5, padding: "2px 8px" }}>{w.interest}</span>
                {w.experience && <span className="hx-muted" style={{ fontStyle: "italic" }}>{w.experience.slice(0, 80)}</span>}
                <span className="hx-muted" style={{ marginLeft: "auto" }}>{fmtDate(w.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
