import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GReview = { author_name: string; rating: number; text: string; relative_time_description?: string };

const SAMPLE = [
  { author: "A. Wodehouse", rating: 5, text: "Felt like being received at a private estate. Stunning fine-line work and a calm, gilded space.", time: "2 weeks ago" },
  { author: "M. Beaumont", rating: 5, text: "Designed exactly what I imagined. The studio is gorgeous and spotless.", time: "1 month ago" },
  { author: "R. Castellane", rating: 5, text: "Best tattoo experience I've had — professional, artistic, and the rococo vibe is unreal.", time: "1 month ago" },
  { author: "J. Pemberton", rating: 5, text: "Booked through the site, easy and elegant. Will be back for a full sleeve.", time: "2 months ago" },
];

export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const place = process.env.GOOGLE_PLACE_ID;
  if (key && place) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place}&fields=rating,user_ratings_total,reviews&reviews_sort=newest&language=en&key=${key}`;
      const r = await fetch(url, { next: { revalidate: 3600 } });
      const j = await r.json();
      const result = j.result || {};
      const reviews = ((result.reviews || []) as GReview[]).map((rv) => ({ author: rv.author_name, rating: rv.rating, text: rv.text, time: rv.relative_time_description }));
      if (reviews.length) return NextResponse.json({ live: true, rating: result.rating, total: result.user_ratings_total, reviews });
    } catch {
      /* fall through to sample */
    }
  }
  return NextResponse.json({ live: false, reviews: SAMPLE });
}
