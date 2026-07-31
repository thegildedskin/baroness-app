"use client";

// Xbox-Home-style shell for the Quarters dashboards:
// identity band up top, one row of big glowing menu tiles, the selected
// panel renders beneath. Arrow keys move tile focus; Enter opens.

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

export type QTile = { key: string; label: string; desc: string; icon: string; accent: string; badge?: string; group?: string };

export default function QuartersShell({
  eyebrow, title, subtitle, tiles, active, onSelect, children, topLinks,
}: {
  eyebrow: string; title: string; subtitle: string;
  tiles: QTile[]; active: string; onSelect: (key: string) => void;
  children: ReactNode;
  topLinks?: { href: string; label: string }[];
}) {
  const [focus, setFocus] = useState(() => Math.max(0, tiles.findIndex((t) => t.key === active)));
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") { e.preventDefault(); setFocus((f) => Math.min(tiles.length - 1, f + 1)); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setFocus((f) => Math.max(0, f - 1)); }
      else if (e.key === "Enter") { onSelect(tiles[focus]?.key); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tiles, focus, onSelect]);

  useEffect(() => {
    const el = rowRef.current?.querySelectorAll(".qx-tile")[focus] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [focus]);

  return (
    <div className="qx">
      <style>{QX_CSS}</style>
      <div className="qx-bg" aria-hidden="true" />
      <header className="qx-head">
        <div>
          <div className="qx-eyebrow">{eyebrow}</div>
          <h1 className="qx-title">{title}</h1>
          <div className="qx-sub">{subtitle}</div>
        </div>
        <nav className="qx-nav">
          <Link href="/">← The Estate</Link>
          {(topLinks ?? []).map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
      </header>

      <div className="qx-tilerow" ref={rowRef}>
        {tiles.map((t, i) => {
          const showGroup = !!t.group && t.group !== tiles[i - 1]?.group;
          return (
            <Fragment key={t.key}>
              {showGroup && <span className="qx-group" aria-hidden>{t.group}</span>}
              <button
                className={`qx-tile${active === t.key ? " on" : ""}${focus === i ? " focus" : ""}`}
                style={{ ["--accent" as string]: t.accent }}
                onClick={() => { setFocus(i); onSelect(t.key); }}
                onMouseEnter={() => setFocus(i)}
              >
                <span className="qx-tile-icon">{t.icon}</span>
                <span className="qx-tile-label">{t.label}</span>
                <span className="qx-tile-desc">{t.desc}</span>
                {t.badge && <span className="qx-badge">{t.badge}</span>}
              </button>
            </Fragment>
          );
        })}
      </div>
      <div className="qx-hint">◄ ► to browse · Enter to open</div>

      <main className="qx-panel" key={active}>{children}</main>
    </div>
  );
}

const QX_CSS = `
.qx{min-height:100vh;position:relative;color:#e9e2d4;padding:30px 4vw 90px;font-family:var(--body,ui-serif)}
.qx-bg{position:fixed;inset:0;z-index:-1;background:
  radial-gradient(1100px 480px at 18% -8%,#2b2140 0%,transparent 60%),
  radial-gradient(900px 460px at 92% 4%,#3b2a1a 0%,transparent 55%),
  linear-gradient(180deg,#0d0b12 0%,#131019 100%)}
.qx-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:26px}
.qx-eyebrow{font-family:var(--caps,inherit);font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#caa24e;margin-bottom:6px}
.qx-title{font-size:42px;margin:0;color:#f3e9d2;font-weight:600;line-height:1.05}
.qx-sub{color:#a5987f;font-size:13px;margin-top:6px}
.qx-nav{display:flex;gap:16px;flex-wrap:wrap}
.qx-nav a{color:#caa24e;text-decoration:none;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-family:var(--caps,inherit)}
.qx-nav a:hover{color:#f1dc97}
.qx-tilerow{display:flex;gap:14px;overflow-x:auto;padding:18px 4px 22px;scrollbar-width:none;align-items:stretch}
.qx-tilerow::-webkit-scrollbar{display:none}
.qx-group{flex:0 0 auto;align-self:center;writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--caps,inherit);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#8a7448;padding:8px 4px;border-left:1px solid rgba(202,162,78,.25);margin-left:4px}
.qx-tile{position:relative;flex:0 0 auto;width:198px;min-height:150px;border-radius:16px;border:1.5px solid rgba(202,162,78,.25);cursor:pointer;text-align:left;padding:18px 16px 14px;display:flex;flex-direction:column;gap:6px;color:#e9e2d4;
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 26%,#14111b) 0%,#14111b 70%);
  transition:transform .18s cubic-bezier(.2,.9,.3,1.4),box-shadow .18s,border-color .18s;transform:scale(.96)}
.qx-tile.focus{transform:scale(1.04);border-color:var(--accent);box-shadow:0 0 0 2.5px color-mix(in srgb,var(--accent) 70%,transparent),0 16px 44px rgba(0,0,0,.55),0 0 34px color-mix(in srgb,var(--accent) 35%,transparent);z-index:2}
.qx-tile.on{border-color:#f1dc97}
.qx-tile.on::after{content:"";position:absolute;left:14px;right:14px;bottom:8px;height:3px;border-radius:2px;background:linear-gradient(90deg,#f1dc97,#caa24e)}
.qx-tile-icon{font-size:30px;line-height:1}
.qx-tile-label{font-size:16.5px;font-weight:700;color:#f3e9d2}
.qx-tile-desc{font-size:11.5px;color:#a5987f;line-height:1.35}
.qx-badge{position:absolute;top:10px;right:10px;background:linear-gradient(180deg,#f1dc97,#caa24e);color:#191307;border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:700}
.qx-hint{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#5f5648;font-family:var(--caps,inherit);margin:0 0 18px 6px}
.qx-panel{animation:qxIn .35s cubic-bezier(.2,.7,.2,1) both;max-width:920px}
@keyframes qxIn{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:none}}
.qx-panel .card{background:linear-gradient(180deg,rgba(253,246,231,.97),rgba(236,224,198,.97));border-radius:12px}
.qx-panel .wrap{padding:0}
@media(max-width:640px){.qx-title{font-size:30px}.qx-tile{width:160px;min-height:132px}}
`;
