const CACHE_NAME = 'laundry-v6';

const urlsToCache = [
    '/De-Supreme-Laundry-Management-System-/',
    '/De-Supreme-Laundry-Management-System-/index.html',
    '/De-Supreme-Laundry-Management-System-/crm.html',
    '/De-Supreme-Laundry-Management-System-/finance.html',
    '/De-Supreme-Laundry-Management-System-/adminTransEntry.html',
    '/De-Supreme-Laundry-Management-System-/app.js',
    '/De-Supreme-Laundry-Management-System-/manifest.json'
];

self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching files');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
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
