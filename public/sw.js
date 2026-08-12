const C = "baroness-v2"; // bumped: v1 cached HTML cache-first (stale pages)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== C).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Network-first for pages: visitors always get fresh HTML; the cache is
    // only an offline fallback.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(C).then((cache) => cache.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static assets: cache-first with background refresh.
  e.respondWith(
    caches.open(C).then(async (cache) => {
      const cached = await cache.match(req);
      const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || net;
    })
  );
});
