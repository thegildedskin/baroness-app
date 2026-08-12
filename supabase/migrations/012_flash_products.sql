-- 012 — Phase 3: purchasable flash designs ("claim this design")
--
-- The products table was created directly in Supabase (its DDL predates the
-- migrations in this repo), so everything here is defensive/idempotent.
--
-- 1. kind: the product category column the app already reads/writes
--    ('art' | 'flash' | 'stencil' | 'aftercare' | 'merch'). Added here with
--    default 'merch' in case an environment is missing it; existing
--    environments are untouched (add column IF NOT EXISTS).
--    'aftercare' is the kind the Phase-1 /shop page groups into its
--    Aftercare section; the artist dashboard now offers it in the kind
--    select as well.
-- 2. claimable: the flash flag. A claimable flash product is a one-off
--    design — buying it claims the design AND counts as the session
--    deposit; the studio reaches out within 1 business day to schedule.
--    (No calendar integration — scheduling stays human.)

alter table public.products add column if not exists kind text not null default 'merch';
alter table public.products add column if not exists claimable boolean not null default false;

comment on column public.products.kind is
  'Product category: art | flash | stencil | aftercare | merch. /shop groups by this.';
comment on column public.products.claimable is
  'Flash only: purchase claims the one-off design and doubles as the session deposit; studio schedules within 1 business day.';
