/**
 * QuickKit service worker.
 *
 * Static-export compatible. Caches the application shell, tool routes, and
 * static assets so the app keeps working offline. No push notifications.
 *
 * Strategy:
 * - precache the app shell on install (HTML routes + key static assets)
 * - runtime cache: cache-first for same-origin GET, with network fallback
 *   and a stale-while-revalidate flavour for navigations
 * - cleanup old caches on activate
 *
 * Registered from RuntimeEffects in production only.
 */

const VERSION = "quickkit-sw-v1";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  "/",
  "/guide",
  "/about",
  "/privacy",
  "/tools/unit-converter",
  "/tools/percentage",
  "/tools/qr",
  "/tools/password",
  "/tools/date",
  "/tools/text",
  "/tools/random",
  "/tools/color",
  "/manifest.webmanifest",
  "/icons/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/llms.txt",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Use addAll with a non-fatal pass — if any single asset fails we
      // don't want to break install. Add one-by-one and ignore failures.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            // ignore — the asset may not exist yet (e.g. dev).
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first with cache fallback for offline launch.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(RUNTIME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(RUNTIME);
          const cached = await cache.match(req);
          if (cached) return cached;
          // Try to serve a route's .html equivalent.
          const path = url.pathname;
          const alt = await cache.match(path + ".html") || await cache.match(path + "/index.html");
          if (alt) return alt;
          // Final fallback: the cached root.
          const root = await cache.match("/");
          if (root) return root;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  // Static assets: cache-first with network fallback.
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        // Only cache successful, same-origin, basic responses.
        if (fresh && fresh.ok && fresh.type === "basic") {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })()
  );
});
