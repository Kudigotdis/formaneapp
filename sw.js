const CACHE = 'wirog-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
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
  '/app.js'
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
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('Offline', { status: 503 })))
  );
});
