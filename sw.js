const CACHE = 'wirog-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/manifest.json',
  '/assets/icons/pwa/icon-192.png',
  '/assets/icons/pwa/icon-512.png',
  '/data.js',
  '/demo-data.js',
  '/demo-profiles.js',
  '/db.js',
  '/user-state.js',
  '/auth.js',
  '/utils.js',
  '/pricing-engine.js',
  '/wirog_product_categories.js',
  '/filter.js',
  '/navigation.js',
  '/router.js',
  '/promos.js',
  '/directory.js',
  '/notes.js',
  '/account.js',
  '/admin.js',
  '/items.js',
  '/app.js',
  '/blogs.js',
  '/sync.js',
  '/media-cache.js',
  '/path-utils.js',
  '/mode-controller.js',
  '/ui-helpers.js',
  '/backend-logic.js',
  '/ui-styles.css',
  '/sw-register.js',
  '/drive-api.js',
  '/google-config.js',
  '/locations.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(r => r || caches.match('/index.html') || fetch(e.request)).catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, copy));
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
