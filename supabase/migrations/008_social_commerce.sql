-- =====================================================================
-- 008 — SOCIAL PUBLISHING + COMMERCE (GoDaddy/Poynt) SETTINGS
-- Run in Supabase → SQL Editor. Safe to re-run. Requires 007.
-- =====================================================================

-- ---------- social_accounts (Meta credentials for auto-publishing) ----------
create table if not exists public.social_accounts (
  id           uuid primary key default gen_random_uuid(),
  platform     text not null check (platform in ('instagram','facebook')),
  label        text not null default '',            -- e.g. "Baroness Garland IG"
  external_id  text not null,                       -- IG user id or FB page id
  access_token text not null,                       -- long-lived page/IG token
  connected_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- publishing fields on marketing_posts ----------
alter table public.marketing_posts add column if not exists media_url        text;  -- public JPEG url (required for IG)
alter table public.marketing_posts add column if not exists social_account_id uuid references public.social_accounts(id) on delete set null;
alter table public.marketing_posts add column if not exists published_at     timestamptz;
alter table public.marketing_posts add column if not exists external_post_id text;
alter table public.marketing_posts add column if not exists publish_error    text;

-- ---------- commerce settings live in site_settings (007) ----------
insert into public.site_settings (key, value) values
  ('poynt_application_id', ''),
  ('poynt_business_id',    ''),
  ('godaddy_dashboard_url','https://dashboard.godaddy.com/venture'),
  ('godaddy_orders_url',   'https://commerce.godaddy.com/orders'),
  ('godaddy_products_url', 'https://commerce.godaddy.com/products'),
  ('godaddy_payouts_url',  'https://commerce.godaddy.com/payouts'),
  ('godaddy_invoices_url', 'https://commerce.godaddy.com/invoicing'),
  ('godaddy_marketing_url','https://commerce.godaddy.com/marketing')
on conflict (key) do nothing;
-- NOTE: the Poynt PRIVATE KEY is NOT stored in the database.
-- Set it as the POYNT_PRIVATE_KEY environment variable in Vercel.

-- ---------- RLS ----------
alter table public.social_accounts enable row level security;
drop policy if exists "social: owner all" on public.social_accounts;
create policy "social: owner all" on public.social_accounts
  for all using (public.is_owner()) with check (public.is_owner());
