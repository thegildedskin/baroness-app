import { NextResponse } from "next/server";
import { listMeshyModels } from "@/lib/meshy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Streams a model's GLB through our own origin so the browser isn't blocked by
// CORS on Meshy's signed asset URLs. GET /api/meshy/model/<id>
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    let models = await listMeshyModels(); // 5-min cached; signed URLs last far longer
    let model = models.find((m) => m.id === params.id);
    if (!model) {
      models = await listMeshyModels({ force: true }); // cache miss → refresh once
      model = models.find((m) => m.id === params.id);
    }
    if (!model?.glbUrl) {
      console.error("[meshy proxy] model not found:", params.id);
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const upstream = await fetch(model.glbUrl);
    if (!upstream.ok) {
      console.error("[meshy proxy] upstream", upstream.status, "for", params.id);
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e: any) {
    console.error("[meshy proxy] error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Proxy failed" }, { status: 500 });
  }
}
