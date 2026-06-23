export type Achievement = { key: string; label: string; desc: string; points: number; icon: string };

export const ACHIEVEMENTS: Achievement[] = [
  { key: "joined", label: "Welcomed to the House", desc: "Created your Quarters.", points: 50, icon: "🗝" },
  { key: "first_ink", label: "First Ink Logged", desc: "Added a piece to your Ink Passport.", points: 100, icon: "🖋" },
  { key: "patron", label: "Patron", desc: "Spent $100 at the house.", points: 150, icon: "🎗" },
  { key: "noble", label: "Noble", desc: "Spent $500 at the house.", points: 300, icon: "👑" },
  { key: "circle", label: "The Baroness's Circle", desc: "Spent $1,500 at the house.", points: 1000, icon: "⚜" },
];
export const ACH_MAP: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.key, a]));

export const TIERS = [
  { name: "Guest", min: 0 },
  { name: "Patron", min: 10000 },
  { name: "Noble", min: 50000 },
  { name: "The Baroness's Circle", min: 150000 },
];
export function tierFor(cents: number) { let t = TIERS[0]; for (const x of TIERS) if (cents >= x.min) t = x; return t; }
export function nextTier(cents: number) { return TIERS.find((x) => x.min > cents) || null; }
