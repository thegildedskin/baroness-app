import { NextResponse } from "next/server";
import { getReviews } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin wrapper for client-side consumers (the homepage ReviewsTicker).
// The fetch/fallback logic lives in lib/reviews.ts, shared with /reviews.
export async function GET() {
  return NextResponse.json(await getReviews());
}
