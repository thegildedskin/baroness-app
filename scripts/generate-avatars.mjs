#!/usr/bin/env node
// Generate the 28 premade avatar portraits via OpenAI gpt-image-1.
//
// Usage:
//   OPENAI_API_KEY=sk-... node scripts/generate-avatars.mjs           # generate missing only
//   OPENAI_API_KEY=sk-... node scripts/generate-avatars.mjs --force   # regenerate all
//   OPENAI_API_KEY=sk-... node scripts/generate-avatars.mjs female-03 # just one id
//
// Output: public/avatars/<id>.png  (the avatar engine auto-prefers these once present).
// Prompts live in scripts/avatar-prompts.json — edit freely.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("✗ OPENAI_API_KEY is not set. Export it and re-run:\n  export OPENAI_API_KEY=sk-...\n");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const prompts = JSON.parse(fs.readFileSync(path.join(here, "avatar-prompts.json"), "utf8"));
const outDir = path.resolve(here, "..", "public", "avatars");
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIds = args.filter((a) => !a.startsWith("--"));
const jobs = onlyIds.length ? prompts.filter((p) => onlyIds.includes(p.id)) : prompts;

let ok = 0, skipped = 0, failed = 0;
for (const { id, prompt } of jobs) {
  const file = path.join(outDir, `${id}.png`);
  if (fs.existsSync(file) && !force) { console.log(`• skip ${id} (exists)`); skipped++; continue; }
  process.stdout.write(`• ${id} … `);
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1536", n: 1 }),
    });
    const j = await r.json();
    const b64 = j?.data?.[0]?.b64_json;
    if (!b64) { console.log(`FAIL — ${j?.error?.message || "no image returned"}`); failed++; continue; }
    fs.writeFileSync(file, Buffer.from(b64, "base64"));
    console.log("saved");
    ok++;
  } catch (e) {
    console.log(`ERROR — ${e?.message || e}`); failed++;
  }
}
console.log(`\nDone. ${ok} generated, ${skipped} skipped, ${failed} failed.`);
if (ok) console.log("Refresh the app — the new portraits replace the from-code avatars automatically.");
