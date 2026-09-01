import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public read of the studio's own Instagram feed, using the same long-lived
// Graph token the admin panel's publisher stores in social_accounts (008).
// Own-account media reads work at Standard Access — no Meta app review.
// Cached in-memory for an hour per serverless instance; degrades to an empty
// list (the strip on /gallery then renders nothing) if no account/token/error.

const GRAPH = "https://graph.facebook.com/v21.0";

export type IgPost = {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: string; // IMAGE | CAROUSEL_ALBUM | VIDEO
};

let cache: { at: number; posts: IgPost[] } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ posts: cache.posts });
  }
  try {
    const admin = createAdminClient();
    const { data: account } = await admin
      .from("social_accounts")
      .select("external_id,access_token")
      .eq("platform", "instagram")
      .order("connected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!account) return NextResponse.json({ posts: [] });

    const url =
      `${GRAPH}/${account.external_id}/media` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=12` +
      `&access_token=${encodeURIComponent(account.access_token)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { id: string; caption?: string; media_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string }[];
    };
    const posts: IgPost[] = (json.data ?? [])
      .map((m) => ({
        id: m.id,
        // videos: show the thumbnail, still link to the reel
        media_url: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) || "",
        permalink: m.permalink || "https://www.instagram.com/baronesstattoo/",
        caption: (m.caption || "").slice(0, 140),
        media_type: m.media_type || "IMAGE",
      }))
      .filter((m) => m.media_url)
      .slice(0, 10);
    cache = { at: Date.now(), posts };
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
