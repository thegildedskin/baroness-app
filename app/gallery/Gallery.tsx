"use client";

// The Gallery — the studio's tattoo work, pulled from the live site and served
// from the house's own CDN. Categories come from public/gallery/manifest.json
// (auto-filled by scripts/gallery-classify.mjs via the vision classifier, or
// edited by hand). Filterable, with a lightbox.

import { useEffect, useMemo, useState } from "react";

type Img = { file: string; category: string };
type Manifest = { cdn: string; images: Img[]; local?: boolean };

export default function Gallery() {
  const [data, setData] = useState<Manifest | null>(null);
  const [cat, setCat] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch("/gallery/manifest.json").then((r) => r.json()).then(setData).catch(() => setData({ cdn: "", images: [] }));
  }, []);

  const cats = useMemo(() => {
    if (!data) return ["All"];
    const order = ["All", ...Array.from(new Set(data.images.map((i) => i.category))).sort((a, b) => (a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b)))];
    return order;
  }, [data]);

  const src = (f: string, w: number) =>
    !data ? "" : data.local ? `/gallery/img/${f}` : `${data.cdn}/${f}/:/rs=w:${w}`;
  const shown = data ? data.images.filter((i) => cat === "All" || i.category === cat) : [];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 80px", color: "var(--black)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-dark)" }}>
          By Appointment of Her Grace · Garland, Texas
        </div>
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--display)", fontWeight: 700, fontSize: 44, color: "var(--black)", lineHeight: 1.1 }}>The Gallery</h1>
        <p style={{ margin: "8px auto 0", maxWidth: 560, fontFamily: "var(--body)", fontSize: 17, color: "var(--grey)", fontStyle: "italic" }}>
          A portrait hall of the house&rsquo;s ink. Choose a hand, and see what it has wrought.
        </p>
      </div>

      {/* category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase",
              padding: "8px 16px", borderRadius: 999, cursor: "pointer",
              border: "1px solid var(--gold)",
              background: cat === c ? "var(--gilt)" : "transparent",
              color: cat === c ? "var(--black)" : "var(--gold-dark)",
            }}
          >
            {c}{data && c !== "All" ? ` · ${data.images.filter((i) => i.category === c).length}` : ""}
          </button>
        ))}
      </div>

      {/* masonry grid */}
      {!data ? (
        <p style={{ textAlign: "center", color: "var(--grey)", fontStyle: "italic" }}>Unveiling the portraits…</p>
      ) : (
        <div style={{ columns: "4 240px", columnGap: 14 }}>
          {shown.map((img) => (
            <button
              key={img.file}
              onClick={() => setLightbox(src(img.file, 1600))}
              style={{ display: "block", width: "100%", marginBottom: 14, breakInside: "avoid", padding: 0, border: "1px solid var(--gold)", borderRadius: 8, overflow: "hidden", cursor: "zoom-in", background: "var(--parchment)", boxShadow: "0 6px 18px rgba(20,14,8,.16)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(img.file, 700)} alt={`${img.category} tattoo by Baroness Tattoo`} loading="lazy" style={{ width: "100%", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(12,10,8,.92)", display: "grid", placeItems: "center", padding: 24, cursor: "zoom-out" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Tattoo by Baroness Tattoo" style={{ maxWidth: "94vw", maxHeight: "92vh", border: "2px solid var(--gold)", borderRadius: 8, boxShadow: "0 0 40px rgba(184,146,74,.4)" }} />
        </div>
      )}
    </div>
  );
}
