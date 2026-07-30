#!/usr/bin/env node
/**
 * Auto-categorize the gallery via the site's own vision classifier.
 * Reads public/gallery/manifest.json, sends each image to /api/classify, and
 * writes the top style back as its `category`. Run with the app running + an
 * OPENAI_API_KEY set (otherwise the classifier falls back to a keyword heuristic).
 *
 *   npm run dev                       # in another terminal (serves /api/classify)
 *   node scripts/gallery-classify.mjs
 *   node scripts/gallery-classify.mjs --url=http://localhost:3000 --dry-run
 *
 * Node 18+.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(__dirname, "..", "public", "gallery", "manifest.json");

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true];
}));
const BASE = String(args.url || "http://localhost:3000").replace(/\/$/, "");
const DRY = !!args["dry-run"];
const LIMIT = args.limit ? Number(args.limit) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function classify(imageUrl, filename) {
  try {
    const r = await fetch(`${BASE}/api/classify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: imageUrl, filename }),
    });
    const j = await r.json();
    const top = (j.styles || [])[0];
    return { category: top?.tag || null, source: j.source, confidence: top?.confidence };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const imgs = manifest.images.slice(0, LIMIT === Infinity ? undefined : LIMIT);
  console.log(`Classifying ${imgs.length} image(s) via ${BASE}/api/classify${DRY ? "  [DRY RUN]" : ""}\n`);

  for (const img of imgs) {
    const url = `${manifest.cdn}/${img.file}/:/rs=w:1024`;
    const res = await classify(url, img.file);
    if (res.error) { console.log(`  ✗ ${img.file.slice(0, 24)}… — ${res.error}`); continue; }
    const cat = res.category || "Uncategorized";
    console.log(`  ${res.category ? "✓" : "•"} ${img.file.slice(0, 24)}… → ${cat}  (${res.source}${res.confidence ? `, ${res.confidence}%` : ""})`);
    if (!DRY && res.category) img.category = res.category;
    await sleep(300); // gentle on the model provider
  }

  if (!DRY) {
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
    const counts = {};
    for (const i of manifest.images) counts[i.category] = (counts[i.category] || 0) + 1;
    console.log(`\nDone. Wrote categories → public/gallery/manifest.json`);
    console.log("  " + Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(" · "));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
