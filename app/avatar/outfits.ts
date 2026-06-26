// Outfit manifest — layered, paper-doll wardrobe.
//
// Unlike `looks.ts` (a fused portrait where person + clothing are baked into one
// image), an *outfit* is a separate clothing LAYER that sits on top of a shared
// body/likeness. That lets a wearer keep the same face & skin while swapping
// garments — and, crucially for a tattoo house, *remove* a garment (bare chest /
// no sleeves) to show off ink.
//
// ── How the layers stack (back → front) ───────────────────────────────────────
//   1. body       the bare likeness (skin, face, hair)            looks.ts `body`
//   2. tattoo     saved design, composited onto bare skin         profile.avatar_tattoo
//   3. outfit     transparent clothing PNG from /public/outfits   this file
//   (a "bare" outfit simply omits layer 3 so the skin + ink show.)
//
// ── Art spec for the outfit PNGs ──────────────────────────────────────────────
//   • Same canvas as the body art: 600 × 1410 px (the full-body 200×470 frame ×3).
//   • Transparent background. Draw ONLY the garment, aligned to the body template
//     in /public/outfits/README.md so necklines / shoulders / hem line up.
//   • Export sleeves and bodice as one piece; the `coversChest` / `coversArms`
//     flags below tell the app what skin a garment hides (used to decide whether
//     the bare-chest / sleeveless toggles are meaningful for that piece).
//
// Drop files in /public/outfits/ using the `src` names below. Until a file
// exists the layer is simply skipped, so you can add garments a few at a time.

export type Outfit = {
  id: string;
  label: string;
  gender: "female" | "male";
  src: string | null;     // transparent overlay in /public/outfits; null = bare skin
  coversChest: boolean;   // does this garment cover the chest?
  coversArms: boolean;    // does it cover the upper arms / shoulders?
  bare?: boolean;         // true for the skin-revealing "outfits" (no shirt, etc.)
  premium?: boolean;
  gems?: number;
};

const F = (n: number, label: string, extra: Partial<Outfit> = {}): Outfit => ({
  id: `outfit-f-${String(n).padStart(2, "0")}`,
  label, gender: "female",
  src: `/outfits/outfit-f-${String(n).padStart(2, "0")}.png`,
  coversChest: true, coversArms: true,
  ...extra,
});
const M = (n: number, label: string, extra: Partial<Outfit> = {}): Outfit => ({
  id: `outfit-m-${String(n).padStart(2, "0")}`,
  label, gender: "male",
  src: `/outfits/outfit-m-${String(n).padStart(2, "0")}.png`,
  coversChest: true, coversArms: true,
  ...extra,
});

// ── Skin / reveal options ─────────────────────────────────────────────────────
// These have no art (src: null). Choosing one removes the relevant garment layer
// so tattoos read on bare skin. They pair with the `bareChest` / `bareArms`
// toggles, and are gendered only for catalog tidiness.
const BARE = (gender: "female" | "male"): Outfit[] => [
  { id: `bare-${gender}-skin`, label: "Bare (no shirt)", gender, src: null, coversChest: false, coversArms: false, bare: true },
  { id: `bare-${gender}-sleeveless`, label: "Sleeveless", gender, src: null, coversChest: true, coversArms: false, bare: true },
];

export const OUTFITS: Outfit[] = [
  // ----- Ladies' wardrobe -----
  ...BARE("female"),
  F(1, "Lavender Court"),
  F(2, "Onyx Lace"),
  F(3, "Cream Brocade"),
  F(4, "Teal Rose"),
  F(5, "Crimson Rose"),
  F(6, "Peach Court"),
  F(7, "Emerald Gold", { premium: true, gems: 99 }),
  F(8, "Ivory Gilt", { premium: true, gems: 99 }),
  // ----- Gentlemen's wardrobe -----
  ...BARE("male"),
  M(1, "Teal & Rose Court"),
  M(2, "Olive Court"),
  M(3, "Naval Blue"),
  M(4, "Ivory & Gold"),
  M(5, "White Officer"),
  M(6, "Plumed Azure", { premium: true, gems: 99 }),
  M(7, "Velvet Noir", { premium: true, gems: 99 }),
];

export const OUTFITS_BY_GENDER: Record<"female" | "male", Outfit[]> = {
  female: OUTFITS.filter((o) => o.gender === "female"),
  male: OUTFITS.filter((o) => o.gender === "male"),
};

export function getOutfit(id?: string | null): Outfit | undefined {
  if (!id) return undefined;
  return OUTFITS.find((o) => o.id === id);
}
