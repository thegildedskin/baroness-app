import CommissionFlow from "./CommissionFlow";

export const metadata = {
  title: "The Commission · Baroness Tattoo Estate",
};

// The booking spine — the $100-deposit consultation flow, guided by Bastien.
export default function CommissionPage() {
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
