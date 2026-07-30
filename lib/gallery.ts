// Single source of truth for the gallery photos. Data lives in
// public/gallery/manifest.json (edit categories there; scripts read it too).
// Images are served through /api/gallery-img/[file], which proxies the studio's
// CDN server-side (bypassing its cross-domain hotlink block), so no download or
// self-hosting step is needed.

import manifest from "@/public/gallery/manifest.json";

export const GALLERY_CDN: string = manifest.cdn;
export const GALLERY: { file: string; category: string }[] = manifest.images;
export const GALLERY_FILES: string[] = GALLERY.map((g) => g.file);

/** Same-origin proxied URL for a gallery photo at a given render width. */
export function galleryImg(file: string, w = 900): string {
  return `/api/gallery-img/${encodeURIComponent(file)}?w=${w}`;
}
