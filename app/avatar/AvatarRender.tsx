import React from "react";

export type AvatarConfig = {
  skin: string; face: string; hair: string; hairColor: string;
  eyes: string; eyeColor: string; brows: string; mouth: string; outfit: string; bg: string;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "light", face: "oval", hair: "wavy", hairColor: "brown",
  eyes: "almond", eyeColor: "brown", brows: "soft", mouth: "smile", outfit: "gown", bg: "royal",
};

type Opt = { id: string; label: string; premium?: boolean; swatch?: string };
export const OPTIONS: Record<string, Opt[]> = {
  skin: [
    { id: "light", label: "Porcelain", swatch: "#f0c8a8" }, { id: "medium", label: "Honey", swatch: "#e0a878" },
    { id: "tan", label: "Tan", swatch: "#c88a5a" }, { id: "brown", label: "Bronze", swatch: "#a06a40" }, { id: "deep", label: "Deep", swatch: "#6e4326" },
  ],
  face: [{ id: "oval", label: "Oval" }, { id: "round", label: "Round" }, { id: "square", label: "Square" }, { id: "heart", label: "Heart" }],
  hair: [
    { id: "short", label: "Cropped" }, { id: "bob", label: "Bob" }, { id: "wavy", label: "Wavy" }, { id: "long", label: "Long" },
    { id: "bun", label: "Bun" }, { id: "bald", label: "Bare" }, { id: "updo", label: "Court Updo", premium: true }, { id: "mohawk", label: "Crest", premium: true },
  ],
  hairColor: [
    { id: "black", label: "Noir", swatch: "#1c1614" }, { id: "brown", label: "Chestnut", swatch: "#4a3324" }, { id: "blonde", label: "Blonde", swatch: "#c9a25a" },
    { id: "auburn", label: "Auburn", swatch: "#7a3b22" }, { id: "gray", label: "Silver", swatch: "#b9b2a6" },
    { id: "rose", label: "Rose", premium: true, swatch: "#d98aa0" }, { id: "sky", label: "Sky", premium: true, swatch: "#86b6cf" }, { id: "lilac", label: "Lilac", premium: true, swatch: "#b39ad0" },
  ],
  eyes: [{ id: "almond", label: "Almond" }, { id: "round", label: "Round" }, { id: "wide", label: "Wide" }],
  eyeColor: [
    { id: "brown", label: "Brown", swatch: "#5b3b1a" }, { id: "hazel", label: "Hazel", swatch: "#8a6b2f" }, { id: "green", label: "Green", swatch: "#3f6b46" },
    { id: "blue", label: "Blue", swatch: "#3f6b8a" }, { id: "violet", label: "Violet", premium: true, swatch: "#6f4f9c" }, { id: "gold", label: "Gold", premium: true, swatch: "#b8924a" },
  ],
  brows: [{ id: "soft", label: "Soft" }, { id: "bold", label: "Bold" }, { id: "arched", label: "Arched" }],
  mouth: [{ id: "smile", label: "Smile" }, { id: "neutral", label: "Demure" }, { id: "smirk", label: "Smirk" }, { id: "pout", label: "Pout" }],
  outfit: [
    { id: "gown", label: "Court Gown" }, { id: "suit", label: "Tailcoat" }, { id: "robe", label: "Robe" },
    { id: "corset", label: "Corset", premium: true }, { id: "royal", label: "Royal Mantle", premium: true },
  ],
  bg: [
    { id: "cream", label: "Cream", swatch: "#efe3c6" }, { id: "blue", label: "Rococo Blue", swatch: "#9fbccf" }, { id: "rose", label: "Rose", swatch: "#d9a7a0" },
    { id: "gold", label: "Gilt", swatch: "#caa24e" }, { id: "royal", label: "Royal", premium: true, swatch: "#3a5673" }, { id: "noir", label: "Velvet Noir", premium: true, swatch: "#241016" },
  ],
};

const SKIN: Record<string, string> = { light: "#f0c8a8", medium: "#e0a878", tan: "#c88a5a", brown: "#a06a40", deep: "#6e4326" };
const HAIR: Record<string, string> = { black: "#1c1614", brown: "#4a3324", blonde: "#c9a25a", auburn: "#7a3b22", gray: "#b9b2a6", rose: "#d98aa0", sky: "#86b6cf", lilac: "#b39ad0" };
const EYE: Record<string, string> = { brown: "#5b3b1a", hazel: "#8a6b2f", green: "#3f6b46", blue: "#3f6b8a", violet: "#6f4f9c", gold: "#b8924a" };
const OUTFIT: Record<string, string> = { gown: "#9fbccf", suit: "#2b2630", robe: "#c8959a", corset: "#7a2d3a", royal: "#3a5673" };
const BG: Record<string, string> = { cream: "#efe3c6", blue: "#9fbccf", rose: "#d9a7a0", gold: "#caa24e", royal: "#3a5673", noir: "#241016" };

export function AvatarRender({ config, size = 168 }: { config?: Partial<AvatarConfig> | null; size?: number }) {
  const c = { ...DEFAULT_AVATAR, ...(config || {}) };
  const skin = SKIN[c.skin] || SKIN.light;
  const hair = HAIR[c.hairColor] || HAIR.brown;
  const eye = EYE[c.eyeColor] || EYE.brown;
  const outfit = OUTFIT[c.outfit] || OUTFIT.gown;
  const bg = BG[c.bg] || BG.cream;

  const head =
    c.face === "round" ? <circle cx="100" cy="96" r="46" fill={skin} /> :
    c.face === "square" ? <rect x="56" y="50" width="88" height="94" rx="28" fill={skin} /> :
    c.face === "heart" ? <path d="M100 148 C66 128 56 96 60 74 C64 56 84 50 100 62 C116 50 136 56 140 74 C144 96 134 128 100 148 Z" fill={skin} /> :
    <ellipse cx="100" cy="96" rx="42" ry="50" fill={skin} />;

  const hairBack =
    c.hair === "long" ? <path d="M52 84 C52 40 148 40 148 84 L150 168 L130 168 C134 120 132 96 132 84 C132 60 68 60 68 84 C68 96 66 120 70 168 L50 168 Z" fill={hair} /> :
    c.hair === "bob" ? <path d="M54 92 C54 48 146 48 146 92 L146 128 C146 138 132 140 130 126 C132 100 130 86 128 82 C128 64 72 64 72 82 C70 86 68 100 70 126 C68 140 54 138 54 128 Z" fill={hair} /> :
    null;

  const hairFront =
    c.hair === "bald" ? null :
    c.hair === "short" ? <path d="M58 86 C58 50 142 50 142 86 C140 74 132 64 100 64 C68 64 60 74 58 86 Z" fill={hair} /> :
    c.hair === "wavy" ? <path d="M56 92 C54 54 146 54 144 92 C140 78 150 70 138 60 C140 50 118 52 116 58 C112 50 88 50 84 58 C82 52 60 50 62 60 C50 70 60 78 56 92 Z" fill={hair} /> :
    c.hair === "bun" ? <g fill={hair}><circle cx="100" cy="40" r="16" /><path d="M58 86 C58 52 142 52 142 86 C140 72 132 62 100 62 C68 62 60 72 58 86 Z" /></g> :
    c.hair === "updo" ? <g fill={hair}><circle cx="100" cy="36" r="14" /><circle cx="84" cy="44" r="9" /><circle cx="116" cy="44" r="9" /><path d="M58 84 C58 54 142 54 142 84 C140 70 132 60 100 60 C68 60 60 70 58 84 Z" /></g> :
    c.hair === "mohawk" ? <path d="M88 30 C92 56 92 70 92 80 L108 80 C108 70 108 56 112 30 C104 24 96 24 88 30 Z" fill={hair} /> :
    <path d="M58 86 C58 50 142 50 142 86 C140 74 132 64 100 64 C68 64 60 74 58 86 Z" fill={hair} />;

  const browY = 80;
  const brows =
    c.brows === "bold" ? <g fill="#3a2a1c"><rect x="74" y={browY} width="20" height="5" rx="2.5" /><rect x="106" y={browY} width="20" height="5" rx="2.5" /></g> :
    c.brows === "arched" ? <g stroke="#3a2a1c" strokeWidth="3.5" fill="none" strokeLinecap="round"><path d={`M74 ${browY+3} Q84 ${browY-4} 94 ${browY+2}`} /><path d={`M106 ${browY+2} Q116 ${browY-4} 126 ${browY+3}`} /></g> :
    <g stroke="#4a3826" strokeWidth="3" fill="none" strokeLinecap="round"><path d={`M75 ${browY+2} Q85 ${browY-1} 94 ${browY+2}`} /><path d={`M106 ${browY+2} Q115 ${browY-1} 125 ${browY+2}`} /></g>;

  const eyeEl = (cx: number) => {
    if (c.eyes === "round") return <g key={cx}><circle cx={cx} cy="94" r="8" fill="#fff" stroke="#caa" strokeWidth="0.5" /><circle cx={cx} cy="94" r="4.2" fill={eye} /><circle cx={cx} cy="94" r="1.6" fill="#1a1a1a" /></g>;
    if (c.eyes === "wide") return <g key={cx}><ellipse cx={cx} cy="94" rx="11" ry="7" fill="#fff" /><circle cx={cx} cy="94" r="4.4" fill={eye} /><circle cx={cx} cy="94" r="1.7" fill="#1a1a1a" /></g>;
    return <g key={cx}><path d={`M${cx-10} 94 Q${cx} 86 ${cx+10} 94 Q${cx} 100 ${cx-10} 94 Z`} fill="#fff" /><circle cx={cx} cy="94" r="4" fill={eye} /><circle cx={cx} cy="94" r="1.5" fill="#1a1a1a" /></g>;
  };

  const mouth =
    c.mouth === "neutral" ? <path d="M88 122 H112" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" /> :
    c.mouth === "smirk" ? <path d="M88 120 Q102 126 114 118" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" /> :
    c.mouth === "pout" ? <ellipse cx="100" cy="121" rx="8" ry="5" fill="#b86b62" /> :
    <path d="M86 119 Q100 132 114 119" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" />;

  const shoulders =
    c.outfit === "suit" ? <g><path d="M40 224 C40 178 160 178 160 224 Z" fill={outfit} /><path d="M100 182 L84 224 L100 210 L116 224 Z" fill="#f3ecda" /></g> :
    c.outfit === "robe" ? <g><path d="M44 224 C44 180 156 180 156 224 Z" fill={outfit} /><path d="M100 184 L82 224 M100 184 L118 224" stroke="#caa24e" strokeWidth="3" /></g> :
    c.outfit === "corset" ? <g><path d="M48 224 C48 182 152 182 152 224 Z" fill={outfit} /><path d="M100 186 V222 M92 192 H108 M92 202 H108 M92 212 H108" stroke="#e9d6b0" strokeWidth="2" /></g> :
    c.outfit === "royal" ? <g><path d="M38 224 C38 176 162 176 162 224 Z" fill={outfit} /><path d="M38 200 C70 214 130 214 162 200 L162 224 L38 224 Z" fill="#7a2d3a" /><circle cx="100" cy="190" r="6" fill="#caa24e" /></g> :
    <g><path d="M40 224 C40 178 160 178 160 224 Z" fill={outfit} /><path d="M70 184 C82 200 118 200 130 184" fill="none" stroke="#f3ecda" strokeWidth="3" /></g>;

  return (
    <svg viewBox="0 0 200 224" width={size} height={size * 224 / 200} role="img" aria-label="avatar">
      <defs><clipPath id="av-clip"><rect x="6" y="6" width="188" height="212" rx="14" /></clipPath></defs>
      <g clipPath="url(#av-clip)">
        <rect x="0" y="0" width="200" height="224" fill={bg} />
        <rect x="0" y="0" width="200" height="224" fill="url(#av-vig)" />
        {shoulders}
        <rect x="92" y="132" width="16" height="26" fill={skin} />
        {hairBack}
        {head}
        <ellipse cx="58" cy="100" rx="6" ry="9" fill={skin} /><ellipse cx="142" cy="100" rx="6" ry="9" fill={skin} />
        {hairFront}
        {brows}
        {eyeEl(82)}{eyeEl(118)}
        <path d="M100 100 L96 112 Q100 115 104 112" fill="none" stroke="#c89070" strokeWidth="2" strokeLinecap="round" />
        {mouth}
      </g>
      <radialGradient id="av-vig" cx="50%" cy="40%" r="75%"><stop offset="60%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.22)" /></radialGradient>
      <rect x="6" y="6" width="188" height="212" rx="14" fill="none" stroke="#b8924a" strokeWidth="3" />
      <rect x="10" y="10" width="180" height="204" rx="11" fill="none" stroke="#8b6f35" strokeWidth="1" />
    </svg>
  );
}
