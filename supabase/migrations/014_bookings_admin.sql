-- 014 · Bookings inbox — let the studio work its leads from the admin panel.
-- The bookings table (baroness-bookings.sql) is insert-only for anon by design;
-- this adds read/update for owners (profiles.role = 'owner') so the Bookings
-- tab in /admin can render the pipeline and move leads through it.

create index if not exists bookings_status_created_idx
  on public.bookings (status, created_at desc);

drop policy if exists "bookings owner read" on public.bookings;
create policy "bookings owner read" on public.bookings
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "bookings owner update" on public.bookings;
create policy "bookings owner update" on public.bookings
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- Working-notes column for the inbox (nullable; safe on legacy rows).
alter table public.bookings add column if not exists notes text;
