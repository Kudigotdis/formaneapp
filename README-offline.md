# Wirog Offline / Sync — Quick Test & Setup

This file explains how to test the offline pieces we added without modifying `index.html`.

Files added:
- `sw.js` — Service worker (caching, background sync hooks)
- `sync.js` — `SyncQueue` (client IndexedDB queue and flush logic)
- `manifest.json` — PWA manifest (icons placeholders)
- `sw-register.js` — service worker registration helper (call from your app)
- `sync-spec.md` — server sync API spec
- `drive-oauth-plan.md` — Google Drive integration plan
- `sync-inspector.html` — small UI to inspect the local sync queue
- `mock-sync-server.js` — simple Node server for `/sync/commit` (local testing)
- `tests/pricing_preview.html` — PricingEngine quick test harness

Local test steps (development):

1) Serve the project over HTTPS or localhost
- Service workers require HTTPS or `localhost`.
- Use a simple static server for local testing. Example (npm):

```bash
# from project root
npx http-server -c-1 -p 8080
# or use live-server, serve, or your dev server
```

2) Start the mock sync server (node)
- Requires Node.js installed.

```bash
node mock-sync-server.js
# Server will listen on http://localhost:3000
```

3) Open the app in the browser (http://localhost:8080)
- Do NOT modify `index.html` — instead, open the console and run:

```js
// In browser console (after page loads)
const s = document.createElement('script');
s.src = '/sw-register.js';
document.head.appendChild(s);
// Then register and enable background sync
window.registerWirogSW().then(async r => { console.log(r); if (r.ok) await r.ensureBackgroundSync?.(); });

// Load sync helper and optionally enqueue a test item
const s2 = document.createElement('script'); s2.src = '/sync.js'; document.head.appendChild(s2);
// After sync.js loads:
// window.SyncQueue.enqueue('test', { foo: 'bar' }).then(it=>console.log('enqueued',it));
```

4) Use the Sync Inspector
- Open `/sync-inspector.html` in the same host to view queued items and trigger flushes.
- Click "Flush Now" to call `SyncQueue.flush()` — it posts to `/sync/commit` (mock server).

5) Testing background sync
- If your browser supports Background Sync, `ensureBackgroundSync()` will register a sync event. You can simulate being offline, enqueue items, then go online and the SW will trigger the `sync` event which posts a message to the page to flush the queue.

6) Notes & next steps
- To integrate in the app proper, add a `script` tag for `sw-register.js` and `sync.js` in `index.html` during your IDE integration step.
- Update `SyncQueue.syncEndpoint` to point to your real backend `https://api.yourhost.com/sync/commit`.
- For production, run the app over HTTPS. Consider using a reverse proxy to terminate TLS.

7) Mock server behavior
- `mock-sync-server.js` supports idempotency via `Idempotency-Key` and returns `serverId`.

If you want, I can now:
- Add Jest unit tests for `PricingEngine` and `WirogDB` wrappers; or
- Implement a small Node `sync-proxy` that accepts flushes and writes to a local JSON file; or
- Start integrating hooks into `items.js`/`promos.js` to enqueue submissions into `SyncQueue` when offline.

Which should I do next?