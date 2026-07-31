-- Fast-track booking requests (from /book). Run once in the Supabase SQL editor.
-- Anonymous requests are allowed (the whole point is no-login booking); only
-- staff read them (via the service role / Supabase dashboard). Optional — if you
-- skip this, /book still works and the deposit still processes via Stripe; you'd
-- just read booking details from the Stripe dashboard instead.

create table if not exists public.bookings (
  id          bigint generated always as identity primary key,
  name        text not null,
  contact     text not null,
  slot        text,
  artist_id   uuid,
  artist_name text,
  placement   text,
  idea        text,
  status      text not null default 'requested',
  created_at  timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Allow anyone to submit a booking request; no anonymous reads.
drop policy if exists "bookings insert public" on public.bookings;
create policy "bookings insert public" on public.bookings
  for insert to anon, authenticated with check (true);
