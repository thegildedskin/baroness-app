// Single source of truth for the studio's real-world facts (NAP — name,
// address, phone — hours, socials, review links). Used by the public pages,
// the SEO layer (JSON-LD, sitemap, metadata) and transactional emails so the
// facts never drift between surfaces.

export const STUDIO = {
  name: "Baroness Tattoo",
  tagline: "Wear your crown.",
  description:
    "A fine-art tattoo studio in the decadence of the French Rococo — fine line, black & grey realism and illustrative work at Firewheel Town Center, Garland, TX.",
  address: {
    street: "315 Coneflower Dr",
    city: "Garland",
    state: "TX",
    zip: "75040",
    area: "Firewheel Town Center",
    full: "315 Coneflower Dr, Garland, TX 75040",
  },
  // Approximate coordinates for Firewheel Town Center, Garland TX.
  geo: { lat: 32.9643, lng: -96.6083 },
  phone: "(469) 246-7217",
  phoneHref: "tel:+14692467217",
  email: "baroness@baronesstattoo.com",
  // Mon–Sat 12–8, Sun 12–6
  hours: [
    { days: "Mon–Sat", open: "12:00 PM", close: "8:00 PM" },
    { days: "Sun", open: "12:00 PM", close: "6:00 PM" },
  ],
  rating: { value: 5.0, count: 31 },
  styles: ["Fine line", "Black & grey realism", "Illustrative / fine art"],
  mapUrl: "https://maps.google.com/?q=315+Coneflower+Dr+Garland+TX+75040",
  socials: {
    instagram: "https://www.instagram.com/baronesstattoo",
    facebook: "https://www.facebook.com/baronesstattoo",
    tiktok: "https://www.tiktok.com/@baronesstattoo",
    yelp: "https://www.yelp.com/biz/baroness-tattoo-garland",
  },
  // NOTE for the owner: replace with the real Google review short-link from
  // your Google Business Profile ("Ask for reviews" → share link, usually
  // https://g.page/r/XXXX/review). This search URL works meanwhile.
  googleReviewsUrl: "https://www.google.com/search?q=baroness+tattoo+garland",
  depositPolicy:
    "$100 non-refundable deposit, applied to your final price; reschedule up to 48 hours in advance.",
} as const;

/** Canonical site origin for metadata/sitemap (env-overridable). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baronesstattoo.com";
