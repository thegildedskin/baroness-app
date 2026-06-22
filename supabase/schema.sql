-- =====================================================================
-- BARONESS TATTOO — Supabase schema (v1, full scope)
-- Roles: owner (you) + artist. Public visitors are anonymous.
-- Run this in Supabase → SQL Editor → New query → paste → Run.
-- =====================================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto";

-- ---------- profiles (one row per auth user, carries role) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'artist' check (role in ('artist','owner')),
  created_at  timestamptz not null default now()
);

-- ---------- artists (the public-facing profile) ----------
create table if not exists public.artists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null, -- linked when the artist logs in
  slug         text unique not null,
  display_name text not null,
  specialty    text,
  bio          text,
  public_note  text,                 -- the "note left for you" shown on the page
  portrait_url text,
  accent       text,                 -- optional per-artist accent color (hex)
  instagram_url text,
  venue_url    text,                 -- their personal venue.ink booking link
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- flash (an artist's gallery images) ----------
create table if not exists public.flash (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artists(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- threads (one conversation: a client <-> an artist) ----------
create table if not exists public.threads (
  id              uuid primary key default gen_random_uuid(),
  artist_id       uuid not null references public.artists(id) on delete cascade,
  client_name     text not null,
  client_email    text,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

-- ---------- messages ----------
create table if not exists public.messages (
  id             uuid primary key default gen_random_uuid(),
  thread_id      uuid not null references public.threads(id) on delete cascade,
  sender         text not null check (sender in ('artist','client')),
  body           text,
  attachment_url text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_flash_artist on public.flash(artist_id);
create index if not exists idx_threads_artist on public.threads(artist_id);
create index if not exists idx_messages_thread on public.messages(thread_id);

-- =====================================================================
-- HELPER FUNCTIONS (security definer to avoid recursive RLS lookups)
-- =====================================================================
create or replace function public.is_owner()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner');
$$;

create or replace function public.owns_artist(a_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.artists a where a.id = a_id and a.user_id = auth.uid());
$$;

-- auto-create a profile row when a new auth user appears
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- keep updated_at fresh on artists
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_artists_touch on public.artists;
create trigger trg_artists_touch before update on public.artists
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.artists  enable row level security;
alter table public.flash    enable row level security;
alter table public.threads  enable row level security;
alter table public.messages enable row level security;

-- ---- profiles ----
create policy "profiles: self read"   on public.profiles for select using (id = auth.uid() or public.is_owner());
create policy "profiles: owner manage" on public.profiles for all   using (public.is_owner()) with check (public.is_owner());

-- ---- artists ----
create policy "artists: public reads published"
  on public.artists for select using (is_published = true or public.owns_artist(id) or public.is_owner());
create policy "artists: artist updates own"
  on public.artists for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "artists: owner manages all"
  on public.artists for all using (public.is_owner()) with check (public.is_owner());

-- ---- flash ----
create policy "flash: public reads published artist"
  on public.flash for select using (
    exists (select 1 from public.artists a where a.id = flash.artist_id
            and (a.is_published = true or a.user_id = auth.uid() or public.is_owner()))
  );
create policy "flash: artist manages own"
  on public.flash for all using (public.owns_artist(artist_id)) with check (public.owns_artist(artist_id));
create policy "flash: owner manages all"
  on public.flash for all using (public.is_owner()) with check (public.is_owner());

-- ---- threads ----  (clients are anonymous; their inserts go through a
--                      server action using the service role, which bypasses RLS)
create policy "threads: artist or owner read"
  on public.threads for select using (public.owns_artist(artist_id) or public.is_owner());
create policy "threads: artist or owner update"
  on public.threads for update using (public.owns_artist(artist_id) or public.is_owner());

-- ---- messages ----
create policy "messages: artist or owner read"
  on public.messages for select using (
    exists (select 1 from public.threads t where t.id = messages.thread_id
            and (public.owns_artist(t.artist_id) or public.is_owner()))
  );
create policy "messages: artist or owner write"
  on public.messages for insert with check (
    sender = 'artist' and exists (
      select 1 from public.threads t where t.id = messages.thread_id
      and (public.owns_artist(t.artist_id) or public.is_owner()))
  );

-- =====================================================================
-- STORAGE BUCKETS  (run once; safe to re-run)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('portraits','portraits',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('flash','flash',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('attachments','attachments',false) on conflict do nothing;

-- public read for portrait + flash images
create policy "portraits public read" on storage.objects for select using (bucket_id = 'portraits');
create policy "flash public read"     on storage.objects for select using (bucket_id = 'flash');
-- authenticated (artist/owner) may upload/manage portrait + flash files
create policy "portraits auth write"  on storage.objects for all
  using (bucket_id = 'portraits' and auth.role() = 'authenticated')
  with check (bucket_id = 'portraits' and auth.role() = 'authenticated');
create policy "flash auth write"      on storage.objects for all
  using (bucket_id = 'flash' and auth.role() = 'authenticated')
  with check (bucket_id = 'flash' and auth.role() = 'authenticated');

-- =====================================================================
-- SEED — your 8 real artists (unpublished until they're filled in)
-- =====================================================================
insert into public.artists (slug, display_name, specialty, instagram_url, is_published, sort_order) values
  ('anna','Anna','Custom tattoo artist','https://www.instagram.com/aaanx.ink/',false,1),
  ('alejandra','Alejandra','Custom tattoo artist','https://www.instagram.com/alejandrra.art/',false,2),
  ('caroline','Caroline','Custom tattoo artist','https://www.instagram.com/stinky.inky666',false,3),
  ('daniel','Daniel','Custom tattoo artist','https://www.instagram.com/danramir3zinks/',false,4),
  ('danny','Danny','Custom tattoo artist','https://www.instagram.com/dann.inkz/',false,5),
  ('katherine','Katherine','Custom tattoo artist','https://www.instagram.com/baroness_katherine/',false,6),
  ('mayra','Mayra','Custom tattoo artist','https://mayrastattoostudio.square.site/',false,7),
  ('mikey','Mikey','Custom tattoo artist','https://www.instagram.com/yikesmikestattoos/',false,8)
on conflict (slug) do nothing;

-- After you create your own login, make yourself the owner by running:
--   update public.profiles set role = 'owner' where email = 'YOUR_EMAIL_HERE';
