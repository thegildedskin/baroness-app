import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/studio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/login",
          "/auth",
          "/artist-hub",
          "/wallet",
          "/kingdom",
          "/quarters",
          "/ball",
          "/studio",
          "/avatar",
          "/explore",
          "/commission",
          "/book/thanks",
          "/shop/thank-you",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
