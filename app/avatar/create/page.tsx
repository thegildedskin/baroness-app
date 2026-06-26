"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Your Avaturn project subdomain (create one free at developer.avaturn.me).
// Until set, the shared "demo" subdomain is used (limited).
const SUB = process.env.NEXT_PUBLIC_AVATURN_SUBDOMAIN || "demo";

export default function CreateAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    let sdk: { destroy: () => void } | null = null;
    // Avaturn can be heavy on first load; fall back after a generous wait.
    const timer = setTimeout(() => setStatus((s) => (s === "ready" ? s : "failed")), 30000);

    async function save(url: string) {
      setSaving(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Stored in the same column the 3D estate already loads as a GLB.
        await supabase.from("profiles").update({ rpm_url: url }).eq("id", user.id);
        await supabase.from("artists").update({ rpm_url: url }).eq("user_id", user.id);
        router.push("/dashboard?me=1");
      } else {
        router.push("/login");
      }
    }

    (async () => {
      try {
        const { AvaturnSDK } = await import("@avaturn/sdk");
        if (cancelled || !containerRef.current) return;
        const instance = new AvaturnSDK();
        sdk = instance;
        instance.on("export", (m) => { if (m?.url) save(m.url); });
        instance.on("error", () => { if (!cancelled) setStatus("failed"); });
        await instance.init(containerRef.current, { url: `https://${SUB}.avaturn.dev` });
        if (cancelled) return;
        clearTimeout(timer);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => { cancelled = true; clearTimeout(timer); try { sdk?.destroy(); } catch { /* noop */ } };
  }, [router]);

  const backBtn: React.CSSProperties = { fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 10, color: "#1a1a1a", background: "linear-gradient(180deg,#d4b574,#b8924a)", border: "1px solid #8b6f35", padding: "10px 16px", borderRadius: 3, textDecoration: "none", cursor: "pointer" };
  const ghostBtn: React.CSSProperties = { ...backBtn, background: "transparent", color: "#e8cf86", border: "1px solid #8b6f35" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0c0a08" }}>
      <style>{`#avaturn-sdk-container iframe{width:100%;height:100%;border:0;display:block}`}</style>
      <div ref={containerRef} id="avaturn-sdk-container"
        style={{ position: "absolute", inset: 0, opacity: status === "ready" ? 1 : 0, transition: "opacity .4s" }} />
      <a href="/dashboard?me=1" style={{ position: "fixed", top: 14, left: 14, zIndex: 5, ...backBtn }}>← Quarters</a>

      {status === "loading" && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#e8cf86", fontFamily: "var(--display)", fontSize: 24, pointerEvents: "none" }}>
          Summoning the 3D atelier…
        </div>
      )}

      {status === "failed" && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(120% 90% at 50% 0%, #241016, #0c0a08)" }}>
          <div style={{ maxWidth: 520, textAlign: "center", background: "linear-gradient(180deg,#fdf6e7,#ece0c6)", border: "2px solid #caa24e", borderRadius: 12, padding: "32px 30px", boxShadow: "0 18px 50px rgba(0,0,0,.5)" }}>
            <div style={{ fontFamily: "var(--blackletter,var(--display))", fontSize: 30, color: "#1a1a1a", marginBottom: 8 }}>The 3D Atelier is resting</div>
            <p style={{ color: "#4a4036", fontSize: 16, lineHeight: 1.5, marginBottom: 18 }}>
              The 3D avatar creator couldn&rsquo;t load here — it needs a quick (free) Avaturn subdomain set up by the house.
              In the meantime, you can craft your <strong>in-house avatar</strong>, which works everywhere and appears across the estate.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard?me=1" style={backBtn}>Build my avatar</a>
              <button onClick={() => { setStatus("loading"); location.reload(); }} style={ghostBtn}>Try the 3D creator again</button>
            </div>
          </div>
        </div>
      )}

      {saving && <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(12,10,8,.8)", color: "#e8cf86", fontFamily: "var(--display)", fontSize: 24 }}>Saving your likeness…</div>}
    </div>
  );
}
