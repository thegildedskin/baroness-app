-- 013 · Pending rewards — the server-side bridge between the funnel and the
-- gem wallet. Guests book (and pay deposits) WITHOUT accounts, so awards can't
-- always be applied at payment time. The Stripe webhook records the award here
-- keyed by email; it is claimed automatically the first time that email signs
-- in and touches the wallet (/api/wallet GET).
--
-- Written only by the service role (webhook) — RLS on, no anon/authenticated
-- policies, so PostgREST callers can't read or forge rewards.

create table if not exists public.pending_rewards (
  id             bigint generated always as identity primary key,
  email          text not null,
  gems           integer not null check (gems > 0),
  reason         text not null default '',
  stripe_session text unique,          -- idempotency: one award per checkout session
  claimed_by     uuid references auth.users on delete set null,
  claimed_at     timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists pending_rewards_email_idx
  on public.pending_rewards (lower(email)) where claimed_at is null;

alter table public.pending_rewards enable row level security;
-- (no policies: service-role only by design)
