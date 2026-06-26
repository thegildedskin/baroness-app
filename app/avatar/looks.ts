// Avatar "looks" manifest — illustrated, pre-made avatar portraits.
//
// Artwork lives in  public/avatars/  (female-01.png … male-14.png), sliced from
// the Rococo / Bridgerton line-up sheets. To swap or add art, drop a PNG with the
// matching `src` name. Until a file exists the gallery shows a "coming soon" frame
// and the rest of the site keeps working.

export type Look = {
  id: string;
  label: string;
  gender: "female" | "male";
  src: string;       // served from /public (the fused, fully-dressed portrait)
  body?: string;     // optional bare-body art (skin/face/hair only) for paper-doll
                     // layering — when present, outfits & tattoos composite onto it.
                     // See app/avatar/outfits.ts. Falls back to `src` if absent.
  premium?: boolean; // gate behind membership / gems if true
  gems?: number;     // optional price tag for the store view
};

const F = (n: number, label: string, extra: Partial<Look> = {}): Look => ({
  id: `female-${String(n).padStart(2, "0")}`,
  label, gender: "female",
  src: `/avatars/female-${String(n).padStart(2, "0")}.png`,
  ...extra,
});
const M = (n: number, label: string, extra: Partial<Look> = {}): Look => ({
  id: `male-${String(n).padStart(2, "0")}`,
  label, gender: "male",
  src: `/avatars/male-${String(n).padStart(2, "0")}.png`,
  ...extra,
});

export const LOOKS: Look[] = [
  // ----- Ladies (14) -----
  F(1, "Lavender"),
  F(2, "Onyx Lace"),
  F(3, "Noir & Cream"),
  F(4, "Cream Brocade"),
  F(5, "Teal Rose"),
  F(6, "Crimson Rose"),
  F(7, "Black Lace"),
  F(8, "Peach Court"),
  F(9, "Powder Blue"),
  F(10, "Sage Court"),
  F(11, "Emerald Gold"),
  F(12, "Ivory Gilt"),
  F(13, "Burgundy"),
  F(14, "Silver Empire"),
  // ----- Gentlemen (14) -----
  M(1, "Teal Court"),
  M(2, "Olive Court"),
  M(3, "Sage"),
  M(4, "Naval Blue"),
  M(5, "Ivory Gold"),
  M(6, "White Officer"),
  M(7, "Plumed White"),
  M(8, "Crimson Cloak"),
  M(9, "Bordeaux Cloak"),
  M(10, "Forest Green"),
  M(11, "Chestnut"),
  M(12, "Slate"),
  M(13, "Lilac Grey"),
  M(14, "Plum"),
];

export const LOOKS_BY_GENDER: Record<"female" | "male", Look[]> = {
  female: LOOKS.filter((l) => l.gender === "female"),
  male: LOOKS.filter((l) => l.gender === "male"),
};

export function getLook(id?: string | null): Look | undefined {
  if (!id) return undefined;
  return LOOKS.find((l) => l.id === id);
}
