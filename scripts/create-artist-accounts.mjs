// Create USERNAME-ONLY login accounts for the house artists and link them to
// their artists rows — run ON YOUR MACHINE (needs service-role key + network):
//
//   node scripts/create-artist-accounts.mjs
//
// NO email accounts needed anywhere (comms live in Venue Ink / Instagram).
// Each username becomes a synthetic identifier — <username>@artists.baronesstattoo.com —
// that never sends or receives mail. The /login form maps a bare username to it
// automatically, so artists literally type e.g.  ale  +  password.
//
// Forgot password? YOU reset it:   node scripts/reset-artist-password.mjs ale
// (Artists change their own in My Quarters → Set Password once signed in.)
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Safe to re-run: existing users are skipped, links are re-applied.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const ARTIST_DOMAIN = "artists.baronesstattoo.com";

// ─── EDIT ME — username (lowercase, no spaces) + their /artists/<slug> ──────
const ARTISTS = [
  { username: "caroline",  slug: "caroline" },
  { username: "anna",      slug: "anna" },
  { username: "tyco",      slug: "tyco" },
  { username: "daniel",    slug: "daniel" },
  { username: "ale",       slug: "ale" },
  { username: "katherine", slug: "katherine" },
  { username: "mikey",     slug: "mikey" },
  { username: "mayra",     slug: "mayra" },
];
// ────────────────────────────────────────────────────────────────────────────

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env.local", "utf8").split("\n").find((l) => l.startsWith(name + "="));
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch { /* noop */ }
  return null;
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (in .env.local)"); process.exit(1); }

const admin = createClient(url, key, { auth: { persistSession: false } });
const tempPasswords = [];

for (const a of ARTISTS) {
  const username = a.username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "");
  const identifier = `${username}@${ARTIST_DOMAIN}`;
  process.stdout.write(`${username} … `);

  // 1) find-or-create the auth user (pre-confirmed: no email is ever sent)
  let userId = null;
  const password = "Brn-" + randomBytes(6).toString("base64url");
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: identifier,
    password,
    email_confirm: true,
  });
  if (createErr) {
    if (/already/i.test(createErr.message)) {
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      userId = list?.users?.find((u) => u.email?.toLowerCase() === identifier)?.id ?? null;
      process.stdout.write("exists · ");
    } else { console.log(`FAILED: ${createErr.message}`); continue; }
  } else {
    userId = created.user.id;
    tempPasswords.push([username, password]);
    process.stdout.write("created · ");
  }
  if (!userId) { console.log("could not resolve user id"); continue; }

  // 2) profile role = artist (don't downgrade an owner)
  const { data: prof } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (prof?.role !== "owner") {
    await admin.from("profiles").upsert({ id: userId, role: "artist" }, { onConflict: "id" });
  }

  // 3) link the artists row by slug
  const { data: row, error: linkErr } = await admin
    .from("artists").update({ user_id: userId }).eq("slug", a.slug).select("display_name").maybeSingle();
  console.log(linkErr ? `link FAILED: ${linkErr.message}` : row ? `linked → ${row.display_name}` : `NO artists row with slug "${a.slug}"`);
}

if (tempPasswords.length) {
  console.log("\nLogins (hand each artist theirs privately — they sign in at /login with JUST these):");
  for (const [u, p] of tempPasswords) console.log(`  username: ${u.padEnd(12)} password: ${p}`);
  console.log("\nHave them change the password in My Quarters → Set Password after first sign-in.");
}
console.log("Done.");
