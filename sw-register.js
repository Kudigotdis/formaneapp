// sw-register.js — register the service worker and wire messages to SyncQueue
// Include this file from your app when ready (do NOT edit index.html here).

async function registerWirogSW() {
  if (!('serviceWorker' in navigator)) return { ok:false, reason: 'No SW support' };

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('Wirog SW registered', reg);

    // If background sync is supported, expose a helper to register it
    async function ensureBackgroundSync() {
      try {
        const ready = await navigator.serviceWorker.ready;
        if (ready.sync) {
          await ready.sync.register('wirog-sync');
          console.log('Background sync registered (wirog-sync)');
          return true;
        }
      } catch (e) { console.warn('Background Sync registration failed', e); }
      return false;
    }

    // Forward messages from SW to SyncQueue.flush
    navigator.serviceWorker.addEventListener('message', msg => {
      const d = msg.data || {};
      if (d && d.type === 'run-sync') {
        if (window.SyncQueue && typeof window.SyncQueue.flush === 'function') {
          window.SyncQueue.flush().then(r => console.log('SyncQueue.flush result', r)).catch(err => console.error('Sync flush error', err));
        }
      }
    });

      // If running on localhost, set SyncQueue endpoint to mock server for easier local testing
      try {
        if (window.SyncQueue && typeof window.SyncQueue === 'object') {
          const host = location.hostname;
          if (host === 'localhost' || host === '127.0.0.1') {
            window.SyncQueue.syncEndpoint = 'http://localhost:3000/sync/commit';
            console.log('SyncQueue.syncEndpoint set to http://localhost:3000/sync/commit for local testing');
          }
        }
      } catch(e) {}

      // If there's an active controller and SyncQueue exists, try to flush queued items (after endpoint set)
      if (navigator.serviceWorker.controller && window.SyncQueue) {
        try { await window.SyncQueue.flush(); } catch(e) { console.warn('Initial flush failed', e); }
      }

    return { ok:true, reg, ensureBackgroundSync };
  } catch (err) {
    console.error('SW registration failed', err);
    return { ok:false, reason: err.message };
  }
}

window.registerWirogSW = registerWirogSW;

// Auto-register when imported in a page (optional). Call `registerWirogSW()` explicitly from your app initialization if you prefer.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // do not auto-run — keep explicit to avoid touching index.html unexpectedly
}