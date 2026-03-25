const CACHE_VERSION = "v1";
const APP_SHELL_CACHE = `elivestock-pwa-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `elivestock-pwa-runtime-${CACHE_VERSION}`;
const APP_SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/pwa-192.png",
  "/pwa-512.png",
];

function isHttpRequest(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

async function addAppShellToCache() {
  const cache = await caches.open(APP_SHELL_CACHE);
  await cache.addAll(
    APP_SHELL_ASSETS.map((assetUrl) => new Request(assetUrl, { cache: "reload" }))
  );
}

async function cleanupOldCaches() {
  const validCaches = new Set([APP_SHELL_CACHE, RUNTIME_CACHE]);
  const cacheKeys = await caches.keys();

  await Promise.all(
    cacheKeys
      .filter((cacheKey) => cacheKey.startsWith("elivestock-pwa-") && !validCaches.has(cacheKey))
      .map((cacheKey) => caches.delete(cacheKey))
  );
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

async function networkFirstNavigation(event) {
  const { request } = event;
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const navigationPreloadResponse = await event.preloadResponse;

    if (navigationPreloadResponse) {
      cache.put(request, navigationPreloadResponse.clone());
      return navigationPreloadResponse;
    }

    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (_error) {
    const cachedResponse =
      (await caches.match(request)) || (await caches.match("/"));

    if (cachedResponse) {
      return cachedResponse;
    }

    throw _error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(addAppShellToCache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await cleanupOldCaches();
      await self.registration.navigationPreload?.enable?.();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (!isHttpRequest(url) || !isSameOrigin(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  const cacheableDestinations = ["document", "script", "style", "image", "font"];

  if (cacheableDestinations.includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
