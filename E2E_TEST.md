E2E Test Runbook — SW + SyncQueue + Mock Server

Goal
- Verify service worker registration, `SyncQueue` enqueue/flush, and mock server receipt of sync items.

Prerequisites
- Node.js installed
- Browser with Service Worker support (Chrome/Edge/Firefox)
- App served over `http://localhost:PORT` (SW requires a secure context or localhost)

Steps

1) Start mock sync server (workspace root):

```bash
node mock-sync-server.js
```

The server listens on port 3000 and logs accepted sync items.

2) Serve the app on localhost (workspace root). Example options:

```bash
# Option A: Python 3
python -m http.server 8080

# Option B: Node http-server (no install required if using npx)
npx http-server -p 8080
```

Open `http://localhost:8080` in your browser.

3) Register the service worker and ensure background sync helper (in browser console):

```js
// Load the registration helper and register SW
await fetch('/sw-register.js').then(r => r.text()).then(eval);
const res = await registerForomaneSW();
console.log('SW registration result:', res);

// Enable background sync helper if available
await res.ensureBackgroundSync?.();
```

Notes:
- `sw-register.js` will set `window.SyncQueue.syncEndpoint` to `http://localhost:3000/sync/commit` when running on localhost.
- If your app includes `sw-register.js` in build or you evaluate it from console, `registerForomaneSW()` is the one to call.

4) Verify `SyncQueue` is present and endpoint is correct:

```js
console.log('SyncQueue present?', !!window.SyncQueue);
console.log('Sync endpoint:', window.SyncQueue?.syncEndpoint);
```

5) Enqueue a test item from the console:

```js
await window.SyncQueue.enqueue('promos', { id: 'console_test_' + Date.now(), title: 'Console E2E Test' }, { clientId: UserState.id });
console.log('Queued:', await window.SyncQueue.getAll());
```

6) Flush immediately (while online) to POST to mock server:

```js
await window.SyncQueue.flush();
```

Observe the mock server terminal — it should log the accepted item and return a JSON response with `status: 'ok'`.

Offline / BG Sync test

1) In DevTools Network, set "Offline".
2) From the app UI, create a promo (or run the enqueue snippet above).
3) Confirm the queued item exists in IndexedDB: DevTools → Application → IndexedDB → `foromane-sync` → `queue`.
4) Switch DevTools Network back to "Online". The page `online` event will trigger `SyncQueue.flush()`; if background sync is supported it may trigger SW sync which posts a message to the page to flush.
5) Confirm the mock server received the item.

Quick server-side smoke test

You can run `test-sync-post.js` (already included) to validate the mock server's idempotency handling:

```bash
node test-sync-post.js
```

Troubleshooting

- "Service worker registration failed": ensure the page is served from `localhost` or over HTTPS.
- `SyncQueue` undefined: ensure `sync.js` is loaded by the page (it is included in the repo; evaluate it in the console to attach `window.SyncQueue`).
- BG Sync not available: background sync is not supported in all browsers; the `online` handler in `sync.js` will flush when connectivity returns.

Files of interest

- `sw.js` — service worker
- `sw-register.js` — registration helper (call `registerForomaneSW()` from console)
- `sync.js` — `SyncQueue` implementation
- `mock-sync-server.js` — mock server for `/sync/commit`
- `test-sync-post.js` — smoke test for the mock server

Next steps

- Run the E2E scenario above and confirm mock server logs in terminal.
- If you'd like, I can add a simple browser automation script (Puppeteer) to perform and assert the full flow automatically.
