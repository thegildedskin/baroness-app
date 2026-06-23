"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Anonymous visitor sends a message to an artist. Runs server-side with the
// service-role client (bypasses RLS) so visitors don't need an account.
export async function sendMessage(input: {
  artistId: string;
  clientName: string;
  clientEmail: string;
  body: string;
}) {
  const artistId = input.artistId;
  const clientName = (input.clientName || "").trim();
  const clientEmail = (input.clientEmail || "").trim();
  const body = (input.body || "").trim();

  if (!artistId || !clientName || !body) {
    return { error: "Please enter your name and a message." };
  }

  const admin = createAdminClient();

  const { data: thread, error: tErr } = await admin
    .from("threads")
    .insert({ artist_id: artistId, client_name: clientName, client_email: clientEmail || null })
    .select("id")
    .single();
  if (tErr || !thread) {
    return { error: tErr?.message || "Could not start the conversation." };
  }

  const { error: mErr } = await admin
    .from("messages")
    .insert({ thread_id: thread.id, sender: "client", body });
  if (mErr) {
    return { error: mErr.message };
  }

  return { ok: true };
}
