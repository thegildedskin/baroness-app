-- September 2026 content calendar → Admin panel Marketing tab.
-- Full plan with shot notes: docs/CONTENT-CALENDAR-SEPT.md
--
-- All rows land as status='drafted' so NOTHING auto-publishes: in the admin
-- panel, attach the photo (media URL), pick the artist where relevant, and
-- flip to 'scheduled' — the daily cron then posts IG/FB automatically.
-- Rows whose media_note starts with [REEL] must be posted by hand from the
-- Instagram app (Meta's API doesn't accept Reels at standard access);
-- the caption is ready to paste. Safe to re-run: exact-duplicate captions on
-- the same date are skipped.

insert into public.marketing_posts (platform, caption, media_note, scheduled_for, status)
select v.platform, v.caption, v.media_note, v.scheduled_for::date, 'drafted'
from (values

('instagram',
'This is a tattoo studio. Garland, Texas. 👑
We built the Baroness like a French estate because getting tattooed should feel like an occasion — not an errand.
Come see it in person. Booking link in bio · $100 deposit goes toward your piece.
#garlandtx #dfwtattoo #dallastattooartist #firewheel #tattoostudio #rococo',
'[REEL — post manually] 20–30s walkthrough: storefront → door → velvet/gold interior pan → artist tattooing. Trending audio. On-screen text: "This is a tattoo studio in Garland, Texas."',
'2026-09-03'),

('instagram',
'Black & grey, straight off the needle. Every piece here starts as a conversation — bring us the idea, we design the rest.
Book a consultation — link in bio. Deposit applies to your final price.
#blackandgreytattoo #dfwtattoo #garlandtattoo #finelinetattoo',
'Strongest recent black & grey piece (rosary-style). Clean, well-lit, no filter.',
'2026-09-05'),

('instagram',
'5.0 stars on Google. We don''t take that lightly — every review is someone who trusted us with skin.
Read them all, then come add yours. Link in bio.
#tattooreviews #dfwtattooartist #garlandtx',
'CAROUSEL: slide 1 = 5-star Google review as cream/gold quote card; slides 2–3 = the healed piece it references.',
'2026-09-06'),

('instagram',
'Meet Caroline — of the House of Baroness. [her specialty in one line]
Her chair books through the site: baronesstattoo.com/artists/caroline (or tap the link in bio and choose her name).
#dallastattooartist #dfwtattoo #tattooartist #garlandtx',
'CAROUSEL: slide 1 = portrait of Caroline in the studio; slides 2–5 = her four best pieces. Set artist on this row. Cross-post to her Story highlight.',
'2026-09-08'),

('instagram',
'HEALED. Not fresh, not filtered — this is what our work looks like when it''s lived with you for two months.
Fresh photos are easy. Healed photos are the proof. Book — link in bio.
#healedtattoo #blackandgreyrealism #dfwtattoo #tattoohealed',
'A piece at 4–8 weeks healed, labeled HEALED on the image. Natural light.',
'2026-09-10'),

('instagram',
'How to book at the Baroness, start to finish: tell us your idea → pick your artist (or let us match you) → $100 deposit holds the chair. The deposit isn''t a fee — it comes off your final price.
That''s it. No DMs required, no waiting on a reply. Link in bio.
#tattoobooking #firsttattoo #dfwtattoo #garlandtattoo',
'[REEL — post manually] 15s: phone screen going through the 3-step /book flow. Text overlay: "Booking takes 2 minutes."',
'2026-09-12'),

('instagram',
'This week at the estate. Every artist, every style — fine line to full black & grey.
Whose chair are you sitting in? Link in bio.
#tattoosofinstagram #dfwtattoo #dallastattoo #garlandtx',
'CAROUSEL: week''s best 3–5 pieces across artists, one slide each, tag each artist.',
'2026-09-13'),

('instagram',
'Meet Anna — of the House of Baroness. [her specialty in one line]
Her chair books through the site: baronesstattoo.com/artists/anna (or tap the link in bio and choose her name).
#dallastattooartist #dfwtattoo #tattooartist #garlandtx',
'CAROUSEL: spotlight format — portrait + 4 best pieces. Set artist on this row.',
'2026-09-15'),

('instagram',
'Details matter here. In the room, and on your skin.
Baroness Tattoo · Firewheel Town Center, Garland TX · link in bio.
#tattoostudio #rococo #darkacademia #dfwtattoo',
'[REEL — post manually] 15s slow b-roll: chandelier, gold frames, velvet chair, ink caps, gloves on. Moody, elegant audio, no talking.',
'2026-09-17'),

('instagram',
'First tattoo? Here''s what actually happens: a 30-minute consult where we talk placement, size and design — before any needle touches skin. Then we build the piece around YOU.
Prep guide is on the site (what to eat, what to wear, what to expect). Link in bio.
#firsttattoo #tattootips #dfwtattoo #garlandtx',
'Artist mid-consult with a client (faces optional), reference sheets on the table.',
'2026-09-19'),

('instagram',
'Slide 2 is what it covered. ➡️
Cover-ups are a specialty of the house — old ink, old names, old chapters. Bring us what you''re carrying and we''ll design past it.
Free cover-up consults. Link in bio, tick the cover-up box.
#coveruptattoo #tattoocoverup #dfwtattoo #dallastattooartist',
'CAROUSEL: after on slide 1, before on slide 2 (hook with the after).',
'2026-09-20'),

('instagram',
'Meet Tyco — of the House of Baroness. [his specialty in one line]
His chair books through the site: baronesstattoo.com/artists/tyco (or tap the link in bio and choose his name).
#dallastattooartist #dfwtattoo #tattooartist #garlandtx',
'CAROUSEL: spotlight format — portrait + 4 best pieces. Set artist on this row.',
'2026-09-22'),

('instagram',
'Day 1 vs day 60. Same piece, zero touch-ups.
Solid work heals solid — that''s the whole craft. Aftercare guide lives on our site.
#healedtattoo #tattooaftercare #blackandgrey #dfwtattoo',
'Fresh vs healed side-by-side of the same piece, labeled, dates on the image.',
'2026-09-24'),

('instagram',
'Fine line has a home here too. Delicate doesn''t mean fragile — this will hold its lines for decades.
Book your piece — link in bio.
#finelinetattoo #dallasfineline #dfwtattoo #garlandtattoo',
'Strongest color or fine-line piece of the month (contrast with the black & grey grid).',
'2026-09-26'),

('instagram',
'Meet Daniel — of the House of Baroness. [his specialty in one line]
His chair books through the site: baronesstattoo.com/artists/daniel (or tap the link in bio and choose his name).
#dallastattooartist #dfwtattoo #tattooartist #garlandtx',
'CAROUSEL: spotlight format — portrait + 4 best pieces. Set artist on this row.',
'2026-09-27'),

('instagram',
'September at the estate. 👑 October books are OPEN — some chairs fill three weeks out, so if you''ve been sitting on an idea, this is the sign.
2 minutes to book, $100 deposit goes toward your piece. Link in bio.
#octoberbooks #dfwtattoo #dallastattooartist #garlandtx #booksopen',
'[REEL — post manually] 20s month recap: fast cuts of September''s pieces → the room → logo. Text: "October books are open."',
'2026-09-29')

) as v(platform, caption, media_note, scheduled_for)
where not exists (
  select 1 from public.marketing_posts m
  where m.caption = v.caption and m.scheduled_for = v.scheduled_for::date
);
