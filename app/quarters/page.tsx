import QuartersRoom from "./QuartersRoom";

export const metadata = {
  title: "My Quarters · Baroness Tattoo Estate",
};

// The Kingdom's personal chamber — a walkable 3D room (SPEC_3d_quarters_glb).
// Client-rendered: reads/writes the shared `baroness-my-quarters` layout.
export default function QuartersPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 480px at 18% -8%, var(--quarter-plum) 0%, transparent 60%), linear-gradient(180deg, var(--quarter-ink), var(--quarter-ink-2))",
      }}
    >
      <QuartersRoom />
    </main>
  );
}
