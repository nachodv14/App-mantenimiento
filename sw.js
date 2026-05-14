const CACHE_NAME = 'mantenimiento-app-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia de red primero (Network First), cayendo a caché si no hay red
  // (Para mantener la app actualizada siempre que sea posible)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
