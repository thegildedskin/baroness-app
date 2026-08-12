// Feature flags for the estate.
//
// EXPERIMENTS_ENABLED gates every experimental / gamified layer in one place:
// the 3D grounds (/explore), the Tattoo Atelier design lab (/studio), the
// Kingdom + gem wallet + Estate Ball + 3D quarters, the avatar creators
// (/avatar/create, /avatar/3d and the Avatar dashboard panels), the demo
// Artist Hub, and the "scenic route" commission flow.
//
// It reads NEXT_PUBLIC_EXPERIMENTS_ENABLED so the same value is inlined into
// both server and client bundles at build time. Default: OFF (go-live basics).
// Set NEXT_PUBLIC_EXPERIMENTS_ENABLED=1 (or "true") in the environment to
// bring the experimental wings back without touching code.

export const EXPERIMENTS_ENABLED =
  process.env.NEXT_PUBLIC_EXPERIMENTS_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_EXPERIMENTS_ENABLED === "true";

export function experimentsEnabled(): boolean {
  return EXPERIMENTS_ENABLED;
}
