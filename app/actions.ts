"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, escHtml } from "@/lib/email";

export async function sendMessage(input: { artistId: string; clientName: string; clientEmail: string; body: string; }) {
  const artistId = input.artistId;
  const clientName = (input.clientName || "").trim();
  const clientEmail = (input.clientEmail || "").trim();
  const body = (input.body || "").trim();
  if (!artistId || !clientName || !body) return { error: "Please enter your name and a message." };

  const admin = createAdminClient();
  const { data: thread, error: tErr } = await admin
    .from("threads")
    .insert({ artist_id: artistId, client_name: clientName, client_email: clientEmail || null })
    .select("id")
    .single();
  if (tErr || !thread) return { error: tErr?.message || "Could not start the conversation." };

  const { error: mErr } = await admin.from("messages").insert({ thread_id: thread.id, sender: "client", body });
  if (mErr) return { error: mErr.message };

  // notify the artist by email (if linked + email known)
  try {
    const { data: art } = await admin.from("artists").select("display_name, user_id").eq("id", artistId).single();
    if (art?.user_id) {
      const { data: prof } = await admin.from("profiles").select("email").eq("id", art.user_id).single();
      if (prof?.email) {
        await sendEmail({
          to: prof.email,
          subject: "New message at Baroness Tattoo",
          html: `<p><strong>${escHtml(clientName)}</strong> sent you a message${clientEmail ? ` (${escHtml(clientEmail)})` : ""}:</p><blockquote>${escHtml(body)}</blockquote><p>Reply from your Artists&rsquo; Quarters.</p>`,
        });
      }
    }
  } catch { /* best-effort */ }

  return { ok: true };
}

export async function replyToThread(threadId: string, body: string) {
  const b = (body || "").trim();
  if (!threadId || !b) return { error: "Empty reply." };
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({ thread_id: threadId, sender: "artist", body: b });
  if (error) return { error: error.message };
  await supabase.from("threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);

  // email the client the reply
  try {
    const admin = createAdminClient();
    const { data: t } = await admin.from("threads").select("client_email, artists(display_name)").eq("id", threadId).single();
    if (t?.client_email) {
      const a = t.artists as { display_name: string } | { display_name: string }[] | null;
      const name = Array.isArray(a) ? a[0]?.display_name : a?.display_name;
      await sendEmail({
        to: t.client_email,
        subject: `A reply from ${name || "your artist"} at Baroness Tattoo`,
        html: `<p>${escHtml(name || "Your artist")} replied:</p><blockquote>${escHtml(b)}</blockquote><p>Visit the estate to continue the conversation.</p>`,
      });
    }
  } catch { /* best-effort */ }

  return { ok: true };
}

import { ACH_MAP } from "@/lib/achievements";

export async function claimAchievements() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { added: 0 };
  const admin = createAdminClient();
  const { data: prof } = await admin.from("profiles").select("total_spent_cents, credits").eq("id", user.id).single();
  const { data: earnedRows } = await admin.from("user_achievements").select("key").eq("user_id", user.id);
  const earned = new Set((earnedRows || []).map((r: { key: string }) => r.key));
  const { count: passportCount } = await admin.from("ink_passport").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  const spent = prof?.total_spent_cents || 0;

  const toGrant: string[] = [];
  if (!earned.has("joined")) toGrant.push("joined");
  if ((passportCount || 0) > 0 && !earned.has("first_ink")) toGrant.push("first_ink");
  if (spent >= 10000 && !earned.has("patron")) toGrant.push("patron");
  if (spent >= 50000 && !earned.has("noble")) toGrant.push("noble");
  if (spent >= 150000 && !earned.has("circle")) toGrant.push("circle");

  let added = 0;
  for (const key of toGrant) {
    const { error } = await admin.from("user_achievements").insert({ user_id: user.id, key });
    if (!error) added += ACH_MAP[key]?.points || 0;
  }
  if (added > 0) await admin.from("profiles").update({ credits: (prof?.credits || 0) + added }).eq("id", user.id);
  return { added };
}
