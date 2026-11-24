// Offline support. Online: always fetch the latest files (network first), and keep a copy.
// Offline: serve the saved copy. Bump VERSION when you change the file list.
const VERSION = "ccc-v4";
const FILES = ["./", "index.html", "app.js", "pathways/acs.js", "pathways/pe.js", "pathways/dvt.js", "pathways/als.js", "pathways/asthma.js", "pathways/anaph.js", "pathways/sepsis.js", "pathways/whys.js", "pathways/mech.js", "abx.html", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(e.request, {cache: "no-cache", signal: ctrl.signal}); clearTimeout(t);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      return (await cache.match(e.request, {ignoreSearch: true})) || (await cache.match("index.html"));
    }
  })());
});
