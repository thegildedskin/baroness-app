import Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escHtml, STUDIO_EMAIL } from "@/lib/email";
import { giftCardCode } from "@/lib/giftcards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const m = e instanceof Error ? e.message : "invalid signature";
    return NextResponse.json({ error: `Webhook error: ${m}` }, { status: 400 });
  }
  if (event.type === "account.updated") {
    const acct = event.data.object as Stripe.Account;
    const admin = createAdminClient();
    await admin.from("artists").update({ payouts_enabled: !!acct.charges_enabled }).eq("stripe_account_id", acct.id);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata || {};
    if (md.type === "deposit") {
      // A consultation deposit from /book. Reconcile the booking row (if we
      // have one — the insert is best-effort), then notify studio + client.
      if (md.booking_id) {
        try {
          const admin = createAdminClient();
          await admin
            .from("bookings")
            .update({
              status: "deposit_paid",
              stripe_session: session.id,
              deposit_cents: session.amount_total ?? null,
              deposit_paid_at: new Date().toISOString(),
            })
            .eq("id", md.booking_id);
        } catch { /* degraded no-supabase path — the emails below still go out */ }
      }
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      const clientEmail = session.customer_details?.email ?? null;
      const details = `
        <p><strong>Name:</strong> ${escHtml(md.name || "—")}</p>
        <p><strong>Contact:</strong> ${escHtml(md.contact || clientEmail || "—")}</p>
        <p><strong>Artist:</strong> ${escHtml(md.artist || "First available")}</p>
        <p><strong>Preferred day / window:</strong> ${escHtml(md.slot || "No preference given")}</p>
        <p><strong>Placement:</strong> ${escHtml(md.placement || "—")}</p>
        <p><strong>Idea:</strong> ${escHtml(md.idea || "—")}</p>
        ${md.details ? `<p><strong>Details:</strong> ${escHtml(md.details)}</p>` : ""}
        ${md.reference ? `<p><strong>Reference:</strong> <a href="${escHtml(md.reference)}">${escHtml(md.reference)}</a></p>` : ""}`;
      await sendEmail({
        to: STUDIO_EMAIL,
        subject: `Deposit paid ($${amount}) — ${md.name || "new booking"}${md.artist ? ` · ${md.artist}` : ""}`,
        html: `<h2>New consultation deposit</h2>${details}
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Stripe session:</strong> ${escHtml(session.id)}</p>
          <p>Reply to the client to confirm their exact appointment time.</p>`,
      });
      if (clientEmail) {
        await sendEmail({
          to: clientEmail,
          subject: "Deposit received — Baroness Tattoo",
          html: `<h2>The chair is yours</h2>
            <p>Hi ${escHtml(md.name || "there")} — we've received your $${amount} deposit. It's applied to your piece, fully transferable, with 48-hour notice.</p>
            ${details}
            <p>We'll reach out shortly to confirm your exact appointment time. Your deposit locks the date.</p>
            <p>— Baroness Tattoo · 315 Coneflower Drive, Garland, TX · 469-246-7217</p>`,
        });
      }
      return NextResponse.json({ received: true });
    }
    if (md.type === "gift_card") {
      // A gift-card purchase from /shop. Code = deterministic short-hash of
      // the session id (lib/giftcards.ts) — the thank-you page shows the same
      // code without waiting on this webhook. Redemption is manual in-store.
      const code = giftCardCode(session.id);
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      const buyerEmail = session.customer_details?.email ?? null;
      try {
        const admin = createAdminClient();
        await admin.from("gift_cards").insert({
          code,
          amount_cents: session.amount_total ?? 0,
          purchaser_email: buyerEmail,
          stripe_session: session.id,
        });
      } catch { /* table missing (migration 011 not run) — emails below still deliver the code */ }
      await sendEmail({
        to: STUDIO_EMAIL,
        subject: `Gift card sold ($${amount}) — code ${code}`,
        html: `<h2>Gift card purchased</h2>
          <p><strong>Code:</strong> ${escHtml(code)}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Purchaser:</strong> ${escHtml(buyerEmail || "—")}</p>
          <p><strong>Stripe session:</strong> ${escHtml(session.id)}</p>
          <p>Redemption is manual: verify the code in the gift_cards table (or this email), apply the value in-store, then mark it redeemed.</p>`,
      });
      if (buyerEmail) {
        await sendEmail({
          to: buyerEmail,
          subject: `Your $${amount} Baroness Tattoo gift card`,
          html: `<h2>Consider it wrapped</h2>
            <p>Your Baroness Tattoo gift card is ready:</p>
            <p style="font-size:22px;letter-spacing:2px"><strong>${escHtml(code)}</strong></p>
            <p><strong>Value:</strong> $${amount} — redeemable in-studio toward any tattoo or purchase. Present this code (forward this email, or a screenshot) at the counter.</p>
            <p>— Baroness Tattoo · 315 Coneflower Dr, Garland, TX 75040 · (469) 246-7217</p>`,
        });
      }
      return NextResponse.json({ received: true });
    }
    const admin = createAdminClient();
    if (md.type === "design_export" && md.designId) {
      await admin.from("designs").update({ exported: true }).eq("id", md.designId);
    } else if (md.type === "product" && md.productId) {
      await admin.from("purchases").insert({ product_id: md.productId, artist_id: md.artistId ?? null, buyer_email: session.customer_details?.email ?? null, amount_cents: session.amount_total ?? null, stripe_session: session.id });
      // Flash purchases: the design is claimed and the purchase doubles as
      // the session deposit — tell buyer + studio, and promise the 1-business-
      // day scheduling call. No calendar automation; scheduling stays human.
      if (md.kind === "flash") {
        const buyerEmail = session.customer_details?.email ?? null;
        const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
        let title = "a flash design";
        let artistName = "";
        try {
          const { data: prod } = await admin.from("products").select("title, artists(display_name)").eq("id", md.productId).single();
          if (prod?.title) title = prod.title;
          const pa = Array.isArray(prod?.artists) ? prod?.artists[0] : prod?.artists;
          artistName = (pa as { display_name?: string } | null)?.display_name ?? "";
        } catch { /* email copy degrades gracefully */ }
        const claimed = md.claimable === "1";
        await sendEmail({
          to: STUDIO_EMAIL,
          subject: `Flash ${claimed ? "claimed" : "sold"} ($${amount}) — ${title}${artistName ? ` · ${artistName}` : ""}`,
          html: `<h2>Flash ${claimed ? "design claimed" : "purchase"}</h2>
            <p><strong>Design:</strong> ${escHtml(title)}</p>
            ${artistName ? `<p><strong>Artist:</strong> ${escHtml(artistName)}</p>` : ""}
            <p><strong>Buyer:</strong> ${escHtml(buyerEmail || "—")}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Stripe session:</strong> ${escHtml(session.id)}</p>
            ${claimed
              ? `<p><strong>Reach out within 1 business day to schedule.</strong> The purchase claims the design and counts as the session deposit. Remember to hide the listing in the dashboard so it can't sell twice.</p>`
              : `<p>Digital flash purchase — the buyer received their download link on the thank-you page.</p>`}`,
        });
        if (claimed && buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: `Design claimed — ${title} · Baroness Tattoo`,
            html: `<h2>The design is yours</h2>
              <p>Your purchase of <strong>${escHtml(title)}</strong>${artistName ? ` by ${escHtml(artistName)}` : ""} ($${amount}) is confirmed.</p>
              <p><strong>Your purchase includes the design and books your session deposit</strong> — we'll reach out within 1 business day to schedule your appointment.</p>
              <p>Questions in the meantime? Reply to this email or call (469) 246-7217.</p>
              <p>— Baroness Tattoo · 315 Coneflower Dr, Garland, TX 75040</p>`,
          });
        }
      }
    } else if (md.artistId) {
      await admin.from("artists").update({ premium: true }).eq("id", md.artistId);
    }
  }
  return NextResponse.json({ received: true });
}
