"use client";

import { useEffect, useRef, useState } from "react";
import ArtistMessageForm from "./ArtistMessageForm";
import { AvatarRender, type AvatarConfig } from "./avatar/AvatarRender";
import ReviewsTicker from "./ReviewsTicker";

export type Flash = { id: string; image_url: string };
export type Artist = {
  id: string; slug: string; display_name: string; specialty: string | null;
  bio: string | null; public_note: string | null; portrait_url: string | null;
  instagram_url: string | null; venue_url: string | null; flash: Flash[];
  avatar?: Partial<AvatarConfig> | null;
  products?: { id: string; title: string; description: string | null; price_cents: number; kind: string; preview_url: string | null }[];
};

const STUDIO_VENUE = "https://venue.ink/";
const CONTACT = {
  address: "315 Coneflower Drive, Garland, TX",
  mapUrl: "https://maps.google.com/?q=315+Coneflower+Drive+Garland+TX",
  phone: "469-246-7217",
  email: "hello@baronesstattoo.com",
  instagram: "https://www.instagram.com/baronesstattoo",
  facebook: "https://www.facebook.com/baronesstattoo",
};
const FALLBACK_PHOTOS = [
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/686041825_18399724834146430_853037633092867592.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/670986604_18396522550146430_246446864300278330.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/623303159_18382563034146430_8582173053-b4c50c8.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/658454530_18082625222612604_424645917561538566.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/503851914_2187254181712828_2715134008098167425.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
  "https://img1.wsimg.com/isteam/ip/b35cdeff-49dc-4837-9cdc-dfead84f5d5f/497726601_1323249775400884_9122255851003204109.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:640",
];

type Scene = "entrance" | "foyer" | "artists" | "gallery" | "booking" | "boutique" | "salon";
const LINES: Record<Scene, string> = {
  entrance: "Pull the bell, and the doors of the estate shall open to you.",
  foyer: "Welcome to the estate. Choose a door and I shall escort you through.",
  artists: "The portrait salon — here hang Her Grace's artists. Touch one to be introduced.",
  gallery: "The gallery of works. Touch any piece to see it close.",
  booking: "The writing parlor, where appointments are entered in the house register.",
  boutique: "The boudoir — Maison Baroness, the ritual line. Not yet released.",
  salon: "The drawing room. Let me tell you of the house and how to call upon us.",
};
const WARES = [
  { bottle: "\u{1F9F4}", line: "La Toilette", name: "Prep Serum", tag: "Prime the canvas.", size: "30 mL" },
  { bottle: "\u{1F90D}", line: "Le Voile", name: "Numbing Cream", tag: "A whisper between you and the needle.", size: "30 g" },
  { bottle: "\u{1F338}", line: "La Rosée", name: "Chair Mist", tag: "Court dew for the working canvas.", size: "60 mL" },
];

function openLink(url: string | null | undefined) { if (url) window.open(url, "_blank", "noopener"); }

function playChime() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [784, 1175, 1568].forEach((freq, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.05;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.start(t); o.stop(t + 1.9);
    });
  } catch { /* audio optional */ }
}

function GateHalf() {
  const bars = [16, 46, 76, 106, 136];
  return (
    <svg viewBox="0 0 152 600" preserveAspectRatio="none" className="gate-svg" aria-hidden="true">
      <defs><linearGradient id="iron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#43434a" /><stop offset="0.5" stopColor="#15151a" /><stop offset="1" stopColor="#43434a" /></linearGradient></defs>
      <rect x="0" y="116" width="152" height="8" fill="url(#iron)" />
      <rect x="0" y="300" width="152" height="8" fill="url(#iron)" />
      <rect x="0" y="470" width="152" height="8" fill="url(#iron)" />
      {bars.map((x, i) => (
        <g key={i}>
          <rect x={x - 2.5} y="30" width="5" height="556" fill="url(#iron)" />
          <path d={`M${x - 6} 32 L${x} 12 L${x + 6} 32 Z`} fill="#caa24e" />
          <circle cx={x} cy="120" r="4" fill="#caa24e" />
        </g>
      ))}
      <g fill="none" stroke="#caa24e" strokeWidth="3">
        <path d="M30 210 C30 182 74 182 74 210 C74 238 30 238 30 210 Z" />
        <path d="M78 210 C78 182 122 182 122 210 C122 238 78 238 78 210 Z" />
        <path d="M30 388 C30 360 74 360 74 388 C74 416 30 416 30 388 Z" />
        <path d="M78 388 C78 360 122 360 122 388 C122 416 78 416 78 388 Z" />
      </g>
    </svg>
  );
}

function ContactBar() {
  const ph = CONTACT.phone.replace(/[^0-9]/g, "");
  return (
    <div className="contactbar">
      <a className="cbtn" href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Address" title={CONTACT.address}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor" /></svg></a>
      <a className="cbtn" href={`tel:${ph}`} aria-label="Phone" title={CONTACT.phone}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.24 1z" fill="currentColor" /></svg></a>
      <a className="cbtn" href={`mailto:${CONTACT.email}`} aria-label="Email" title={CONTACT.email}><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.4l8 5 8-5V6H4zm16 12V8.9l-8 5-8-5V18h16z" fill="currentColor" /></svg></a>
      <a className="cbtn" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 4.95 4.95.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.15 3.25-1.65 4.8-4.95 4.95-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-3.3-.15-4.8-1.7-4.95-4.95C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9C2.42 3.85 3.92 2.32 7.1 2.27 8.4 2.2 8.8 2.2 12 2.2zm0 3.05a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zm0 2.4a4.35 4.35 0 1 1 0 8.7 4.35 4.35 0 0 1 0-8.7zm6.95-.9a1.58 1.58 0 1 0 0 3.16 1.58 1.58 0 0 0 0-3.16z" fill="currentColor" /></svg></a>
      <a className="cbtn" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" fill="currentColor" /></svg></a>
    </div>
  );
}

function Chandelier() {
  return (
    <svg className="chandelier" width="150" height="172" viewBox="0 0 150 172" aria-hidden="true">
      <g stroke="#b8924a" strokeWidth="2.4" fill="none">
        <line x1="75" y1="0" x2="75" y2="40" />
        <path d="M75 56 C40 70 30 96 34 118 M75 56 C110 70 120 96 116 118" />
        <path d="M48 72 C24 86 22 106 30 120 M102 72 C126 86 128 106 120 120" />
        <path d="M40 60 H110" />
      </g>
      <circle cx="75" cy="50" r="9" fill="#caa24e" stroke="#8b6f35" strokeWidth="1.5" />
      <g fill="#f6e6b8" stroke="#8b6f35" strokeWidth="1.4">
        <ellipse cx="30" cy="122" rx="5" ry="8" /><ellipse cx="48" cy="124" rx="5" ry="8" />
        <ellipse cx="75" cy="128" rx="6" ry="9" /><ellipse cx="102" cy="124" rx="5" ry="8" /><ellipse cx="120" cy="122" rx="5" ry="8" />
      </g>
      <g fill="#fff3c4" className="flames">
        <circle cx="30" cy="112" r="3" /><circle cx="48" cy="114" r="3" /><circle cx="75" cy="118" r="3.4" /><circle cx="102" cy="114" r="3" /><circle cx="120" cy="112" r="3" />
      </g>
    </svg>
  );
}

function RoomBackdrop({ kind }: { kind: string }) {
  return (
    <div className={`room room-${kind}`}>
      <div className="wall" />
      <div className="boiserie">
        <span className="panel" /><span className="panel" /><span className="panel" /><span className="panel" /><span className="panel" />
      </div>
      <Chandelier />
      <div className="floor" />
      <div className="photowrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="roomphoto" src={`/rooms/${kind}.jpg`} alt="" onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.display = "none"; }} />
        <div className="photoshade" />
      </div>
      <div className="vignette" />
    </div>
  );
}

export default function EstateApp({ artists, gallery = [] }: { artists: Artist[]; gallery?: string[] }) {
  const [scene, setScene] = useState<Scene>("entrance");
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [transit, setTransit] = useState(false);
  const [active, setActive] = useState<Artist | null>(null);
  const [butlerTarget, setButlerTarget] = useState(LINES.entrance);
  const [butlerText, setButlerText] = useState("");
  const [motes, setMotes] = useState<{ left: number; size: number; dur: number; delay: number }[]>([]);
  const [ringing, setRinging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setButlerText("");
    let i = 0;
    const t = setInterval(() => { i += 1; setButlerText(butlerTarget.slice(0, i)); if (i >= butlerTarget.length) clearInterval(t); }, 18);
    return () => clearInterval(t);
  }, [butlerTarget]);

  useEffect(() => {
    setMotes(Array.from({ length: 28 }, () => ({ left: Math.random() * 100, size: 2 + Math.random() * 4, dur: 8 + Math.random() * 12, delay: -Math.random() * 18 })));
  }, []);

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    function onMove(e: MouseEvent) {
      root!.style.setProperty("--px", String(e.clientX / window.innerWidth - 0.5));
      root!.style.setProperty("--py", String(e.clientY / window.innerHeight - 0.5));
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.1 });
    const id = setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".scene.active .reveal").forEach((el) => { el.classList.remove("in"); obs.observe(el); });
    }, 700);
    return () => { clearTimeout(id); obs.disconnect(); };
  }, [scene, artists.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "");
    if (["foyer", "artists", "gallery", "booking", "boutique", "salon"].includes(h)) {
      setDoorsOpen(true); setScene(h as Scene); setButlerTarget(LINES[h as Scene]);
    }
  }, []);

  function go(s: Scene) {
    if (transit) return;
    setTransit(true);
    window.setTimeout(() => { setScene(s); setButlerTarget(LINES[s]); }, 560);
    window.setTimeout(() => setTransit(false), 1180);
  }
  function ring() {
    if (doorsOpen || ringing) return;
    setRinging(true);
    playChime();
    setButlerTarget("Ah — a guest! Do come in. Allow me to take your coat...");
    window.setTimeout(() => setDoorsOpen(true), 650);
    window.setTimeout(() => { setScene("foyer"); setButlerTarget(LINES.foyer); }, 2100);
  }
  function openArtist(a: Artist) { setActive(a); setButlerTarget(`May I present ${a.display_name}. When ready, I shall book your sitting.`); }
  async function buyProduct(id: string) {
    try { const r = await fetch("/api/checkout-product", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: id }) }); const d = await r.json(); if (d.url) { window.location.href = d.url; } } catch { /* noop */ }
  }

  const galleryPhotos = artists.flatMap((a) => a.flash?.map((f) => f.image_url) ?? []).slice(0, 24);
  const photos = gallery.length ? gallery : (galleryPhotos.length ? galleryPhotos : FALLBACK_PHOTOS);
  const initials = (name: string) => (name?.trim()?.[0] ?? "B").toUpperCase();

  return (
    <div className="estate" ref={rootRef}>
      <style>{CSS}</style>
      <div className="giltframe" />
      <a className="quarters" href="/dashboard">My Quarters</a>
      <ContactBar />

      {/* ENTRANCE — iron gates */}
      <section className={`scene ${scene === "entrance" ? "active" : ""} ${doorsOpen ? "doors-open" : ""} ${ringing ? "ringing" : ""}`} id="entrance">
        <div className="estate-beyond" />
        <span className="sconce l" /><span className="sconce r" />
        <div className="gatewrap">
          <div className="gate left"><GateHalf /></div>
          <div className="gate right"><GateHalf /></div>
        </div>
        <div className="gate-crest">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="crest-logo" src="/logo.png" alt="Baroness Tattoo" />
        </div>
        <button className="bellpull" onClick={ring} aria-label="Ring the bell to enter">
          <span className="bell-rope" />
          <svg className="bell" viewBox="0 0 60 70" aria-hidden="true">
            <defs><linearGradient id="bellg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8cf86" /><stop offset="1" stopColor="#b8924a" /></linearGradient></defs>
            <path d="M30 8 a6 6 0 0 1 6 6 c10 4 13 18 13 30 l3 8 H8 l3 -8 c0 -12 3 -26 13 -30 a6 6 0 0 1 6 -6 Z" fill="url(#bellg)" stroke="#8b6f35" strokeWidth="1.5" />
            <circle cx="30" cy="60" r="4" fill="#8b6f35" />
          </svg>
          <span className="bell-label">Ring to enter</span>
        </button>
        <div className="entrance-text">
          <div className="eyebrow">By Appointment of Her Grace · Garland, Texas</div>
          <div className="estate-sub">A Luxury Atelier in the French Rococo</div>
          <div className="tagline">&ldquo;Wear your crown.&rdquo;</div>
        </div>
        <div className="vignette" />
      </section>

      {/* FOYER */}
      <section className={`scene ${scene === "foyer" ? "active" : ""}`}>
        <RoomBackdrop kind="foyer" />
        <div className="scene-inner center">
          <div className="wordmark-sm reveal">Baroness Tattoo</div>
          <div className="section-title reveal">The Grand Foyer</div>
          <div className="section-kicker reveal">Choose a door, and I shall escort you through.</div>
          <div className="filigree reveal"><span>❦</span></div>
          <div className="rooms">
            <div className="room-card reveal" onClick={() => go("artists")}><span className="room-emblem"><svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="12" height="15" rx="4" /><path d="M20 19 V30 M20 30 V37 M14 9 H10 a3 3 0 0 0 -3 3 V15" /><circle cx="20" cy="9" r="1.6" fill="currentColor" /></svg></span><div className="room-name">Portrait Salon</div><div className="room-desc">Her Grace&rsquo;s artists</div></div>
            <div className="room-card reveal" onClick={() => go("gallery")}><span className="room-emblem">🖼</span><div className="room-name">The Gallery</div><div className="room-desc">Works upon the skin</div></div>
            <div className="room-card reveal" onClick={() => go("booking")}><span className="room-emblem">✉</span><div className="room-name">Writing Parlor</div><div className="room-desc">Request your sitting</div></div>
            <div className="room-card reveal" onClick={() => go("boutique")}><span className="room-emblem">👛</span><div className="room-name">The Boudoir</div><div className="room-desc">Maison Baroness</div></div>
            <div className="room-card reveal" onClick={() => go("salon")}><span className="room-emblem">📜</span><div className="room-name">Drawing Room</div><div className="room-desc">The house &amp; how to call</div></div>
          </div>
          <a className="btn" href="/explore" style={{ marginTop: 26 }}>Stroll the Grounds · 3D (beta)</a>
          <ReviewsTicker />
        </div>
      </section>

      {/* ARTISTS */}
      <section className={`scene ${scene === "artists" ? "active" : ""}`}>
        <RoomBackdrop kind="gallery-hall" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead reveal"><div className="section-title">Portrait Salon</div><div className="section-kicker">The artists in Her Grace&rsquo;s service</div></div>
          <div className="filigree reveal"><span>❦</span></div>
          {artists.length === 0 ? (
            <p className="reveal" style={{ fontStyle: "italic", color: "var(--grey)" }}>The artists are preparing their portraits. Pray return shortly.</p>
          ) : (
            <div className="gallery-grid">
              {artists.map((a) => (
                <div className="portrait reveal" key={a.id} onClick={() => openArtist(a)}>
                  <div className="frame">
                    {a.portrait_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.portrait_url} alt={a.display_name} className="pimg" />
                    ) : a.avatar ? (
                      <AvatarRender config={a.avatar} size={220} />
                    ) : (<span className="initials">{initials(a.display_name)}</span>)}
                  </div>
                  <div className="pmeta"><div className="pname">{a.display_name}</div><div className="pspec">{a.specialty}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section className={`scene ${scene === "gallery" ? "active" : ""}`}>
        <RoomBackdrop kind="gallery" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead reveal"><div className="section-title">The Gallery</div><div className="section-kicker">Custom work, fine line &amp; black-and-grey realism</div></div>
          <div className="filigree reveal"><span>❦</span></div>
          <div className="photos">
            {photos.map((src, i) => (
              <div className="pic reveal" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={src} alt="Tattoo by Baroness Tattoo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className={`scene ${scene === "booking" ? "active" : ""}`}>
        <RoomBackdrop kind="parlor" />
        <div className="scene-inner center">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="parchment reveal">
            <span className="corner tl">❧</span><span className="corner tr">❧</span><span className="corner bl">❧</span><span className="corner br">❧</span>
            <h3>The Writing Parlor</h3>
            <div className="lead">Show up already winning.</div>
            <p>Her Grace receives by appointment. Present your petition and we shall arrange your sitting through the house register — deposits, scheduling, and correspondence kept in good order there.</p>
            <p style={{ fontStyle: "italic", color: "var(--grey)" }}>Walk-ins welcomed at Her Grace&rsquo;s pleasure: Monday through Saturday, noon to eight; Sunday, noon to six. Shop minimum $100.</p>
            <div className="bookrow">
              <button className="btn" onClick={() => openLink(STUDIO_VENUE)}>Request a Sitting</button>
              <button className="btn ghost" onClick={() => go("artists")}>Choose an Artist First</button>
            </div>
          </div>
        </div>
      </section>

      {/* BOUTIQUE */}
      <section className={`scene ${scene === "boutique" ? "active" : ""}`}>
        <RoomBackdrop kind="boudoir" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead reveal"><div className="section-title">Maison Baroness</div><div className="section-kicker">The ritual before the ritual — a skincare house for the working canvas</div></div>
          <div className="filigree reveal"><span>❦</span></div>
          <div className="shelf">
            {WARES.map((w) => (
              <div className="ware reveal" key={w.name}>
                <div className="vessel"><span className="bottle">{w.bottle}</span><span className="soon">Coming Soon</span></div>
                <div className="wline">{w.line}</div><div className="wname">{w.name}</div><div className="wtag">{w.tag}</div><div className="wsize">{w.size}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SALON */}
      <section className={`scene ${scene === "salon" ? "active" : ""}`}>
        <RoomBackdrop kind="salon" />
        <div className="scene-inner center">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="parchment reveal">
            <span className="corner tl">❧</span><span className="corner tr">❧</span><span className="corner bl">❧</span><span className="corner br">❧</span>
            <h3>The Drawing Room</h3>
            <div className="lead">Powdered porcelain. Wet ink. A coronet of pearls and a needle that doesn&rsquo;t blink.</div>
            <p>Baroness Tattoo is a luxury studio dressed in the decadence of the French Rococo — gold-framed mirrors, candle clusters, velvet in deep cream, and not a fluorescent light to be found. Every guest is received as nobility: escorted from the foyer to the chair, and sent home wearing their crown.</p>
            <div className="contact">
              <div><div className="lbl">The Estate</div><div className="val">315 Coneflower Drive<br />Garland, Texas</div></div>
              <div><div className="lbl">To Call Upon Us</div><div className="val"><a href="tel:4692467217">469·246·7217</a></div></div>
              <div><div className="lbl">Receiving Hours</div><div className="val">Mon–Sat · 12–8 PM<br />Sunday · 12–6 PM</div></div>
              <div><div className="lbl">Of Note</div><div className="val">Walk-ins welcome<br />Shop minimum $100</div></div>
            </div>
            <div className="bookrow" style={{ justifyContent: "flex-start", marginTop: 22 }}>
              <button className="btn" onClick={() => openLink(STUDIO_VENUE)}>Request a Sitting</button>
            </div>
          </div>
        </div>
      </section>

      {/* DOOR TRANSITION VEIL */}
      <div className={`doorveil${transit ? " run" : ""}`} aria-hidden="true">
        <div className="dv left" /><div className="dv right" />
      </div>

      {/* BUTLER + NAV (persistent) */}
      <div className="butler">
        <div className="butlerdock">
          <div className="butlernav">
            <div className="bn-h">Navigate the Estate</div>
            <button onClick={() => go("foyer")}>The Foyer</button>
            <button onClick={() => go("artists")}>Portrait Salon</button>
            <button onClick={() => go("gallery")}>The Gallery</button>
            <button onClick={() => go("booking")}>Appointment Parlor</button>
            <button onClick={() => go("boutique")}>Maison Baroness</button>
            <button onClick={() => go("salon")}>Drawing Room</button>
            <div className="bn-div" />
            <a href="/explore">Stroll the Grounds · 3D</a>
            <a href="/dashboard">My Quarters · Profile</a>
          </div>
          <div className="avatar">🧑‍✈️</div>
        </div>
        <div className="bubble"><div className="who">Reynard · Butler to Her Grace</div><div className="say">{butlerText}</div></div>
      </div>

      {/* MOTES */}
      <div className="motes">
        {motes.map((m, i) => (<span key={i} className="mote" style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }} />))}
      </div>

      {/* ARTIST MODAL */}
      {active && (
        <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
          <div className="sheet">
            <button className="closeX" onClick={() => setActive(null)}>×</button>
            <div className="hero">
              {active.portrait_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.portrait_url} alt={active.display_name} className="heroimg" />
              ) : active.avatar ? (
                <AvatarRender config={active.avatar} size={200} />
              ) : (<span className="initials">{initials(active.display_name)}</span>)}
            </div>
            <div className="body">
              <h2>{active.display_name}</h2>
              <div className="spec">{active.specialty}</div>
              <p>{active.bio || "Bio coming soon. Visit this artist's atelier to view their latest work."}</p>
              {active.flash?.length > 0 && (
                <div className="flashgrid">
                  {active.flash.map((f) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={f.id} src={f.image_url} alt="flash" className="ftile" />
                  ))}
                </div>
              )}
              {active.public_note && (<div className="notebox"><div className="who">A note left for you</div><span>{active.public_note}</span></div>)}
              {active.products && active.products.length > 0 && (
                <div className="shopwrap">
                  <div className="shoph">Atelier shop</div>
                  <div className="shopgrid">
                    {active.products.map((pr) => (
                      <div className="shopitem" key={pr.id}>
                        {pr.preview_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pr.preview_url} alt={pr.title} className="si-img" />
                        ) : (<div className="si-ph">✦</div>)}
                        <div className="si-title">{pr.title}</div>
                        <div className="si-price">${(pr.price_cents / 100).toFixed(2)} · {pr.kind}</div>
                        <button className="btn" onClick={() => buyProduct(pr.id)}>Buy</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bookrow" style={{ justifyContent: "flex-start", marginTop: 22 }}>
                <button className="btn" onClick={() => openLink(active.venue_url || STUDIO_VENUE)}>Book with this Artist</button>
                {active.instagram_url && <button className="btn ghost" onClick={() => openLink(active.instagram_url)}>View Their Atelier</button>}
                <button className="btn ghost" onClick={() => setActive(null)}>Return to the Hall</button>
              </div>
              <ArtistMessageForm artistId={active.id} artistName={active.display_name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DAMASK = "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='90'%20height='130'%20viewBox='0%200%2090%20130'%3E%3Cg%20fill='none'%20stroke='%23b8924a'%20stroke-opacity='0.18'%20stroke-width='2'%3E%3Cpath%20d='M45%206C66%2028%2066%2050%2045%2070%2024%2050%2024%2028%2045%206Z'/%3E%3Ccircle%20cx='45'%20cy='38'%20r='7'/%3E%3Cpath%20d='M0%2072C22%2094%2022%20116%200%20130M90%2072C68%2094%2068%20116%2090%20130'/%3E%3C/g%3E%3C/svg%3E\")";

const CSS = `
.estate{position:fixed;inset:0;overflow:hidden;font-family:var(--body);color:var(--black);background:#0c0a08;--px:0;--py:0}
.estate .giltframe{position:absolute;inset:14px;border:1.5px solid var(--gold);box-shadow:inset 0 0 0 4px rgba(0,0,0,.12),inset 0 0 0 6px var(--gold-dark);pointer-events:none;border-radius:3px;z-index:60}
.estate .quarters{position:fixed;top:22px;right:30px;z-index:62;font-family:var(--caps);letter-spacing:.14em;text-transform:uppercase;font-size:10px;color:var(--black);background:linear-gradient(180deg,var(--gold-light),var(--gold));border:1px solid var(--gold-dark);padding:8px 14px;border-radius:2px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.estate .quarters:hover{filter:brightness(1.08)}
.estate .vignette{position:absolute;inset:0;box-shadow:inset 0 0 240px rgba(40,26,12,.55);pointer-events:none;z-index:3}
.estate .scene{position:absolute;inset:0;display:none;opacity:0}
.estate .scene.active{display:flex;animation:sceneIn 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes sceneIn{0%{opacity:0}100%{opacity:1}}
.estate .scene-inner{position:relative;z-index:5;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:74px 30px 150px;overflow-y:auto;scroll-behavior:smooth}
.estate .scene-inner.center{justify-content:center}
.estate .reveal{opacity:0;transform:translateY(26px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.estate .reveal.in{opacity:1;transform:none}
/* ===== ROCOCO ROOM ===== */
.estate .room{position:absolute;inset:0;z-index:0;overflow:hidden;transform:translate(calc(var(--px)*-10px),calc(var(--py)*-7px));transition:transform .25s ease-out}
.estate .room-foyer{--wall:#a9c4d4;--wall2:#d6e6ef}
.estate .room-gallery-hall{--wall:#a6c1d2;--wall2:#d2e2ed}
.estate .room-gallery{--wall:#9fbccf;--wall2:#cee0ec}
.estate .room-parlor{--wall:#b2cad9;--wall2:#dae8f0}
.estate .room-boudoir{--wall:#ccb2c3;--wall2:#ecd8e1}
.estate .room-salon{--wall:#aac6d1;--wall2:#d6e6ec}
.estate .wall{position:absolute;inset:0;background:linear-gradient(180deg,var(--wall2) 0%,var(--wall) 55%,color-mix(in srgb,var(--wall) 76%,#33506a) 100%)}
.estate .wall::after{content:"";position:absolute;inset:0;background-image:${"" /*damask*/}var(--damask);background-size:90px 130px;opacity:.85;mix-blend-mode:multiply}
.estate .boiserie{position:absolute;left:0;right:0;top:9%;height:48%;display:flex;gap:3vw;justify-content:center;padding:0 5vw;z-index:0;opacity:.9}
.estate .panel{flex:1;max-width:210px;border:2px solid var(--gold);border-radius:90px 90px 6px 6px;box-shadow:inset 0 0 0 4px rgba(255,255,255,.18),inset 0 0 0 6px var(--gold-dark),0 0 16px rgba(184,146,74,.18);background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(184,146,74,.05))}
.estate .floor{position:absolute;left:-30%;right:-30%;bottom:0;height:34%;background-color:#e9e4d8;background-image:conic-gradient(#15110d 90deg,#efeadf 0 180deg,#15110d 0 270deg,#efeadf 0);background-size:64px 64px;transform:perspective(440px) rotateX(63deg);transform-origin:bottom;opacity:.5;z-index:0;box-shadow:0 -34px 56px 34px var(--wall)}
.estate .photowrap{position:absolute;inset:0;z-index:1}
.estate .roomphoto{width:100%;height:100%;object-fit:cover;display:block}
.estate .photoshade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,12,8,.30),rgba(18,12,8,.12) 38%,rgba(18,12,8,.52))}
.estate .chandelier{position:absolute;top:2px;left:50%;transform:translateX(-50%);z-index:1;filter:drop-shadow(0 0 26px rgba(255,200,110,.55));animation:sway 6s ease-in-out infinite;transform-origin:top center}
@keyframes sway{0%,100%{transform:translateX(-50%) rotate(-1.1deg)}50%{transform:translateX(-50%) rotate(1.1deg)}}
.estate .chandelier .flames{animation:eflick 2.2s ease-in-out infinite}
/* ===== ENTRANCE ===== */
.estate #entrance{background:#0a0806}
.estate .approach{position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 38%,rgba(120,90,40,.35),rgba(10,7,5,0) 70%),radial-gradient(140% 120% at 50% 120%,rgba(60,44,20,.5),#0a0806 75%);transform:translate(calc(var(--px)*-26px),calc(var(--py)*-18px)) scale(1.12);animation:approachPulse 9s ease-in-out infinite}
@keyframes approachPulse{0%,100%{opacity:.85}50%{opacity:1}}
.estate .doorwrap{position:absolute;inset:0;display:flex;z-index:8;transform:translate(calc(var(--px)*-8px),0)}
.estate .door{position:relative;width:50%;height:100%;background:linear-gradient(180deg,var(--velvet-2),var(--velvet) 60%,#0d0a08);transition:transform 1.7s cubic-bezier(.7,.02,.27,1);box-shadow:inset 0 0 90px rgba(0,0,0,.7)}
.estate .door::before{content:"";position:absolute;inset:30px;border:2px solid var(--gold-dark);box-shadow:inset 0 0 0 3px rgba(0,0,0,.35),inset 0 0 0 4px var(--gold);border-radius:60px 60px 8px 8px}
.estate .door .knob{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--gold-light),var(--gold-dark));box-shadow:0 0 14px rgba(212,181,116,.6)}
.estate .door.left{transform-origin:left center}.estate .door.left .knob{right:26px}
.estate .door.right{transform-origin:right center}.estate .door.right .knob{left:26px}
.estate .doors-open .door.left{transform:perspective(1500px) rotateY(110deg)}
.estate .doors-open .door.right{transform:perspective(1500px) rotateY(-110deg)}
.estate .entrance-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:12;transition:opacity .8s ease;padding:20px;transform:translate(calc(var(--px)*-16px),calc(var(--py)*-12px))}
.estate .doors-open .entrance-content{opacity:0;pointer-events:none}
.estate .eyebrow{font-family:var(--caps);letter-spacing:.42em;font-size:12px;color:var(--gold-light);text-transform:uppercase;margin-bottom:22px}
.estate .logo-img{max-width:min(360px,70vw);width:100%;height:auto;background:var(--cream);padding:24px 28px;border:2px solid var(--gold);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.55),inset 0 0 0 4px rgba(139,111,53,.25);animation:floaty 7s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.estate .estate-sub{font-family:var(--caps);letter-spacing:.36em;font-size:clamp(11px,2.2vw,16px);color:var(--cream);text-transform:uppercase;margin-top:24px}
.estate .tagline{font-family:var(--display);font-style:italic;font-size:clamp(17px,3vw,24px);color:var(--gold-light);margin-top:10px}
.estate .knock{margin-top:42px}
.estate .enterhint{margin-top:18px;font-size:30px;color:var(--gold-light);opacity:.7;animation:bob 1.8s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(8px);opacity:.9}}
/* ===== BUTTONS / HEADINGS ===== */
.estate .btn{position:relative;overflow:hidden;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:var(--black);background:linear-gradient(180deg,var(--gold-light),var(--gold));border:1px solid var(--gold-dark);padding:14px 28px;border-radius:2px;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35);transition:transform .25s,box-shadow .25s,filter .25s}
.estate .btn:hover{transform:translateY(-2px);filter:brightness(1.07)}
.estate .btn::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(110deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);transition:left .6s}
.estate .btn:hover::after{left:120%}
.estate .btn.ghost{background:transparent;color:var(--gold-dark);border-color:var(--gold)}
.estate .section-title{font-family:var(--display);font-weight:700;font-size:clamp(40px,7vw,76px);color:var(--black);text-align:center;line-height:1;margin-bottom:4px;text-shadow:0 1px 0 rgba(255,255,255,.4)}
.estate .section-kicker{font-family:var(--display);font-style:italic;font-size:clamp(16px,2.6vw,21px);color:#5a4a32;text-align:center;margin-bottom:14px}
.estate .filigree{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 34px;color:var(--gold-dark);max-width:360px}
.estate .filigree::before,.estate .filigree::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,var(--gold-dark))}
.estate .filigree::after{background:linear-gradient(90deg,var(--gold-dark),transparent)}
.estate .filigree span{animation:twinkle 3.5s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.18)}}
.estate .wordmark-sm{font-family:var(--blackletter);font-size:30px;color:var(--gold-dark);text-align:center;line-height:.9;margin-bottom:6px}
/* ===== FOYER DOORS ===== */
.estate .rooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:22px;width:100%;max-width:1040px;perspective:1200px}
.estate .room-card{position:relative;min-height:230px;background:linear-gradient(180deg,#fbf2dd,#e9d9b4);border:2px solid var(--gold);border-radius:100px 100px 6px 6px;padding:34px 18px 22px;text-align:center;cursor:pointer;transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s;box-shadow:0 12px 30px rgba(0,0,0,.22);transform-origin:left center;display:flex;flex-direction:column;align-items:center;justify-content:center}
.estate .room-card::before{content:"";position:absolute;inset:10px;border:1px solid var(--gold-dark);border-radius:80px 80px 4px 4px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.3);pointer-events:none}
.estate .room-card::after{content:"";position:absolute;top:52%;right:16px;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--gold-light),var(--gold-dark));box-shadow:0 0 8px rgba(212,181,116,.6)}
.estate .room-card:hover{transform:perspective(1200px) rotateY(-16deg) translateZ(10px);box-shadow:0 30px 60px rgba(0,0,0,.34)}
.estate .room-emblem{font-size:38px;color:var(--gold-dark);margin-bottom:12px;display:block;transition:transform .4s}
.estate .room-card:hover .room-emblem{transform:translateY(-3px) scale(1.1)}
.estate .room-name{font-family:var(--caps);font-size:15px;letter-spacing:.05em;color:var(--black)}
.estate .room-desc{font-family:var(--display);font-style:italic;font-size:16px;color:#6a563a;margin-top:6px}
.estate .roomhead{text-align:center;max-width:760px;margin-bottom:18px}
.estate .backline{position:absolute;top:30px;left:34px;z-index:40}
/* ===== PORTRAITS / GALLERY ===== */
.estate .gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;width:100%;max-width:1060px}
.estate .portrait{position:relative;background:#fdf6e7;border:1px solid var(--gold);border-radius:5px;overflow:hidden;cursor:pointer;transition:transform .35s,box-shadow .35s;box-shadow:0 10px 26px rgba(0,0,0,.2)}
.estate .portrait:hover{transform:translateY(-6px) scale(1.015);box-shadow:0 22px 44px rgba(0,0,0,.3)}
.estate .portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 32%,rgba(255,240,200,.4) 50%,transparent 68%);transform:translateX(-130%);transition:transform .8s;pointer-events:none;z-index:3}
.estate .portrait:hover::after{transform:translateX(130%)}
.estate .portrait .frame{height:220px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--velvet-2),var(--velvet));position:relative}
.estate .portrait .frame::after{content:"";position:absolute;inset:12px;border:2px solid var(--gold);border-radius:3px;pointer-events:none}
.estate .portrait .pimg{width:100%;height:100%;object-fit:cover}
.estate .portrait .initials{font-family:var(--display);font-weight:700;font-size:72px;color:var(--gold-light)}
.estate .portrait .pmeta{padding:18px 16px 22px;text-align:center}
.estate .portrait .pname{font-family:var(--caps);font-size:18px;color:var(--black);letter-spacing:.04em}
.estate .portrait .pspec{font-family:var(--display);font-style:italic;color:var(--grey);margin-top:5px;font-size:16px}
.estate .photos{columns:3 260px;column-gap:16px;width:100%;max-width:1080px}
.estate .photos .pic{break-inside:avoid;margin-bottom:16px;border:3px solid var(--gold);border-radius:4px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.3),inset 0 0 0 1px var(--gold-dark);background:var(--velvet)}
.estate .photos .pic img{display:block;width:100%;height:auto;transition:transform .5s,filter .5s}
.estate .photos .pic:hover img{transform:scale(1.06);filter:brightness(1.06)}
/* ===== WARES ===== */
.estate .shelf{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:26px;width:100%;max-width:1000px}
.estate .ware{position:relative;background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:1px solid var(--gold);border-radius:6px;overflow:hidden;text-align:center;box-shadow:0 10px 24px rgba(0,0,0,.18);padding-bottom:26px;transition:transform .35s,box-shadow .35s}
.estate .ware:hover{transform:translateY(-6px);box-shadow:0 22px 44px rgba(0,0,0,.28)}
.estate .ware .vessel{height:200px;display:flex;align-items:center;justify-content:center;position:relative;background:radial-gradient(120% 90% at 50% 20%,#2a221b,var(--velvet))}
.estate .ware .vessel::after{content:"";position:absolute;inset:14px;border:1px solid var(--gold);border-radius:4px}
.estate .ware .bottle{font-size:62px}
.estate .ware .soon{position:absolute;top:12px;right:12px;font-family:var(--caps);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--cream);background:rgba(184,146,74,.92);padding:4px 9px;border-radius:20px}
.estate .ware .wline{font-family:var(--caps);letter-spacing:.18em;font-size:12px;color:var(--gold-dark);margin:18px 14px 2px;text-transform:uppercase}
.estate .ware .wname{font-family:var(--display);font-weight:600;font-size:23px;color:var(--black);margin:0 14px 2px}
.estate .ware .wtag{font-family:var(--display);font-style:italic;color:var(--grey);font-size:17px;margin:0 16px 6px}
.estate .ware .wsize{font-family:var(--caps);font-size:10px;letter-spacing:.12em;color:var(--grey)}
/* ===== PARCHMENT ===== */
.estate .parchment{position:relative;background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:1px solid var(--gold);border-radius:8px;padding:42px 44px;max-width:700px;box-shadow:0 22px 56px rgba(0,0,0,.4)}
.estate .parchment::before{content:"";position:absolute;inset:8px;border:1px solid rgba(139,111,53,.4);border-radius:4px;pointer-events:none}
.estate .parchment h3{font-family:var(--display);font-weight:700;font-size:42px;color:var(--black);margin-bottom:6px}
.estate .parchment .lead{font-family:var(--display);font-style:italic;font-size:20px;color:var(--gold-dark);margin-bottom:18px}
.estate .parchment p{font-size:19px;line-height:1.66;color:#3a322a;margin-bottom:15px}
.estate .parchment .corner{position:absolute;width:24px;height:24px;color:var(--gold-dark);font-size:22px;pointer-events:none;opacity:.85}
.estate .corner.tl{top:5px;left:9px}.estate .corner.tr{top:5px;right:9px;transform:scaleX(-1)}
.estate .corner.bl{bottom:3px;left:9px;transform:scaleY(-1)}.estate .corner.br{bottom:3px;right:9px;transform:scale(-1)}
.estate .bookrow{display:flex;flex-wrap:wrap;gap:13px;justify-content:center;margin-top:8px}
.estate .contact{display:grid;grid-template-columns:1fr 1fr;gap:18px 30px;margin-top:26px;padding-top:22px;border-top:1px solid rgba(139,111,53,.4)}
.estate .contact .lbl{font-family:var(--caps);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:3px}
.estate .contact .val{font-size:18px;color:#3a322a;line-height:1.45}
.estate .contact a{color:var(--gold-dark);text-decoration:none;border-bottom:1px solid var(--gold)}
/* ===== DOOR VEIL TRANSITION ===== */
.estate .doorveil{position:fixed;inset:0;z-index:70;pointer-events:none;display:flex}
.estate .doorveil.run{pointer-events:auto}
.estate .doorveil .dv{position:relative;width:50%;height:100%;background:linear-gradient(180deg,var(--velvet-2),var(--velvet) 60%,#0d0a08);box-shadow:inset 0 0 90px rgba(0,0,0,.7);transform:translateX(-105%)}
.estate .doorveil .dv.right{transform:translateX(105%)}
.estate .doorveil .dv::before{content:"";position:absolute;inset:26px;border:2px solid var(--gold-dark);box-shadow:inset 0 0 0 3px rgba(0,0,0,.3),inset 0 0 0 4px var(--gold);border-radius:60px 60px 8px 8px}
.estate .doorveil .dv::after{content:"";position:absolute;top:50%;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--gold-light),var(--gold-dark));box-shadow:0 0 14px rgba(212,181,116,.6)}
.estate .doorveil .dv.left::after{right:30px}.estate .doorveil .dv.right::after{left:30px}
.estate .doorveil.run .dv.left{animation:veilL 1.18s ease-in-out}
.estate .doorveil.run .dv.right{animation:veilR 1.18s ease-in-out}
@keyframes veilL{0%{transform:translateX(-105%)}42%{transform:translateX(0)}58%{transform:translateX(0)}100%{transform:translateX(-105%)}}
@keyframes veilR{0%{transform:translateX(105%)}42%{transform:translateX(0)}58%{transform:translateX(0)}100%{transform:translateX(105%)}}
/* ===== BUTLER / MOTES ===== */
.estate .butler{position:fixed;left:0;right:0;bottom:0;z-index:55;display:flex;align-items:flex-end;gap:16px;padding:16px 26px;background:linear-gradient(0deg,rgba(12,10,8,.96),rgba(12,10,8,0));pointer-events:none}
.estate .butler .avatar{flex:0 0 auto;width:88px;height:88px;border-radius:50%;background:radial-gradient(circle at 40% 35%,var(--velvet-2),var(--velvet));border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:46px;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.estate .bubble{background:rgba(245,233,211,.97);border:1px solid var(--gold);border-radius:12px;padding:11px 20px;max-width:760px;box-shadow:0 8px 22px rgba(0,0,0,.4)}
.estate .bubble .who{font-family:var(--caps);font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:3px}
.estate .bubble .say{font-family:var(--display);font-size:19px;font-style:italic;color:var(--black);min-height:1.4em}
.estate .butlerdock{position:relative;pointer-events:auto}
.estate .avatar{cursor:pointer;position:relative;transition:transform .25s,box-shadow .25s}
.estate .butlerdock:hover .avatar{transform:translateY(-2px);box-shadow:0 0 0 3px rgba(212,181,116,.5),0 8px 20px rgba(0,0,0,.5)}
.estate .avatar .navtag{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-family:var(--caps);font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-light);white-space:nowrap;opacity:.85}
.estate .butlernav{position:absolute;bottom:104px;left:0;display:flex;flex-direction:column;gap:1px;background:rgba(18,11,8,.92);border:1px solid var(--gold);border-radius:10px;padding:8px;min-width:210px;box-shadow:0 14px 34px rgba(0,0,0,.55)}
@keyframes navIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.estate .butlernav .bn-h{font-family:var(--caps);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-light);padding:4px 10px 7px}
.estate .butlernav .bn-div{height:1px;background:linear-gradient(90deg,transparent,var(--gold-dark),transparent);margin:5px 6px}
.estate .butlernav button,.estate .butlernav a{font-family:var(--display);font-size:17px;color:#f5e9d3;background:transparent;border:none;text-align:left;padding:7px 11px;border-radius:6px;cursor:pointer;text-decoration:none;display:block;width:100%}
.estate .butlernav button:hover,.estate .butlernav a:hover{background:rgba(184,146,74,.28);color:#fff}
.estate .motes{position:absolute;inset:0;z-index:50;pointer-events:none;overflow:hidden}
.estate .mote{position:absolute;bottom:-12px;border-radius:50%;background:radial-gradient(circle,rgba(255,238,190,.9),rgba(255,238,190,0));animation:erise linear infinite}
@keyframes erise{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.8}90%{opacity:.5}100%{transform:translateY(-105vh) translateX(40px);opacity:0}}
.estate .sconce{position:absolute;top:30%;width:10px;height:10px;border-radius:50%;z-index:9;background:#ffd98a;box-shadow:0 0 26px 12px rgba(255,196,92,.5),0 0 70px 30px rgba(255,150,40,.2);animation:eflick 2.4s infinite ease-in-out}
.estate .sconce.l{left:11%}.estate .sconce.r{right:11%;animation-delay:.8s}
@keyframes eflick{0%,100%{opacity:.85;transform:scale(1)}45%{opacity:1;transform:scale(1.12)}70%{opacity:.7;transform:scale(.95)}}
/* ===== MODAL ===== */
.estate .modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,.8);padding:24px;animation:fadeIn .3s ease both}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.estate .sheet{background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:2px solid var(--gold);border-radius:10px;max-width:760px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 18px 50px rgba(0,0,0,.45);position:relative;animation:sheetIn .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes sheetIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.estate .sheet .hero{height:220px;background:linear-gradient(135deg,var(--velvet-2),var(--velvet));display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.estate .sheet .hero::after{content:"";position:absolute;inset:14px;border:2px solid var(--gold);border-radius:3px;pointer-events:none}
.estate .sheet .hero .heroimg{width:100%;height:100%;object-fit:cover}
.estate .sheet .hero .initials{font-family:var(--display);font-weight:700;font-size:96px;color:var(--gold-light)}
.estate .sheet .body{padding:30px 36px 36px}
.estate .sheet h2{font-family:var(--display);font-weight:700;font-size:46px;color:var(--black);line-height:1}
.estate .sheet .spec{font-family:var(--caps);letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:var(--gold-dark);margin:6px 0 18px}
.estate .sheet p{font-size:18px;line-height:1.6;color:#3a322a;margin-bottom:14px}
.estate .flashgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 24px}
.estate .flashgrid .ftile{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;border:1px solid var(--gold-dark)}
.estate .closeX{position:absolute;top:12px;right:14px;z-index:5;background:rgba(0,0,0,.45);color:var(--gold-light);border:1px solid var(--gold);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px}
.estate .notebox{background:rgba(168,196,162,.16);border:1px dashed var(--gold-dark);border-radius:6px;padding:14px 16px;margin-top:6px;font-size:16px;color:#4a4036}
.estate .notebox .who{font-family:var(--caps);font-size:10px;letter-spacing:.2em;color:var(--gold-dark);text-transform:uppercase;margin-bottom:4px}
@media(max-width:560px){.estate .photos{columns:2 150px}.estate .flashgrid{grid-template-columns:repeat(2,1fr)}.estate .backline{top:18px;left:18px}.estate .contact{grid-template-columns:1fr}.estate .quarters{top:18px;right:20px}.estate .boiserie{display:none}}
@media(prefers-reduced-motion:reduce){.estate *,.estate *::before,.estate *::after{animation:none!important;transition:none!important}.estate .reveal{opacity:1;transform:none}}
.estate .estate-beyond{position:absolute;inset:0;background:url(/rooms/foyer.jpg) center/cover;filter:brightness(.4) saturate(.85);transform:translate(calc(var(--px)*-18px),calc(var(--py)*-12px)) scale(1.12);z-index:0}
.estate .gatewrap{position:absolute;inset:0;z-index:8}
.estate .gate{position:absolute;top:0;height:100%;width:51%;transition:transform 1.8s cubic-bezier(.7,.02,.27,1);backface-visibility:hidden}
.estate .gate.left{left:0;transform-origin:left center}
.estate .gate.right{right:0;transform-origin:right center}
.estate .gate-svg{width:100%;height:100%;display:block;filter:drop-shadow(0 0 18px rgba(0,0,0,.6))}
.estate .doors-open .gate.left{transform:perspective(1600px) rotateY(118deg)}
.estate .doors-open .gate.right{transform:perspective(1600px) rotateY(-118deg)}
.estate .gate-crest{position:absolute;top:9%;left:50%;transform:translateX(-50%);z-index:11;background:radial-gradient(circle,#1f1d1a,#0c0a08);border:4px solid #caa24e;border-radius:50%;width:min(210px,44vw);height:min(210px,44vw);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(0,0,0,.7),inset 0 0 0 7px rgba(139,111,53,.4)}
.estate .crest-logo{width:80%;height:80%;object-fit:contain;background:var(--cream);border-radius:50%;padding:10px}
.estate .doors-open .gate-crest{opacity:0;transition:opacity .6s ease}
.estate .bellpull{position:absolute;top:7%;right:19%;z-index:12;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px}
.estate .bell-rope{width:2px;height:54px;background:linear-gradient(#caa24e,#8b6f35)}
.estate .bell{width:52px;height:auto;transform-origin:50% 8px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))}
.estate .bellpull:hover .bell{animation:bellnudge .6s ease}
.estate .ringing .bell{animation:bellring 1s ease}
@keyframes bellnudge{0%,100%{transform:rotate(0)}30%{transform:rotate(9deg)}60%{transform:rotate(-7deg)}}
@keyframes bellring{0%{transform:rotate(0)}15%{transform:rotate(24deg)}35%{transform:rotate(-19deg)}55%{transform:rotate(13deg)}75%{transform:rotate(-8deg)}100%{transform:rotate(0)}}
.estate .bell-label{font-family:var(--caps);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-light);text-shadow:0 1px 4px #000}
.estate .doors-open .bellpull{opacity:0;transition:opacity .5s ease;pointer-events:none}
.estate .entrance-text{position:absolute;left:0;right:0;bottom:17%;z-index:10;text-align:center;transition:opacity .8s ease;padding:0 20px}
.estate .doors-open .entrance-text{opacity:0}
.estate .contactbar{position:fixed;right:26px;bottom:22px;z-index:58;display:flex;gap:8px}
.estate .cbtn{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--black);background:linear-gradient(180deg,var(--gold-light),var(--gold));border:1px solid var(--gold-dark);text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,.35);transition:transform .2s,filter .2s}
.estate .cbtn:hover{filter:brightness(1.08);transform:translateY(-2px)}
@media(max-width:560px){.estate .contactbar{right:14px;bottom:14px;gap:6px}.estate .cbtn{width:30px;height:30px}.estate .bellpull{right:11%}}
.estate .shopwrap{margin:6px 0 18px}
.estate .shoph{font-family:var(--caps);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:8px}
.estate .shopgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.estate .shopitem{border:1px solid var(--gold);border-radius:6px;overflow:hidden;background:#fffdf6;text-align:center;padding-bottom:8px}
.estate .si-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.estate .si-ph{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#241c16,#161210);color:var(--gold-light);font-size:26px}
.estate .si-title{font-size:13px;color:var(--black);margin:6px 6px 0;font-weight:600}
.estate .si-price{font-size:12px;color:var(--gold-dark);margin:0 0 6px}
.estate .shopitem .btn{padding:7px 14px;font-size:10px}
`.replace(/var\(--damask\)/g, DAMASK);
