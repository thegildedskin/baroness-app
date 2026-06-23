import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ThankYou({ searchParams }: { searchParams: { session_id?: string } }) {
  const sid = searchParams.session_id;
  let title = "your item";
  let downloadUrl = "";
  if (sid && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sid);
      if (session.payment_status === "paid" && session.metadata?.type === "product" && session.metadata.productId) {
        const admin = createAdminClient();
        const { data: p } = await admin.from("products").select("title, file_path").eq("id", session.metadata.productId).single();
        if (p?.file_path) {
          title = p.title;
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
        {downloadUrl ? (
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
