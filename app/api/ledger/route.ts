import { type NextRequest, NextResponse } from "next/server";
import { getLedger, type MintInput, type MintKind } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: MintKind[] = ["court-look", "livery", "garment", "trophy", "design-provenance"];

// GET /api/ledger            → every record (the ledger table)
// GET /api/ledger?owner=<id> → one collector's holdings
export async function GET(req: NextRequest) {
  const owner = new URL(req.url).searchParams.get("owner") || undefined;
  const records = await getLedger().list(owner);
  return NextResponse.json({ count: records.length, records });
}

// POST /api/ledger  { kind, name, series, ownerUserId, tier?, image?, designHash?, attributes? }
//   → mints a record into the royal ledger (optimistic; UI shows "minted").
export async function POST(req: NextRequest) {
  let body: Partial<MintInput> = {};
  try { body = await req.json(); } catch { /* noop */ }

  if (!body.kind || !KINDS.includes(body.kind)) {
    return NextResponse.json({ error: `kind must be one of ${KINDS.join(", ")}` }, { status: 400 });
  }
  if (!body.name || !body.series || !body.ownerUserId) {
    return NextResponse.json({ error: "name, series and ownerUserId are required" }, { status: 400 });
  }

  try {
    const record = await getLedger().mint(body as MintInput);
    return NextResponse.json({ record });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Mint failed" }, { status: 500 });
  }
}
