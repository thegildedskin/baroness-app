"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; sender: string; body: string | null; created_at: string };
type Thread = {
  id: string;
  client_name: string;
  client_email: string | null;
  created_at: string;
  last_message_at: string;
  messages: Message[];
};

export default function Messages({ threads }: { threads: Thread[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [reply, setReply] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>("");

  async function send(threadId: string) {
    const body = (reply[threadId] || "").trim();
    if (!body) return;
    setBusy(threadId);
    const { error } = await supabase.from("messages").insert({ thread_id: threadId, sender: "artist", body });
    if (!error) {
      await supabase.from("threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);
      setReply((r) => ({ ...r, [threadId]: "" }));
      router.refresh();
    }
    setBusy("");
  }

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 24, marginBottom: 14 }}>Messages</h3>
      {threads.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>
          No messages yet. When a visitor writes from your profile, it appears here.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {threads.map((t) => {
            const msgs = [...t.messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
            return (
              <div key={t.id} style={{ border: "1px solid var(--gold)", borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ fontWeight: 600 }}>
                  {t.client_name}
                  {t.client_email ? ` · ${t.client_email}` : ""}
                </div>
                <div style={{ display: "grid", gap: 6, margin: "10px 0" }}>
                  {msgs.map((m) => (
                    <div key={m.id} style={{ textAlign: m.sender === "artist" ? "right" : "left" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: m.sender === "artist" ? "var(--gold-light)" : "#efe3c6",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 15,
                          maxWidth: "85%",
                        }}
                      >
                        {m.body}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={reply[t.id] || ""}
                    onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))}
                    placeholder="Write a reply…"
                    style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 15 }}
                  />
                  <button className="btn" onClick={() => send(t.id)} disabled={busy === t.id}>
                    {busy === t.id ? "…" : "Reply"}
                  </button>
                </div>
                {t.client_email && (
                  <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 6 }}>
                    To be sure they see it, you can also email {t.client_email} directly.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
