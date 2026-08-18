/**
 * Service worker — what makes the web app open with no signal.
 *
 * The caching strategy here is deliberately split, because the two kinds of
 * file want opposite things:
 *
 *   The app itself (HTML, JS, CSS) — **network first**. When you publish a fix,
 *   everyone should get it the next time they open the app. A cache-first
 *   strategy would keep serving last month's code until the cache name changed,
 *   which is exactly the trap that makes people say "I published it but nothing
 *   happened". The cached copy is still there as the fallback, so a phone with
 *   no signal still opens instantly.
 *
 *   Icons and the manifest — **cache first**. They effectively never change,
 *   and re-fetching them costs a round trip for nothing.
 *
 * The trade for network-first is one quick request on launch when online. On a
 * dead connection that request fails fast and the cached copy is served, so the
 * offline experience is unaffected.
 */
const VERSION = "v2";
const APP_CACHE = `travel-translator-app-${VERSION}`;
const ASSET_CACHE = `travel-translator-assets-${VERSION}`;
const CACHES = [APP_CACHE, ASSET_CACHE];

/** Precached so the very first offline launch works, before anything is visited. */
const APP_SHELL = ["./", "./index.html", "./app.js", "./styles.css"];
const ASSETS = [
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

/** How long to wait for the network before falling back to cache. */
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const [app, assets] = await Promise.all([caches.open(APP_CACHE), caches.open(ASSET_CACHE)]);
      // Individual puts, not addAll: addAll rejects the entire install if any
      // one file 404s, which would leave no cache at all rather than a partial
      // one.
      await Promise.allSettled([
        ...APP_SHELL.map((url) => app.add(url)),
        ...ASSETS.map((url) => assets.add(url)),
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !CACHES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

function isAsset(url) {
  return /\/icons\/|\.webmanifest$|\.png$|\.svg$|\.ico$/.test(url.pathname);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);

    if (response && response.ok) {
      // Clone before returning: a Response body can only be read once.
      cache.put(request, response.clone());
      return response;
    }
    throw new Error(`Bad response ${response?.status}`);
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // A navigation with nothing cached for that exact URL still has to render
    // something, and the shell is always cached.
    if (request.mode === "navigate") {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    return new Response("", { status: 504, statusText: "Offline and not cached" });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch cross-origin requests. The online translator in particular must
  // go straight to the network — a cached translation would be stale and, worse,
  // would make the app look like it works offline when it does not.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    isAsset(url) ? cacheFirst(request, ASSET_CACHE) : networkFirst(request, APP_CACHE)
  );
});
