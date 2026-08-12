import { redirect } from "next/navigation";
import CommissionFlow from "./CommissionFlow";
import { EXPERIMENTS_ENABLED } from "@/lib/flags";

export const metadata = {
  title: "The Commission · Baroness Tattoo Estate",
};

// Rendered per-request: a statically prerendered redirect() loses its
// Location header, so the paused-experiments redirect must stay dynamic.
export const dynamic = "force-dynamic";

// The "scenic route" guided booking (Bastien, gems, Atelier tie-ins).
// While experiments are paused, send visitors straight to the real
// deposit flow at /book so no booking intent is ever lost.
export default function CommissionPage() {
  if (!EXPERIMENTS_ENABLED) redirect("/book");
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 420px at 50% -12%, rgba(184,146,74,.14), transparent 60%), linear-gradient(180deg, var(--estate-black), var(--velvet))",
      }}
    >
      <CommissionFlow />
    </main>
  );
}
