-- 016 · Careers — online application (replaces the old GoDaddy /employee page).
-- Anon may insert (the /careers form posts via /api/careers); only owners read.

create table if not exists public.job_applications (
  id            bigint generated always as identity primary key,
  name          text not null,
  email         text not null,
  phone         text,
  instagram     text,
  role          text not null default 'Tattoo Artist',   -- artist / piercer / front desk / apprentice
  years_experience text,
  licensed      boolean,
  portfolio_url text,
  message       text,
  status        text not null default 'new' check (status in ('new','reviewed','interview','hired','declined')),
  created_at    timestamptz not null default now()
);

alter table public.job_applications enable row level security;

drop policy if exists "applications anon insert" on public.job_applications;
create policy "applications anon insert" on public.job_applications
  for insert to anon, authenticated with check (true);

drop policy if exists "applications owner read" on public.job_applications;
create policy "applications owner read" on public.job_applications
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "applications owner update" on public.job_applications;
create policy "applications owner update" on public.job_applications
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));
