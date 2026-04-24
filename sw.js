const CACHE_NAME = 'laundry-system-v1';
const urlsToCache = [
  '/De-Supreme-Laundry-Management-System-/',
  '/De-Supreme-Laundry-Management-System-/index.html',
  '/De-Supreme-Laundry-Management-System-/adminTransEntry.html',
  '/De-Supreme-Laundry-Management-System-/finance.html',
  '/De-Supreme-Laundry-Management-System-/finance2.html',
  '/De-Supreme-Laundry-Management-System-/crm.html',
  '/De-Supreme-Laundry-Management-System-/scheduling.html',
  '/De-Supreme-Laundry-Management-System-/marketing.html',
  '/De-Supreme-Laundry-Management-System-/systems.html'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('[SW] Cache failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (!url.pathname.startsWith('/De-Supreme-Laundry-Management-System-/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
