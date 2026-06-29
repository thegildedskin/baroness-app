import { NextResponse } from "next/server";
import { listMeshyModels } from "@/lib/meshy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/meshy/models           → cached list of the account's 3D models
// GET /api/meshy/models?refresh=1 → bypass the cache (fresh signed URLs)
export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("refresh") === "1";
  try {
    const models = await listMeshyModels({ force });
    return NextResponse.json({ count: models.length, models });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch Meshy models" },
      { status: 500 }
    );
  }
}
