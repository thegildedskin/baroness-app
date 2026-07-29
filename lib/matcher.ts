// The house matcher — the single scoring rule the Commission chamber uses to rank
// artist works against a wanderer's chosen styles + temperament. Kept here so the
// Commission flow and any gallery/search use identical scoring.
//
// Score = 2 points per style hit + 1 point per temperament hit.

export type ScorableWork = { st: string[]; vb: string[] };

export function scoreWork(w: ScorableWork, styles: string[], vibe: string | null): number {
  return w.st.filter((s) => styles.includes(s)).length * 2 + (vibe && w.vb.includes(vibe) ? 1 : 0);
}

/** Rank works, keep only positive matches, return the top `limit` (default 6). */
export function topMatches<T extends ScorableWork>(
  works: T[],
  styles: string[],
  vibe: string | null,
  limit = 6,
): (T & { sc: number })[] {
  return works
    .map((w) => ({ ...w, sc: scoreWork(w, styles, vibe) }))
    .filter((w) => w.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, limit);
}
