"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SUB = process.env.NEXT_PUBLIC_RPM_SUBDOMAIN || "demo";

export default function CreateAvatar() {
  const ref = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function save(url: string) {
      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ rpm_url: url }).eq("id", user.id);
        await supabase.from("artists").update({ rpm_url: url }).eq("user_id", user.id);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
    function onMsg(e: MessageEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let json: any;
      try { json = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (json?.source !== "readyplayerme") return;
      if (json.eventName === "v1.frame.ready") {
        ref.current?.contentWindow?.postMessage(JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.**" }), "*");
      }
      if (json.eventName === "v1.avatar.exported" && json.data?.url) save(json.data.url as string);
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [router]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0c0a08" }}>
      <iframe ref={ref} title="Create your avatar" allow="camera *; microphone *" src={`https://${SUB}.readyplayer.me/avatar?frameApi&bodyType=fullbody&clearCache`} style={{ width: "100%", height: "100%", border: 0 }} />
      <a href="/dashboard" style={{ position: "fixed", top: 14, left: 14, zIndex: 5, fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 10, color: "#1a1a1a", background: "linear-gradient(180deg,#d4b574,#b8924a)", border: "1px solid #8b6f35", padding: "8px 14px", borderRadius: 2, textDecoration: "none" }}>← Quarters</a>
      {saving && <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(12,10,8,.8)", color: "#e8cf86", fontFamily: "var(--display)", fontSize: 24 }}>Saving your likeness…</div>}
    </div>
  );
}
