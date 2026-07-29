# Deploying Baroness Tattoo to Vercel

The app is a standard Next.js 14 App Router project. Fonts are self-hosted
automatically at build time (via `next/font`), so there are no font steps.

## 1. Prerequisites

- The code pushed to a **GitHub** repo (Vercel deploys from Git).
- A **Vercel** account (free tier is fine).
- Your existing **Supabase** project (already used for auth + data).
- API keys you already have: **Meshy** (3D), **OpenAI** (AI features). Stripe /
  Resend / Google Places are optional.

## 2. Environment variables

Set these in **Vercel → your project → Settings → Environment Variables**
(add each to Production, Preview, and Development). Values come from your
`.env.local` / the source files in the project root.

### Required

| Variable | What it powers | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, database, shared-state backend | Supabase → Project Settings → API (the Project URL, **without** `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth | Supabase → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes | Supabase → API → `service_role` key |
| `NEXT_PUBLIC_SITE_URL` | Absolute links / auth redirects | Your Vercel URL, e.g. `https://baroness.vercel.app` |

### Feature keys (set the ones you use)

| Variable | What it powers |
| --- | --- |
| `MESHY_API_KEY` | 3D character viewer + Estate Ball (the `/api/meshy/*` proxy) |
| `OPENAI_API_KEY` | Vision classifier (`/api/classify`), AI avatar & tattoo generators |

### Optional

| Variable | What it powers |
| --- | --- |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout / deposits |
| `RESEND_API_KEY`, `RESEND_FROM` | Transactional email |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | Reviews ticker |
| `NEXT_PUBLIC_AVATURN_SUBDOMAIN` | Avaturn avatar creator |
| `MESHY_BASE_URL` | Override the Meshy API base (defaults to `https://api.meshy.ai`) |

> The full list with comments lives in `.env.example`.

## 3. Deploy

1. **Vercel → Add New → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Root directory: the folder
   containing this file (`baroness-app`). Build command / output: leave default.
3. Add the environment variables from step 2.
4. **Deploy.** First build downloads the self-hosted fonts and compiles all routes.

Node version: Vercel defaults to Node 20, which is correct (the app needs 18+).

## 4. Post-deploy (one-time)

1. **Create the tables.** In Supabase → SQL Editor, run these two scripts once:
   - `supabase/baroness-state.sql` — the `player_state` table (wardrobe,
     portfolio, curiosities, Quarters layout) with row-level security.
   - `supabase/baroness-wallet.sql` — the `gem_transactions` ledger + the
     `apply_gems()` RPC that owns the balance server-side (atomic, no overspend,
     250-gem starting purse). The `/wallet` page reads this.

   *Skipping these is fine* — the app falls back to per-device `localStorage`
   (the wallet is then client-side only, not cheat-resistant).

2. **Auth redirect URLs.** In Supabase → Authentication → URL Configuration,
   set **Site URL** to your Vercel URL and add it to **Redirect URLs**, so
   email/social login returns to the deployed site.

3. **Smoke-check** the new routes once live: `/commission`, `/kingdom`,
   `/artist-hub`, `/quarters`, `/avatar/3d`, `/ball`, and the `/dashboard` tiles.

## 5. Local development

```bash
npm install
# copy .env.example → .env.local and fill in values
npm run dev        # http://localhost:3000
```

On Windows, run this in **PowerShell** (not WSL on the `C:` drive — WSL can't set
file permissions there, which breaks `npm install`).

## Notes

- **3D models** stream from Meshy through the app's CORS proxy. To serve local
  compressed GLBs instead, run `meshy-fetch/build-models.mjs` (see that folder's
  README) — outputs land in `public/models/` and load via the Draco-configured
  loader already wired in `lib/gltf.ts`.
- **Royal Ledger** currently uses an in-process mock provider (`lib/ledger.ts`).
  On serverless (Vercel), that state is per-instance and ephemeral — swap
  `getLedger()` for a real embedded-wallet + L2 (or a DB table) before relying on
  it in production.
