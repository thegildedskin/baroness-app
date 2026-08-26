# Baroness Platform — Engineering Audit & Target Architecture

*Audit date: 2026-08-26. Scope: the full `baroness-app` codebase (26 routes, 20 API
endpoints, 18 lib modules, 12 SQL migrations) plus the `meshy-fetch` asset pipeline.*

---

## 1 · Audit — current state

### What is genuinely good (keep, don't churn)

- **The go-live flag system** (`lib/flags.ts`). Every experimental wing — 3D grounds,
  Atelier, Kingdom/wallet/ball/quarters, avatar creators, demo Artist Hub, scenic
  commission — is gated behind `NEXT_PUBLIC_EXPERIMENTS_ENABLED`, **default OFF**.
  This is the correct resolution of the site's core tension (immersion vs. conversion):
  ship the funnel, keep the world as a flag-flip. The estate homepage correctly hides
  links to gated pages, so nothing dead-ends.
- **The funnel is real now**: `/book` is a 3-step qualified intake (contact → vision
  with reference upload → artist & date) with honeypot, per-IP rate limiting, Stripe
  deposit, webhook signature verification, booking-row reconciliation, and a
  graceful no-Stripe path. `/artists/[slug]`, `/styles/[slug]`, `/reviews`, `/faq`
  give search engines real landing surfaces; `sitemap.ts` (ISR, hourly) + `robots.ts`
  + `lib/studio.ts` (NAP single source) cover local-SEO fundamentals.
- **Separation of facts from presentation** — `lib/studio.ts`, `lib/taxonomy.ts`,
  `lib/matcher.ts`, `lib/gallery.ts` are single sources of truth. CI runs
  typecheck + tests on every push.
- **Payments**: Stripe (deposits, products, gift cards) + GoDaddy Poynt (POS bridge,
  server-only JWT auth). Correct: the deposit is the conversion event, POS handles
  the chair.

### Bugs found in this audit (fixed where possible)

| # | Finding | Status |
|---|---|---|
| 1 | **CI lint step could never run** — ESLint was not installed and no config existed; `next lint` prompts interactively, so the CI `npm run lint` step hangs. | **Fixed**: added `.eslintrc.json` (`next/core-web-vitals`) + `eslint`/`eslint-config-next` devDeps. Run `npm install` locally once. |
| 2 | 2 `tsc` errors from **stale `.next/types` artifacts** referencing the deleted `/api/ledger` route. Not a source bug — the ledger removal itself was clean (no dangling refs). | Local-only artifact; clears on next `npm run build` (CI typechecks fresh). |
| 3 | `tests/` still covers taxonomy + matcher, but the ledger test was removed with the feature — coverage of the *funnel* (booking validation, rate limiter) is **zero**. | Open — see roadmap P1. |

### Redundancies / consolidation candidates

- **Two galleries**: the estate scene gallery and `/gallery` both render the same 25
  proxied photos. Acceptable (different contexts: immersive vs. crawlable/filterable),
  but both should keep reading `lib/gallery.ts` only — they do today. No action.
- **Two booking flows**: `/book` (fast) and `/commission` (scenic, flag-gated). By
  design. When experiments are re-enabled, `/commission` must funnel its final CTA
  into `/api/book` rather than its own mock reserve — currently it's demo-only.
- **Three avatar systems** (paper-doll 2D, AI likeness, 3D GLB viewer). All flag-gated.
  Long-term: one avatar record with three renderers, not three products (roadmap P3).
- `scripts/gallery-download.mjs` vs the `/api/gallery-img` proxy: the proxy is
  primary; keep the downloader as the fallback if GoDaddy hotlink policy changes.

### Risks / debts worth naming

- **In-memory rate limiting & caches** (booking rate limit, Meshy model cache) are
  per-serverless-instance. Fine at this traffic; move to Upstash/Redis or a
  Postgres counter if abuse appears.
- **`EstateApp.tsx` is a ~900-line client component** with inline CSS. It works and
  the flag system contains it, but it is the highest-complexity file; split scenes
  into components before adding anything to it.
- **Images**: public pages use raw `<img>` (correct for the CDN-proxied gallery);
  consider `next/image` for artist portraits and shop products (P2 perf pass).
- **Bookings inbox**: bookings land in Supabase + Stripe metadata + email; the admin
  UI for working them (contacted → booked → completed) is minimal. The artist suite
  (Goal 2) should own this.

---

## 2 · On "the most advanced coding languages available"

Honest senior-engineer answer: **the stack is already correct, and changing languages
would hurt, not help.** TypeScript (strict) + Next.js 14 App Router + React 18 +
Postgres (Supabase) + Stripe is the current production-grade standard for exactly
this class of product. What "advanced" should mean here:

- **TypeScript strict everywhere** — already on. Keep `tsc --noEmit` + tests in CI.
- **Server components / ISR / edge caching** — already used on the funnel pages.
- **SQL with RLS as the security boundary** — already the pattern (migrations 010/011).
- **WebGL via three.js/R3F** for the 3D tier — already in place, flag-gated.
- Where exotic tech is *not* justified: Rust/WASM (no CPU-bound hot path), GraphQL
  (one first-party client), microservices (one team, one deployable), a separate CMS
  (Supabase tables + admin panel already serve this).
- Sensible future upgrades, low priority: Next 15 + React 19 when the ecosystem
  settles; Playwright for E2E of the booking funnel; Zod at the API boundary
  (`/api/book` currently validates by hand — works, but Zod would make the contract
  explicit and testable).

---

## 3 · Target architecture — three tiers, one system

```
                    ┌─────────────────────────────────────────────┐
 GOAL 1 · FUNNEL    │  PUBLIC (always on, SEO, fast, no login)    │
 (client gen)       │  / (estate hero + Book CTA)                 │
                    │  /artists /artists/[slug] /styles/[slug]    │
                    │  /gallery /reviews /faq /prep-guide         │
                    │  /aftercare /shop /book ──► Stripe deposit  │
                    │        │                        │           │
                    │        ▼                        ▼           │
                    │  bookings table ◄── webhook reconciliation  │
                    └─────────────┬───────────────────────────────┘
                                  │ rewards hook (deposit → points)
                    ┌─────────────▼───────────────────────────────┐
 RETENTION          │  MEMBERS (login)                            │
 (points/rewards)   │  /dashboard (grouped tiles) /wallet (gems)  │
                    │  gem_transactions (server-authoritative)    │
                    │  earn: booking · missions · community       │
                    │  spend: liveries · wares · (discount codes) │
                    └─────────────┬───────────────────────────────┘
                                  │
                    ┌─────────────▼───────────────────────────────┐
 GOAL 2 · ARTIST    │  ARTIST SUITE (role-gated)                  │
 SUITE              │  /artist-hub: bookings inbox · portfolio    │
                    │  (classifier) · social composer + scheduler │
                    │  (/api/social + cron) · per-artist store    │
                    │  (Stripe Connect onboard) · Poynt POS       │
                    │  venue.ink = CRM of record (links out;      │
                    │  no public API → deep-link integration)     │
                    └─────────────┬───────────────────────────────┘
                                  │ NEXT_PUBLIC_EXPERIMENTS_ENABLED
                    ┌─────────────▼───────────────────────────────┐
 GOAL 3 · WORLD     │  EXPERIMENTS (flag-gated wing)              │
 (add-ons)          │  /commission (scenic booking w/ Bastien)    │
                    │  /kingdom /quarters /ball /avatar/* /studio │
                    │  /explore (3D grounds) · Meshy GLB pipeline │
                    └─────────────────────────────────────────────┘
```

**Design rules that keep this sane**

1. The funnel never depends on anything in the lower tiers. A visitor can land,
   book, and pay with zero JS-heavy 3D, zero login, zero gems.
2. The rewards system is the *bridge*, not a gate: paying a deposit earns points
   whether or not the guest ever opens the Kingdom. Points redeem as **discount
   codes on real services/merch** (that's the retention loop that generates repeat
   clients — see P1 below).
3. venue.ink stays the CRM of record. It has no public API, so the integration is
   deep links (per-artist `venue_url`, already modeled in `artists` + admin UI) and
   the bookings inbox mirrors state manually. If venue.ink ships an API/webhooks,
   `lib/` gets a `venueink.ts` adapter and the inbox syncs instead of mirrors.
4. Everything experimental ships behind the flag until it demonstrably helps a KPI.

---

## 4 · Creative differentiators (ranked by effort ÷ impact)

1. **"Wear it before you wear it"** — the AI tattoo generator (`/api/ai-tattoo`,
   exists) + on-skin preview during booking: attach a generated concept to the
   brief. No other studio in DFW offers this in the funnel itself.
2. **Deposit → crown points → real discounts** — market it as a *patronage*
   ("House Patronage: every sitting earns favor with Her Grace"). Points redeem
   for aftercare products, flash discounts, priority booking windows.
3. **Healed-work guarantee page** — publish healed (6-week) photos next to fresh
   ones per artist. Almost nobody does this; it converts skeptics and it's pure
   content (classifier already tags them).
4. **The estate as reward, not obstacle** — finish a sitting → unlock your room in
   the 3D estate, your piece hangs in your Quarters. The flag-gated world becomes
   the loyalty program's clubhouse.
5. **Artist reels autopilot** — the social composer + scheduler (exists) fed by the
   portfolio classifier: healed photo in → captioned, tagged, scheduled post out.
6. **Live "books open" state** per artist on `/artists` — scarcity honestly stated
   ("Vivienne: 2 September slots left") drives deposit urgency.

---

## 5 · Phased roadmap

**P0 — ship the funnel** ✅ COMPLETE (code side)
- [x] Flags off, funnel pages live, SEO layer, qualified `/book`, webhook reconcile.
- [x] CI lint fixed. Funnel tests: `lib/booking.ts` + `tests/booking.test.ts`
  (sanitizer, email, rate-limiter window/cap, honeypot, IP parsing).
- [x] GoDaddy-URL 301s in `next.config.mjs` for the cutover.
- [ ] **Operator actions**: run migrations 013–015 + the two SQL scripts in
  Supabase; `npm install` (ESLint devDeps); point DNS at Vercel.

**P1 — retention bridge** ✅ COMPLETE
- [x] Webhook: paid deposit → `pending_rewards` (email-keyed, idempotent by
  Stripe session) → auto-claimed on first authenticated wallet read (013).
- [x] Redemption: gems → `discount_codes` (015) via `/api/redeem` — atomic
  spend-first with refund-on-failure; tiers tunable in `lib/rewards.ts`;
  Purse UI shows tiers + codes. Manual counter redemption (like gift cards).
- [x] Bookings inbox: `/admin` → Bookings (default tab) — pipeline, intake
  detail, deposit badge, notes, Venue Ink handoff note. RLS in 014.

**P2 — artist suite hardening** ✅ COMPLETE (in scope)
- [x] Artists' real dashboard: `/dashboard` role-routes artists to their own
  Quarters (profile, flash, shop, payouts, messages); demo `/artist-hub`
  paused behind the flag with a pointer.
- [x] Social: real Meta Graph publishing (Standard Access, long-lived tokens in
  `social_accounts`) + Vercel cron (`CRON_SECRET`-guarded). TikTok stays a
  manual queue — no publish API at standard access; revisit if that changes.
- [x] Perf: `next/image` (fill + sizes, priority on the portrait LCP) on
  `/artists` + `/artists/[slug]`; image `remotePatterns` configured.
- [~] `EstateApp.tsx` split: deliberately deferred — it works, it's flag-
  contained, and it's under active parallel edit; refactoring a hot 900-line
  file mid-flight invites conflicts for zero user-visible gain. Split it when
  the next real feature touches it.

**P3 — the world, re-lit (flip when P0 metrics are healthy)**
- [x] `/commission` reserve now collects name/contact and POSTs the REAL
  `/api/book` flow (Stripe deposit; webhook awards the gems — client-side
  award removed). While flags are off it 301s to `/book`, so nothing is lost.
- [ ] Members-only experiments: product decision — either flip the env flag
  globally, or gate per-user (needs a runtime role check replacing the
  build-time flag; ~1 day when wanted).
- [ ] Regenerate portraits (`npm run avatars -- --force`, OpenAI credits) and
  generate the full GLB set (`meshy-fetch/generate-models.mjs`, Meshy credits)
  — both are operator/content actions; pipelines are built and tested.
- [ ] One-avatar-record unification + 3D loyalty clubhouse: build after the
  world re-lights and only if engagement metrics justify it.

**Deliberately not done (with reasons)**
- Playwright E2E: can't be verified in this environment (needs browser install
  + a running build); adding unverified CI steps is worse than none. Add it
  first thing once someone can run `npx playwright install` locally.
- Redis-backed rate limiting: premature at current traffic; the in-memory
  limiter is tested and the seam (`createRateLimiter`) makes the swap trivial.

---

*Fixed in this audit: ESLint install+config (CI lint was dead on arrival). Noted:
stale `.next` ledger types (self-heals on rebuild). Everything else verified clean:
typecheck ✓, tests 2 suites ✓, webhook signatures ✓, flag gating consistent ✓,
no dangling references to removed features ✓.*
