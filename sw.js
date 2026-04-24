const CACHE_NAME = 'laundry-v2';
const BASE_PATH = '/De-Supreme-Laundry-Management-System-';

const urlsToCache = [
    BASE_PATH + '/',
    BASE_PATH + '/index.html',
    BASE_PATH + '/crm.html',
    BASE_PATH + '/finance.html',
    BASE_PATH + '/adminTransEntry.html',
    BASE_PATH + '/app.js',
    BASE_PATH + '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache files
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip cross-origin requests for Firebase and external APIs
    if (url.origin !== location.origin && 
        !url.href.includes('cdnjs') && 
        !url.href.includes('cdn.jsdelivr.net')) {
        return;
    }
    
    // Only handle requests for our app path
    if (!url.pathname.startsWith(BASE_PATH) && url.origin === location.origin) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                }).catch(() => {
                    // Fallback for offline - return cached index.html for navigation
                    if (event.request.mode === 'navigate') {
                        return caches.match(BASE_PATH + '/index.html');
                    }
                    return new Response('Offline - Please check your connection', { status: 503 });
                });
            })
    );
});

// Activate event - clean up old caches
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