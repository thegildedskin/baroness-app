import type { MetadataRoute } from "next";
import { fetchPublishedArtists } from "@/lib/artists";
import { STYLE_PAGES } from "@/lib/styles";
import { SITE_URL } from "@/lib/studio";

// Regenerated hourly alongside the artist pages (ISR), so new artists are
// picked up without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const staticPages: MetadataRoute.Sitemap = [
    page("/", 1, "weekly"),
    page("/book", 0.9, "monthly"),
    page("/artists", 0.9, "weekly"),
    page("/shop", 0.7, "weekly"),
    page("/reviews", 0.7, "weekly"),
    page("/gallery", 0.7, "weekly"),
    page("/faq", 0.6, "monthly"),
    page("/aftercare", 0.6, "monthly"),
    page("/prep-guide", 0.6, "monthly"),
    page("/styles", 0.7, "monthly"),
  ];

  // The style+city landing pages — static, from the const array.
  const stylePages: MetadataRoute.Sitemap = STYLE_PAGES.map((s) => page(`/styles/${s.slug}`, 0.8, "monthly"));

  const artists = await fetchPublishedArtists();
  const artistPages: MetadataRoute.Sitemap = artists.map((a) => page(`/artists/${a.slug}`, 0.8, "weekly"));

  return [...staticPages, ...stylePages, ...artistPages];
}
