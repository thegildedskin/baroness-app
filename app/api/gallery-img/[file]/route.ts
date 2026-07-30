import { type NextRequest, NextResponse } from "next/server";
import { GALLERY_CDN, GALLERY_FILES } from "@/lib/gallery";

export const runtime = "nodejs";
export const revalidate = false;

// Proxies a gallery photo from the studio's GoDaddy CDN. Fetching server-side
// with the studio's own referer defeats the cross-domain hotlink block that
// stops the images loading on a different domain (e.g. the new Vercel site).
// GET /api/gallery-img/<file>?w=900
export async function GET(req: NextRequest, { params }: { params: { file: string } }) {
  const file = decodeURIComponent(params.file);
  if (!GALLERY_FILES.includes(file)) {
    return NextResponse.json({ error: "unknown image" }, { status: 404 });
  }
  const w = Math.max(80, Math.min(2000, Number(new URL(req.url).searchParams.get("w")) || 900));
  const upstream = `${GALLERY_CDN}/${file}/:/rs=w:${w}`;

  try {
    const r = await fetch(upstream, {
      headers: { Referer: "https://baronesstattoo.com/", "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) return NextResponse.json({ error: `upstream ${r.status}` }, { status: 502 });
    const buf = await r.arrayBuffer();
    return new Response(buf, {
      headers: {
        "Content-Type": r.headers.get("content-type") || "image/jpeg",
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy failed" }, { status: 500 });
  }
}
