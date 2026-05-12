/* ════════════════════════════════════════════════════════
   WIROG MEDIA CACHE - IndexedDB blob cache for promo media
   + WIROG_IMG_MODE — Online/Offline/Saved mode controller
   ════════════════════════════════════════════════════════ */

const WirogMediaCache = {
  async init() {},

  async get(url) {
    return window.WirogDB.get('mediaCache', url);
  },

  async put(url, blob, contentType) {
    return window.WirogDB.put('mediaCache', {
      url: url,
      blob: blob,
      contentType: contentType || blob.type || 'image/png',
      cachedAt: Date.now(),
      size: blob.size
    });
  },

  async delete(url) {
    return window.WirogDB.delete('mediaCache', url);
  },

  async clear() {
    return window.WirogDB.clear('mediaCache');
  },

  async cacheImage(url) {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Fetch failed: ' + response.status);
    const blob = await response.blob();
    await this.put(url, blob);
    return blob;
  },

  /**
   * TASK 1: Weekly Package Manifest Sync
   * Fetches a list of URLs and caches them sequentially.
   */
  async syncFromManifest(manifestUrl, onProgress) {
    try {
      const response = await fetch(manifestUrl);
      const urls = await response.json();
      
      if (!Array.isArray(urls)) throw new Error('Invalid manifest format');

      let completed = 0;
      for (const url of urls) {
        const cached = await this.get(url);
        if (!cached) {
          try {
            await this.cacheImage(url);
          } catch (e) {
            console.warn(`Failed to cache ${url}:`, e);
          }
        }
        completed++;
        if (onProgress) onProgress(completed, urls.length);
      }
      return { total: urls.length, cached: completed };
    } catch (error) {
      console.error('Manifest Sync Error:', error);
      throw error;
    }
  },

  async cacheAll(promos, onProgress) {
    const urls = new Set();
    (promos || []).forEach(p => {
      (p.images || []).forEach(img => {
        if (img && !img.startsWith('data:')) urls.add(img);
      });
    });
    const arr = Array.from(urls);
    let completed = 0;
    for (const url of arr) {
      const cached = await this.get(url);
      if (!cached) {
        try { await this.cacheImage(url); } catch(e) { /* skip unfetchable */ }
      }
      completed++;
      if (onProgress) onProgress(completed, arr.length);
    }
    return { total: arr.length, cached: completed };
  },

  async getInfo() {
    const all = await window.WirogDB.getAll('mediaCache');
    let totalSize = 0;
    (all || []).forEach(entry => totalSize += (entry.size || 0));
    return { count: (all || []).length, totalSizeBytes: totalSize, totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2) };
  }
};

window.WirogMediaCache = WirogMediaCache;

/* ─── IMAGE MODE CONTROLLER ─── */

const WIROG_IMG_MODE = {
  current: localStorage.getItem('wirog_img_mode') || 'saved',

  set(mode) {
    this.current = mode;
    localStorage.setItem('wirog_img_mode', mode);
    this.updateUI();
    if (typeof renderPromos === 'function') renderPromos();
  },

  getImgSrc(originalUrl) {
    if (!originalUrl) return '';
    if (originalUrl.startsWith('data:')) return originalUrl;
    if (this.current === 'online') return originalUrl;
    if (this.current === 'offline') return 'assets/media/offline-mode-image.png';
    return 'assets/media/wirog_place_holder_image_blank.webp';
  },

  needsAsyncResolve(originalUrl) {
    return !!(originalUrl && !originalUrl.startsWith('data:') && this.current === 'saved');
  },

  /**
   * TASK 3: Smart Fallback
   * Checks assets/categories/ (Live) before defaulting to cache.
   */
  async resolve(originalUrl) {
    if (!originalUrl) return '';
    
    // Skip cache for Data URLs entirely
    if (originalUrl.startsWith('data:')) return originalUrl;
    
    if (this.current === 'online') return originalUrl;
    if (this.current === 'offline') return 'assets/media/offline-mode-image.png';

    // SMART FALLBACK: Check if it's already a local category asset
    if (originalUrl.startsWith('assets/categories/')) {
        return originalUrl;
    }

    const result = await WirogMediaCache.get(originalUrl);
    if (result) return URL.createObjectURL(result.blob);

    if (navigator.onLine) {
      try {
        const blob = await WirogMediaCache.cacheImage(originalUrl);
        return URL.createObjectURL(blob);
      } catch(e) {
        return 'assets/media/no_link.png';
      }
    }
    return 'assets/media/no_link.png';
  },

  async resolveAll(images) {
    const results = {};
    for (const url of images) {
      results[url] = await this.resolve(url);
    }
    return results;
  },

  updateUI() {
    document.querySelectorAll('.img-mode-option').forEach(function(el) {
      el.classList.toggle('active', el.dataset.mode === WIROG_IMG_MODE.current);
  }
};

window.WirogMediaCache = WirogMediaCache;
window.WIROG_IMG_MODE = WIROG_IMG_MODE;

async function downloadMediaPackage() {
  var allPromos = [].concat(window._promos || [], window._userItems || []);
  var statusEl = document.getElementById('media-cache-status');
  if (!allPromos.length) {
    if (statusEl) statusEl.textContent = 'No media';
    showToast('No promos to cache');
    return;
  }
  var count = 0;
  allPromos.forEach(function(p) {
    if (p.images) count += p.images.filter(function(i) { return i && !i.startsWith('data:'); }).length;
  });
  if (!count) {
    if (statusEl) statusEl.textContent = '0';
    showToast('All media already local');
    return;
  }
  if (statusEl) statusEl.textContent = '0/' + count + '...';
  await WirogMediaCache.cacheAll(allPromos, function(done, total) {
    if (statusEl) statusEl.textContent = done + '/' + total;
  });
  var info = await WirogMediaCache.getInfo();
  if (statusEl) statusEl.textContent = info.count + ' (' + info.totalSizeMB + 'MB)';
  showToast('Media cached: ' + info.count + ' files (' + info.totalSizeMB + 'MB)');
}
