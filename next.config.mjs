/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img1.wsimg.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // 301/308 redirects for the old GoDaddy site's URLs so existing Google
  // results and bookmarks keep working after the domain cutover.
  // (/shop exists at the same path on both sites — no redirect needed.)
  async redirects() {
    return [
      { source: "/main", destination: "/", permanent: true },
      { source: "/gallery-1", destination: "/gallery", permanent: true },
      { source: "/prep-guide-1", destination: "/prep-guide", permanent: true },
      { source: "/contact", destination: "/book", permanent: true },
      { source: "/employee", destination: "/login", permanent: true },
      { source: "/m/login", destination: "/login", permanent: true },
      { source: "/m/bookings", destination: "/book", permanent: true },
    ];
  },
};
export default nextConfig;
