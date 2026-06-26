import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// AI avatar / likeness generation. Mirrors the tattoo route but produces a
// character portrait. Activates only when OPENAI_API_KEY is set.
//
// Body: { prompt: string, image?: string (data URL), portrait?: boolean }
//  - prompt  : the composed description (see app/avatar/creatorOptions.ts)
//  - image   : optional reference photo → uses the image-edits endpoint so the
//              result keeps the person's likeness ("create from image")
//  - portrait: true → tall 1024x1536 (full figure); false → 1024x1024 bust
export async function POST(req: NextRequest) {
  let prompt = "";
  let image: string | undefined;
  let portrait = true;
  try {
    const body = await req.json();
    prompt = (body.prompt || "").toString();
    image = typeof body.image === "string" ? body.image : undefined;
    portrait = body.portrait !== false;
  } catch { /* noop */ }

  if (!prompt.trim() && !image) {
    return NextResponse.json({ error: "Describe your character first." }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI avatars aren't configured yet (no image API key)." });

  const size = portrait ? "1024x1536" : "1024x1024";
  const styled =
    "Full-body character portrait of a single subject, centered, standing, " +
    "elegant neutral studio background, soft flattering light, high detail, " +
    "tasteful. " + prompt.trim();

  try {
    // ── Create from image (reference photo → keep likeness) ──────────────────
    if (image) {
      const m = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!m) return NextResponse.json({ error: "Reference image must be a data URL." });
      const bytes = Buffer.from(m[2], "base64");
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", styled);
      form.append("size", size);
      form.append("n", "1");
      form.append("image", new Blob([bytes], { type: m[1] }), "reference.png");

      const r = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
      const j = await r.json();
      const b64 = j?.data?.[0]?.b64_json;
      const url = j?.data?.[0]?.url;
      if (b64) return NextResponse.json({ image: `data:image/png;base64,${b64}` });
      if (url) return NextResponse.json({ image: url });
      return NextResponse.json({ error: j?.error?.message || "No image returned." });
    }

    // ── Create from scratch (tags + text) ────────────────────────────────────
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: styled, size, n: 1 }),
    });
    const j = await r.json();
    const b64 = j?.data?.[0]?.b64_json;
    const url = j?.data?.[0]?.url;
    if (b64) return NextResponse.json({ image: `data:image/png;base64,${b64}` });
    if (url) return NextResponse.json({ image: url });
    return NextResponse.json({ error: j?.error?.message || "No image returned." });
  } catch {
    return NextResponse.json({ error: "AI request failed." });
  }
}
