Foromane App — Offline Architecture & Android PWA Install Guide

Overview
- Goal: Make the app offline-first for Android (PWA) while preserving existing logic and NOT editing `index.html`.
- Key pieces implemented in repo (no `index.html` changes):
  - `sw.js` — service worker (app-shell caching, runtime caching, background sync message handling)
  - `sync.js` — `SyncQueue` (IndexedDB queue, enqueue/getAll/remove/clear/flush, exponential backoff)
  - `sw-register.js` — explicit SW registration helper (`registerForomaneSW()`)
  - `mock-sync-server.js` — Node mock server for `/sync/commit`
  - `E2E_TEST.md` — runbook for manual E2E tests

Architecture Summary
- App Shell: `sw.js` precaches core assets in `CORE_ASSETS`. Runtime cache handles images (cache-first), API/sync requests (network-first), and other assets (stale-while-revalidate).
- Queue & Flush: `SyncQueue` stores outbound sync tasks in IndexedDB (`foromane-sync`, store `queue`). The page owns flush logic (POST to `syncEndpoint`) and the SW notifies the page via `postMessage` when Background Sync fires.
- Idempotency: Outbound requests include an `Idempotency-Key` header (queue item `id`) so server apps can safely dedupe.
- Background Sync: SW registers a `foromane-sync` sync tag; `sw.js` listens for `sync` events and posts `{type:'run-sync'}` messages to clients; client page runs `window.SyncQueue.flush()` on receipt.
- Online handler: `sync.js` also triggers `SyncQueue.flush()` on `window.online` as a fallback if Background Sync isn't supported.

How to register the Service Worker (without editing `index.html`)
- Use the registration helper from the browser console or evaluate `sw-register.js` in DevTools. Example (open `http://localhost:8080` and paste):

```js
// Load the helper and register the SW
await fetch('/sw-register.js').then(r => r.text()).then(eval);
const res = await registerForomaneSW();
console.log(res);
// Optionally enable background sync helper
await res.ensureBackgroundSync?.();
```

- `sw-register.js` will try to set `window.SyncQueue.syncEndpoint` to `http://localhost:3000/sync/commit` when on `localhost` to simplify local testing.

Local E2E test (summary)
1) Start mock server: `node mock-sync-server.js` (port 3000).
2) Serve the app on `localhost` (e.g. `python -m http.server 8080` or `npx http-server -p 8080`).
3) Register SW via the console (snippet above).
4) Enqueue a test item:

```js
await window.SyncQueue.enqueue('promos', { id: 'console_test_' + Date.now(), title: 'Console E2E Test' }, { clientId: UserState.id });
await window.SyncQueue.flush();
```

5) Monitor mock server logs — it will print accepted items and demonstrates idempotency on duplicate `Idempotency-Key`.

Offline test (manual)
- In DevTools Network, set "Offline" and create a promo from the UI (or enqueue via console). Confirm item is in IndexedDB: Application → IndexedDB → `foromane-sync` → `queue`.
- Return Online — `SyncQueue.flush()` will run via the `online` handler or Background Sync.

Android PWA install guidance (no `index.html` edits required)
- Ensure `manifest.json` is present in repo (it is). Important fields to check or add if missing:
  - `name`, `short_name`, `start_url` (use `/` or `/index.html`), `display: 'standalone'`, `background_color`, `theme_color`, `icons` with appropriate sizes (192/512).
- Without editing `index.html`, register the SW and then prompt users to "Add to Home Screen" manually:
  - On Chrome for Android: open the site (must be served from `https://` or `http://localhost`), open DevTools > Application > Manifest to validate, then use the browser UI (three-dot menu) → "Add to Home screen".
  - Alternatively, use Chrome's install prompt when criteria are met (service worker registered + manifest present + served over HTTPS/localhost). Because we avoid `index.html` edits, the `beforeinstallprompt` event can't be auto-handled without adding script tags — so the user will rely on the browser's native add-to-home-screen UI or run `registerForomaneSW()` from a console-injected script / devtools snippet to ensure SW and manifest are registered.

Notes on Android behaviour
- Chrome shows the install prompt after the app is served over HTTPS (or localhost) and the manifest and SW are valid. Background sync availability may vary by Android version and Chrome policy.
- When the app is installed to Home screen, the SW's scope should remain `/` (default in `sw-register.js` uses `/sw.js` scope `/`) — ensure you serve the app at root during testing.

Server-side sync expectations
- The mock server accepts `POST /sync/commit` with JSON body `{ type, payload, meta }` and requires `Idempotency-Key` header. The server returns `{ status:'ok', serverId }` and returns the same `serverId` for duplicate keys.
- For production, implement idempotency via server-side store (key → serverId) and verify authentication/authorization.

Troubleshooting
- Service worker won't register: ensure page is served from `localhost` or `https`.
- `SyncQueue` undefined in page: ensure `sync.js` is loaded by the page. If not, evaluate it in console: `await fetch('/sync.js').then(r=>r.text()).then(eval);` (only for local/dev).
- BG Sync unavailable: rely on `window.online` flush fallback. Use `sw-register.js`'s `ensureBackgroundSync()` to request registration.
- IndexedDB entries visible in DevTools: Application → IndexedDB → `foromane-sync` → `queue`.

Recommended next improvements
- Implement server-side `/sync/commit` that verifies client identity and returns canonical server IDs (for mapping local items to server items).
- Add a small client-side dead-letter store or UI in `sync-inspector.html` for items that exceed retry attempts.
- Automate an E2E Puppeteer script to exercise SW registration, enqueue, offline/online transitions, and assert mock server receipts (I can add this if you'd like).

Files to review
- `sw.js`, `sync.js`, `sw-register.js`, `mock-sync-server.js`, `E2E_TEST.md`, `tests/pricing_engine_test.js`.

Contact
- If you want, I can add the Puppeteer E2E harness next (will add `package.json` devDeps and a script), or expand unit tests to cover `ForomaneDB` (requires an IndexedDB mock environment).