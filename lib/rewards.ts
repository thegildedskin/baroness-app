// Crown-point redemption tiers — the studio can tune these freely (business
// knob, not code). Values chosen so a booked deposit (+200) plus the starter
// purse (250) puts the first small discount within one visit's reach.
// Shared by /api/redeem (server) and the wallet page (labels).

export type RedemptionTier = { id: string; gems: number; valueCents: number; label: string };

export const REDEMPTION_TIERS: RedemptionTier[] = [
  { id: "t20", gems: 400, valueCents: 2000, label: "$20 off any sitting or merch" },
  { id: "t50", gems: 900, valueCents: 5000, label: "$50 off any sitting" },
  { id: "t100", gems: 1600, valueCents: 10000, label: "$100 off any sitting" },
];

export function tierById(id: string): RedemptionTier | undefined {
  return REDEMPTION_TIERS.find((t) => t.id === id);
}

/** Human-friendly unambiguous code: BRN-XXXX-XXXX (no 0/O/1/I). */
export function generateDiscountCode(rand: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) => Array.from({ length: n }, () => alphabet[Math.floor(rand() * alphabet.length)]).join("");
  return `BRN-${pick(4)}-${pick(4)}`;
}
