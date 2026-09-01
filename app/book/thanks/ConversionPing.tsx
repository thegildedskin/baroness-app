"use client";

import { useEffect } from "react";

// Fires conversion events once when the deposit-paid thank-you page renders
// (Stripe success_url → /book/thanks?ok=1). No-ops if GA / the Meta Pixel
// aren't loaded. The Meta Purchase event is what lets Meta ads optimize for
// people who actually pay deposits, not just clicks.
export default function ConversionPing() {
  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void };
    try {
      w.gtag?.("event", "deposit_completed", {
        event_category: "booking",
        value: 100,
        currency: "USD",
      });
    } catch { /* analytics is best-effort */ }
    try {
      w.fbq?.("track", "Purchase", { value: 100, currency: "USD", content_name: "consultation_deposit" });
    } catch { /* analytics is best-effort */ }
  }, []);
  return null;
}
