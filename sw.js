const CACHE_NAME = 'malinche-radio';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/js/lunaradio-sincors.js',
        // Agrega aquí los recursos adicionales que tu PWA necesita en caché
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminamos lo que ya no se necesita en cache
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    // Le indica al SW activar el cache actual
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Responder con el objeto en caché si existe
      if (response) {
        return response;
      }

      // De lo contrario, realizar la solicitud a la red
      return fetch(event.request).then((networkResponse) => {
        // Si la solicitud es válida, abrimos el caché y la almacenamos para futuras solicitudes
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }

        // Si la solicitud no es válida, simplemente la devolvemos
        return networkResponse;
      });
    })
  );
});
