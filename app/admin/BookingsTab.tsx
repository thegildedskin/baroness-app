"use client";

// Bookings inbox — the studio's lead pipeline, fed by /book + the Stripe
// webhook. Self-fetching (same pattern as CommerceTab) via the user's Supabase
// client; requires migration 014 (owner read/update RLS) — until it's run this
// tab shows the "no access" hint rather than breaking the panel.
//
// Pipeline: requested → deposit_paid → contacted → booked → completed
//                                   ↘ no_show / cancelled
// venue.ink stays the CRM of record — this inbox is triage; once booked,
// schedule the sitting in Venue Ink as usual.

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Booking = {
  id: number;
  created_at: string;
  status: string;
  name: string;
  contact: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  slot: string | null;
  artist_name: string | null;
  placement: string | null;
  idea: string | null;
  size: string | null;
  style: string | null;
  color_mode: string | null;
  budget: string | null;
  first_tattoo: boolean | null;
  cover_up: boolean | null;
  reference_url: string | null;
  deposit_cents: number | null;
  notes: string | null;
};

const PIPELINE = ["requested", "deposit_paid", "contacted", "booked", "completed"] as const;
const TERMINAL = ["no_show", "cancelled"] as const;
const LABEL: Record<string, string> = {
  requested: "Requested", deposit_paid: "Deposit paid", contacted: "Contacted",
  booked: "Booked", completed: "Completed", no_show: "No-show", cancelled: "Cancelled",
};

export default function BookingsTab() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<string>("open");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setErr("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data ?? []) as Booking[]);
    } catch (e) {
      setRows([]);
      setErr(e instanceof Error ? e.message : "Could not load bookings — has migration 014 been run?");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: number, status: string) {
    setSavingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      setRows((r) => (r ?? []).map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (e) { setErr(e instanceof Error ? e.message : "Update failed"); }
    setSavingId(null);
  }

  async function saveNote(id: number) {
    const notes = noteDraft[id] ?? "";
    setSavingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("bookings").update({ notes }).eq("id", id);
      if (error) throw error;
      setRows((r) => (r ?? []).map((b) => (b.id === id ? { ...b, notes } : b)));
    } catch (e) { setErr(e instanceof Error ? e.message : "Update failed"); }
    setSavingId(null);
  }

  const open = (b: Booking) => !["completed", "no_show", "cancelled"].includes(b.status);
  const shown = (rows ?? []).filter((b) =>
    filter === "all" ? true : filter === "open" ? open(b) : b.status === filter
  );
  const counts: Record<string, number> = {};
  for (const b of rows ?? []) counts[b.status] = (counts[b.status] || 0) + 1;

  return (
    <div className="hx-card">
      <div className="hx-card-title">Bookings — the register of requests</div>
      {err && <p className="hx-muted" style={{ color: "#e07a6a" }}>{err}</p>}

      <div className="hx-pills" style={{ marginBottom: 12 }}>
        {["open", "all", ...PIPELINE, ...TERMINAL].map((f) => (
          <button key={f} className={`hx-pill${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>
            {f === "open" ? `Open (${(rows ?? []).filter(open).length})` : f === "all" ? `All (${rows?.length ?? 0})` : `${LABEL[f]}${counts[f] ? ` (${counts[f]})` : ""}`}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="hx-muted">Opening the register…</p>
      ) : shown.length === 0 ? (
        <p className="hx-muted">Nothing here. New requests from /book (and paid deposits via Stripe) appear automatically.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {shown.map((b) => (
            <div key={b.id} style={{ border: "1px solid rgba(184,146,74,.3)", borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,.02)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15 }}>{b.name}</strong>
                <span className="hx-muted">{new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <span className={`hx-pill on`} style={{ fontSize: 10, padding: "3px 10px" }}>{LABEL[b.status] || b.status}</span>
                {b.deposit_cents ? <span style={{ color: "#9fc48f", fontSize: 12 }}>${(b.deposit_cents / 100).toFixed(0)} deposit ✓</span> : null}
                <span className="hx-muted" style={{ marginLeft: "auto", fontSize: 12 }}>
                  {b.email || b.phone || b.contact}{b.instagram ? ` · @${b.instagram.replace(/^@/, "")}` : ""}
                </span>
              </div>
              <div className="hx-muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
                {[b.artist_name && `Artist: ${b.artist_name}`, b.slot && `Prefers: ${b.slot}`, b.style, b.size, b.color_mode, b.budget, b.placement && `on ${b.placement}`,
                  b.first_tattoo && "first tattoo", b.cover_up && "cover-up"].filter(Boolean).join(" · ") || "No details given"}
                {b.idea ? <div style={{ marginTop: 4, fontStyle: "italic", color: "inherit" }}>&ldquo;{b.idea}&rdquo;</div> : null}
                {b.reference_url ? <div style={{ marginTop: 4 }}><a href={b.reference_url} target="_blank" rel="noopener noreferrer">Reference image ↗</a></div> : null}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                {PIPELINE.filter((s) => s !== b.status).map((s) => (
                  <button key={s} className="hx-pill" disabled={savingId === b.id} onClick={() => setStatus(b.id, s)}>→ {LABEL[s]}</button>
                ))}
                {TERMINAL.filter((s) => s !== b.status).map((s) => (
                  <button key={s} className="hx-pill" style={{ opacity: 0.7 }} disabled={savingId === b.id} onClick={() => setStatus(b.id, s)}>{LABEL[s]}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  style={{ flex: 1, fontSize: 13 }}
                  placeholder="Notes (Venue Ink ref, quoted price, follow-ups…)"
                  value={noteDraft[b.id] ?? b.notes ?? ""}
                  onChange={(e) => setNoteDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                />
                <button className="hx-pill" disabled={savingId === b.id} onClick={() => saveNote(b.id)}>Save</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="hx-muted" style={{ marginTop: 12, fontSize: 12 }}>
        Once a lead is <strong>Booked</strong>, schedule the sitting in Venue Ink as usual — this inbox is triage, Venue Ink remains the book of record.
      </p>
    </div>
  );
}
