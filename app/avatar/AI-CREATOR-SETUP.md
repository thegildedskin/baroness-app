# AI likeness creator — setup

The avatar builder now has two modes (a "Premade looks" / "✨ Create with AI"
toggle): the existing gallery, and a tag→prompt→image generator modelled on the
Delulu control panel but tuned for a tattoo house.

## What was added

| File | Purpose |
|------|---------|
| `app/api/ai-avatar/route.ts` | Server route. Calls OpenAI `gpt-image-1` (generations, or **edits** when a reference photo is supplied) and returns a data URL. |
| `app/avatar/creatorOptions.ts` | The attribute tag catalog (style, gender, age, build, skin, hair, eyes, outfit, tattoos, extras) + `composePrompt()`. |
| `app/dashboard/AvatarCreator.tsx` | The creator UI: accordion of pill-tags, free-text box, "create from image" upload, Create + Save. |
| `app/dashboard/AvatarBuilder.tsx` | Gained the Premade/AI mode toggle. |
| `AvatarConfig.likenessUrl` | New field; a saved likeness renders as the avatar everywhere (over looks/cartoon). |

## Two things to enable it

1. **`OPENAI_API_KEY`** must be set in the environment (same key the tattoo
   generator uses). Without it the route returns a friendly "not configured"
   message and nothing breaks.

2. **A public Supabase Storage bucket named `avatars`.** Saving a generated
   likeness uploads the PNG there and stores the public URL on
   `profiles.avatar.likenessUrl` (mirrors the `portraits` / `flash` / `gallery`
   buckets you already use). Create it in Supabase → Storage → New bucket →
   name `avatars`, mark **Public**. Until it exists, Create/preview still work;
   only Save shows a message asking for the bucket.

No schema migration is needed — `avatar` is already a JSONB column, and
`likenessUrl` is just another key inside it.

## How it flows

1. User picks tags / writes text / optionally uploads a reference photo.
2. `composePrompt()` turns the picks into a sentence; `POST /api/ai-avatar`
   generates the image.
3. Preview renders via `AvatarRender` (so outfit overlays, bare-skin and tattoo
   layers still apply).
4. Save uploads to the `avatars` bucket and writes `likenessUrl` to the profile;
   it now shows as the figure in Quarters and the estate.

## Notes / next steps

- "Create from image" uses the `gpt-image-1` **edits** endpoint to keep the
  uploaded person's likeness. Results vary; a clear, front-facing photo works best.
- Generation isn't metered against credits yet — wire it to your credits/Stripe
  flow the same way tattoo exports are gated if you want to charge for it.
- The tag list is just data in `creatorOptions.ts`; add/rename freely.
