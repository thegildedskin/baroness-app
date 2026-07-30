#!/usr/bin/env node
/**
 * Download the gallery photos from the studio's CDN into public/gallery/img/ so
 * the site serves them itself instead of hotlinking GoDaddy. Reads (and updates)
 * public/gallery/manifest.json — sets `local: true` when done, which flips the
 * /gallery page to the local copies.
 *
 *   node scripts/gallery-download.mjs
 *   node scripts/gallery-download.mjs --dry-run
 *   node scripts/gallery-download.mjs --force        # re-download existing
 *
 * Run on your own machine (not the sandbox). Node 18+.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(__dirname, "..", "public", "gallery", "manifest.json");
const OUT = path.resolve(__dirname, "..", "public", "gallery", "img");

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true];
}));
const DRY = !!args["dry-run"];
const FORCE = !!args.force;

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  await fsp.mkdir(OUT, { recursive: true });
  console.log(`Downloading ${manifest.images.length} photo(s) → public/gallery/img/${DRY ? "   [DRY RUN]" : ""}\n`);

  let ok = 0;
  for (const img of manifest.images) {
    const dest = path.join(OUT, img.file);
    if (!FORCE && fs.existsSync(dest)) { console.log(`  • ${img.file.slice(0, 26)}… — skip (exists)`); ok++; continue; }
    const url = `${manifest.cdn}/${img.file}`; // original, no transform
    if (DRY) { console.log(`  → ${img.file.slice(0, 26)}…`); continue; }
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await fsp.writeFile(dest, Buffer.from(await r.arrayBuffer()));
      const kb = (fs.statSync(dest).size / 1024).toFixed(0);
      console.log(`  ✓ ${img.file.slice(0, 26)}… (${kb} KB)`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${img.file.slice(0, 26)}… — ${e.message}`);
    }
  }

  if (!DRY && ok === manifest.images.length) {
    manifest.local = true;
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`\nDone. ${ok}/${manifest.images.length} downloaded; manifest set to serve local copies.`);
  } else if (!DRY) {
    console.log(`\n${ok}/${manifest.images.length} downloaded. Fix failures (or --force), then re-run to flip to local.`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
