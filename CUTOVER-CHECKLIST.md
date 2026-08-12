# Cutover Checklist — baronesstattoo.com → this app

Step-by-step for moving the domain off the old GoDaddy Website Builder site and onto
this app (Vercel). Work top to bottom; nothing here is destructive until the DNS step,
and even that is reversible (see Rollback at the end).

---

## 1. Vercel environment variables

Vercel project → **Settings → Environment Variables** (set for Production; Preview too
if you use preview deploys). These are every variable the app reads:

### Required — the site will not work correctly without these

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL — powers artists, gallery, booking intake, shop products, logins. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public (anon) key — safe to expose; RLS restricts what it can read. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key, **server-only, never share** — used by the Stripe webhook, checkout, and secure download links. |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…`) — booking deposits, gift cards, shop checkout. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret (`whsec_…`) for the webhook endpoint `https://baronesstattoo.com/api/stripe/webhook` — create/update the endpoint in the Stripe dashboard **after** the domain is live and paste its secret here. Confirms payments, sends receipts, records gift cards. |
| `NEXT_PUBLIC_SITE_URL` | Set to `https://baronesstattoo.com` — canonical URLs, sitemap, and where Stripe sends buyers back after checkout. |

### Strongly recommended — bookings work, but you won't hear about them without these

| Variable | What it does |
|---|---|
| `RESEND_API_KEY` | Resend.com API key — all transactional email (deposit confirmations, gift-card codes, studio notifications). Without it, email silently no-ops. |
| `RESEND_FROM` | The From address, e.g. `Baroness Tattoo <bookings@baronesstattoo.com>` — requires verifying the domain in Resend (see §5, email stays at GoDaddy; Resend only needs a few DNS TXT/CNAME records added alongside). |
| `STUDIO_NOTIFY_EMAIL` | Where studio notifications go (new deposits, gift-card sales, flash claims). Defaults to baroness@baronesstattoo.com if unset. |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID (`G-…`) — analytics and the `deposit_completed` conversion the Google Ads campaign imports. |

### Optional — features degrade gracefully when unset

| Variable | What it does |
|---|---|
| `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` | Live Google reviews in the reviews ticker. Unset = curated built-in quotes. |
| `CRON_SECRET` | Protects `/api/cron/publish-scheduled` (scheduled marketing posts, runs daily via vercel.json). Set it to any long random string. |
| `OPENAI_API_KEY` | Only the AI avatar / AI tattoo toys in the estate experience. |
| `MESHY_API_KEY` (+ `MESHY_BASE_URL`) | Only the 3D avatar model generation in the estate experience. |
| `NEXT_PUBLIC_AVATURN_SUBDOMAIN` | Only the Avaturn 3D avatar creator. |
| `POYNT_PRIVATE_KEY` | Only the GoDaddy/Poynt commerce dashboard inside /admin. |
| `NEXT_PUBLIC_EXPERIMENTS_ENABLED` | Feature flag for experimental estate features — **leave unset (off) for go-live**. |

After adding/changing variables, **redeploy** (Deployments → ⋯ → Redeploy) — env vars
only apply to new builds.

## 2. Run the database migrations

Supabase dashboard → **SQL Editor** → run these three files from `supabase/migrations/`,
in order, one at a time (each is safe to re-run):

1. `010_security_fixes.sql` — flash approval enforced at the database, storage write
   scoping, booking↔Stripe reconciliation columns. **Note:** after running it, existing
   flash starts hidden until approved — approve the current set in `/admin`.
2. `011_booking_intake.sql` — booking intake columns, `gift_cards` table, the
   `booking-refs` upload bucket.
3. `012_flash_products.sql` — product `kind`/`claimable` columns for purchasable flash
   designs ("claim this design" in the shop).

## 3. Add the domain to Vercel

Vercel project → **Settings → Domains**:

1. Add `baronesstattoo.com` (set as primary).
2. Add `www.baronesstattoo.com` → choose **Redirect to baronesstattoo.com**.

Vercel will show the exact DNS records it wants — usually the values in §4. Leave this
tab open.

## 4. DNS changes at GoDaddy

GoDaddy → **My Products → Domains → baronesstattoo.com → DNS**. Change ONLY these two
records (per what the Vercel Domains tab shows):

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` (Vercel's apex IP — confirm against the Vercel Domains tab) |
| `CNAME` | `www` | `cname.vercel-dns.com` |

- The old `A`/`CNAME` records pointing at GoDaddy Website Builder get **replaced** by
  the two above.
- **DO NOT touch** `MX` records, email-related `TXT`/`SPF`/`DKIM` records, or anything
  Poynt/payments-related. Email and Poynt stay at GoDaddy exactly as they are.
- Propagation is usually minutes, occasionally up to 24–48 h. Vercel's Domains tab shows
  a checkmark when it's live, and issues the SSL certificate automatically.

## 5. Keep GoDaddy email + Poynt untouched

- **Email** (baroness@baronesstattoo.com) is hosted at GoDaddy and depends only on the
  MX/TXT records you did not touch. It keeps working through and after the cutover.
- **Poynt** (card reader / in-store payments) is not tied to the website at all —
  nothing to do.
- If you set up Resend (§1), it will ask you to add a few **additional** TXT/CNAME
  records at GoDaddy for sending. Adding records is fine; just never remove the MX ones.

## 6. Post-cutover verification

Once https://baronesstattoo.com shows the new site:

- [ ] Home page, `/artists`, `/gallery`, `/shop`, `/styles`, `/faq`, `/reviews`,
      `/aftercare`, `/prep-guide` all load over HTTPS (padlock, no warnings).
- [ ] Old URLs redirect: `/main` → `/`, `/gallery-1` → `/gallery`, `/contact` → `/book`,
      `/prep-guide-1` → `/prep-guide`, `/employee` → `/login`.
- [ ] **Test a booking end-to-end.** Do this with Stripe in **test mode** first
      (test-mode `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` on a preview deploy, card
      `4242 4242 4242 4242`) — do NOT pay yourself a real deposit on the live keys; a
      real card charge costs you Stripe fees even if refunded. Verify: the thank-you
      page, the studio notification email, the client email, and the booking row
      flipping to `deposit_paid` in Supabase.
- [ ] Buy a test-mode gift card the same way; confirm the code email arrives.
- [ ] Send yourself an email to baroness@baronesstattoo.com and reply from it (email
      untouched by cutover).
- [ ] **Google Search Console**: add/verify the `baronesstattoo.com` property (Domain
      property, verified via a DNS TXT record at GoDaddy), then:
      - Submit `https://baronesstattoo.com/sitemap.xml` under Sitemaps.
      - Check it parses and lists the artist + style pages.
      - Use **URL Inspection → Request Indexing** for `/`, `/book`, each `/artists/…`
        page, and each `/styles/…` page.
- [ ] **Google Business Profile**: update the website link if it pointed to a
      GoDaddy-builder URL, and confirm the booking link points to
      `https://baronesstattoo.com/book`.
- [ ] Watch Vercel → Logs for a day for 404s from old URLs you may have missed
      (add any stragglers to `next.config.mjs` redirects).

## 7. Rollback (if something is badly wrong)

The old GoDaddy site still exists — cutover only moved DNS. To roll back:

1. GoDaddy DNS → restore the previous `A` record for `@` and `CNAME` for `www`
   (GoDaddy support can read you the Website Builder values; screenshot the old records
   before §4 so you have them).
2. Wait for propagation (minutes to a few hours). Email is unaffected either way.

Nothing in Supabase or Stripe needs undoing — they simply stop receiving traffic.

---

## Google Ads — rebuild spec

Rebuild the campaign fresh against the new site (do this ~1 week after cutover, once
the `deposit_completed` conversion is flowing).

**Structure** — one Search campaign, "Baroness — Garland Search", budget **$4–5/day**,
location targeting: Garland TX + 10 mi (covers Firewheel, Sachse, Rowlett, Wylie,
Murphy, Richardson east side). Three ad groups:

### Ad group 1 — "tattoo shop garland"
- Keywords: `[tattoo shop garland]`, `[tattoo shops in garland tx]`, `"tattoo garland tx"`, `[tattoo parlor garland]`, `"best tattoo shop garland"`
- Final URL: `https://baronesstattoo.com/book`

### Ad group 2 — "tattoo shop firewheel / sachse / rowlett"
- Keywords: `[tattoo shop firewheel]`, `"tattoo firewheel town center"`, `[tattoo shop sachse]`, `[tattoo shop rowlett]`, `"tattoo near firewheel"`
- Final URL: `https://baronesstattoo.com/book`

### Ad group 3 — "fine line tattoo dallas"
- Keywords: `[fine line tattoo dallas]`, `"fine line tattoo artist dallas"`, `[fine line tattoo near me]`, `"black and grey tattoo artist dallas"`
- Final URL: `https://baronesstattoo.com/artists` (style shoppers want to see work first)
- Consider also `https://baronesstattoo.com/styles/fine-line-tattoos-garland-tx` as a
  second ad's final URL — message match is exact.

**Negative keywords** (campaign level): `free`, `apprentice`, `apprenticeship`,
`removal`, `laser`, `school`, `classes`, `how to`, `kit`, `supplies`, `henna`, `jobs`.

**Ads**: 2 responsive search ads per ad group. Headlines to rotate: "Fine-Art Tattoo
Studio in Garland", "Fine Line & Black-and-Grey", "At Firewheel Town Center",
"5.0★ on Google", "Book With a $100 Deposit", "Walk-Ins Welcome Mon–Sat".
Descriptions: mention the deposit applies to the final price, and name the styles.
Sitelinks: Artists (/artists), Styles (/styles), Reviews (/reviews), FAQ (/faq).

**Conversion tracking**: the thank-you page fires a GA4 event `deposit_completed`
(requires `NEXT_PUBLIC_GA_ID`).
1. GA4 → Admin → Events → mark `deposit_completed` as a **key event**.
2. Link GA4 to Google Ads (GA4 Admin → Product links → Google Ads).
3. Google Ads → Goals → Conversions → **Import → Google Analytics 4 → `deposit_completed`**.
4. Set the campaign to bid **Maximize conversions** once it has ~15 conversions;
   start on Maximize clicks before that.

Value note: count each conversion at $100 (the deposit), knowing real ticket value is
several times that.
