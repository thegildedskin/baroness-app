-- Artist titles — the Eden lesson: every artist gets a POSITION, not a job
-- description. The `specialty` column renders as the italic line under each
-- artist's name on their page, on the /artists grid, and in search results.
--
-- ❗ EDIT BEFORE RUNNING: these are drafted from limited knowledge of each
-- artist's work. Match the title to the artist, not the artist to the title —
-- read their portfolio first. Rules of a good title: 2–5 words, names a lane
-- nobody else in DFW is standing in, sounds like a calling card not a résumé.
--
-- Draft options (assign / rewrite freely):
--   "The Painterly Hand"          "Ornamental Fine Line"
--   "Black & Grey, Old Masters"   "Botanical Ink & Linework"
--   "Realism in Smoke & Silver"   "Color That Breathes"
--   "The Micro-Realist"           "Script, Built to Last"
--   "Illustrative Storyteller"    "The Cover-Up Alchemist"
--
-- Katherine's is written with intent — restorative work leads, artistry
-- follows, so she is never pigeonholed as only one or the other.

update public.artists set specialty = 'Fine Art & Restorative Tattooing'  where slug = 'katherine';
update public.artists set specialty = 'EDIT ME — e.g. The Painterly Hand' where slug = 'caroline';
update public.artists set specialty = 'EDIT ME'                            where slug = 'anna';
update public.artists set specialty = 'EDIT ME'                            where slug = 'tyco';
update public.artists set specialty = 'EDIT ME'                            where slug = 'daniel';
update public.artists set specialty = 'EDIT ME'                            where slug = 'ale';
update public.artists set specialty = 'EDIT ME'                            where slug = 'mikey';
update public.artists set specialty = 'EDIT ME'                            where slug = 'mayra';

-- Verify what's live:
select slug, display_name, specialty from public.artists order by sort_order;
