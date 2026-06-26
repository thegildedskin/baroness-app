import React from "react";
import { getLook } from "./looks";
import { getOutfit } from "./outfits";

export type AvatarConfig = {
  skin: string; face: string; hair: string; hairColor: string;
  eyes: string; eyeColor: string; brows: string; mouth: string;
  accessory: string; outfit: string; bg: string;
  // When set, the avatar renders the chosen illustrated "look" instead of the
  // built-from-parts cartoon. See app/avatar/looks.ts.
  look?: string;
  // Paper-doll wardrobe (see app/avatar/outfits.ts). `outfitId` selects a clothing
  // LAYER drawn over the likeness; `bareChest` / `bareArms` strip the garment so
  // tattoos read on bare skin. All three are optional & back-compatible — an avatar
  // saved before this feature simply renders as it always did.
  outfitId?: string;
  bareChest?: boolean;
  bareArms?: boolean;
  // AI-generated / uploaded likeness (the "create from scratch / from image"
  // flow). When set it is used as the portrait base, taking precedence over
  // both `look` and the built-from-parts cartoon. See app/dashboard/AvatarCreator.tsx.
  likenessUrl?: string;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "light", face: "oval", hair: "wavy", hairColor: "brown",
  eyes: "almond", eyeColor: "brown", brows: "soft", mouth: "smile",
  accessory: "none", outfit: "gown", bg: "royal",
};

type Opt = { id: string; label: string; premium?: boolean; swatch?: string };
export const OPTIONS: Record<string, Opt[]> = {
  skin: [
    { id: "light", label: "Porcelain", swatch: "#f0c8a8" }, { id: "medium", label: "Honey", swatch: "#e0a878" },
    { id: "olive", label: "Olive", swatch: "#c79a66" }, { id: "tan", label: "Tan", swatch: "#c88a5a" },
    { id: "brown", label: "Bronze", swatch: "#a06a40" }, { id: "deep", label: "Deep", swatch: "#6e4326" },
  ],
  face: [{ id: "oval", label: "Oval" }, { id: "round", label: "Round" }, { id: "square", label: "Square" }, { id: "heart", label: "Heart" }, { id: "long", label: "Long" }],
  hair: [
    { id: "short", label: "Cropped" }, { id: "bob", label: "Bob" }, { id: "wavy", label: "Wavy" }, { id: "long", label: "Long" },
    { id: "bun", label: "Bun" }, { id: "curls", label: "Curls" }, { id: "ponytail", label: "Ponytail" }, { id: "afro", label: "Halo" }, { id: "bald", label: "Bare" },
    { id: "updo", label: "Court Updo", premium: true }, { id: "mohawk", label: "Crest", premium: true }, { id: "braids", label: "Braids", premium: true },
  ],
  hairColor: [
    { id: "black", label: "Noir", swatch: "#1c1614" }, { id: "brown", label: "Chestnut", swatch: "#4a3324" }, { id: "blonde", label: "Blonde", swatch: "#c9a25a" },
    { id: "auburn", label: "Auburn", swatch: "#7a3b22" }, { id: "copper", label: "Copper", swatch: "#a85a2a" }, { id: "gray", label: "Silver", swatch: "#b9b2a6" },
    { id: "platinum", label: "Platinum", swatch: "#e3dcc8" },
    { id: "rose", label: "Rose", premium: true, swatch: "#d98aa0" }, { id: "sky", label: "Sky", premium: true, swatch: "#86b6cf" }, { id: "lilac", label: "Lilac", premium: true, swatch: "#b39ad0" },
  ],
  eyes: [{ id: "almond", label: "Almond" }, { id: "round", label: "Round" }, { id: "wide", label: "Wide" }, { id: "hooded", label: "Hooded" }],
  eyeColor: [
    { id: "brown", label: "Brown", swatch: "#5b3b1a" }, { id: "hazel", label: "Hazel", swatch: "#8a6b2f" }, { id: "amber", label: "Amber", swatch: "#b07b2a" },
    { id: "green", label: "Green", swatch: "#3f6b46" }, { id: "blue", label: "Blue", swatch: "#3f6b8a" }, { id: "gray", label: "Grey", swatch: "#7a8088" },
    { id: "violet", label: "Violet", premium: true, swatch: "#6f4f9c" }, { id: "gold", label: "Gold", premium: true, swatch: "#b8924a" },
  ],
  brows: [{ id: "soft", label: "Soft" }, { id: "bold", label: "Bold" }, { id: "arched", label: "Arched" }],
  mouth: [{ id: "smile", label: "Smile" }, { id: "neutral", label: "Demure" }, { id: "smirk", label: "Smirk" }, { id: "pout", label: "Pout" }, { id: "grin", label: "Grin" }],
  accessory: [
    { id: "none", label: "None" }, { id: "beautyMark", label: "Beauty mark" }, { id: "pearls", label: "Pearls" }, { id: "earrings", label: "Earrings" }, { id: "glasses", label: "Spectacles" },
    { id: "monocle", label: "Monocle", premium: true }, { id: "crown", label: "Coronet", premium: true }, { id: "veil", label: "Veil", premium: true },
  ],
  outfit: [
    { id: "gown", label: "Court Gown" }, { id: "suit", label: "Tailcoat" }, { id: "robe", label: "Robe" }, { id: "cloak", label: "Cloak" }, { id: "tee", label: "House Tee" },
    { id: "corset", label: "Corset", premium: true }, { id: "royal", label: "Royal Mantle", premium: true }, { id: "lace", label: "Lace Bodice", premium: true },
  ],
  bg: [
    { id: "cream", label: "Cream", swatch: "#efe3c6" }, { id: "blue", label: "Rococo Blue", swatch: "#9fbccf" }, { id: "rose", label: "Rose", swatch: "#d9a7a0" },
    { id: "sage", label: "Sage", swatch: "#c7d4c0" }, { id: "lavender", label: "Lavender", swatch: "#cdc3df" }, { id: "gold", label: "Gilt", swatch: "#caa24e" },
    { id: "royal", label: "Royal", premium: true, swatch: "#3a5673" }, { id: "noir", label: "Velvet Noir", premium: true, swatch: "#241016" },
  ],
};

const SKIN: Record<string, string> = { light: "#f0c8a8", medium: "#e0a878", olive: "#c79a66", tan: "#c88a5a", brown: "#a06a40", deep: "#6e4326" };
const HAIR: Record<string, string> = { black: "#1c1614", brown: "#4a3324", blonde: "#c9a25a", auburn: "#7a3b22", copper: "#a85a2a", gray: "#b9b2a6", platinum: "#e3dcc8", rose: "#d98aa0", sky: "#86b6cf", lilac: "#b39ad0" };
const EYE: Record<string, string> = { brown: "#5b3b1a", hazel: "#8a6b2f", amber: "#b07b2a", green: "#3f6b46", blue: "#3f6b8a", gray: "#7a8088", violet: "#6f4f9c", gold: "#b8924a" };
const OUTFIT: Record<string, string> = { gown: "#9fbccf", suit: "#2b2630", robe: "#c8959a", cloak: "#3a2f3c", tee: "#cfd8dc", corset: "#7a2d3a", royal: "#3a5673", lace: "#efe3ea" };
const BG: Record<string, string> = { cream: "#efe3c6", blue: "#9fbccf", rose: "#d9a7a0", sage: "#c7d4c0", lavender: "#cdc3df", gold: "#caa24e", royal: "#3a5673", noir: "#241016" };

// Mix a hex colour toward white (pct > 0) or black (pct < 0). pct in -1..1.
function mix(hex: string, pct: number): string {
  const h = hex.replace("#", "");
  let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const t = pct < 0 ? 0 : 255, p = Math.abs(pct);
  r = Math.round((t - r) * p) + r; g = Math.round((t - g) * p) + g; b = Math.round((t - b) * p) + b;
  const hx = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

export function AvatarRender({ config, size = 168, tattoo = null, fullBody = false }: { config?: Partial<AvatarConfig> | null; size?: number; tattoo?: string | null; fullBody?: boolean }) {
  const c = { ...DEFAULT_AVATAR, ...(config || {}) };
  const skin = SKIN[c.skin] || SKIN.light;
  const hair = HAIR[c.hairColor] || HAIR.brown;
  const eye = EYE[c.eyeColor] || EYE.brown;
  const outfit = OUTFIT[c.outfit] || OUTFIT.gown;
  const bg = BG[c.bg] || BG.cream;

  // Unique id prefix so multiple avatars on one page don't share gradient defs.
  const uid = React.useId().replace(/[:]/g, "");
  const gid = (n: string) => `${uid}-${n}`;
  const u = (n: string) => `url(#${gid(n)})`;

  // ── Wardrobe layers (paper-doll) ────────────────────────────────────────────
  // `outfitId` chooses a clothing overlay; the bare toggles (or a bare outfit
  // entry) strip it so saved tattoos read on bare skin.
  const outfitSel = getOutfit(c.outfitId);
  const bareChest = !!c.bareChest || outfitSel?.coversChest === false;
  const bareArms = !!c.bareArms || outfitSel?.coversArms === false;
  // Only overlay a garment when one is chosen, it has art, and the chest isn't
  // being deliberately bared.
  const outfitLayer = outfitSel?.src && !bareChest ? outfitSel.src : null;
  // We enter layered mode whenever the wearer touches the wardrobe so the rest of
  // the time the fused portrait renders byte-for-byte as it always has.
  const layered = !!(outfitSel || c.bareChest || c.bareArms);

  // Illustrated look or a generated likeness — render the portrait (optionally with
  // wardrobe layers). A generated likeness (c.likenessUrl) takes precedence over a look.
  const look = getLook(c.look);
  const customSrc = c.likenessUrl;
  if (look || customSrc) {
    const aria = look?.label || "your likeness";
    // Prefer the generated likeness, then bare-body art when layering, else the
    // fused portrait (renders exactly as before).
    const baseSrc = customSrc || (layered && look?.body ? look.body : look!.src);
    const inkOnSkin = layered && bareChest && !!tattoo; // ink drawn under (absent) garment

    // Full-body mode: show the entire figure (head to feet) in a tall, gilt-framed
    // portrait. The source art is a full-length figure on a warm neutral ground, so
    // we letterbox with a matched mat colour and use "meet" to avoid cropping legs/head.
    if (fullBody) {
      const FW = 200, FH = 470;
      return (
        <svg viewBox={`0 0 ${FW} ${FH}`} width={size} height={size * FH / FW} role="img" aria-label={aria}>
          <defs>
            <clipPath id={gid("clip")}><rect x="6" y="6" width={FW - 12} height={FH - 12} rx="14" /></clipPath>
            <linearGradient id={gid("mat")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eadfca" /><stop offset="100%" stopColor="#d6c8ac" />
            </linearGradient>
            <radialGradient id={gid("matvig")} cx="50%" cy="42%" r="72%">
              <stop offset="62%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(60,40,20,0.18)" />
            </radialGradient>
          </defs>
          <g clipPath={`url(#${gid("clip")})`}>
            <rect x="0" y="0" width={FW} height={FH} fill={u("mat")} />
            <image href={baseSrc} x="0" y="0" width={FW} height={FH} preserveAspectRatio="xMidYMid meet" />
            {inkOnSkin && <image href={tattoo!} x={FW / 2 - 16} y={FH * 0.33} width="32" height="38" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />}
            {outfitLayer && <image href={outfitLayer} x="0" y="0" width={FW} height={FH} preserveAspectRatio="xMidYMid meet" />}
            {tattoo && !inkOnSkin && <image href={tattoo} x={FW / 2 - 16} y={FH * 0.33} width="32" height="38" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />}
            <rect x="0" y="0" width={FW} height={FH} fill={u("matvig")} />
          </g>
          <rect x="6" y="6" width={FW - 12} height={FH - 12} rx="14" fill="none" stroke="#b8924a" strokeWidth="3" />
          <rect x="10" y="10" width={FW - 20} height={FH - 20} rx="11" fill="none" stroke="#8b6f35" strokeWidth="1" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 200 224" width={size} height={size * 224 / 200} role="img" aria-label={aria}>
        <defs><clipPath id={gid("clip")}><rect x="6" y="6" width="188" height="212" rx="14" /></clipPath></defs>
        <g clipPath={`url(#${gid("clip")})`}>
          <rect x="0" y="0" width="200" height="224" fill="#efe3c6" />
          <image href={baseSrc} x="0" y="0" width="200" height="224" preserveAspectRatio="xMidYMin slice" />
          {inkOnSkin && <image href={tattoo!} x="84" y="150" width="32" height="38" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />}
          {outfitLayer && <image href={outfitLayer} x="0" y="0" width="200" height="224" preserveAspectRatio="xMidYMin slice" />}
          {tattoo && !inkOnSkin && <image href={tattoo} x="84" y="150" width="32" height="38" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />}
        </g>
        <rect x="6" y="6" width="188" height="212" rx="14" fill="none" stroke="#b8924a" strokeWidth="3" />
        <rect x="10" y="10" width="180" height="204" rx="11" fill="none" stroke="#8b6f35" strokeWidth="1" />
      </svg>
    );
  }

  // Derived shades for volume.
  const skinHi = mix(skin, 0.26), skinLo = mix(skin, -0.16), skinShadow = mix(skin, -0.3);
  const hairHi = mix(hair, 0.3), hairLo = mix(hair, -0.24);
  const outfitHi = mix(outfit, 0.14), outfitLo = mix(outfit, -0.18);
  const bgHi = mix(bg, 0.2), bgLo = mix(bg, -0.26);

  const head =
    c.face === "round" ? <circle cx="100" cy="96" r="46" fill={u("skin")} /> :
    c.face === "square" ? <rect x="56" y="50" width="88" height="94" rx="28" fill={u("skin")} /> :
    c.face === "heart" ? <path d="M100 148 C66 128 56 96 60 74 C64 56 84 50 100 62 C116 50 136 56 140 74 C144 96 134 128 100 148 Z" fill={u("skin")} /> :
    c.face === "long" ? <ellipse cx="100" cy="98" rx="38" ry="54" fill={u("skin")} /> :
    <ellipse cx="100" cy="96" rx="42" ry="50" fill={u("skin")} />;

  const hairBack =
    c.hair === "long" ? <path d="M52 84 C52 40 148 40 148 84 L150 168 L130 168 C134 120 132 96 132 84 C132 60 68 60 68 84 C68 96 66 120 70 168 L50 168 Z" fill={u("hair")} /> :
    c.hair === "bob" ? <path d="M54 92 C54 48 146 48 146 92 L146 128 C146 138 132 140 130 126 C132 100 130 86 128 82 C128 64 72 64 72 82 C70 86 68 100 70 126 C68 140 54 138 54 128 Z" fill={u("hair")} /> :
    c.hair === "afro" ? <circle cx="100" cy="74" r="58" fill={u("hair")} /> :
    c.hair === "ponytail" ? <g fill={u("hair")}><path d="M120 70 C150 86 150 140 132 168 L120 164 C134 138 130 96 116 84 Z" /></g> :
    c.hair === "curls" ? <g fill={u("hair")}><circle cx="60" cy="92" r="14" /><circle cx="140" cy="92" r="14" /><circle cx="64" cy="118" r="12" /><circle cx="136" cy="118" r="12" /></g> :
    c.hair === "braids" ? <g fill={u("hair")}><path d="M62 90 L54 170 L70 170 L74 96 Z" /><path d="M138 90 L146 170 L130 170 L126 96 Z" /></g> :
    null;

  const hairFront =
    c.hair === "bald" ? null :
    c.hair === "short" ? <path d="M58 86 C58 50 142 50 142 86 C140 74 132 64 100 64 C68 64 60 74 58 86 Z" fill={u("hair")} /> :
    c.hair === "wavy" ? <path d="M56 92 C54 54 146 54 144 92 C140 78 150 70 138 60 C140 50 118 52 116 58 C112 50 88 50 84 58 C82 52 60 50 62 60 C50 70 60 78 56 92 Z" fill={u("hair")} /> :
    c.hair === "bun" ? <g fill={u("hair")}><circle cx="100" cy="40" r="16" /><path d="M58 86 C58 52 142 52 142 86 C140 72 132 62 100 62 C68 62 60 72 58 86 Z" /></g> :
    c.hair === "afro" ? <path d="M60 80 C60 52 140 52 140 80 C136 70 128 64 100 64 C72 64 64 70 60 80 Z" fill={u("hair")} /> :
    c.hair === "curls" ? <g fill={u("hair")}><circle cx="76" cy="58" r="14" /><circle cx="100" cy="52" r="15" /><circle cx="124" cy="58" r="14" /><circle cx="62" cy="74" r="12" /><circle cx="138" cy="74" r="12" /></g> :
    c.hair === "ponytail" ? <path d="M58 86 C58 52 142 52 142 86 C140 72 132 62 100 62 C68 62 60 72 58 86 Z" fill={u("hair")} /> :
    c.hair === "braids" ? <path d="M58 84 C58 52 142 52 142 84 C140 70 132 60 100 60 C68 60 60 70 58 84 Z" fill={u("hair")} /> :
    c.hair === "updo" ? <g fill={u("hair")}><circle cx="100" cy="36" r="14" /><circle cx="84" cy="44" r="9" /><circle cx="116" cy="44" r="9" /><path d="M58 84 C58 54 142 54 142 84 C140 70 132 60 100 60 C68 60 60 70 58 84 Z" /></g> :
    c.hair === "mohawk" ? <path d="M88 30 C92 56 92 70 92 80 L108 80 C108 70 108 56 112 30 C104 24 96 24 88 30 Z" fill={u("hair")} /> :
    <path d="M58 86 C58 50 142 50 142 86 C140 74 132 64 100 64 C68 64 60 74 58 86 Z" fill={u("hair")} />;

  const browY = 80;
  const brows =
    c.brows === "bold" ? <g fill="#3a2a1c"><rect x="74" y={browY} width="20" height="5" rx="2.5" /><rect x="106" y={browY} width="20" height="5" rx="2.5" /></g> :
    c.brows === "arched" ? <g stroke="#3a2a1c" strokeWidth="3.5" fill="none" strokeLinecap="round"><path d={`M74 ${browY + 3} Q84 ${browY - 4} 94 ${browY + 2}`} /><path d={`M106 ${browY + 2} Q116 ${browY - 4} 126 ${browY + 3}`} /></g> :
    <g stroke="#4a3826" strokeWidth="3" fill="none" strokeLinecap="round"><path d={`M75 ${browY + 2} Q85 ${browY - 1} 94 ${browY + 2}`} /><path d={`M106 ${browY + 2} Q115 ${browY - 1} 125 ${browY + 2}`} /></g>;

  const eyeEl = (cx: number) => {
    const lash = <path d={`M${cx - 11} 89 Q${cx} 84 ${cx + 11} 89`} stroke="#3a2a1c" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    if (c.eyes === "round") return <g key={cx}><circle cx={cx} cy="94" r="8" fill="#fff" stroke="#caa" strokeWidth="0.5" /><circle cx={cx} cy="94" r="4.2" fill={eye} /><circle cx={cx} cy="94" r="1.6" fill="#1a1a1a" />{lash}</g>;
    if (c.eyes === "wide") return <g key={cx}><ellipse cx={cx} cy="94" rx="11" ry="7" fill="#fff" /><circle cx={cx} cy="94" r="4.4" fill={eye} /><circle cx={cx} cy="94" r="1.7" fill="#1a1a1a" />{lash}</g>;
    if (c.eyes === "hooded") return <g key={cx}><path d={`M${cx - 10} 95 Q${cx} 89 ${cx + 10} 95 Q${cx} 99 ${cx - 10} 95 Z`} fill="#fff" /><circle cx={cx} cy="95" r="3.6" fill={eye} /><circle cx={cx} cy="95" r="1.4" fill="#1a1a1a" /><path d={`M${cx - 11} 90 Q${cx} 86 ${cx + 11} 90`} stroke="#3a2a1c" strokeWidth="2" fill="none" strokeLinecap="round" /></g>;
    return <g key={cx}><path d={`M${cx - 10} 94 Q${cx} 86 ${cx + 10} 94 Q${cx} 100 ${cx - 10} 94 Z`} fill="#fff" /><circle cx={cx} cy="94" r="4" fill={eye} /><circle cx={cx} cy="94" r="1.5" fill="#1a1a1a" />{lash}</g>;
  };

  const mouth =
    c.mouth === "neutral" ? <path d="M88 122 H112" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" /> :
    c.mouth === "smirk" ? <path d="M88 120 Q102 126 114 118" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" /> :
    c.mouth === "pout" ? <ellipse cx="100" cy="121" rx="8" ry="5" fill="#b86b62" /> :
    c.mouth === "grin" ? <g><path d="M86 118 Q100 134 114 118 Z" fill="#fff" stroke="#9c5a52" strokeWidth="2" /></g> :
    <path d="M86 119 Q100 132 114 119" stroke="#9c5a52" strokeWidth="3" strokeLinecap="round" fill="none" />;

  // Clothed torso (the cloth garment of the built-from-parts bust).
  const cloth =
    c.outfit === "suit" ? <g><path d="M40 224 C40 178 160 178 160 224 Z" fill={u("outfit")} /><path d="M100 182 L84 224 L100 210 L116 224 Z" fill="#f3ecda" /></g> :
    c.outfit === "robe" ? <g><path d="M44 224 C44 180 156 180 156 224 Z" fill={u("outfit")} /><path d="M100 184 L82 224 M100 184 L118 224" stroke="#caa24e" strokeWidth="3" /></g> :
    c.outfit === "cloak" ? <g><path d="M34 224 C34 176 166 176 166 224 Z" fill={u("outfit")} /><path d="M100 182 L100 224" stroke="#caa24e" strokeWidth="2" /><circle cx="100" cy="188" r="5" fill="#caa24e" /></g> :
    c.outfit === "tee" ? <g><path d="M46 224 C46 184 154 184 154 224 Z" fill={u("outfit")} /><path d="M84 184 Q100 196 116 184" fill="none" stroke="#9fb0b6" strokeWidth="3" /></g> :
    c.outfit === "corset" ? <g><path d="M48 224 C48 182 152 182 152 224 Z" fill={u("outfit")} /><path d="M100 186 V222 M92 192 H108 M92 202 H108 M92 212 H108" stroke="#e9d6b0" strokeWidth="2" /></g> :
    c.outfit === "lace" ? <g><path d="M46 224 C46 182 154 182 154 224 Z" fill={u("outfit")} /><path d="M70 186 Q100 200 130 186" fill="none" stroke="#caa24e" strokeWidth="2" /><circle cx="86" cy="204" r="2" fill="#caa24e" /><circle cx="100" cy="208" r="2" fill="#caa24e" /><circle cx="114" cy="204" r="2" fill="#caa24e" /></g> :
    c.outfit === "royal" ? <g><path d="M38 224 C38 176 162 176 162 224 Z" fill={u("outfit")} /><path d="M38 200 C70 214 130 214 162 200 L162 224 L38 224 Z" fill="#7a2d3a" /><circle cx="100" cy="190" r="6" fill="#caa24e" /></g> :
    <g><path d="M40 224 C40 178 160 178 160 224 Z" fill={u("outfit")} /><path d="M70 184 C82 200 118 200 130 184" fill="none" stroke="#f3ecda" strokeWidth="3" /></g>;

  // Bare skin torso — drawn when the wearer goes shirtless to show chest ink.
  const bareTorso = (
    <g>
      <path d="M40 224 C40 178 160 178 160 224 Z" fill={u("skin")} />
      <ellipse cx="100" cy="198" rx="60" ry="22" fill={skinHi} opacity="0.12" />
      <path d="M66 192 Q100 184 134 192" fill="none" stroke={skinLo} strokeWidth="2" opacity="0.55" strokeLinecap="round" />
      <path d="M100 196 L100 224" stroke={skinLo} strokeWidth="1.4" opacity="0.4" />
      <path d="M72 206 Q86 220 100 210" fill="none" stroke={skinLo} strokeWidth="1.6" opacity="0.32" />
      <path d="M128 206 Q114 220 100 210" fill="none" stroke={skinLo} strokeWidth="1.6" opacity="0.32" />
    </g>
  );
  // Skin showing at the shoulders/upper arms when sleeveless.
  const armCaps = <g><ellipse cx="46" cy="208" rx="15" ry="24" fill={u("skin")} /><ellipse cx="154" cy="208" rx="15" ry="24" fill={u("skin")} /></g>;

  const shoulders = bareChest
    ? <g>{bareTorso}</g>
    : <g>{bareArms && armCaps}{cloth}</g>;

  const acc = (() => {
    switch (c.accessory) {
      case "beautyMark": return <circle cx="113" cy="116" r="2.2" fill="#3a2a1c" />;
      case "pearls": return <g fill="#fff" stroke="#caa24e" strokeWidth="0.6">{[80, 88, 96, 104, 112, 120].map((x, i) => <circle key={i} cx={x} cy={155 + Math.abs(x - 100) * 0.12} r="3.4" />)}</g>;
      case "earrings": return <g fill="#caa24e"><circle cx="58" cy="112" r="3.4" /><circle cx="142" cy="112" r="3.4" /></g>;
      case "glasses": return <g fill="none" stroke="#2a2a2a" strokeWidth="2.4"><rect x="68" y="86" width="28" height="18" rx="9" /><rect x="104" y="86" width="28" height="18" rx="9" /><path d="M96 94 H104" /></g>;
      case "monocle": return <g fill="none" stroke="#b8924a" strokeWidth="2.4"><circle cx="118" cy="94" r="13" /><path d="M118 107 L124 134" stroke="#8b6f35" strokeWidth="1.4" /></g>;
      case "crown": return <g fill="#caa24e" stroke="#8b6f35" strokeWidth="1.2"><path d="M68 52 L78 36 L88 50 L100 32 L112 50 L122 36 L132 52 Z" /><circle cx="100" cy="34" r="3" fill="#d98aa0" /></g>;
      case "veil": return <path d="M58 60 C58 40 142 40 142 60 L150 150 L50 150 Z" fill="#ffffff" opacity="0.28" />;
      default: return null;
    }
  })();

  return (
    <svg viewBox="0 0 200 224" width={size} height={size * 224 / 200} role="img" aria-label="avatar">
      <defs>
        <clipPath id={gid("clip")}><rect x="6" y="6" width="188" height="212" rx="14" /></clipPath>
        <radialGradient id={gid("bg")} cx="50%" cy="32%" r="85%">
          <stop offset="0%" stopColor={bgHi} /><stop offset="58%" stopColor={bg} /><stop offset="100%" stopColor={bgLo} />
        </radialGradient>
        <radialGradient id={gid("halo")} cx="50%" cy="40%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" /><stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gid("vig")} cx="50%" cy="40%" r="75%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.26)" />
        </radialGradient>
        <radialGradient id={gid("skin")} cx="40%" cy="34%" r="74%">
          <stop offset="0%" stopColor={skinHi} /><stop offset="52%" stopColor={skin} /><stop offset="100%" stopColor={skinLo} />
        </radialGradient>
        <linearGradient id={gid("hair")} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor={hairHi} /><stop offset="46%" stopColor={hair} /><stop offset="100%" stopColor={hairLo} />
        </linearGradient>
        <linearGradient id={gid("outfit")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={outfitHi} /><stop offset="100%" stopColor={outfitLo} />
        </linearGradient>
        <radialGradient id={gid("blush")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e88a86" stopOpacity="0.5" /><stop offset="100%" stopColor="#e88a86" stopOpacity="0" />
        </radialGradient>
        <filter id={gid("soft")} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      <g clipPath={`url(#${gid("clip")})`}>
        <rect x="0" y="0" width="200" height="224" fill={u("bg")} />
        <ellipse cx="100" cy="92" rx="86" ry="96" fill={u("halo")} />
        <ellipse cx="100" cy="222" rx="78" ry="16" fill="#000" opacity="0.16" filter={`url(#${gid("soft")})`} />
        {shoulders}
        <path d="M89 128 Q100 138 111 128 L111 156 Q100 162 89 156 Z" fill={skinLo} />
        <ellipse cx="100" cy="150" rx="22" ry="9" fill={skinShadow} opacity="0.34" filter={`url(#${gid("soft")})`} />
        {hairBack}
        {head}
        <ellipse cx="58" cy="100" rx="6" ry="9" fill={skinLo} /><ellipse cx="142" cy="100" rx="6" ry="9" fill={skinLo} />
        <path d="M58 84 Q100 70 142 84 L142 94 Q100 82 58 94 Z" fill="#000" opacity="0.07" filter={`url(#${gid("soft")})`} />
        {hairFront}
        {brows}
        {eyeEl(82)}{eyeEl(118)}
        <circle cx="80.4" cy="92.2" r="1.3" fill="#fff" opacity="0.85" /><circle cx="116.4" cy="92.2" r="1.3" fill="#fff" opacity="0.85" />
        <path d="M101 100 L96 112 Q100 115.5 104 112" fill="none" stroke={mix(skin, -0.22)} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="74" cy="111" rx="7" ry="5.5" fill={u("blush")} /><ellipse cx="126" cy="111" rx="7" ry="5.5" fill={u("blush")} />
        {mouth}
        {acc}
        {tattoo && <image href={tattoo} x="84" y="158" width="32" height="38" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />}
        <rect x="0" y="0" width="200" height="224" fill={u("vig")} />
      </g>
      <rect x="6" y="6" width="188" height="212" rx="14" fill="none" stroke="#b8924a" strokeWidth="3" />
      <rect x="10" y="10" width="180" height="204" rx="11" fill="none" stroke="#8b6f35" strokeWidth="1" />
    </svg>
  );
}
