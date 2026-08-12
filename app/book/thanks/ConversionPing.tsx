"use client";

import { useEffect } from "react";

// Fires a GA4 conversion event once when the deposit-paid thank-you page
// renders (Stripe success_url → /book/thanks?ok=1). No-ops if GA isn't loaded.
export default function ConversionPing() {
  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    try {
      w.gtag?.("event", "deposit_completed", {
        event_category: "booking",
        value: 100,
        currency: "USD",
      });
    } catch { /* analytics is best-effort */ }
  }, []);
  return null;
}
