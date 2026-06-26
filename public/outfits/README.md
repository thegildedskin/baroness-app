# Outfit artwork — the layered (paper-doll) wardrobe

Drop **transparent PNGs of clothing only** in this folder. Each file is a layer
drawn *on top of* a likeness, so the same face/skin can change outfits — and, by
choosing a "bare" option, show off tattoos.

This is different from `/public/avatars/` (which holds the **fused** full-figure
portraits, person + clothes baked together). Use this folder only for clothing
cut out on a transparent background.

The manifest that names these files lives in `app/avatar/outfits.ts`. Until a
file exists the layer is simply skipped, so you can add garments a few at a time.

## Art spec (read me before exporting)

- **Canvas:** 600 × 1410 px, transparent background. (That's the full-body
  200 × 470 frame at 3×.) Export every garment on this exact canvas so necklines,
  shoulders, waist, and hem line up across outfits.
- **Align to the body template.** Draw the garment where it would sit on the
  shared body figure — centered, head-space empty at top, hem near the bottom.
  Keep the silhouette consistent so swapping outfits doesn't shift the body.
- **Clothing only.** No face, hair, hands, or background — just the garment
  (bodice + sleeves + skirt, or coat + waistcoat + breeches). The app composites
  it over the body and any tattoo automatically.
- **One piece per file.** Sleeves and bodice export together. The
  `coversChest` / `coversArms` flags in `outfits.ts` tell the app which skin a
  garment hides (used by the "no shirt / sleeveless" toggles).

## File names

### Ladies (`outfit-f-NN.png`)

| File | Label |
|------|-------|
| outfit-f-01.png | Lavender Court |
| outfit-f-02.png | Onyx Lace |
| outfit-f-03.png | Cream Brocade |
| outfit-f-04.png | Teal Rose |
| outfit-f-05.png | Crimson Rose |
| outfit-f-06.png | Peach Court |
| outfit-f-07.png | Emerald Gold (premium) |
| outfit-f-08.png | Ivory Gilt (premium) |

### Gentlemen (`outfit-m-NN.png`)

| File | Label |
|------|-------|
| outfit-m-01.png | Teal & Rose Court |
| outfit-m-02.png | Olive Court |
| outfit-m-03.png | Naval Blue |
| outfit-m-04.png | Ivory & Gold |
| outfit-m-05.png | White Officer |
| outfit-m-06.png | Plumed Azure (premium) |
| outfit-m-07.png | Velvet Noir (premium) |

Add more by appending entries in `app/avatar/outfits.ts` (the `F(n,...)` /
`M(n,...)` helpers auto-name the file). Mark members-only pieces with
`premium: true` (and optionally `gems: 99`).

## The "no shirt / no sleeves" options

Two entries per gender have **no art** (`src: null`) — "Bare (no shirt)" and
"Sleeveless". Selecting one removes the matching garment layer so a saved tattoo
reads on bare skin. The two toggles in the avatar builder (`bareChest`,
`bareArms`) do the same thing on top of any chosen garment.

## Bare-body art (optional, for the best reveal)

For the cleanest result when a garment is removed, supply a **bare-body** version
of each likeness (skin, face, hair — no clothes) and point the look's `body`
field at it in `app/avatar/looks.ts`, e.g.:

```
F(1, "Lavender", { body: "/avatars/female-01-body.png" }),
```

Put those bare-body PNGs in `/public/avatars/` on the **same 600 × 1410 canvas**
as the outfits. When `body` is absent the app falls back to the fused portrait,
so this is purely an upgrade you can add later.
