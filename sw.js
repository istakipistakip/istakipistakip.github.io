// İşTakip Mobil — çevrimdışı önbellek. Uygulama dosyaları değişince SURUM'u artırın.
const SURUM = "istakip-mobil-v35";
const DOSYALAR = ["./", "index.html", "manifest.json", "leaflet.js", "leaflet.css", "ikon-180.png", "ikon-192.png", "ikon-512.png", "jspdf.min.js", "DejaVuSans-tr.ttf", "DejaVuSans-Bold-tr.ttf", "maplibre-gl.js", "maplibre-gl.css", "leaflet-rotate.js", "pdf.min.js", "pdf.worker.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k))))); self.clients.claim(); });
// Yalnızca uygulamanın kendi dosyaları: önce internetten (güncel sürüm gelsin), olmazsa önbellekten.
// Harita karoları (uydu/sokak) önbelleğe alınmaz.
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
