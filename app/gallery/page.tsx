import Gallery from "./Gallery";

export const metadata = {
  title: "The Gallery · Baroness Tattoo Estate",
  description: "A portrait hall of Baroness Tattoo's work — Garland, TX.",
};

export default function GalleryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Gallery />
    </main>
  );
}
