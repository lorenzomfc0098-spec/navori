/* Navori Studio — service worker: pages network-first (always fresh), assets cache-first. */
const V = "navori-v3";
const CORE = ["./", "index.html", "assets/app.js", "assets/fonts/sora.woff2", "img/mark.webp"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith(self.location.origin)) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => {
    if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
    return res;
  })));
});
