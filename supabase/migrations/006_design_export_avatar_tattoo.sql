-- Pay-to-export designs + wear a design on your avatar
alter table public.designs add column if not exists exported boolean not null default false;
alter table public.profiles add column if not exists avatar_tattoo text;
alter table public.profiles add column if not exists avatar_tattoo_placement text;
