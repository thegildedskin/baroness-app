-- Baroness shared-state backend (SPEC: replace the localStorage contract with a
-- real backend + one server-side gem wallet). Run once in the Supabase SQL editor.
--
-- One key-value row per (user, key). Keys used by the app:
--   wallet         -> number         (the single gem balance — shared across every screen)
--   curiosities    -> string[]       (Estate finds; Kingdom reads)
--   butler-skins   -> {owned,appointed}  (Kingdom writes; Commission reads livery)
--   artist-works   -> {t,a,st,vb,c}[]    (Artist Hub publishes; Commission matcher reads)
--   my-quarters    -> {placed,bought}    (Quarters layout)

create table if not exists public.player_state (
  user_id    uuid not null references auth.users on delete cascade,
  key        text not null,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.player_state enable row level security;

-- Each guest sees and writes only their own record.
drop policy if exists "player_state own rows" on public.player_state;
create policy "player_state own rows"
  on public.player_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: give new guests a starting purse of 250 gems on sign-up.
create or replace function public.seed_player_wallet()
returns trigger language plpgsql security definer as $$
begin
  insert into public.player_state (user_id, key, value)
  values (new.id, 'wallet', '250'::jsonb)
  on conflict (user_id, key) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_seed_wallet on auth.users;
create trigger on_auth_user_created_seed_wallet
  after insert on auth.users
  for each row execute function public.seed_player_wallet();
