# Baroness Platform — Architecture

A map of the platform built from the design handoff: the routes, APIs, shared
libraries, the gem economy, external integrations, and the asset pipeline.
Everything is Next.js 14 App Router + TypeScript, styled from the design tokens
in `app/globals.css`. Fonts are self-hosted via `next/font` (`app/layout.tsx`).

## Routes (`app/`)

| Route | File | What it is | Status |
| --- | --- | --- | --- |
| `/` | `EstateApp.tsx` | Marketing estate / entry funnel | pre-existing |
| `/studio` | `studio/` | Atelier (AI tattoo studio) | pre-existing |
| `/shop` | `shop/` | Boutique (storefront) | pre-existing |
| `/admin` | `admin/` | Owner console | pre-existing |
| `/avatar`, `/avatar/create` | `avatar/` | Avatar / Dressing Room | pre-existing |
| `/dashboard` | `dashboard/ClientQuarters.tsx` | Client Quarters hub (tiles) | extended |
| **`/avatar/3d`** | `avatar/3d/MeshyGallery.tsx` | Candlelit GLB character viewer | **new** |
| **`/quarters`** | `quarters/QuartersRoom.tsx` | 3D My Quarters (edit + walk) | **new** |
| **`/ball`** | `ball/EstateBall.tsx` | Estate Ball (view + walk, live presence) | **new** |
| **`/commission`** | `commission/CommissionFlow.tsx` | $100-deposit booking flow + Bastien | **new** |
| **`/kingdom`** | `kingdom/Kingdom.tsx` | Court, lore, missions, hunt, Royal Ledger | **new** |
| **`/artist-hub`** | `artist-hub/ArtistHub.tsx` | Artist business dashboard (8 tabs) | **new** |
| **`/wallet`** | `wallet/Wallet.tsx` | The Purse — gem balance + ledger | **new** |

`/dashboard` tiles route to `/commission`, `/kingdom`, `/wallet`, `/avatar/3d`,
`/quarters`, `/ball`; the `/artist-hub` link is in the shell header.

## API routes (`app/api/`)

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/meshy/models` | GET | List the account's 3D models (Meshy list endpoints) |
| `/api/meshy/model/[id]` | GET | **CORS proxy** — streams a model's GLB from Meshy |
| `/api/classify` | POST | Vision classifier (OpenAI vision + heuristic fallback) |
| `/api/ledger` | GET / POST | Royal Ledger (token records; **mock provider**) |
| `/api/state` | GET / POST | Shared player state (per-user key-value; auth-gated) |
| `/api/wallet` | GET / POST | **Server-authoritative gem wallet** (atomic `apply_gems`) |
| `/api/ai-avatar`, `/api/ai-tattoo` | POST | OpenAI image generation | (pre-existing) |
| `/api/checkout*`, `/api/connect*`, `/api/stripe/webhook`, `/api/reviews` | — | (pre-existing) |

## Shared libraries (`lib/`)

- **`lib/gltf.ts`** — GLTFLoader configured with a self-hosted Draco decoder
  (`public/draco/`). Used by the viewer, ball, and (future) quarters props.
- **`lib/ledger.ts`** — `LedgerProvider` interface + a mock custodial impl
  (ERC-721 metadata, silent wallets). Swap the real chain in at `getLedger()`.
- **`lib/state.ts`** — client shared-state: `loadState`/`saveState`
  (server → localStorage → default). Keys: `wallet` (fallback), `curiosities`,
  `butler-skins`, `artist-works`, `my-quarters`, `curio-rewards`.
- **`lib/wallet.ts`** — client gem wallet: `getWallet` / `applyGems`
  (server-authoritative, localStorage fallback).
- **`lib/supabase/{client,server,admin}`** — Supabase clients (pre-existing).

## The gem economy

A single wallet, server-authoritative when signed in (the balance lives in
`gem_transactions`; only `apply_gems()` can change it, and it refuses overspend).

- **Earn** — Kingdom missions (`claim`), Kingdom curiosity hunt (`collectCurio`,
  +20 each), Artist Hub community royalties (+396, +60), Commission booking (+200).
- **Spend** — Kingdom liveries, Quarters wares.
- **See** — live balance on the Dashboard tile, Kingdom pill, Artist Hub pill,
  Quarters pill; full day-grouped ledger on `/wallet`.
- All flow through `applyGems(delta, reason)` → `POST /api/wallet` →
  `apply_gems` RPC. Reasons are namespaced: `mission:*`, `hunt:*`,
  `community:*`, `commission:*`, `livery:*`, `quarters:*`.

## Cross-screen data contracts (shared state)

- **`butler-skins`** — Kingdom writes (appoint livery) → Commission reads (Bastien's livery).
- **`artist-works`** — Artist Hub publishes (classify → publish) → Commission matcher ranks them.
- **`curiosities`** — the Estate writes finds → Kingdom reads (Hunt tab, Chapter III unlock).
- **`curio-rewards`** — Kingdom tracks which finds have been collected for gems.
- **`my-quarters`** — Quarters layout `{placed, bought}` (migrated from the old `{x,y%}` shape).

## Supabase tables (run once — SQL editor)

- **`supabase/baroness-state.sql`** → `player_state` (one jsonb row per user+key, RLS).
- **`supabase/baroness-wallet.sql`** → `gem_transactions` (append-only ledger, RLS)
  + `apply_gems(delta, reason)` RPC (atomic, overspend-safe, 250-gem starter purse).

Both are optional for the prototype (localStorage fallback), required for
cross-device + cheat-resistant persistence.

## External integrations

- **Meshy** — image→3D generation + GLB hosting. Loaded through the CORS proxy.
  Key: `MESHY_API_KEY`.
- **OpenAI** — vision classifier + AI image generators. Key: `OPENAI_API_KEY`.
- **Supabase** — auth, Postgres (state + wallet + existing data), and **Realtime
  presence** (the `estate-ball` channel drives live guests in `/ball`).

## 3D asset pipeline (`meshy-fetch/`)

1. **`baroness-download.mjs --list`** — pull existing GLBs from the account.
2. **`generate-models.mjs --src=<images>`** — image→3D for new looks (costs credits).
3. **`build-models.mjs --src=raw-models`** — Draco-compress → `public/models/`.

The app loads compressed models through `lib/gltf.ts` (Draco decoder in
`public/draco/`). Asset folders: `public/bastien/` (7 busts), `public/livery/`
(10 liveries), `public/models/`, `public/likeness-portrait.png`.

## Deployment

See `DEPLOYMENT.md` — Vercel steps, env-var matrix, and the two SQL scripts to run.

## Known later-phase items

- Real on-chain ledger (embedded-wallet vendor + L2 + legal) — `lib/ledger.ts` is a mock.
- Generating the full GLB set (28 court + 10 liveries) — pipeline exists, needs Meshy credits.
- Ball presence is client positions only — no server reconciliation / anti-cheat.
