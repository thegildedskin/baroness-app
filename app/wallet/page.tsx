import Wallet from "./Wallet";

export const metadata = {
  title: "The Purse · Baroness Tattoo Estate",
};

// The gem wallet view — balance + transaction ledger (server-authoritative).
export default function WalletPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 480px at 18% -8%, var(--quarter-plum) 0%, transparent 60%), linear-gradient(180deg, var(--quarter-ink), var(--quarter-ink-2))",
      }}
    >
      <Wallet />
    </main>
  );
}
