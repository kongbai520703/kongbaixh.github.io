const CACHE_NAME = 'rollcall-v3.0';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    // 开发环境不缓存动态请求
    if (event.request.url.includes('/api')) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 返回缓存或网络请求
                return response || fetch(event.request)
                    .then(res => {
                        // 动态缓存重要资源
                        if (res && res.status === 200 && 
                            (res.type === 'basic' || 
                             res.url.includes('.css') || 
                             res.url.includes('.js'))) {
                            const resClone = res.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, resClone));
                        }
                        return res;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim());
});
