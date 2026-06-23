"use client";

import { useEffect, useState } from "react";

type Review = { author: string; rating: number; text: string; time?: string };

export default function ReviewsTicker() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [live, setLive] = useState(true);
  const [rating, setRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch("/api/reviews").then((r) => r.json()).then((d) => {
      setReviews(d.reviews || []); setLive(!!d.live); setRating(d.rating);
    }).catch(() => {});
  }, []);

  if (!reviews.length) return null;
  const items = [...reviews, ...reviews];
  return (
    <div className="revticker">
      <div className="rev-h">★ Reviews on Google{rating ? ` · ${rating.toFixed(1)}` : ""}{!live && <span className="rev-prev">preview</span>}</div>
      <div className="rev-track">
        {items.map((r, i) => (
          <div className="rev-card" key={i}>
            <div className="rev-stars">{"★".repeat(Math.max(1, Math.round(r.rating || 5)))}</div>
            <div className="rev-text">&ldquo;{r.text}&rdquo;</div>
            <div className="rev-author">— {r.author}{r.time ? ` · ${r.time}` : ""}</div>
          </div>
        ))}
      </div>
      <style>{`
        .revticker{width:100%;max-width:1040px;margin:28px auto 0;overflow:hidden;border:1px solid var(--gold);border-radius:8px;background:rgba(253,246,231,.55);padding:10px 0 12px;position:relative}
        .rev-h{font-family:var(--caps);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-dark);text-align:center;margin-bottom:8px}
        .rev-prev{background:var(--gold);color:#1a1a1a;border-radius:10px;padding:1px 7px;font-size:8px;margin-left:6px;vertical-align:middle}
        .rev-track{display:flex;gap:16px;width:max-content;animation:revscroll 44s linear infinite;padding:0 8px}
        .revticker:hover .rev-track{animation-play-state:paused}
        .rev-card{width:300px;flex:0 0 auto;background:#fffdf6;border:1px solid var(--gold);border-radius:6px;padding:12px 14px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .rev-stars{color:#caa24e;font-size:14px;letter-spacing:2px}
        .rev-text{font-family:var(--display);font-style:italic;color:#3a322a;font-size:16px;line-height:1.4;margin:4px 0 6px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .rev-author{font-family:var(--caps);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dark)}
        @keyframes revscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>
    </div>
  );
}
