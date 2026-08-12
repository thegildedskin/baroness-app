# Estate Extraction — runbook

The interactive "estate" (3D mansion, kingdom, avatar atelier, ball, wallet,
studio, commission) is charming but heavy — three.js, Meshy, 55 MB of room
assets — and none of it books tattoos. The plan: move it to its own repo and
its own Vercel project at **estate.baronesstattoo.com**, and let the main
site be a lean local-business site.

## When to do it

**After the main site is stable on baronesstattoo.com** — cutover done
(CUTOVER-CHECKLIST.md), bookings flowing, Search Console green for a couple
of weeks. There is no rush: the estate wings are gated behind
`NEXT_PUBLIC_EXPERIMENTS_ENABLED` and cost nothing while dormant. Do NOT do
this in the same week as the domain cutover; one migration at a time.

## Step 1 — run the extraction script

From the repo root:

```bash
./scripts/extract-estate.sh          # builds ../baroness-estate/
```

The script only READS this repo — it copies the estate code, assets, sql and
tests into `../baroness-estate/` and generates that new repo's
`package.json`, `tsconfig.json`, `next.config.mjs`, a minimal layout +
landing page, `.env.example`, `.gitignore` and `README.md`. Re-running it is
safe (it overwrites the copy).

## Step 2 — stand the estate up

Follow `../baroness-estate/README.md`: new GitHub repo, new Vercel project,
env vars (same Supabase project as this site + `MESHY_API_KEY`), and the
`estate` CNAME at GoDaddy.

## Step 3 — what to test on estate.baronesstattoo.com

- `npm install && npm run build` succeeds locally in the new repo.
- `npm test` — the matcher/taxonomy tests pass.
- `/` landing renders and links every wing.
- `/explore` loads the 3D mansion (draco decoder + room GLBs load — watch
  the network tab for 404s on `/rooms/...`, `/draco/...`).
- `/avatar/create` (needs `NEXT_PUBLIC_AVATURN_SUBDOMAIN`) and
  `/kingdom`, `/quarters`, `/ball`, `/wallet` with a logged-in test user —
  state + wallet APIs read/write the shared Supabase.
- Every money-shaped CTA points at `https://baronesstattoo.com/book`.

## Step 4 — LATER: delete the estate from this repo

**Deletion happens after the estate is verified live — not now, and not by
the script.** When the time comes, remove from THIS repo:

Pages / components:
- `app/explore/`, `app/kingdom/`, `app/quarters/`, `app/ball/`,
  `app/wallet/`, `app/avatar/`, `app/studio/`, `app/commission/`
- `app/Mansion3D.tsx` (check `app/EstateApp.tsx` / homepage imports first —
  the homepage estate scene may still use it; if the homepage keeps its 3D
  hero, keep Mansion3D and its assets)

API routes:
- `app/api/state/`, `app/api/wallet/`, `app/api/meshy/`,
  `app/api/ai-avatar/`, `app/api/ai-tattoo/`, `app/api/checkout-design/`,
  `app/api/checkout/`, `app/api/classify/`

Libraries:
- `lib/state.ts`, `lib/wallet.ts`, `lib/achievements.ts`, `lib/gltf.ts`,
  `lib/matcher.ts`, `lib/taxonomy.ts`, `lib/meshy.ts`
- (keep `lib/flags.ts` and `lib/supabase/` — the main site uses them)

Assets:
- `public/draco/`, `public/bastien/`, `public/livery/`, `public/rooms/`,
  `public/avatars/`, `public/outfits/` (same Mansion3D caveat: if the
  homepage keeps the 3D hero, it still needs draco + rooms)

SQL / tests:
- `supabase/baroness-state.sql`, `supabase/baroness-wallet.sql` (files only —
  do NOT drop the tables in Supabase; the estate app uses them)
- `tests/matcher.test.ts`, `tests/taxonomy.test.ts`

Dependencies (`package.json`):
- `three`, `@types/three`, `@react-three/fiber`,
  `@react-three/postprocessing`, `@avaturn/sdk`
- keep `stripe`, `@supabase/*`, `lenis` — the main site uses them

Then in this repo: `npx tsc --noEmit && npx next build && npm test`, fix any
straggler imports (grep for `Mansion3D`, `lib/state`, `lib/wallet`,
`lib/meshy`), add redirects in `next.config.mjs` from the old estate paths to
`https://estate.baronesstattoo.com/...`, and enjoy the ~70 MB lighter repo
and faster builds.
