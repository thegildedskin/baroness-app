-- Artist profiles — TITLE + BIO together (title renders under the name; bio on
-- their page). Each block below is an ARCHETYPE: if a style doesn't match the
-- artist, swap whole blocks between artists rather than rewriting — the title
-- and bio are written to travel as a pair. Katherine's is factual; the other
-- seven are drafted in the house voice and need your eye before running.
--
-- Run in the Supabase SQL editor. Re-runnable (plain updates).

-- ── Katherine — factual ─────────────────────────────────────────────────────
update public.artists set
  specialty = 'Fine Art & Restorative Tattooing',
  bio = 'Katherine works in two rooms of the same house. In one, she is a fine-art tattooer — composition-first custom pieces designed to sit right on the body and stay readable for decades. In the other, she practices restorative nipple-areola tattooing, trained under one of the pioneering restorative artists in DFW, giving people back a part of themselves after mastectomy and breast surgery. Both disciplines get the same hands, the same patience, and the same standard. Consultations are unhurried and honest — bring her the idea, or the chapter of your story that needs closing, and she will design the rest.'
where slug = 'katherine';

-- ── Archetype: The Painterly Hand ───────────────────────────────────────────
update public.artists set
  specialty = 'The Painterly Hand',
  bio = 'Trained in fine art before ever holding a machine, Caroline approaches skin the way a painter approaches canvas — value first, edges with intent, color that behaves. Her pieces read like brushwork: soft where they should breathe, sharp where they must hold. Clients come to her with a feeling as often as a reference photo, and leave with something that looks like it was always meant to be there. Book a consultation and bring the idea in whatever form it lives in — a picture, a phrase, a memory.'
where slug = 'caroline';

-- ── Archetype: Realism in Smoke & Silver ────────────────────────────────────
update public.artists set
  specialty = 'Realism in Smoke & Silver',
  bio = 'Anna works in black and grey the way the old masters worked in charcoal — patient layers, disciplined light, contrast placed exactly where the eye should land. Portraits, statuary, animals, the pieces that have to look *real* from across a room and still hold their detail up close. She is exacting in the consultation because realism is unforgiving of guesswork: reference, placement, and scale get settled before the needle ever moves. The result heals clean and ages slow.'
where slug = 'anna';

-- ── Archetype: Illustrative Storyteller ─────────────────────────────────────
update public.artists set
  specialty = 'Illustrative Storyteller',
  bio = 'Tyco''s work owns the fact that it''s drawn. Bold structure, confident linework, and color with a point of view — pieces that feel like panels from a story only you know the whole of. He is at his best when a client brings him a meaning rather than a finished picture: give him the why, and the what arrives looking like nothing else in the room. Ask to see his sketchbooks at the consultation; that''s where the next piece is already waiting.'
where slug = 'tyco';

-- ── Archetype: The Cover-Up Alchemist ───────────────────────────────────────
update public.artists set
  specialty = 'The Cover-Up Alchemist',
  bio = 'Daniel has seen the tattoo you stopped loving, and he does not flinch. Cover-ups and reworks are their own discipline — reading old ink like a map, knowing what can be absorbed, transformed, or worked around — and it is where he does his most satisfying work. The question is never how the old piece happened; it is only what it becomes next. Cover-up consultations are free and judgment-free: wear short sleeves, bring your patience, and leave with a plan.'
where slug = 'daniel';

-- ── Archetype: Botanical Ink & Fine Line ────────────────────────────────────
update public.artists set
  specialty = 'Botanical Ink & Fine Line',
  bio = 'Ale draws flowers the way almost nobody does — from observation, with the discipline of a botanical illustrator and the restraint of a single-needle hand. Fine line, florals, and delicate ornamental work that stays crisp because it was engineered to: correct line weight, correct spacing, room to breathe as skin ages. Delicate does not mean fragile. If you want something small that will still be beautiful in twenty years, this is whose book you open first.'
where slug = 'ale';

-- ── Archetype: Bold Will Hold ───────────────────────────────────────────────
update public.artists set
  specialty = 'Bold Will Hold',
  bio = 'Mikey tattoos with the conviction of the classics — strong lines, honest shading, pieces built to be read across a street and worn hard for a lifetime. Traditional and bold illustrative work, done the way it was meant to be: clean, saturated, permanent in spirit as well as fact. He is fast in the chair because he is thorough before it. Bring him a classic and he''ll make it yours; bring him yours and he''ll make it classic.'
where slug = 'mikey';

-- ── Archetype: Color That Breathes ──────────────────────────────────────────
update public.artists set
  specialty = 'Color That Breathes',
  bio = 'Mayra''s color work does not sit on the skin — it lives in it. Saturated, luminous pieces where the palette is chosen for your undertone, not just the reference photo, so the color heals true and stays vivid. From full-color statement pieces to soft watercolor moods, her consultations start with your skin in daylight and end with a design that was mixed for it. If color is the point of your piece, she is the point of the roster.'
where slug = 'mayra';

-- Verify:
select slug, display_name, specialty, left(bio, 60) || '…' as bio_preview
from public.artists order by sort_order;
