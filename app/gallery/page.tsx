import Gallery from "./Gallery";
import PublicHeader from "../PublicHeader";
import InstagramStrip from "../InstagramStrip";

export const metadata = {
  title: "The Gallery · Baroness Tattoo Estate",
  description: "A portrait hall of Baroness Tattoo's work — Garland, TX.",
};

export default function GalleryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <Gallery />
      <InstagramStrip />
    </main>
  );
}
