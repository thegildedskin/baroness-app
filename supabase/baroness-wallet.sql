-- Baroness server-authoritative gem wallet. Run once in the Supabase SQL editor
-- (after baroness-state.sql). The BALANCE is owned by the server: gems can only
-- change through apply_gems(), which is atomic and refuses to overspend — so a
-- client can't forge or negative a balance by editing localStorage.

-- Append-only transaction log. Balance = the latest row's balance_after (or 250).
create table if not exists public.gem_transactions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users on delete cascade,
  delta         integer not null,
  reason        text not null default '',
  balance_after integer not null,
  created_at    timestamptz not null default now()
);
create index if not exists gem_transactions_user_id_idx on public.gem_transactions (user_id, id desc);

alter table public.gem_transactions enable row level security;

-- Guests may read their own history; nobody may write directly (only the RPC).
drop policy if exists "gem_transactions read own" on public.gem_transactions;
create policy "gem_transactions read own"
  on public.gem_transactions for select
  using (auth.uid() = user_id);

-- Atomic credit/debit. Positive delta = earn, negative = spend. Returns new balance.
create or replace function public.apply_gems(p_delta integer, p_reason text default '')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cur integer;
  nxt integer;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  select coalesce(
    (select balance_after from public.gem_transactions where user_id = auth.uid() order by id desc limit 1),
    250  -- starting purse
  ) into cur;
  nxt := cur + p_delta;
  if nxt < 0 then raise exception 'insufficient gems'; end if;
  insert into public.gem_transactions (user_id, delta, reason, balance_after)
  values (auth.uid(), p_delta, left(coalesce(p_reason, ''), 80), nxt);
  return nxt;
end;
$$;

revoke all on function public.apply_gems(integer, text) from public;
grant execute on function public.apply_gems(integer, text) to authenticated;
