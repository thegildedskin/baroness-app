// Create Supabase auth accounts for the house artists and link them to their
// artists rows — run ON YOUR MACHINE (it needs the service-role key and network):
//
//   node scripts/create-artist-accounts.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
// Edit the ARTISTS list below (email + the slug of their artists-table row),
// then run. Safe to re-run: existing users are skipped, links are re-applied.
//
// Each artist gets a TEMPORARY password (printed once, at the end — share it
// with them privately); they should change it in My Quarters → Set Password,
// or just use "Email me a sign-in link" on /login and never touch the temp one.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// ─── EDIT ME ────────────────────────────────────────────────────────────────
const ARTISTS = [
  // { email: "caroline@example.com", slug: "caroline" },
  // { email: "anna@example.com",     slug: "anna" },
  // { email: "tyco@example.com",     slug: "tyco" },
  // { email: "daniel@example.com",   slug: "daniel" },
  // { email: "ale@example.com",      slug: "ale" },
  // { email: "katherine@example.com",slug: "katherine" },
  // { email: "mikey@example.com",    slug: "mikey" },
  // { email: "mayra@example.com",    slug: "mayra" },
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
if (ARTISTS.length === 0) { console.error("Edit the ARTISTS list at the top of this script first."); process.exit(1); }

const admin = createClient(url, key, { auth: { persistSession: false } });
const tempPasswords = [];

for (const a of ARTISTS) {
  const email = a.email.toLowerCase().trim();
  process.stdout.write(`${email} … `);

  // 1) find-or-create the auth user
  let userId = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: (() => { const p = "Brn-" + randomBytes(6).toString("base64url"); tempPasswords.push([email, p]); return p; })(),
    email_confirm: true,
  });
  if (createErr) {
    if (/already/i.test(createErr.message)) {
      tempPasswords.pop(); // not used
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
      userId = list?.users?.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
      process.stdout.write("exists · ");
    } else { console.log(`FAILED: ${createErr.message}`); continue; }
  } else {
    userId = created.user.id;
    process.stdout.write("created · ");
  }
  if (!userId) { console.log("could not resolve user id"); continue; }

  // 2) profile role = artist (upsert; don't downgrade an owner)
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
  console.log("\nTemporary passwords (share privately; artists should change them or use magic links):");
  for (const [e, p] of tempPasswords) console.log(`  ${e}  ${p}`);
}
console.log("\nDone. Artists sign in at /login and land in their Quarters automatically.");
