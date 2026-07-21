import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publish, type SocialAccount } from "@/lib/social";

export const dynamic = "force-dynamic";

// POST { postId } — publish one planner post to its linked social account. Owner only.
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") return NextResponse.json({ error: "Owner only." }, { status: 403 });

  const { postId } = (await req.json().catch(() => ({}))) as { postId?: string };
  if (!postId) return NextResponse.json({ error: "postId required." }, { status: 400 });

  const admin = createAdminClient();
  const { data: post } = await admin
    .from("marketing_posts")
    .select("id, caption, media_url, platform, social_account_id, status")
    .eq("id", postId)
    .single();
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.platform !== "instagram" && post.platform !== "facebook") {
    return NextResponse.json({ error: `Auto-publish supports Instagram and Facebook. "${post.platform}" posts are manual.` }, { status: 400 });
  }

  // Use the linked account, else the first account matching the platform.
  let account: SocialAccount | null = null;
  if (post.social_account_id) {
    const { data } = await admin.from("social_accounts").select("id, platform, label, external_id, access_token").eq("id", post.social_account_id).single();
    account = (data as SocialAccount) ?? null;
  }
  if (!account) {
    const { data } = await admin.from("social_accounts").select("id, platform, label, external_id, access_token").eq("platform", post.platform).limit(1);
    account = (data?.[0] as SocialAccount) ?? null;
  }
  if (!account) return NextResponse.json({ error: `No connected ${post.platform} account. Connect one in the Marketing tab.` }, { status: 400 });

  const result = await publish(account, { id: post.id, caption: post.caption, media_url: post.media_url });

  if (result.ok) {
    await admin.from("marketing_posts").update({
      status: "posted", published_at: new Date().toISOString(),
      external_post_id: result.externalId, publish_error: null, social_account_id: account.id,
    }).eq("id", post.id);
    return NextResponse.json({ ok: true, externalId: result.externalId });
  }
  await admin.from("marketing_posts").update({ publish_error: result.error }).eq("id", post.id);
  return NextResponse.json({ error: result.error }, { status: 502 });
}
