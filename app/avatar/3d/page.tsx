import MeshyGallery from "./MeshyGallery";
import ComingSoon from "../../ComingSoon";
import { EXPERIMENTS_ENABLED } from "@/lib/flags";

export const metadata = {
  title: "3D Avatar Gallery · Baroness Tattoo Estate",
};

// The model list is fetched client-side from /api/meshy/models (signed URLs are
// short-lived, so we want them fresh on each visit rather than baked at build).
export default function Avatar3DPage() {
  if (!EXPERIMENTS_ENABLED) return <ComingSoon title="The Court in 3D is being prepared" />;
  return <MeshyGallery />;
}
