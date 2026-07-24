import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Vision classifier — SPEC_vision_classifier. Tags a portfolio image with the
// fixed style/temperament taxonomy shared with the Commission matcher.
// Body: { image?: dataURL|https, title?: string, filename?: string }
// Returns: { styles:[{tag,confidence}], temperaments:[{tag,confidence}], source }
// where confidence is an integer percent (renders as "NN% sure").
//
// Runs server-side (images may contain client skin — keep them off third
// parties beyond the model provider; strip EXIF/GPS at the storage layer).
// Uses OpenAI vision when OPENAI_API_KEY is set; otherwise falls back to the
// prototype keyword heuristic so the Portfolio flow still works.

const STYLES = [
  "Traditional", "Neo-Traditional", "Realism", "Fine Line", "Blackwork",
  "Japanese", "Watercolor", "Geometric", "Chicano", "Dark Fantasy",
] as const;
const TEMPERAMENTS = ["Delicate", "Bold", "Dark", "Ornate", "Minimal"] as const;

type Tag = { tag: string; confidence: number };

function canon<T extends readonly string[]>(list: T, v: unknown): string | null {
  if (typeof v !== "string") return null;
  const hit = list.find((x) => x.toLowerCase() === v.trim().toLowerCase());
  return hit || null;
}
const pct = (n: unknown) => {
  let v = typeof n === "number" ? n : parseFloat(String(n));
  if (!isFinite(v)) v = 0;
  if (v > 0 && v <= 1) v *= 100; // allow 0..1 or 0..100
  return Math.max(0, Math.min(100, Math.round(v)));
};

// ── keyword heuristic (fallback + no-key path) ──────────────────────────────
const STYLE_HINTS: Record<string, string[]> = {
  Traditional: ["traditional", "old school", "sailor", "anchor", "swallow"],
  "Neo-Traditional": ["neo", "neotraditional"],
  Realism: ["realism", "realistic", "portrait", "photo"],
  "Fine Line": ["fine line", "fineline", "single needle", "thin"],
  Blackwork: ["blackwork", "black work", "solid black", "tribal"],
  Japanese: ["japanese", "irezumi", "koi", "dragon", "oni", "geisha"],
  Watercolor: ["watercolor", "watercolour", "splash", "brush"],
  Geometric: ["geometric", "sacred geometry", "mandala", "dotwork", "linework"],
  Chicano: ["chicano", "lettering", "clown", "lowrider"],
  "Dark Fantasy": ["dark fantasy", "demon", "skull", "gothic", "occult", "horror"],
};
const TEMP_HINTS: Record<string, string[]> = {
  Delicate: ["delicate", "fine", "soft", "small", "floral"],
  Bold: ["bold", "heavy", "large", "solid"],
  Dark: ["dark", "black", "gothic", "horror", "shadow"],
  Ornate: ["ornate", "ornamental", "filigree", "baroque", "detailed"],
  Minimal: ["minimal", "simple", "line", "clean"],
};
function heuristic(text: string): { styles: Tag[]; temperaments: Tag[] } {
  const t = text.toLowerCase();
  const score = (hints: Record<string, string[]>) =>
    Object.entries(hints)
      .map(([tag, kws]) => ({ tag, confidence: kws.some((k) => t.includes(k)) ? 66 : 0 }))
      .filter((x) => x.confidence > 0)
      .slice(0, 2);
  const styles = score(STYLE_HINTS);
  const temperaments = score(TEMP_HINTS);
  return {
    styles: styles.length ? styles : [{ tag: "Blackwork", confidence: 40 }],
    temperaments: temperaments.length ? temperaments : [{ tag: "Bold", confidence: 40 }],
  };
}

export async function POST(req: NextRequest) {
  let image: string | undefined;
  let title = "";
  let filename = "";
  try {
    const b = await req.json();
    image = typeof b.image === "string" ? b.image : undefined;
    title = (b.title || "").toString();
    filename = (b.filename || "").toString();
  } catch { /* noop */ }

  const key = process.env.OPENAI_API_KEY;

  // No key or no image → keyword heuristic on title/filename.
  if (!key || !image) {
    return NextResponse.json({ ...heuristic(`${title} ${filename}`), source: "heuristic" });
  }

  const instructions =
    "You classify tattoo photographs for a studio's portfolio. " +
    `Choose 1-2 STYLES strictly from: ${STYLES.join(", ")}. ` +
    `Choose 1-2 TEMPERAMENTS strictly from: ${TEMPERAMENTS.join(", ")}. ` +
    "Return ONLY JSON: {\"styles\":[{\"tag\":\"\",\"confidence\":0-100}],\"temperaments\":[{\"tag\":\"\",\"confidence\":0-100}]}. " +
    "Confidence is your certainty as a percent. Use only tags from the lists." +
    (title ? ` The artist titled it: "${title}".` : "");

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Respond with strict JSON only." },
          {
            role: "user",
            content: [
              { type: "text", text: instructions },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });
    const j = await r.json();
    const raw = j?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("no completion");
    const parsed = JSON.parse(raw);

    const styles: Tag[] = (parsed.styles || [])
      .map((s: any) => ({ tag: canon(STYLES, s.tag), confidence: pct(s.confidence) }))
      .filter((s: Tag) => s.tag)
      .slice(0, 2);
    const temperaments: Tag[] = (parsed.temperaments || [])
      .map((s: any) => ({ tag: canon(TEMPERAMENTS, s.tag), confidence: pct(s.confidence) }))
      .filter((s: Tag) => s.tag)
      .slice(0, 2);

    if (!styles.length && !temperaments.length) throw new Error("empty classification");
    return NextResponse.json({ styles, temperaments, source: "vision" });
  } catch {
    // graceful degrade to the heuristic rather than failing the upload
    return NextResponse.json({ ...heuristic(`${title} ${filename}`), source: "heuristic-fallback" });
  }
}
