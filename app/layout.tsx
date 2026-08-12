import type { Metadata } from "next";
import Script from "next/script";
import { Cinzel, Cormorant_Garamond, EB_Garamond, UnifrakturCook } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./SmoothScroll";
import BookButton from "./BookButton";
import { STUDIO, SITE_URL } from "@/lib/studio";

// GA4 — set NEXT_PUBLIC_GA_ID (G-XXXXXXX) to enable; renders nothing when unset.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// Self-hosted at build time (next/font downloads + serves these locally — no
// runtime request to Google, no layout shift). Each exposes a CSS variable that
// app/globals.css maps onto the design-system font tokens (--display/--body/etc.).
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-ebgaramond", display: "swap" });
const unifraktur = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--font-unifraktur", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Baroness Tattoo — Fine Art Tattoo Studio in Garland, TX (Firewheel)",
    template: "%s", // pages set full, unique titles themselves
  },
  description:
    "Baroness Tattoo — a fine-art tattoo studio in the decadence of the French Rococo. Fine line, black & grey realism and illustrative work at Firewheel Town Center, Garland, TX. 5.0★ on Google.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Baroness" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    type: "website",
    siteName: "Baroness Tattoo",
    locale: "en_US",
    url: SITE_URL,
    title: "Baroness Tattoo — Fine Art Tattoo Studio in Garland, TX (Firewheel)",
    description:
      "Fine line, black & grey realism and illustrative tattoos at Firewheel Town Center, Garland TX. 5.0★ · 31 Google reviews. Book with a $100 deposit.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Baroness Tattoo" }],
  },
  twitter: { card: "summary" },
};

// Local-business structured data (TattooParlor) — rendered site-wide so every
// indexable page carries the studio's NAP, hours, geo and rating.
const TATTOO_PARLOR_JSONLD = {
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  "@id": `${SITE_URL}/#studio`,
  name: STUDIO.name,
  description: STUDIO.description,
  url: SITE_URL,
  telephone: "+1-469-246-7217",
  email: STUDIO.email,
  priceRange: "$$",
  image: `${SITE_URL}/icon-512.png`,
  logo: `${SITE_URL}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: STUDIO.address.street,
    addressLocality: STUDIO.address.city,
    addressRegion: STUDIO.address.state,
    postalCode: STUDIO.address.zip,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: STUDIO.geo.lat, longitude: STUDIO.geo.lng },
  hasMap: STUDIO.mapUrl,
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "12:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "12:00", closes: "18:00" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: STUDIO.rating.value,
    reviewCount: STUDIO.rating.count,
    bestRating: 5,
  },
  sameAs: [STUDIO.socials.instagram, STUDIO.socials.facebook, STUDIO.socials.tiktok, STUDIO.socials.yelp],
};

export const viewport = { themeColor: "#0c0a08" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${ebGaramond.variable} ${unifraktur.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TATTOO_PARLOR_JSONLD) }} />
        <SmoothScroll />
        {children}
        <BookButton />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
