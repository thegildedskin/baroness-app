-- =====================================================================
-- 007 — MARKETING: site settings, post planner, weekly scorecard
-- Run in Supabase → SQL Editor. Safe to re-run.
-- =====================================================================

-- ---------- site_settings (key/value; safe-for-public values only) ----------
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- seed defaults (no-op if present)
insert into public.site_settings (key, value) values
  ('studio_venue_url',        'https://venue.ink/'),
  ('booking_promise',         'A reply within the hour during receiving hours — a paid deposit is what locks your date.'),
  ('google_review_url_garland', ''),
  ('google_review_url_plano',   ''),
  ('meta_business_url',       'https://business.facebook.com/'),
  ('google_business_url',     'https://business.google.com/'),
  ('venue_dashboard_url',     'https://venue.ink/')
on conflict (key) do nothing;

-- ---------- marketing_posts (content planner) ----------
create table if not exists public.marketing_posts (
  id            uuid primary key default gen_random_uuid(),
  location      text not null default 'garland' check (location in ('garland','plano')),
  platform      text not null default 'instagram' check (platform in ('instagram','tiktok','facebook','google','email','other')),
  artist_id     uuid references public.artists(id) on delete set null,
  caption       text not null,
  media_note    text,               -- what asset to use / where it lives
  scheduled_for date,
  status        text not null default 'idea' check (status in ('idea','drafted','scheduled','posted')),
  created_at    timestamptz not null default now()
);
create index if not exists idx_mkt_posts_sched on public.marketing_posts(scheduled_for);

-- ---------- marketing_metrics (weekly scorecard, one row per week+location) ----------
create table if not exists public.marketing_metrics (
  week_start        date not null,
  location          text not null check (location in ('garland','plano')),
  inquiries         int not null default 0,
  avg_response_min  int,            -- median/typical first-response time, minutes
  deposits          int not null default 0,
  reviews_added     int not null default 0,
  notes             text,
  updated_at        timestamptz not null default now(),
  primary key (week_start, location)
);

-- ---------- RLS ----------
alter table public.site_settings     enable row level security;
alter table public.marketing_posts   enable row level security;
alter table public.marketing_metrics enable row level security;

-- settings: anyone may read (values are public-safe; the estate page uses them),
-- only the owner may write
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read"  on public.site_settings for select using (true);
drop policy if exists "settings: owner write" on public.site_settings;
create policy "settings: owner write" on public.site_settings
  for all using (public.is_owner()) with check (public.is_owner());

-- posts + metrics: owner only (artists see their own posts too)
drop policy if exists "mkt posts: owner all" on public.marketing_posts;
create policy "mkt posts: owner all" on public.marketing_posts
  for all using (public.is_owner()) with check (public.is_owner());
drop policy if exists "mkt posts: artist reads own" on public.marketing_posts;
create policy "mkt posts: artist reads own" on public.marketing_posts
  for select using (artist_id is not null and public.owns_artist(artist_id));

drop policy if exists "mkt metrics: owner all" on public.marketing_metrics;
create policy "mkt metrics: owner all" on public.marketing_metrics
  for all using (public.is_owner()) with check (public.is_owner());
