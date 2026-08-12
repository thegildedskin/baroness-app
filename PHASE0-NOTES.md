# Phase 0 — owner action items

Things this branch cannot do for you; please handle before/at deploy.

1. **Rotate the Meshy API key.** A real key (`msy_mAIy…`) was committed in
   `.env.example` (now replaced with a placeholder, but it lives in git
   history). Rotate it at meshy.ai → profile → API Keys and put the new key
   only in `.env.local` / Vercel env vars.
2. **Archive `raw-art/` locally.** The folder (~213MB of raw AI outputs and
   thumbs) was removed from the repo on this branch. It still exists in git
   history on `main` — copy it somewhere safe (external drive / cloud) before
   any future history rewrite.
3. **`public/models/` (~621MB of USDZ files) was removed** — nothing in the
   code referenced them. Same note as above: recoverable from `main` history.
4. **Run `supabase/migrations/010_security_fixes.sql`** in the Supabase SQL
   editor. If the `flash.approved` column didn't exist yet, all current flash
   starts hidden from the public site — approve the good pieces in `/admin`.
5. **Set new env vars:** `STUDIO_NOTIFY_EMAIL` (where deposit notifications
   go; defaults to baroness@baronesstattoo.com) and `NEXT_PUBLIC_GA_ID`
   (GA4 measurement id, e.g. G-XXXXXXX; analytics renders nothing when unset).
