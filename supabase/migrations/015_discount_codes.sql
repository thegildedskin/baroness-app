-- 015 · Crown-point redemption — gems become real in-studio discount codes.
-- Codes are created only by the server (/api/redeem spends the gems atomically
-- via apply_gems first, then mints the code with the service role). Guests can
-- read their own codes; redemption is manual at the counter (same flow as gift
-- cards): verify the code, apply the value, mark redeemed in the admin panel.

create table if not exists public.discount_codes (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  user_id     uuid not null references auth.users on delete cascade,
  value_cents integer not null check (value_cents > 0),
  gems_spent  integer not null check (gems_spent > 0),
  redeemed_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists discount_codes_user_idx on public.discount_codes (user_id, created_at desc);

alter table public.discount_codes enable row level security;

-- Guests see their own codes; nobody inserts/updates via PostgREST
-- (service role bypasses RLS; owners work codes through the admin panel below).
drop policy if exists "discount_codes read own" on public.discount_codes;
create policy "discount_codes read own" on public.discount_codes
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "discount_codes owner read" on public.discount_codes;
create policy "discount_codes owner read" on public.discount_codes
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "discount_codes owner redeem" on public.discount_codes;
create policy "discount_codes owner redeem" on public.discount_codes
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));
