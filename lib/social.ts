// Meta (Instagram + Facebook) publishing — SERVER ONLY.
// Uses the Graph API with stored long-lived tokens (social_accounts table).
// Own-account publishing works at Standard Access — no Meta app review needed.

const GRAPH = "https://graph.facebook.com/v21.0";

export type SocialAccount = {
  id: string;
  platform: "instagram" | "facebook";
  label: string;
  external_id: string; // IG user id or FB page id
  access_token: string;
};

export type PublishablePost = {
  id: string;
  caption: string;
  media_url: string | null;
};

export type PublishResult =
  | { ok: true; externalId: string }
  | { ok: false; error: string };

type GraphResponse = { id?: string; post_id?: string; status_code?: string; error?: { message?: string } };

async function graph(path: string, params: Record<string, string>): Promise<GraphResponse> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    // Meta can be slow when a container is processing
    signal: AbortSignal.timeout(25000),
  });
  const data = (await res.json().catch(() => ({}))) as GraphResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Graph API error (${res.status})`);
  }
  return data;
}

async function waitForContainer(containerId: string, token: string): Promise<void> {
  for (let i = 0; i < 6; i++) {
    const res = await fetch(`${GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(15000) });
    const data = (await res.json().catch(() => ({}))) as GraphResponse;
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Instagram rejected the media (container ERROR). Is media_url a public JPEG?");
    await new Promise((r) => setTimeout(r, 2500));
  }
  // proceed anyway — media_publish will error if truly not ready
}

export async function publishToInstagram(account: SocialAccount, post: PublishablePost): Promise<PublishResult> {
  try {
    if (!post.media_url) return { ok: false, error: "Instagram requires a public image URL (JPEG). Add a media URL to this post." };
    const container = await graph(`/${account.external_id}/media`, {
      image_url: post.media_url,
      caption: post.caption,
      access_token: account.access_token,
    });
    if (!container.id) return { ok: false, error: "No media container id returned." };
    await waitForContainer(container.id, account.access_token);
    const published = await graph(`/${account.external_id}/media_publish`, {
      creation_id: container.id,
      access_token: account.access_token,
    });
    return { ok: true, externalId: published.id || container.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Instagram publish failed." };
  }
}

export async function publishToFacebook(account: SocialAccount, post: PublishablePost): Promise<PublishResult> {
  try {
    if (post.media_url) {
      const r = await graph(`/${account.external_id}/photos`, {
        url: post.media_url,
        caption: post.caption,
        access_token: account.access_token,
      });
      return { ok: true, externalId: r.post_id || r.id || "" };
    }
    const r = await graph(`/${account.external_id}/feed`, {
      message: post.caption,
      access_token: account.access_token,
    });
    return { ok: true, externalId: r.id || "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Facebook publish failed." };
  }
}

export function publish(account: SocialAccount, post: PublishablePost): Promise<PublishResult> {
  return account.platform === "instagram" ? publishToInstagram(account, post) : publishToFacebook(account, post);
}
