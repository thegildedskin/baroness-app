#!/usr/bin/env bash
#
# extract-estate.sh — build ../baroness-estate/ as a NEW repo tree containing
# the interactive "estate" experience (3D mansion, kingdom, avatar, wallet…),
# ready to become its own GitHub repo + Vercel project on
# estate.baronesstattoo.com.
#
# Safe by design:
#   • READS ONLY from this repo — it never modifies, moves or deletes
#     anything inside the current repository.
#   • Idempotent — re-running overwrites the generated tree with a fresh copy.
#   • Deleting the copied files from THIS repo is a separate, later, manual
#     step (see ESTATE-EXTRACTION.md).
#
# Usage (from the repo root):
#   ./scripts/extract-estate.sh [destination]   # default: ../baroness-estate
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$ROOT/../baroness-estate}"
mkdir -p "$DEST"
DEST="$(cd "$DEST" && pwd)"

if [ "$DEST" = "$ROOT" ] || [[ "$DEST" == "$ROOT"/* ]]; then
  echo "Refusing: destination ($DEST) must be outside the repo ($ROOT)." >&2
  exit 1
fi

echo "Extracting estate → $DEST"

# ─── 1. Copy the game code, assets, sql and tests ───────────────────────────
# copy <repo-relative-path>: recreates the same path under $DEST.
copy() {
  local rel="$1" src dstdir
  src="$ROOT/$rel"
  if [ ! -e "$src" ]; then
    echo "  ! skip (missing): $rel"
    return 0
  fi
  dstdir="$DEST/$(dirname "$rel")"
  mkdir -p "$dstdir"
  rm -rf "${DEST:?}/$rel"
  cp -R "$src" "$dstdir/"
  echo "  + $rel"
}

# The estate wings (pages + their client components)
copy app/explore
copy app/kingdom
copy app/quarters
copy app/ball
copy app/wallet
copy app/avatar
copy app/studio
copy app/commission
copy app/Mansion3D.tsx
copy app/ComingSoon.tsx        # imported by every experimental wing
copy app/globals.css           # the rococo design tokens the wings style with

# API routes the wings call
copy app/api/state
copy app/api/wallet
copy app/api/meshy
copy app/api/ai-avatar
copy app/api/ai-tattoo
copy app/api/checkout-design
copy app/api/checkout
copy app/api/classify

# Libraries
copy lib/state.ts
copy lib/wallet.ts
copy lib/achievements.ts
copy lib/gltf.ts
copy lib/matcher.ts
copy lib/taxonomy.ts
copy lib/meshy.ts
copy lib/flags.ts              # EXPERIMENTS_ENABLED gate used by the wings
copy lib/supabase              # client/server/admin/static helpers

# Assets (public/rooms is ~55MB — plan to move to Supabase Storage/CDN, see README)
copy public/draco
copy public/bastien
copy public/livery
copy public/rooms
copy public/avatars
copy public/outfits

# Database schemas for the estate's own tables
copy supabase/baroness-state.sql
copy supabase/baroness-wallet.sql

# Tests
copy tests/matcher.test.ts
copy tests/taxonomy.test.ts

# ─── 2. package.json (minimal; stripe only if checkout routes copied) ───────
STRIPE_DEP=""
if [ -d "$DEST/app/api/checkout" ] || [ -d "$DEST/app/api/checkout-design" ]; then
  STRIPE_DEP='
    "stripe": "^17.3.1",'
fi

cat > "$DEST/package.json" <<EOF
{
  "name": "baroness-estate",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@avaturn/sdk": "^1.1.4",
    "@react-three/fiber": "^8.17.10",
    "@react-three/postprocessing": "^2.16.3",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4",
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",$STRIPE_DEP
    "three": "^0.169.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.169.0",
    "typescript": "^5.5.4",
    "vitest": "^2.1.0"
  }
}
EOF
echo "  + package.json"

# ─── 3. tsconfig / next.config / vitest skeletons ────────────────────────────
cat > "$DEST/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
echo "  + tsconfig.json"

cat > "$DEST/next.config.mjs" <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};
export default nextConfig;
EOF
echo "  + next.config.mjs"

cat > "$DEST/vitest.config.mjs" <<'EOF'
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: { include: ["tests/**/*.test.ts"] },
});
EOF
echo "  + vitest.config.mjs"

# ─── 4. Minimal app/layout.tsx + landing page linking the wings ─────────────
cat > "$DEST/app/layout.tsx" <<'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://estate.baronesstattoo.com"),
  title: "The Baroness Estate",
  description:
    "The interactive estate of Baroness Tattoo — wander the mansion, dress an avatar, earn your title. The studio itself lives at baronesstattoo.com.",
  robots: { index: false }, // flip to index once the estate is ready for court
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF
echo "  + app/layout.tsx"

cat > "$DEST/app/page.tsx" <<'EOF'
// Landing hall — links every wing of the estate. Money always flows to the
// real studio: booking lives at baronesstattoo.com/book, never here.
const WINGS = [
  { href: "/explore", label: "Explore the Mansion", desc: "Walk the halls in 3D." },
  { href: "/kingdom", label: "The Kingdom", desc: "Court, lore, missions, achievements." },
  { href: "/quarters", label: "Your Quarters", desc: "Your private room in the estate." },
  { href: "/ball", label: "The Ball", desc: "Dress for the season's occasion." },
  { href: "/avatar/create", label: "The Atelier of Selves", desc: "Create your avatar." },
  { href: "/wallet", label: "The Royal Purse", desc: "Crowns, titles and the ledger." },
  { href: "/studio", label: "The Studio Wing", desc: "Design experiments." },
  { href: "/commission", label: "Commission a Design", desc: "AI-assisted tattoo sketches." },
];

export default function EstateLanding() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream, #f5e9d3)", padding: "60px 24px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--display, serif)", fontSize: "clamp(38px,6vw,56px)", margin: 0 }}>
          The Baroness Estate
        </h1>
        <p style={{ fontFamily: "var(--body, serif)", fontStyle: "italic", fontSize: 18, opacity: 0.75, margin: "12px auto 0", maxWidth: 560 }}>
          The playable wing of the house. For ink on actual skin, the studio receives at{" "}
          <a href="https://baronesstattoo.com/book" style={{ color: "inherit" }}>baronesstattoo.com/book</a>.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18, marginTop: 44, textAlign: "left" }}>
          {WINGS.map((w) => (
            <a key={w.href} href={w.href} style={{ display: "block", textDecoration: "none", color: "inherit", border: "1px solid var(--gold, #b08d3f)", borderRadius: 8, padding: "20px 22px", background: "var(--parchment, #efe2c4)" }}>
              <div style={{ fontFamily: "var(--display, serif)", fontWeight: 700, fontSize: 20 }}>{w.label}</div>
              <div style={{ fontFamily: "var(--body, serif)", fontSize: 14, opacity: 0.7, marginTop: 6 }}>{w.desc}</div>
            </a>
          ))}
        </div>
        <p style={{ marginTop: 48, fontSize: 13, opacity: 0.6 }}>
          Baroness Tattoo · 315 Coneflower Dr, Garland, TX ·{" "}
          <a href="https://baronesstattoo.com" style={{ color: "inherit" }}>baronesstattoo.com</a>
        </p>
      </div>
    </main>
  );
}
EOF
echo "  + app/page.tsx"

# ─── 5. .env.example / .gitignore / README ──────────────────────────────────
cat > "$DEST/.env.example" <<'EOF'
# ── Copy to .env.local (git-ignored) ──────────────────────────────────────────

# Supabase — the SAME project as the main site (baroness-app). The estate's
# tables (baroness-state.sql / baroness-wallet.sql) live alongside the
# studio's tables; both apps share auth and storage.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Meshy (3D avatar model generation) — server-side only
MESHY_API_KEY=
# MESHY_BASE_URL=            # optional override

# Optional — only for the AI image features (avatar/tattoo generators)
OPENAI_API_KEY=

# Optional — only if the checkout routes stay (design export purchases)
STRIPE_SECRET_KEY=

# Optional — Avaturn avatar creator subdomain
NEXT_PUBLIC_AVATURN_SUBDOMAIN=

# Optional — gates the experimental wings (see lib/flags.ts)
NEXT_PUBLIC_EXPERIMENTS_ENABLED=1

# Canonical origin of THIS app
NEXT_PUBLIC_SITE_URL=https://estate.baronesstattoo.com
EOF
echo "  + .env.example"

cat > "$DEST/.gitignore" <<'EOF'
node_modules/
.next/
out/
.env*.local
.vercel
tsconfig.tsbuildinfo
.DS_Store
EOF
echo "  + .gitignore"

cat > "$DEST/README.md" <<'EOF'
# Baroness Estate

The interactive "estate" experience extracted from the main Baroness Tattoo
site (baroness-app): the 3D mansion, kingdom/achievements layer, avatar
atelier, ball, wallet, studio and commission wings — everything playful, so
the studio site can stay small, fast and boring in the best way.

## Setting it up

1. **New GitHub repo.** Init here and push:
   `git init && git add -A && git commit -m "Estate extracted from baroness-app" && gh repo create baroness-estate --private --source=. --push`
2. **New Vercel project** from that repo. Framework preset: Next.js. Add the
   env vars from `.env.example` (Production + Preview).
3. **Domain:** add `estate.baronesstattoo.com` to the Vercel project, then at
   GoDaddy DNS add: `CNAME  estate → cname.vercel-dns.com`. (The apex domain
   keeps pointing at the main site — don't touch its records.)
4. **Supabase is SHARED** with the main site — same project, same URL/keys.
   The estate's own tables come from `supabase/baroness-state.sql` and
   `supabase/baroness-wallet.sql` (already applied if the main site ran them;
   both are idempotent and safe to re-run in the SQL editor).

## Big assets → storage/CDN over time

`public/rooms` (~55 MB), `public/bastien` and `public/livery` ship in the
repo for now, which works but bloats clones and deploys. Migrate them to
Supabase Storage (public bucket, e.g. `estate-assets`) or any CDN and swap
the hardcoded `/rooms/...` paths for the bucket URLs — piecemeal is fine,
nothing depends on them being local.

## House rule: money links home

The estate never takes booking money. Every "book", "deposit" or "get this
tattooed" call-to-action must link to **https://baronesstattoo.com/book** —
the studio site owns Stripe deposits, intake and email. (The optional
checkout routes here only cover design-export novelties; delete them and the
`stripe` dependency if unused.)

## Development

```
npm install
cp .env.example .env.local   # fill in Supabase + Meshy
npm run dev
npm test                     # matcher/taxonomy unit tests
```
EOF
echo "  + README.md"

echo ""
echo "Done. Tree at: $DEST"
echo "This repo was not modified. Next steps live in $DEST/README.md and ESTATE-EXTRACTION.md."
