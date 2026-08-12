import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for static/ISR rendering (generateStaticParams,
// revalidated pages, the sitemap). The cookie-bound server client in
// ./server.ts forces dynamic rendering; this one reads only public,
// RLS-protected data and can run at build time. Returns null when Supabase
// isn't configured so callers can degrade gracefully.
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
