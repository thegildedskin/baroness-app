-- 010 — security fixes (Phase 0)
--
-- 1. Flash approval is now enforced at the database, not just in app queries:
--    the public read policy requires approved = true. Artists still see their
--    own unapproved flash; the owner sees everything (the /admin approval queue).
-- 2. Storage writes to the public 'portraits' and 'flash' buckets are scoped
--    to the uploader's own auth.uid() folder prefix (uploads are written as
--    `${user.id}/...` — see app/dashboard/ProfileEditor.tsx / SocialSubmit.tsx).
--    Previously ANY authenticated user could write or delete ANY object.
-- 3. Booking reconciliation columns for the Stripe deposit webhook.

-- ---------------------------------------------------------------------
-- 1. flash approval
-- ---------------------------------------------------------------------
-- The approval column the /admin queue already relies on. New uploads start
-- unapproved; NOTE: if this column did not exist yet, existing flash starts
-- hidden until approved in /admin — approve the current set after running this.
alter table public.flash add column if not exists approved boolean not null default false;
alter table public.flash add column if not exists created_at timestamptz not null default now();

drop policy if exists "flash: public reads published artist" on public.flash;
create policy "flash: public reads approved on published artist"
  on public.flash for select using (
    (
      approved = true
      and exists (select 1 from public.artists a
                  where a.id = flash.artist_id and a.is_published = true)
    )
    or public.owns_artist(artist_id)  -- artist sees their own, approved or not
    or public.is_owner()              -- owner sees everything
  );
-- ("flash: artist manages own" and "flash: owner manages all" are unchanged.)

-- ---------------------------------------------------------------------
-- 2. storage: write only under your own auth.uid()/ folder prefix
-- ---------------------------------------------------------------------
drop policy if exists "portraits auth write" on storage.objects;
drop policy if exists "flash auth write" on storage.objects;

-- public read stays as-is ("portraits public read" / "flash public read").

create policy "portraits write own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'portraits'
              and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
create policy "portraits update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'portraits'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()))
  with check (bucket_id = 'portraits'
              and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
create policy "portraits delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'portraits'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));

create policy "flash write own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'flash'
              and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
create policy "flash update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'flash'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()))
  with check (bucket_id = 'flash'
              and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));
create policy "flash delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'flash'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner()));

-- ---------------------------------------------------------------------
-- 3. bookings: columns the deposit webhook writes on checkout.session.completed
-- ---------------------------------------------------------------------
alter table public.bookings add column if not exists stripe_session  text;
alter table public.bookings add column if not exists deposit_cents   int;
alter table public.bookings add column if not exists deposit_paid_at timestamptz;
