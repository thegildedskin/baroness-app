# Avatar artwork — drop your illustrations here

The avatar gallery loads images from this folder. Save each illustration with the
exact filename below (PNG, JPG, or WEBP all work — keep the base name, the app
looks for `.png` by default; if you use another extension, update `src` in
`app/avatar/looks.ts`).

Until a file exists, that slot shows a tasteful "coming soon" frame and the site
keeps working — so you can add art a few at a time.

Recommended export: portrait/tall crop, head near the top (the small avatar
thumbnails crop from the top so the face shows). ~600×800px is plenty.

## Ladies (female line)

| File | Label |
|------|-------|
| female-01.png | Lavender |
| female-02.png | Onyx Lace |
| female-03.png | Brocade Cream |
| female-04.png | Cream Court |
| female-05.png | Teal Brocade |
| female-06.png | Crimson Rose |
| female-07.png | Rose Noir |
| female-08.png | Scarlet Lace |
| female-09.png | Coral Court |
| female-10.png | Powder Blue |
| female-11.png | Emerald |
| female-12.png | Aqua Court |
| female-13.png | Ivory Gilt |
| female-14.png | Burgundy |
| female-15.png | Bridgerton Blush |
| female-16.png | Coral Silk |

## Gentlemen (male line)

| File | Label |
|------|-------|
| male-01.png | Sage |
| male-02.png | Olive Court |
| male-03.png | Chestnut |
| male-04.png | Royal Blue |
| male-05.png | Ivory Court |
| male-06.png | Naval Officer |
| male-07.png | Plumed Captain |
| male-08.png | Azure |
| male-09.png | Gold Court |
| male-10.png | Onyx & Gold |
| male-11.png | Velvet King |
| male-12.png | Crimson Cloak |
| male-13.png | Forest Green |
| male-14.png | Bordeaux |
| male-15.png | Slate |
| male-16.png | Burgundy Cloak |

The labels are just defaults — rename any of them in `app/avatar/looks.ts`.
To mark a look as members-only, add `premium: true` (and optionally `gems: 99`)
to its entry in that file.
