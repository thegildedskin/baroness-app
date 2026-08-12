import ArtistHub from "./ArtistHub";
import ComingSoon from "../ComingSoon";
import { EXPERIMENTS_ENABLED } from "@/lib/flags";

export const metadata = {
  title: "Artist Hub · Baroness Tattoo Estate",
};

// The artist business dashboard — 8 tabs. Portfolio tab wires to /api/classify.
// (Demo/design-kit data; paused behind the experiments flag until it's real.)
export default function ArtistHubPage() {
  if (!EXPERIMENTS_ENABLED) return <ComingSoon title="The Artist Hub is being prepared" note="Artists: your working dashboard lives in the Artists' Quarters — profile, flash, shop, payouts and messages are all there." />;
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 480px at 18% -8%, var(--quarter-plum) 0%, transparent 60%), radial-gradient(900px 460px at 92% 4%, var(--quarter-umber) 0%, transparent 55%), linear-gradient(180deg, var(--quarter-ink), var(--quarter-ink-2))",
      }}
    >
      <ArtistHub />
    </main>
  );
}
