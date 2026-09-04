# Baroness — Go-Live Checklist (everything that's yours to do)

Every operator action from the whole build, in one place, in order.
Code-side work is done; each item here is a click, a command, or a decision.
Check them off as you go.

## 1 · One-time local setup (PowerShell, in `baroness-app`)

- [ ] `npm install` — picks up the ESLint dev-dependencies (CI lint needs it once locally too)
- [ ] Delete the two dead 54 MB assets bloating every deploy:
      `Remove-Item "public\rooms\FoyerMp4.mp4","public\rooms\gate.png"`

## 2 · Supabase (dashboard → SQL Editor, in order)

- [ ] **Resume the project** if it's paused (free tier sleeps after ~7 idle days;
      goes away at launch with traffic, or with Pro ~$25/mo → also daily backups)
- [ ] Run migrations, in order: `013_pending_rewards.sql` → `014_bookings_admin.sql`
      → `015_discount_codes.sql` → `016_job_applications.sql` → `017_edu_waitlist.sql`
- [ ] Seed: `seeds/artist-titles.sql` — **review the bios/titles first**; swap
      archetype blocks between artists so each fits (Katherine's is factual)
- [ ] Seed: `seeds/seed-content-calendar-2026-09.sql` — loads September's 16
      Instagram posts into Admin → Marketing as drafts

## 3 · Accounts (PowerShell)

- [ ] `node scripts\create-artist-accounts.mjs` — username-only artist logins
      (list is pre-filled; check usernames/slugs first). Prints passwords once —
      hand them out privately; artists change them in My Quarters → Set Password
- [ ] Forgot-password desk (whenever needed): `node scripts\reset-artist-password.mjs <username>`
- [ ] Client loyalty import: export your check-in history to CSV (needs an
      `email` column; `total_spent` / `visits` optional), then
      `node scripts\import-clients.mjs clients.csv` (add `--invite` to email
      sign-up invitations). Rates tunable at the top of the script.
      *Or drop the raw file in the project folder and have Claude map it.*

## 4 · Vercel (dashboard → Project → Settings → Environment Variables)

- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — from Meta Events Manager; enables the Pixel
      + the $100 Purchase conversion event (required before spending on ads)
- [ ] `NEXT_PUBLIC_GA_ID` — GA4 measurement ID, if not already set
- [ ] Confirm existing: Supabase URL/keys, `SUPABASE_SERVICE_ROLE_KEY`,
      `STRIPE_SECRET_KEY` + webhook secret, `CRON_SECRET`
- [ ] Redeploy after env changes

## 5 · Integrations

- [ ] **Instagram**: connect the IG Business account + long-lived token in
      Admin → Marketing. Unlocks BOTH the auto-publisher (daily cron) and the
      live @baronesstattoo strip on /gallery
- [ ] **Instagram bio link** → `baronesstattoo.com/book?utm_source=instagram`
- [ ] Stripe: confirm webhook endpoint points at the production domain

## 6 · Content & assets

- [ ] **Hero photo**: drop your best real interior shot into `public\rooms\`
      and tell Claude the filename — one-line swap replaces the AI garden
- [ ] Regenerate premade avatar portraits: `npm run avatars -- --force`
      (OpenAI credits; only matters when the experiments flag flips on)
- [ ] Generate the full GLB set: `node meshy-fetch\generate-models.mjs`
      (Meshy credits; experiments-only, no rush)
- [ ] September content: attach photos to the seeded posts in Admin →
      Marketing, flip each to *scheduled*; post the 4 Reels manually
- [ ] Review /restorative copy **with Katherine** before announcing it
      (claims kept careful; pricing deliberately unstated — your call)

## 7 · Launch

- [ ] Commit + push everything; confirm the Vercel build is green
- [ ] Point DNS at Vercel (keep GoDaddy site up until parity confirmed;
      old URLs 301 automatically: /gallery-1, /prep-guide-1, /contact, /employee…)
- [ ] After cutover: submit the sitemap in Google Search Console
- [ ] Walk the funnel yourself once on your phone: home → book → pay a $1 test
      deposit (Stripe test mode) → check it lands in Admin → Bookings

## 8 · Decisions parked (say the word and Claude builds)

- [ ] Academy pricing + cohort date → then: real Stripe enrollment checkout on /edu
- [ ] Members-only experiments flip (env flag global vs per-user gating)
- [ ] Playwright E2E once someone can run browsers locally
- [ ] October content calendar (rotating in Ale, Katherine, Mikey, Mayra)
- [ ] GoDaddy/M365 email untangling — no longer blocks anything on the site
