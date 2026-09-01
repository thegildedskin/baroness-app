"use client";

// Live @baronesstattoo strip — real posts pulled through /api/instagram
// (the studio's own Graph token). Renders nothing until an Instagram account
// is connected in the admin panel, so it's safe to ship dark.

import { useEffect, useState } from "react";

type IgPost = { id: string; media_url: string; permalink: string; caption: string; media_type: string };

export default function InstagramStrip() {
  const [posts, setPosts] = useState<IgPost[]>([]);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((j) => setPosts(j.posts || []))
      .catch(() => { /* strip simply doesn't render */ });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 22px 70px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold-dark)" }}>
          Fresh from the needle
        </div>
        <a
          href="https://www.instagram.com/baronesstattoo/"
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, color: "var(--black)", textDecoration: "none" }}
        >
          @baronesstattoo
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
        {posts.map((p) => (
          <a
            key={p.id}
            href={p.permalink}
            target="_blank" rel="noopener noreferrer"
            title={p.caption}
            style={{ position: "relative", display: "block", aspectRatio: "1", overflow: "hidden", borderRadius: 4, border: "2px solid var(--gold)", background: "var(--velvet)", boxShadow: "0 6px 16px rgba(0,0,0,.14)" }}
          >
            {/* IG CDN URLs expire after a while; the API layer refreshes hourly — plain img keeps this simple */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.media_url} alt={p.caption || "Baroness Tattoo on Instagram"} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {p.media_type === "VIDEO" && (
              <span style={{ position: "absolute", top: 8, right: 8, color: "#fff", fontSize: 16, textShadow: "0 1px 6px rgba(0,0,0,.8)" }}>▶</span>
            )}
          </a>
        ))}
      </div>
      <p style={{ textAlign: "center", marginTop: 16 }}>
        <a
          href="https://www.instagram.com/baronesstattoo/"
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 3, padding: "12px 22px", textDecoration: "none", display: "inline-block" }}
        >
          Follow the House →
        </a>
      </p>
    </section>
  );
}
