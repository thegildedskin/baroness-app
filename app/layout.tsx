import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, EB_Garamond, UnifrakturCook } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./SmoothScroll";

// Self-hosted at build time (next/font downloads + serves these locally — no
// runtime request to Google, no layout shift). Each exposes a CSS variable that
// app/globals.css maps onto the design-system font tokens (--display/--body/etc.).
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-ebgaramond", display: "swap" });
const unifraktur = UnifrakturCook({ subsets: ["latin"], weight: "700", variable: "--font-unifraktur", display: "swap" });

export const metadata: Metadata = {
  title: "Baroness Tattoo — Wear Your Crown",
  description:
    "Baroness Tattoo — a luxury studio in the decadence of the French Rococo. Garland, TX.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Baroness" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
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
        <SmoothScroll />
        {children}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
      </body>
    </html>
  );
}
