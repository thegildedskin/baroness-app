// Retroactive loyalty import — turn your client check-in history into crown
// points. Run ON YOUR MACHINE (needs service-role key + network):
//
//   node scripts/import-clients.mjs clients.csv            # seed points only
//   node scripts/import-clients.mjs clients.csv --invite   # + email each client a sign-up invite
//
// CSV columns (header row required, extra columns ignored, order flexible):
//   email            required
//   name             optional
//   total_spent      optional — dollars, e.g. 450 or $450.00
//   visits           optional — number of check-ins
//
// How the points work: rows are written to pending_rewards (migration 013),
// keyed by email. NO account is required up front — the moment a client signs
// in with that email and their wallet loads, the gems arrive automatically
// (the same bridge that awards booking deposits). Re-running is safe: each
// email is tagged with a legacy-import marker and skipped if already imported.
//
// Tune the exchange rate here:
const GEMS_PER_DOLLAR = 1;    // $450 lifetime spend → 450 gems
const GEMS_PER_VISIT  = 25;   // used only when total_spent is absent/zero
const MAX_GEMS        = 5000; // sanity cap per client

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env.local", "utf8").split("\n").find((l) => l.startsWith(name + "="));
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch { /* noop */ }
  return null;
}

const [, , csvPath, ...flags] = process.argv;
const doInvite = flags.includes("--invite");
if (!csvPath) { console.error("Usage: node scripts/import-clients.mjs <clients.csv> [--invite]"); process.exit(1); }

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (in .env.local)"); process.exit(1); }
const admin = createClient(url, key, { auth: { persistSession: false } });

// tiny CSV parser (handles quoted fields with commas)
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows.shift().map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
const col = (name) => header.indexOf(name);
const iEmail = col("email"), iSpent = col("total_spent"), iVisits = col("visits"), iName = col("name");
if (iEmail < 0) { console.error("CSV needs an 'email' column."); process.exit(1); }

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
let imported = 0, skipped = 0, invalid = 0, invited = 0;

for (const r of rows) {
  const email = (r[iEmail] || "").trim().toLowerCase();
  if (!emailRe.test(email)) { invalid++; continue; }
  const spent = iSpent >= 0 ? parseFloat((r[iSpent] || "0").replace(/[$,]/g, "")) || 0 : 0;
  const visits = iVisits >= 0 ? parseInt(r[iVisits] || "0", 10) || 0 : 0;
  const gems = Math.min(MAX_GEMS, Math.round(spent > 0 ? spent * GEMS_PER_DOLLAR : visits * GEMS_PER_VISIT));
  if (gems <= 0) { skipped++; continue; }

  // idempotency: one legacy import per email (stripe_session column is just a
  // unique tag — we reuse it as "legacy:<email>" so re-runs don't double-award)
  const { error } = await admin.from("pending_rewards").insert({
    email, gems,
    reason: "legacy:check-ins",
    stripe_session: `legacy:${email}`,
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) skipped++;
    else console.error(`${email}: ${error.message}`);
    continue;
  }
  imported++;

  if (doInvite) {
    const { error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: iName >= 0 && r[iName] ? { display_name: r[iName].trim() } : undefined,
    });
    if (!invErr) invited++;
    // "already registered" is fine — their gems await their next wallet load
  }
}

console.log(`\nImported ${imported} clients' points (${skipped} skipped/already imported, ${invalid} invalid emails).`);
if (doInvite) console.log(`Invites emailed: ${invited}`);
console.log("Points sit in pending_rewards and land automatically the first time each client signs in.");
