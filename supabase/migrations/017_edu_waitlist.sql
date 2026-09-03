-- 017 · The Baroness Academy — education-arm waitlist (/edu page).
-- Anon insert via /api/edu; owners read. The Academy is deliberately broader
-- than tattooing (artistry + restorative/paramedical training) so no one
-- teaching there is pigeonholed into a single discipline.

create table if not exists public.edu_waitlist (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null,
  interest   text not null default '',  -- e.g. 'restorative', 'fine-art', 'business'
  experience text,                       -- their background, freeform
  created_at timestamptz not null default now(),
  unique (email, interest)               -- idempotent per track
);

alter table public.edu_waitlist enable row level security;

drop policy if exists "edu anon insert" on public.edu_waitlist;
create policy "edu anon insert" on public.edu_waitlist
  for insert to anon, authenticated with check (true);

drop policy if exists "edu owner read" on public.edu_waitlist;
create policy "edu owner read" on public.edu_waitlist
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));
