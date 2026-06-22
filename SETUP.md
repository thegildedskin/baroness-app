# Baroness App — Setup Guide

This is the new Next.js application that will replace the static prototype. It's
wired to Supabase for logins (magic link), artist profiles, media, and messaging.

This guide covers the steps **only you can do** (anything involving accounts or
secret keys). I can't create accounts or handle your passwords/keys for you.

---

## What's built so far (Phase 0 — foundation)

- ✅ Next.js app that compiles and deploys
- ✅ Supabase database schema with security rules (`supabase/schema.sql`)
- ✅ Magic-link login (`/login`) + session handling
- ✅ A protected dashboard shell (`/dashboard`)
- ✅ Your 8 artists seeded into the database (unpublished)

**Coming next:** porting the full rococo estate site, the artist profile editor,
the owner admin panel, and client messaging.

---

## Step 1 — Create your Supabase project

1. Go to **supabase.com** → sign in → **New project**.
2. Name it `baroness`, pick a region near Texas (e.g. `us-east-1`), set a database
   password (save it in your password manager), and create it.

## Step 2 — Load the database schema

1. In Supabase, open **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this folder, copy all of it, paste, and click **Run**.
3. You should see "Success." This creates all tables, security rules, storage
   buckets, and seeds your 8 artists.

## Step 3 — Get your keys

In Supabase → **Project Settings → API**, copy three things:

- **Project URL** (e.g. `https://abcd1234.supabase.co`)
- **anon public** key
- **service_role** key  ← *secret, never share or commit this*

## Step 4 — Configure auth redirect URLs

In Supabase → **Authentication → URL Configuration**, add to **Redirect URLs**:

- `http://localhost:3000/auth/confirm` (for local testing)
- `https://YOUR-VERCEL-DOMAIN/auth/confirm` (add once you deploy)

Magic-link email sign-in is on by default — nothing else to enable.

## Step 5 — Run it locally (optional but recommended)

In a terminal, inside the `baroness-app` folder:

```
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste in your URL and keys from Step 3. Then:

```
npm run dev
```

Visit `http://localhost:3000`, click **Artists' Quarters · Login**, enter your
email, and click the link in your inbox. You should land on the dashboard.

## Step 6 — Make yourself the House Owner

After you've signed in once (so your profile row exists), go to Supabase →
**SQL Editor** and run:

```sql
update public.profiles set role = 'owner' where email = 'YOUR_EMAIL_HERE';
```

## Step 7 — Deploy via GitHub + Vercel (the lasting setup)

This replaces the drag-and-drop method so future edits publish automatically.

1. Put this `baroness-app` folder in a **GitHub repository** (I can walk you
   through this — it's a one-time step).
2. In **Vercel → Add New → Project**, import that repo.
3. In the import screen, add the **Environment Variables** from your `.env.local`
   (the three keys + `NEXT_PUBLIC_SITE_URL` set to your Vercel URL).
4. Deploy. Add `baronesstattoo.com` under the project's Domains when ready.
5. Back in Supabase (Step 4), add your live `…/auth/confirm` URL to the redirect list.

---

## Notes

- The static prototype (`../index.html`) still works and stays as-is until this
  app is feature-complete and you choose to switch the domain over.
- `.env.local` and `node_modules` are git-ignored — your secrets won't be committed.
