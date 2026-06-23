# Stripe Setup — Premium Unlock

The code is built: an **Unlock premium** button in the avatar studio opens Stripe's
hosted checkout; when payment completes, a webhook flips that artist to `premium`
(unlocking the premium avatar looks). Card details never touch this site — Stripe
hosts the payment page. You'll do the account/keys steps below (I never see your keys).

## 1. Create a Stripe account
Go to **stripe.com**, sign up. Stay in **Test mode** (toggle, top-right) while we try it.

## 2. Get your Secret key
**Developers → API keys** → copy the **Secret key** (starts with `sk_test_…`).

## 3. Add the webhook endpoint
**Developers → Webhooks → Add endpoint**:
- Endpoint URL: `https://baroness-app.vercel.app/api/stripe/webhook`
  (use your real domain once it's live)
- "Select events" → add **`checkout.session.completed`**
- Create it, then copy the **Signing secret** (starts with `whsec_…`).

## 4. Add the keys to Vercel
**Vercel → your project → Settings → Environment Variables** (Production), add:
- `STRIPE_SECRET_KEY` = your `sk_test_…`
- `STRIPE_WEBHOOK_SECRET` = your `whsec_…`

(`NEXT_PUBLIC_SITE_URL` should already be set to `https://baroness-app.vercel.app`.)

## 5. Redeploy
After adding env vars, redeploy (Vercel → Deployments → Redeploy, or push any commit)
so the server picks them up.

## 6. Test it
In the dashboard avatar studio, click **Unlock premium**. On the Stripe page use the
test card **4242 4242 4242 4242**, any future expiry, any CVC/ZIP. After paying you'll
return to the dashboard; within a moment the premium avatar options unlock (the webhook
set `premium = true`). If it doesn't flip immediately, reload — webhooks are near-instant
but asynchronous.

## Going live (later)
When ready for real payments: in Stripe switch to **Live mode**, complete account
activation (business details, bank account for payouts), then repeat steps 2–4 with the
**live** keys (`sk_live_…`, and a new live webhook `whsec_…`) in Vercel.

## Notes
- Price is set in `app/api/checkout/route.ts` as `PREMIUM_PRICE_CENTS = 1200` ($12). Edit there.
- This is a one-time unlock per artist. We can switch to a recurring membership later.
- The same Stripe foundation will power the **marketplace** (artist payouts via Stripe
  Connect) and **stencil sales** in upcoming phases.
