// The single source of truth for the tattoo taxonomy — one enum shared by the
// Commission quiz + matcher, the Artist Hub Portfolio classifier, the /api/classify
// route, and gallery search. Do not redefine these lists anywhere else.

export const STYLES = [
  "Traditional", "Neo-Traditional", "Realism", "Fine Line", "Blackwork",
  "Japanese", "Watercolor", "Geometric", "Chicano", "Dark Fantasy",
] as const;

export const TEMPERAMENTS = ["Delicate", "Bold", "Dark", "Ornate", "Minimal"] as const;

export type Style = (typeof STYLES)[number];
export type Temperament = (typeof TEMPERAMENTS)[number];

/** Case-insensitively resolve a free-text tag to a canonical taxonomy value. */
export function canonTag<T extends readonly string[]>(list: T, v: unknown): T[number] | null {
  if (typeof v !== "string") return null;
  const hit = list.find((x) => x.toLowerCase() === v.trim().toLowerCase());
  return (hit as T[number]) || null;
}
