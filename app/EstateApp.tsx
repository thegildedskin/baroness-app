"use client";

import { useEffect, useState } from "react";

export type Flash = { id: string; image_url: string };
export type Artist = {
  id: string;
  slug: string;
  display_name: string;
  specialty: string | null;
  bio: string | null;
  public_note: string | null;
  portrait_url: string | null;
  instagram_url: string | null;
  venue_url: string | null;
  flash: Flash[];
};

const STUDIO_VENUE = "https://venue.ink/";
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
  foyer: "Welcome to the estate. Choose a room and I shall escort you at once.",
  artists: "Here hang the portraits of Her Grace's artists. Touch one to be introduced.",
  gallery: "The Gallery — works the house has worn. Touch any piece to see it close.",
  booking: "To arrange a sitting, I shall lead you to the house register.",
  boutique: "Maison Baroness — the ritual line. These relics are not yet released.",
  salon: "The Salon, where I may tell you of the house and how to call upon us.",
};

const WARES = [
  { bottle: "\u{1F9F4}", line: "La Toilette", name: "Prep Serum", tag: "Prime the canvas.", size: "30 mL" },
  { bottle: "\u{1F90D}", line: "Le Voile", name: "Numbing Cream", tag: "A whisper between you and the needle.", size: "30 g" },
  { bottle: "\u{1F338}", line: "La Rosée", name: "Chair Mist", tag: "Court dew for the working canvas.", size: "60 mL" },
];

function openLink(url: string | null | undefined) {
  if (url) window.open(url, "_blank", "noopener");
}

export default function EstateApp({ artists }: { artists: Artist[] }) {
  const [scene, setScene] = useState<Scene>("entrance");
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [active, setActive] = useState<Artist | null>(null);
  const [butlerTarget, setButlerTarget] = useState(LINES.entrance);
  const [butlerText, setButlerText] = useState("");
  const [motes, setMotes] = useState<{ left: number; size: number; dur: number; delay: number }[]>([]);

  // butler typing effect
  useEffect(() => {
    setButlerText("");
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setButlerText(butlerTarget.slice(0, i));
      if (i >= butlerTarget.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [butlerTarget]);

  // dust motes (client only — avoids hydration mismatch)
  useEffect(() => {
    setMotes(
      Array.from({ length: 22 }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        dur: 8 + Math.random() * 12,
        delay: -Math.random() * 18,
      }))
    );
  }, []);

  function go(s: Scene) {
    setScene(s);
    setButlerTarget(LINES[s]);
  }
  function ring() {
    setDoorsOpen(true);
    setButlerTarget("Ah — a guest! Do come in. Allow me to take your coat...");
    setTimeout(() => go("foyer"), 1750);
  }
  function openArtist(a: Artist) {
    setActive(a);
    setButlerTarget(`May I present ${a.display_name}. When ready, I shall book your sitting.`);
  }

  const galleryPhotos =
    artists.flatMap((a) => a.flash?.map((f) => f.image_url) ?? []).slice(0, 24);
  const photos = galleryPhotos.length ? galleryPhotos : FALLBACK_PHOTOS;

  const initials = (name: string) => (name?.trim()?.[0] ?? "B").toUpperCase();

  return (
    <div className="estate">
      <style>{CSS}</style>
      <div className="giltframe" />

      {/* ENTRANCE */}
      <section className={`scene ${scene === "entrance" ? "active" : ""} ${doorsOpen ? "doors-open" : ""}`} id="entrance">
        <div className="doorwrap">
          <div className="door left"><span className="knob" /></div>
          <div className="door right"><span className="knob" /></div>
        </div>
        <span className="sconce l" /><span className="sconce r" />
        <div className="entrance-content">
          <div className="eyebrow">By Appointment of Her Grace · Garland, Texas</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-img" src="/logo.png" alt="Baroness Tattoo" />
          <div className="estate-sub">A Luxury Atelier in the French Rococo</div>
          <div className="tagline">&ldquo;Wear your crown.&rdquo;</div>
          <div className="knock"><button className="btn" onClick={ring}>Ring the Bell · Enter</button></div>
        </div>
        <div className="vignette" />
      </section>

      {/* FOYER */}
      <section className={`scene ${scene === "foyer" ? "active" : ""}`}>
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner center">
          <div className="wordmark-sm">Baroness Tattoo</div>
          <div className="section-title">The Grand Foyer</div>
          <div className="section-kicker">Where shall I escort you?</div>
          <div className="filigree"><span>❦</span></div>
          <div className="rooms">
            <div className="room-card" onClick={() => go("artists")}><span className="room-emblem">🎨</span><div className="room-name">Hall of Portraits</div><div className="room-desc">Her Grace&rsquo;s artists</div></div>
            <div className="room-card" onClick={() => go("gallery")}><span className="room-emblem">🖼</span><div className="room-name">The Gallery</div><div className="room-desc">Works upon the skin</div></div>
            <div className="room-card" onClick={() => go("booking")}><span className="room-emblem">✉</span><div className="room-name">Appointment Parlor</div><div className="room-desc">Request your sitting</div></div>
            <div className="room-card" onClick={() => go("boutique")}><span className="room-emblem">👛</span><div className="room-name">Maison Baroness</div><div className="room-desc">The ritual line</div></div>
            <div className="room-card" onClick={() => go("salon")}><span className="room-emblem">📜</span><div className="room-name">The Salon</div><div className="room-desc">The house &amp; how to call</div></div>
          </div>
        </div>
      </section>

      {/* ARTISTS */}
      <section className={`scene ${scene === "artists" ? "active" : ""}`}>
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead"><div className="section-title">Hall of Portraits</div><div className="section-kicker">The artists in Her Grace&rsquo;s service</div></div>
          <div className="filigree"><span>❦</span></div>
          {artists.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "var(--grey)" }}>The artists are preparing their portraits. Pray return shortly.</p>
          ) : (
            <div className="gallery-grid">
              {artists.map((a) => (
                <div className="portrait" key={a.id} onClick={() => openArtist(a)}>
                  <div className="frame">
                    {a.portrait_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.portrait_url} alt={a.display_name} className="pimg" />
                    ) : (
                      <span className="initials">{initials(a.display_name)}</span>
                    )}
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
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead"><div className="section-title">The Gallery</div><div className="section-kicker">Custom work, fine line &amp; black-and-grey realism</div></div>
          <div className="filigree"><span>❦</span></div>
          <div className="photos">
            {photos.map((src, i) => (
              <div className="pic" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={src} alt="Tattoo by Baroness Tattoo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className={`scene ${scene === "booking" ? "active" : ""}`}>
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner center">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="parchment">
            <span className="corner tl">❧</span><span className="corner tr">❧</span><span className="corner bl">❧</span><span className="corner br">❧</span>
            <h3>The Appointment Parlor</h3>
            <div className="lead">Show up already winning.</div>
            <p>Her Grace receives by appointment. Present your petition and we shall arrange your sitting through the house register — deposits, scheduling, and correspondence are kept in good order there.</p>
            <p style={{ fontStyle: "italic", color: "var(--grey)" }}>Walk-ins are welcomed at Her Grace&rsquo;s pleasure: Monday through Saturday, noon to eight; Sunday, noon to six. Shop minimum $100.</p>
            <div className="bookrow">
              <button className="btn" onClick={() => openLink(STUDIO_VENUE)}>Request a Sitting</button>
              <button className="btn ghost" onClick={() => go("artists")}>Choose an Artist First</button>
            </div>
          </div>
        </div>
      </section>

      {/* BOUTIQUE */}
      <section className={`scene ${scene === "boutique" ? "active" : ""}`}>
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="roomhead"><div className="section-title">Maison Baroness</div><div className="section-kicker">The ritual before the ritual — a skincare house for the working canvas</div></div>
          <div className="filigree"><span>❦</span></div>
          <div className="shelf">
            {WARES.map((w) => (
              <div className="ware" key={w.name}>
                <div className="vessel"><span className="bottle">{w.bottle}</span><span className="soon">Coming Soon</span></div>
                <div className="wline">{w.line}</div><div className="wname">{w.name}</div><div className="wtag">{w.tag}</div><div className="wsize">{w.size}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SALON */}
      <section className={`scene ${scene === "salon" ? "active" : ""}`}>
        <div className="cream-bg" /><div className="grain" /><div className="vignette" />
        <div className="scene-inner center">
          <div className="backline"><button className="btn ghost" onClick={() => go("foyer")}>← The Foyer</button></div>
          <div className="parchment">
            <span className="corner tl">❧</span><span className="corner tr">❧</span><span className="corner bl">❧</span><span className="corner br">❧</span>
            <h3>The Salon</h3>
            <div className="lead">Powdered porcelain. Wet ink. A coronet of pearls and a needle that doesn&rsquo;t blink.</div>
            <p>Baroness Tattoo is a luxury studio dressed in the decadence of the French Rococo — gold-framed mirrors, candle clusters, velvet in deep cream, and not a fluorescent light to be found. Every guest is received as nobility: escorted from the foyer to the chair, attended to, and sent home wearing their crown.</p>
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

      {/* BUTLER */}
      <div className="butler">
        <div className="avatar">🧑‍✈️</div>
        <div className="bubble"><div className="who">Reynard · Butler to Her Grace</div><div className="say">{butlerText}</div></div>
      </div>

      {/* MOTES */}
      <div className="motes">
        {motes.map((m, i) => (
          <span key={i} className="mote" style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }} />
        ))}
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
              ) : (
                <span className="initials">{initials(active.display_name)}</span>
              )}
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
              {active.public_note && (
                <div className="notebox"><div className="who">A note left for you</div><span>{active.public_note}</span></div>
              )}
              <div className="bookrow" style={{ justifyContent: "flex-start", marginTop: 22 }}>
                <button className="btn" onClick={() => openLink(active.venue_url || STUDIO_VENUE)}>Book with this Artist</button>
                {active.instagram_url && <button className="btn ghost" onClick={() => openLink(active.instagram_url)}>View Their Atelier</button>}
                <button className="btn ghost" onClick={() => setActive(null)}>Return to the Hall</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.estate{position:fixed;inset:0;overflow:hidden;font-family:var(--body);color:var(--black);background:#0c0a08}
.estate .giltframe{position:absolute;inset:14px;border:1.5px solid var(--gold);box-shadow:inset 0 0 0 4px rgba(0,0,0,.12),inset 0 0 0 6px var(--gold-dark);pointer-events:none;border-radius:3px;z-index:60}
.estate .cream-bg{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,#fbf3e2 0%,var(--cream) 45%,var(--cream-deep) 100%)}
.estate .grain{position:absolute;inset:0;opacity:.5;pointer-events:none;background-image:radial-gradient(circle at 50% 50%,rgba(184,146,74,.07) 0 1.5px,transparent 2px);background-size:46px 46px}
.estate .vignette{position:absolute;inset:0;box-shadow:inset 0 0 230px rgba(12,10,8,.6);pointer-events:none}
.estate .scene{position:absolute;inset:0;display:none;opacity:0;transition:opacity .9s ease}
.estate .scene.active{display:flex;opacity:1}
.estate .scene-inner{position:relative;z-index:5;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:64px 30px 150px;overflow-y:auto}
.estate .scene-inner.center{justify-content:center}
.estate #entrance{background:#0a0806}
.estate .doorwrap{position:absolute;inset:0;display:flex;z-index:8}
.estate .door{position:relative;width:50%;height:100%;background:linear-gradient(180deg,var(--velvet-2),var(--velvet) 60%,#0d0a08);transition:transform 1.7s cubic-bezier(.7,.02,.27,1);box-shadow:inset 0 0 90px rgba(0,0,0,.7)}
.estate .door::before{content:"";position:absolute;inset:30px;border:2px solid var(--gold-dark);box-shadow:inset 0 0 0 3px rgba(0,0,0,.35),inset 0 0 0 4px var(--gold);border-radius:60px 60px 8px 8px}
.estate .door .knob{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,var(--gold-light),var(--gold-dark));box-shadow:0 0 14px rgba(212,181,116,.6)}
.estate .door.left{transform-origin:left center}.estate .door.left .knob{right:26px}
.estate .door.right{transform-origin:right center}.estate .door.right .knob{left:26px}
.estate .doors-open .door.left{transform:perspective(1500px) rotateY(108deg)}
.estate .doors-open .door.right{transform:perspective(1500px) rotateY(-108deg)}
.estate .entrance-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:12;transition:opacity .8s ease;padding:20px}
.estate .doors-open .entrance-content{opacity:0;pointer-events:none}
.estate .eyebrow{font-family:var(--caps);letter-spacing:.42em;font-size:12px;color:var(--gold-light);text-transform:uppercase;margin-bottom:22px}
.estate .logo-img{max-width:min(360px,70vw);width:100%;height:auto;background:var(--cream);padding:24px 28px;border:2px solid var(--gold);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.55),inset 0 0 0 4px rgba(139,111,53,.25)}
.estate .estate-sub{font-family:var(--caps);letter-spacing:.36em;font-size:clamp(11px,2.2vw,16px);color:var(--cream);text-transform:uppercase;margin-top:24px}
.estate .tagline{font-family:var(--display);font-style:italic;font-size:clamp(17px,3vw,24px);color:var(--gold-light);margin-top:10px}
.estate .knock{margin-top:42px}
.estate .btn{font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:var(--black);background:linear-gradient(180deg,var(--gold-light),var(--gold));border:1px solid var(--gold-dark);padding:14px 28px;border-radius:2px;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35);transition:transform .25s,box-shadow .25s,filter .25s}
.estate .btn:hover{transform:translateY(-2px);filter:brightness(1.07)}
.estate .btn.ghost{background:transparent;color:var(--gold-dark);border-color:var(--gold)}
.estate .section-title{font-family:var(--display);font-weight:700;font-size:clamp(40px,7vw,76px);color:var(--black);text-align:center;line-height:1;margin-bottom:4px}
.estate .section-kicker{font-family:var(--display);font-style:italic;font-size:clamp(16px,2.6vw,21px);color:var(--grey);text-align:center;margin-bottom:14px}
.estate .filigree{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 34px;color:var(--gold);max-width:360px}
.estate .filigree::before,.estate .filigree::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,var(--gold))}
.estate .filigree::after{background:linear-gradient(90deg,var(--gold),transparent)}
.estate .wordmark-sm{font-family:var(--blackletter);font-size:30px;color:var(--gold-dark);text-align:center;line-height:.9;margin-bottom:6px}
.estate .rooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px;width:100%;max-width:1040px}
.estate .room-card{position:relative;background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:1px solid var(--gold);border-radius:5px;padding:30px 22px 26px;text-align:center;cursor:pointer;transition:transform .3s,box-shadow .3s;box-shadow:0 10px 26px rgba(0,0,0,.14)}
.estate .room-card::before{content:"";position:absolute;inset:7px;border:1px solid rgba(139,111,53,.45);border-radius:3px;pointer-events:none}
.estate .room-card:hover{transform:translateY(-6px);box-shadow:0 20px 42px rgba(0,0,0,.24),0 0 0 1px var(--gold-light)}
.estate .room-emblem{font-size:38px;color:var(--gold-dark);margin-bottom:12px;display:block;transition:transform .4s}
.estate .room-card:hover .room-emblem{transform:translateY(-3px) scale(1.08)}
.estate .room-name{font-family:var(--caps);font-size:16px;letter-spacing:.06em;color:var(--black)}
.estate .room-desc{font-family:var(--display);font-style:italic;font-size:17px;color:var(--grey);margin-top:8px}
.estate .roomhead{text-align:center;max-width:760px;margin-bottom:18px}
.estate .backline{position:absolute;top:30px;left:34px;z-index:40}
.estate .gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;width:100%;max-width:1060px}
.estate .portrait{position:relative;background:#fdf6e7;border:1px solid var(--gold);border-radius:5px;overflow:hidden;cursor:pointer;transition:transform .3s,box-shadow .3s;box-shadow:0 10px 26px rgba(0,0,0,.14)}
.estate .portrait:hover{transform:translateY(-6px);box-shadow:0 20px 42px rgba(0,0,0,.26)}
.estate .portrait .frame{height:220px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--velvet-2),var(--velvet));position:relative}
.estate .portrait .frame::after{content:"";position:absolute;inset:12px;border:2px solid var(--gold);border-radius:3px;pointer-events:none}
.estate .portrait .pimg{width:100%;height:100%;object-fit:cover}
.estate .portrait .initials{font-family:var(--display);font-weight:700;font-size:72px;color:var(--gold-light)}
.estate .portrait .pmeta{padding:18px 16px 22px;text-align:center}
.estate .portrait .pname{font-family:var(--caps);font-size:18px;color:var(--black);letter-spacing:.04em}
.estate .portrait .pspec{font-family:var(--display);font-style:italic;color:var(--grey);margin-top:5px;font-size:16px}
.estate .photos{columns:3 260px;column-gap:16px;width:100%;max-width:1080px}
.estate .photos .pic{break-inside:avoid;margin-bottom:16px;border:1px solid var(--gold);border-radius:4px;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.2);background:var(--velvet)}
.estate .photos .pic img{display:block;width:100%;height:auto;transition:transform .5s,filter .5s}
.estate .photos .pic:hover img{transform:scale(1.05);filter:brightness(1.05)}
.estate .shelf{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:26px;width:100%;max-width:1000px}
.estate .ware{position:relative;background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:1px solid var(--gold);border-radius:6px;overflow:hidden;text-align:center;box-shadow:0 10px 24px rgba(0,0,0,.14);padding-bottom:26px}
.estate .ware .vessel{height:200px;display:flex;align-items:center;justify-content:center;position:relative;background:radial-gradient(120% 90% at 50% 20%,#2a221b,var(--velvet))}
.estate .ware .vessel::after{content:"";position:absolute;inset:14px;border:1px solid var(--gold);border-radius:4px}
.estate .ware .bottle{font-size:62px}
.estate .ware .soon{position:absolute;top:12px;right:12px;font-family:var(--caps);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--cream);background:rgba(184,146,74,.92);padding:4px 9px;border-radius:20px}
.estate .ware .wline{font-family:var(--caps);letter-spacing:.18em;font-size:12px;color:var(--gold-dark);margin:18px 14px 2px;text-transform:uppercase}
.estate .ware .wname{font-family:var(--display);font-weight:600;font-size:23px;color:var(--black);margin:0 14px 2px}
.estate .ware .wtag{font-family:var(--display);font-style:italic;color:var(--grey);font-size:17px;margin:0 16px 6px}
.estate .ware .wsize{font-family:var(--caps);font-size:10px;letter-spacing:.12em;color:var(--grey)}
.estate .parchment{position:relative;background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:1px solid var(--gold);border-radius:8px;padding:42px 44px;max-width:700px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
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
.estate .butler{position:fixed;left:0;right:0;bottom:0;z-index:55;display:flex;align-items:flex-end;gap:16px;padding:16px 26px;background:linear-gradient(0deg,rgba(12,10,8,.96),rgba(12,10,8,0));pointer-events:none}
.estate .butler .avatar{flex:0 0 auto;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 40% 35%,var(--velvet-2),var(--velvet));border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.estate .bubble{background:rgba(245,233,211,.97);border:1px solid var(--gold);border-radius:12px;padding:11px 20px;max-width:760px;box-shadow:0 8px 22px rgba(0,0,0,.4)}
.estate .bubble .who{font-family:var(--caps);font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:3px}
.estate .bubble .say{font-family:var(--display);font-size:19px;font-style:italic;color:var(--black);min-height:1.4em}
.estate .motes{position:absolute;inset:0;z-index:50;pointer-events:none;overflow:hidden}
.estate .mote{position:absolute;bottom:-12px;border-radius:50%;background:radial-gradient(circle,rgba(255,238,190,.9),rgba(255,238,190,0));animation:erise linear infinite}
@keyframes erise{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.8}90%{opacity:.5}100%{transform:translateY(-105vh) translateX(40px);opacity:0}}
.estate .sconce{position:absolute;top:30%;width:10px;height:10px;border-radius:50%;z-index:9;background:#ffd98a;box-shadow:0 0 26px 12px rgba(255,196,92,.5),0 0 70px 30px rgba(255,150,40,.2);animation:eflick 2.4s infinite ease-in-out}
.estate .sconce.l{left:11%}.estate .sconce.r{right:11%;animation-delay:.8s}
@keyframes eflick{0%,100%{opacity:.85;transform:scale(1)}45%{opacity:1;transform:scale(1.12)}70%{opacity:.7;transform:scale(.95)}}
.estate .modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,.8);padding:24px}
.estate .sheet{background:linear-gradient(180deg,#fdf6e7,var(--cream-deep));border:2px solid var(--gold);border-radius:10px;max-width:760px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 18px 50px rgba(0,0,0,.45);position:relative}
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
@media(max-width:560px){.estate .photos{columns:2 150px}.estate .flashgrid{grid-template-columns:repeat(2,1fr)}.estate .backline{top:18px;left:18px}.estate .contact{grid-template-columns:1fr}}
`;
