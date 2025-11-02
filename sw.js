const CACHE_NAME = 'stellar-codex-cache-v3'; // Cache-Version erhöht für sauberes Update
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://aistudiocdn.com/react@19.2.0',
    'https://aistudiocdn.com/react-dom@19.2.0/client',
    'https://aistudiocdn.com/idb@8.0.3',
    'https://aistudiocdn.com/lucide-react@0.548.0',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap'
];

// Install: Cache all essential assets non-atomically for resilience
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Stellar Codex: Opened cache for installation.');
                // Unlike cache.addAll, this non-atomic approach prevents one failed request
                // from breaking the entire installation process, which is crucial for
                // handling potential CORS issues with third-party assets.
                const cachePromises = URLS_TO_CACHE.map(urlToCache => {
                    return cache.add(urlToCache).catch(err => {
                        console.warn(`Stellar Codex: Failed to cache ${urlToCache} during install.`, err);
                    });
                });
                return Promise.all(cachePromises);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Stellar Codex: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Implement network-first for navigation and stale-while-revalidate for assets
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // Strategy 1: Network-first for navigation requests (the HTML document itself)
    // This ensures users always get the latest version of the app shell if they are online.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If network fails, serve the main page from the cache.
                    return caches.match('/');
                })
        );
        return;
    }

    // Strategy 2: Stale-While-Revalidate for all other requests (JS, CSS, fonts, etc.)
    // This provides assets instantly from the cache for performance, then updates in the background.
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // If we get a valid response, update the cache for next time.
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(err => {
                 console.warn(`Stellar Codex: Fetch failed for ${event.request.url}`, err);
            });
            
            // Return from cache immediately if available, otherwise wait for the network.
            return cachedResponse || fetchPromise;
        })
    );
});