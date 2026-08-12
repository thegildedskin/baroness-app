import Kingdom from "./Kingdom";
import ComingSoon from "../ComingSoon";
import { EXPERIMENTS_ENABLED } from "@/lib/flags";

export const metadata = {
  title: "The Kingdom · Baroness Tattoo Estate",
};

// The gamified layer — court, lore, missions, hunt, achievements, Royal Ledger.
export default function KingdomPage() {
  if (!EXPERIMENTS_ENABLED) return <ComingSoon title="The Kingdom is being prepared" />;
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 480px at 18% -8%, var(--quarter-plum) 0%, transparent 60%), radial-gradient(900px 460px at 92% 4%, var(--quarter-umber) 0%, transparent 55%), linear-gradient(180deg, var(--quarter-ink), var(--quarter-ink-2))",
      }}
    >
      <Kingdom />
    </main>
  );
}
