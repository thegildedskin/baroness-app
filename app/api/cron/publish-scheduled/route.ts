import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publish, type SocialAccount } from "@/lib/social";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — invoked by Vercel Cron (see vercel.json). Publishes every planner post
// that is status='scheduled', due today or earlier, on an auto-capable platform.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await admin
    .from("marketing_posts")
    .select("id, caption, media_url, platform, social_account_id")
    .eq("status", "scheduled")
    .lte("scheduled_for", today)
    .in("platform", ["instagram", "facebook"])
    .limit(10);

  const results: { id: string; ok: boolean; detail: string }[] = [];
  for (const post of due ?? []) {
    let account: SocialAccount | null = null;
    if (post.social_account_id) {
      const { data } = await admin.from("social_accounts").select("id, platform, label, external_id, access_token").eq("id", post.social_account_id).single();
      account = (data as SocialAccount) ?? null;
    }
    if (!account) {
      const { data } = await admin.from("social_accounts").select("id, platform, label, external_id, access_token").eq("platform", post.platform).limit(1);
      account = (data?.[0] as SocialAccount) ?? null;
    }
    if (!account) {
      await admin.from("marketing_posts").update({ publish_error: `No connected ${post.platform} account.` }).eq("id", post.id);
      results.push({ id: post.id, ok: false, detail: "no account" });
      continue;
    }
    const r = await publish(account, { id: post.id, caption: post.caption, media_url: post.media_url });
    if (r.ok) {
      await admin.from("marketing_posts").update({
        status: "posted", published_at: new Date().toISOString(),
        external_post_id: r.externalId, publish_error: null, social_account_id: account.id,
      }).eq("id", post.id);
      results.push({ id: post.id, ok: true, detail: r.externalId });
    } else {
      await admin.from("marketing_posts").update({ publish_error: r.error }).eq("id", post.id);
      results.push({ id: post.id, ok: false, detail: r.error });
    }
  }
  return NextResponse.json({ checked: due?.length ?? 0, results });
}
