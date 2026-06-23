"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; title: string; description: string | null; price_cents: number; kind: string; preview_url: string | null; is_active: boolean };

export default function ProductManager({ artistId, products }: { artistId: string; products: Product[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("25");
  const [kind, setKind] = useState("art");
  const [preview, setPreview] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function add() {
    if (!title.trim() || !file) { setStatus("Title and a downloadable file are required."); return; }
    setBusy(true); setStatus("Uploading…");
    let preview_url: string | null = null;
    if (preview) {
      const pp = `${artistId}/preview-${Date.now()}-${preview.name}`;
      const up = await supabase.storage.from("product-previews").upload(pp, preview, { upsert: true });
      if (up.error) { setBusy(false); setStatus(`Error: ${up.error.message}`); return; }
      preview_url = supabase.storage.from("product-previews").getPublicUrl(pp).data.publicUrl;
    }
    const fp = `${artistId}/file-${Date.now()}-${file.name}`;
    const fu = await supabase.storage.from("product-files").upload(fp, file, { upsert: true });
    if (fu.error) { setBusy(false); setStatus(`Error: ${fu.error.message}`); return; }
    const cents = Math.max(100, Math.round(parseFloat(price || "0") * 100));
    const { error } = await supabase.from("products").insert({ artist_id: artistId, title: title.trim(), description: desc.trim() || null, price_cents: cents, kind, preview_url, file_path: fp, is_active: true });
    setBusy(false);
    if (error) { setStatus(`Error: ${error.message}`); return; }
    setTitle(""); setDesc(""); setPrice("25"); setPreview(null); setFile(null); setStatus("Listed.");
    router.refresh();
  }
  async function toggle(p: Product) {
    setBusy(true);
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    setBusy(false); router.refresh();
  }
  async function remove(id: string) {
    setBusy(true);
    await supabase.from("products").delete().eq("id", id);
    setBusy(false); router.refresh();
  }

  return (
    <div className="card" style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 24, marginBottom: 6 }}>Your shop</h3>
      <p style={{ color: "var(--grey)", marginBottom: 14, fontSize: 15 }}>Sell digital art, flash, and stencils. Buyers receive a secure download after paying via Stripe.</p>

      {products.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, marginBottom: 18 }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", background: "#fffdf6", opacity: p.is_active ? 1 : 0.55 }}>
              {p.preview_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.preview_url} alt={p.title} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
              ) : <div style={{ aspectRatio: "1", background: "linear-gradient(135deg,#241c16,#161210)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-light)", fontSize: 28 }}>✦</div>}
              <div style={{ padding: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "var(--gold-dark)" }}>${(p.price_cents / 100).toFixed(2)} · {p.kind}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button className="btn ghost" style={{ padding: "5px 8px", fontSize: 9 }} onClick={() => toggle(p)} disabled={busy}>{p.is_active ? "Hide" : "Show"}</button>
                  <button className="btn ghost" style={{ padding: "5px 8px", fontSize: 9 }} onClick={() => remove(p.id)} disabled={busy}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={inp} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ fontSize: 14 }}>$ <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" step="1" style={{ ...inp, width: 90, display: "inline-block" }} /></label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inp, width: "auto" }}>
            <option value="art">Digital art</option><option value="flash">Flash design</option><option value="stencil">Stencil</option>
          </select>
        </div>
        <label style={{ fontSize: 13, color: "var(--grey)" }}>Preview image (shown publicly): <input type="file" accept="image/*" onChange={(e) => setPreview(e.target.files?.[0] ?? null)} /></label>
        <label style={{ fontSize: 13, color: "var(--grey)" }}>Downloadable file (delivered after purchase): <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn" onClick={add} disabled={busy}>{busy ? "Working…" : "List for sale"}</button>
          {status && <span style={{ color: status.startsWith("Error") ? "#a33" : "var(--gold-dark)", fontSize: 14 }}>{status}</span>}
        </div>
      </div>
    </div>
  );
}
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid var(--gold-dark)", borderRadius: 3, background: "#fdf6e7", fontFamily: "var(--body)", fontSize: 15 };
