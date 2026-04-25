 const CACHE_NAME = 'laundry-v8';

// Dynamically get the base path for GitHub Pages
const getBasePath = () => {
    const path = window.location.pathname;
    const basePath = path.substring(0, path.lastIndexOf('/') + 1);
    return basePath || './';
};

// URLs to cache - will be set dynamically during install
let urlsToCache = [];

self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    
    // Determine the base path from the request URL
    const basePath = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);
    
    urlsToCache = [
        basePath,
        basePath + 'index.html',
        basePath + 'crm.html',
        basePath + 'finance.html',
        basePath + 'adminTransEntry.html',
        basePath + 'app.js',
        basePath + 'manifest.json'
    ];
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW] Caching files:', urlsToCache);
            try {
                await cache.addAll(urlsToCache);
                console.log('[SW] Cache successful');
            } catch(e) {
                console.error('[SW] Cache failed for some files:', e);
            }
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                // Return offline page for navigation requests if needed
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline content not available');
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
