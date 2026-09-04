// Reset an artist's password (owner tool — the "forgot password" path, since
// artist accounts have no real email). Run ON YOUR MACHINE:
//
//   node scripts/reset-artist-password.mjs ale            # random new password, printed
//   node scripts/reset-artist-password.mjs ale MyNewPass1 # specific password
//
// Also accepts a full email for client accounts:
//   node scripts/reset-artist-password.mjs someone@gmail.com

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const ARTIST_DOMAIN = "artists.baronesstattoo.com";

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env.local", "utf8").split("\n").find((l) => l.startsWith(name + "="));
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch { /* noop */ }
  return null;
}

const [, , who, wanted] = process.argv;
if (!who) { console.error("Usage: node scripts/reset-artist-password.mjs <username-or-email> [new-password]"); process.exit(1); }

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (in .env.local)"); process.exit(1); }
const admin = createClient(url, key, { auth: { persistSession: false } });

const identifier = who.includes("@") ? who.toLowerCase() : `${who.toLowerCase()}@${ARTIST_DOMAIN}`;
const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
const user = list?.users?.find((u) => u.email?.toLowerCase() === identifier);
if (!user) { console.error(`No account found for ${identifier}`); process.exit(1); }

const password = wanted || "Brn-" + randomBytes(6).toString("base64url");
const { error } = await admin.auth.admin.updateUserById(user.id, { password });
if (error) { console.error(`Reset failed: ${error.message}`); process.exit(1); }
console.log(`Password reset for ${who.includes("@") ? identifier : who}.`);
if (!wanted) console.log(`New password: ${password}`);
console.log("They sign in at /login and can change it in My Quarters → Set Password.");
