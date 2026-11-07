// Modo sin internet: guarda las páginas e imágenes la primera vez que se cargan.
// Cambia VERSION al publicar cambios para que los iPads bajen la versión nueva.
const VERSION = 'psf-1';
const BASE = ['./', 'index.html', 'juego.html', 'referencias.html', 'foto.html', 'manifest.webmanifest',
  'assets/fondos.js', 'assets/sprites.js', 'assets/opengameart/heart.png', 'assets/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// páginas: primero la red (para ver cambios) y si no hay internet, la copia guardada; lo demás: primero la copia
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const save = res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };
  if (req.mode === 'navigate') e.respondWith(fetch(req).then(save).catch(() => caches.match(req)));
  else e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
});
