-- =====================================================================
-- 009 — ARTIST SOCIAL SUBMISSIONS
-- Lets artists file *drafts* into the marketing planner from their
-- dashboard ("Submit to studio social"). The owner still reviews,
-- schedules and publishes everything from House Admin → Marketing:
-- artists may only INSERT rows for their own artist_id with a
-- pending status ('idea'/'drafted'), and may DELETE (withdraw) their
-- own rows only while they are still pending. Reading their own rows
-- was already granted in 007 ("mkt posts: artist reads own").
-- Run in Supabase → SQL Editor. Safe to re-run. Requires 007 + 008.
-- =====================================================================

drop policy if exists "mkt posts: artist submits draft" on public.marketing_posts;
create policy "mkt posts: artist submits draft" on public.marketing_posts
  for insert to authenticated
  with check (
    artist_id is not null
    and public.owns_artist(artist_id)
    and status in ('idea','drafted')
  );

drop policy if exists "mkt posts: artist withdraws draft" on public.marketing_posts;
create policy "mkt posts: artist withdraws draft" on public.marketing_posts
  for delete to authenticated
  using (
    artist_id is not null
    and public.owns_artist(artist_id)
    and status in ('idea','drafted')
  );
