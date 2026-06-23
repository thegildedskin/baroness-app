import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Optional AI design generation. Activates only when OPENAI_API_KEY is set.
export async function POST(req: NextRequest) {
  let prompt = "";
  try { prompt = (await req.json()).prompt || ""; } catch { /* noop */ }
  if (!prompt.trim()) return NextResponse.json({ error: "Describe a design first." }, { status: 400 });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI design isn't configured yet (no image API key)." });
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: `Black and white tattoo line art, clean stencil, white background: ${prompt}`, size: "1024x1024", n: 1 }),
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
