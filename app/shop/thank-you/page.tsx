import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { giftCardCode } from "@/lib/giftcards";

export const dynamic = "force-dynamic";

export default async function ThankYou({ searchParams }: { searchParams: { session_id?: string } }) {
  const sid = searchParams.session_id;
  let title = "your item";
  let downloadUrl = "";
  let giftCode = "";
  let giftAmount = "";
  let flashClaim = false;
  if (sid && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sid);
      if (session.payment_status === "paid" && session.metadata?.type === "gift_card") {
        // Same deterministic code the webhook stored/emailed (lib/giftcards.ts)
        giftCode = giftCardCode(session.id);
        giftAmount = ((session.amount_total ?? 0) / 100).toFixed(0);
      }
      if (session.payment_status === "paid" && session.metadata?.type === "product" && session.metadata.productId) {
        // Claimed flash: the purchase includes the design AND books the
        // session deposit — say so (the webhook emails the same promise).
        flashClaim = session.metadata.kind === "flash" && session.metadata.claimable === "1";
        const admin = createAdminClient();
        const { data: p } = await admin.from("products").select("title, file_path").eq("id", session.metadata.productId).single();
        if (p?.title) title = p.title;
        if (p?.file_path) {
          const { data: signed } = await admin.storage.from("product-files").createSignedUrl(p.file_path, 60 * 60 * 24);
          downloadUrl = signed?.signedUrl ?? "";
        }
      }
    } catch { /* noop */ }
  }
  return (
    <main className="wrap" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 44 }}>Thank you</h1>
      <div className="card" style={{ marginTop: 16 }}>
        {giftCode ? (
          <>
            <p>Your <strong>${giftAmount} gift card</strong> is ready. The code:</p>
            <p style={{ fontFamily: "var(--caps)", fontSize: 22, letterSpacing: ".12em", margin: "14px 0", color: "var(--gold-dark)" }}>{giftCode}</p>
            <p style={{ fontSize: 14, color: "var(--grey)" }}>
              We&rsquo;ve also emailed it to you. Redeemable in-studio toward any tattoo or purchase — present the code at the counter.
              315 Coneflower Dr, Garland, TX 75040.
            </p>
          </>
        ) : flashClaim ? (
          <>
            <p>The design is yours — <strong>{title !== "your item" ? title : "your flash piece"}</strong> is claimed, and no one else can wear it.</p>
            <p style={{ marginTop: 12 }}>
              <strong>Your purchase includes the design and books your session deposit.</strong> We&rsquo;ll reach out within
              1 business day to schedule your appointment — watch your email (and your phone).
            </p>
            {downloadUrl && <p style={{ marginTop: 12 }}><a className="btn" href={downloadUrl}>Download the design</a></p>}
            <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 10 }}>
              Questions meanwhile? Call (469) 246-7217 or reply to your confirmation email. Baroness Tattoo · 315 Coneflower Dr, Garland, TX 75040.
            </p>
          </>
        ) : downloadUrl ? (
          <>
            <p>Your purchase of <strong>{title}</strong> is ready.</p>
            <p style={{ marginTop: 12 }}><a className="btn" href={downloadUrl}>Download your file</a></p>
            <p style={{ fontSize: 13, color: "var(--grey)", marginTop: 10 }}>This link is valid for 24 hours. Your purchase is recorded in the house records.</p>
          </>
        ) : (
          <p>Payment received. If your download doesn&rsquo;t appear, contact the studio and we&rsquo;ll send it straightaway.</p>
        )}
      </div>
      <p style={{ marginTop: 16 }}><a href="/" className="caps" style={{ fontSize: 11, color: "var(--gold-dark)" }}>← Back to the estate</a></p>
    </main>
  );
}
