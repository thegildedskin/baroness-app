import EstateBall from "./EstateBall";

export const metadata = {
  title: "The Estate Ball · Baroness Tattoo Estate",
};

// A shared-scene first pass (single-player): a candlelit ballroom populated with
// the court's GLB avatars. Real-time presence is a later backend phase.
export default function BallPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 480px at 82% -8%, var(--quarter-umber) 0%, transparent 60%), linear-gradient(180deg, var(--quarter-ink), var(--quarter-ink-2))",
      }}
    >
      <EstateBall />
    </main>
  );
}
