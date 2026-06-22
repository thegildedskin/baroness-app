/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img1.wsimg.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};
export default nextConfig;
