// Avatar "looks" manifest — pre-made avatars.
//
// Each look is described by a `config` that the built-in SVG avatar engine
// (app/avatar/AvatarRender.tsx) draws entirely from code — no external image
// assets required, so the gallery always renders. An optional `src` PNG may be
// added later in /public/avatars to override a look with illustrated art.

import type { AvatarConfig } from "./AvatarRender";

export type Look = {
  id: string;
  label: string;
  gender: "female" | "male";
  config: Partial<AvatarConfig>; // drives the from-code SVG avatar
  src?: string;                  // optional illustrated override (served from /public)
  premium?: boolean;
  gems?: number;
};

const pad = (n: number) => String(n).padStart(2, "0");
const FBASE: Partial<AvatarConfig> = { face: "oval", brows: "soft", eyes: "almond", mouth: "smile" };
const MBASE: Partial<AvatarConfig> = { face: "square", brows: "bold", eyes: "almond", mouth: "neutral", hair: "short", hairColor: "brown" };

const F = (n: number, label: string, config: Partial<AvatarConfig>, extra: Partial<Look> = {}): Look => ({
  id: `female-${pad(n)}`, label, gender: "female",
  config: { ...FBASE, ...config }, src: `/avatars/female-${pad(n)}.png`, ...extra,
});
const M = (n: number, label: string, config: Partial<AvatarConfig>, extra: Partial<Look> = {}): Look => ({
  id: `male-${pad(n)}`, label, gender: "male",
  config: { ...MBASE, ...config }, src: `/avatars/male-${pad(n)}.png`, ...extra,
});

export const LOOKS: Look[] = [
  // ----- Ladies (14) -----
  F(1,  "Lavender",       { skin: "light",  hair: "wavy",     hairColor: "brown",    outfit: "gown",   outfitColor: "#b9a7d6", bg: "lavender", accessory: "pearls",     eyeColor: "blue" }),
  F(2,  "Onyx Lace",      { skin: "light",  hair: "updo",     hairColor: "black",    outfit: "lace",   outfitColor: "#2a2630", bg: "noir",     accessory: "earrings",   eyeColor: "gray" }),
  F(3,  "Noir & Cream",   { skin: "medium", hair: "long",     hairColor: "platinum", outfit: "gown",   outfitColor: "#23202a", bg: "cream",    accessory: "veil",       eyeColor: "green" }),
  F(4,  "Cream Brocade",  { skin: "light",  hair: "bun",      hairColor: "blonde",   outfit: "royal",  outfitColor: "#e7d9b3", bg: "gold",     accessory: "pearls",     eyeColor: "hazel" }),
  F(5,  "Teal Rose",      { skin: "tan",    hair: "long",     hairColor: "auburn",   outfit: "gown",   outfitColor: "#2f8f86", bg: "sage",     accessory: "earrings",   eyeColor: "amber" }),
  F(6,  "Crimson Rose",   { skin: "medium", hair: "curls",    hairColor: "black",    outfit: "gown",   outfitColor: "#8e2433", bg: "rose",     accessory: "beautyMark", eyeColor: "brown", mouth: "pout" }),
  F(7,  "Black Lace",     { skin: "light",  hair: "wavy",     hairColor: "black",    outfit: "lace",   outfitColor: "#201c22", bg: "noir",     accessory: "veil",       eyeColor: "violet" }),
  F(8,  "Peach Court",    { skin: "light",  hair: "updo",     hairColor: "copper",   outfit: "gown",   outfitColor: "#e8b48f", bg: "cream",    accessory: "pearls",     eyeColor: "hazel" }),
  F(9,  "Powder Blue",    { skin: "light",  hair: "long",     hairColor: "blonde",   outfit: "gown",   outfitColor: "#a9c4d4", bg: "blue",     accessory: "earrings",   eyeColor: "blue" }),
  F(10, "Sage Court",     { skin: "olive",  hair: "bun",      hairColor: "brown",    outfit: "gown",   outfitColor: "#8fa98f", bg: "sage",     accessory: "pearls",     eyeColor: "green" }),
  F(11, "Emerald Gold",   { skin: "brown",  hair: "updo",     hairColor: "black",    outfit: "royal",  outfitColor: "#1f6b51", bg: "royal",    accessory: "crown",      eyeColor: "gold" }),
  F(12, "Ivory Gilt",     { skin: "light",  hair: "curls",    hairColor: "platinum", outfit: "gown",   outfitColor: "#efe6cf", bg: "gold",     accessory: "crown",      eyeColor: "gray" }),
  F(13, "Burgundy",       { skin: "tan",    hair: "long",     hairColor: "auburn",   outfit: "gown",   outfitColor: "#6e2030", bg: "rose",     accessory: "earrings",   eyeColor: "brown" }),
  F(14, "Silver Empire",  { skin: "light",  hair: "updo",     hairColor: "gray",     outfit: "gown",   outfitColor: "#c8ccd2", bg: "lavender", accessory: "pearls",     eyeColor: "gray" }),
  // ----- Gentlemen (14) -----
  M(1,  "Teal Court",     { skin: "medium", hair: "short",    hairColor: "brown",    outfit: "suit",   outfitColor: "#2f7f86", bg: "cream",    accessory: "none",       eyeColor: "brown" }),
  M(2,  "Olive Court",    { skin: "brown",  hair: "short",    hairColor: "black",    outfit: "suit",   outfitColor: "#6f7a3a", bg: "sage",     accessory: "none",       eyeColor: "brown" }),
  M(3,  "Sage",          { skin: "light",  hair: "wavy",     hairColor: "brown",    outfit: "suit",   outfitColor: "#8fa98f", bg: "cream",    accessory: "none",       eyeColor: "green" }),
  M(4,  "Naval Blue",     { skin: "deep",   hair: "short",    hairColor: "black",    outfit: "suit",   outfitColor: "#2a3f63", bg: "blue",     accessory: "none",       eyeColor: "brown" }),
  M(5,  "Ivory Gold",     { skin: "light",  hair: "wavy",     hairColor: "blonde",   outfit: "royal",  outfitColor: "#e7d9b3", bg: "gold",     accessory: "monocle",    eyeColor: "hazel" }),
  M(6,  "White Officer",  { skin: "medium", hair: "short",    hairColor: "brown",    outfit: "suit",   outfitColor: "#eef0f2", bg: "blue",     accessory: "none",       eyeColor: "gray" }),
  M(7,  "Plumed White",   { skin: "light",  hair: "wavy",     hairColor: "platinum", outfit: "royal",  outfitColor: "#f3f1ea", bg: "cream",    accessory: "none",       eyeColor: "blue" }),
  M(8,  "Crimson Cloak",  { skin: "brown",  hair: "short",    hairColor: "black",    outfit: "cloak",  outfitColor: "#8e2433", bg: "noir",     accessory: "none",       eyeColor: "brown" }),
  M(9,  "Bordeaux Cloak", { skin: "deep",   hair: "short",    hairColor: "black",    outfit: "cloak",  outfitColor: "#5a1f2c", bg: "royal",    accessory: "none",       eyeColor: "brown" }),
  M(10, "Forest Green",   { skin: "medium", hair: "short",    hairColor: "brown",    outfit: "suit",   outfitColor: "#1f5a3a", bg: "sage",     accessory: "none",       eyeColor: "green" }),
  M(11, "Chestnut",       { skin: "tan",    hair: "wavy",     hairColor: "brown",    outfit: "suit",   outfitColor: "#6e4326", bg: "cream",    accessory: "none",       eyeColor: "hazel" }),
  M(12, "Slate",          { skin: "light",  hair: "short",    hairColor: "gray",     outfit: "suit",   outfitColor: "#4a525c", bg: "blue",     accessory: "glasses",    eyeColor: "gray" }),
  M(13, "Lilac Grey",     { skin: "medium", hair: "short",    hairColor: "brown",    outfit: "suit",   outfitColor: "#b3a7c4", bg: "lavender", accessory: "none",       eyeColor: "brown" }),
  M(14, "Plum",           { skin: "brown",  hair: "short",    hairColor: "black",    outfit: "suit",   outfitColor: "#5a2f5a", bg: "royal",    accessory: "none",       eyeColor: "brown" }),
];

export const LOOKS_BY_GENDER: Record<"female" | "male", Look[]> = {
  female: LOOKS.filter((l) => l.gender === "female"),
  male: LOOKS.filter((l) => l.gender === "male"),
};

export function getLook(id?: string | null): Look | undefined {
  if (!id) return undefined;
  return LOOKS.find((l) => l.id === id);
}
