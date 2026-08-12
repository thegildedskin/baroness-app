-- 011 — Phase 1: qualifying booking intake + gift cards
--
-- 1. bookings: nullable columns for the upgraded /book intake form
--    (contact split, Instagram, the vision — size/style/color/budget,
--    first-tattoo / cover-up flags, a reference image URL).
-- 2. gift_cards: preset-amount gift cards sold via Stripe Checkout
--    (/api/checkout-gift). Redemption is manual, in-store: the studio
--    looks the code up here (or in the notification email) and marks it
--    redeemed. Service-role only — no public policies.
-- 3. booking-refs storage bucket: lets anonymous bookers attach a
--    reference image from the intake form. Public-read, insert-only,
--    image-only, 8 MB cap. The form degrades to a paste-a-link field if
--    this bucket/policy isn't in place.

-- ---------------------------------------------------------------------
-- 1. bookings intake columns (all nullable — old rows and the degraded
--    no-JS path stay valid)
-- ---------------------------------------------------------------------
alter table public.bookings add column if not exists email          text;
alter table public.bookings add column if not exists phone          text;
alter table public.bookings add column if not exists instagram      text;
alter table public.bookings add column if not exists size           text;    -- XS / S / M / L
alter table public.bookings add column if not exists style          text;    -- fine line / realism / …
alter table public.bookings add column if not exists color_mode     text;    -- 'Black & grey' | 'Color'
alter table public.bookings add column if not exists budget         text;    -- range label
alter table public.bookings add column if not exists first_tattoo   boolean;
alter table public.bookings add column if not exists cover_up       boolean;
alter table public.bookings add column if not exists reference_url  text;

-- ---------------------------------------------------------------------
-- 2. gift cards
-- ---------------------------------------------------------------------
create table if not exists public.gift_cards (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,          -- short hash of the Stripe session id
  amount_cents    int  not null,
  purchaser_email text,
  stripe_session  text,
  status          text not null default 'active' check (status in ('active','redeemed','void')),
  redeemed_at     timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.gift_cards enable row level security;
-- No anon/authenticated policies: only the service role (webhook, studio
-- tooling) reads or writes gift cards. The owner can also manage them from
-- the Supabase dashboard.
drop policy if exists "gift_cards owner read" on public.gift_cards;
create policy "gift_cards owner read" on public.gift_cards
  for select using (public.is_owner());

-- ---------------------------------------------------------------------
-- 3. booking reference-image bucket (anon upload, public read)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booking-refs', 'booking-refs', true, 8388608,
        array['image/jpeg','image/png','image/webp','image/gif','image/heic'])
on conflict (id) do nothing;

drop policy if exists "booking refs public read" on storage.objects;
create policy "booking refs public read" on storage.objects
  for select using (bucket_id = 'booking-refs');

-- Insert-only for visitors (no update/delete — nothing to hijack). The
-- bucket's mime + size limits bound abuse; objects are keyed by random name.
drop policy if exists "booking refs anon insert" on storage.objects;
create policy "booking refs anon insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'booking-refs');
