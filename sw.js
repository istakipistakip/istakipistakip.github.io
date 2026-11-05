// İşTakip Mobil — çevrimdışı önbellek. Uygulama dosyaları değişince SURUM'u artırın.
// Açılış hızlı olsun diye uygulama dosyaları ÖNCE ÖNBELLEKTEN verilir (internet beklenmez).
// Yeni sürüm (bu dosyadaki SURUM değişince) arka planda indirilir; hazır olunca
// sayfa "Yeni sürüm yüklendi" notunu gösterir.
const SURUM = "istakip-mobil-v39";
const DOSYALAR = ["./", "index.html", "manifest.json", "leaflet.js", "leaflet.css", "ikon-180.png", "ikon-192.png", "ikon-512.png", "jspdf.min.js", "DejaVuSans-tr.ttf", "DejaVuSans-Bold-tr.ttf", "maplibre-gl.js", "maplibre-gl.css", "leaflet-rotate.js", "pdf.min.js", "pdf.worker.min.js"];
self.addEventListener("install", e => {
  // tarayıcının HTTP önbelleği atlanır: yeni sürümün dosyaları gerçekten yeni gelsin
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("istakip-mobil-") && k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Yalnızca uygulamanın kendi dosyaları. Harita karoları (uydu/sokak) burada önbelleğe alınmaz.
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;
  const sayfa = e.request.mode === "navigate";
  e.respondWith((async () => {
    const c = await caches.open(SURUM);
    const hit = sayfa ? (await c.match("index.html")) || (await c.match("./")) : await c.match(e.request, { ignoreSearch: true });
    if(hit) return hit;
    try{
      const r = await fetch(e.request);
      if(r && r.ok && !sayfa) c.put(e.request, r.clone());
      return r;
    }catch(err){
      return (await c.match("index.html")) || Response.error();
    }
  })());
});
