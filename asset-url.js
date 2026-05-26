/* ════════════════════════════════════════════════════════
   WIROG ASSET URL - Image path resolver
   Routes relative paths → Firebase Storage CDN when enabled.
   ════════════════════════════════════════════════════════ */

window.__STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/wirog-app-93318.firebasestorage.app/o/';

window.useStorage = function (enabled) {
  if (enabled === void 0) return window.__USE_STORAGE === true;
  window.__USE_STORAGE = !!enabled;
};

window.assetUrl = function (relativePath) {
  if (!relativePath) return relativePath;
  if (/^https?:\/\//i.test(relativePath) || relativePath.startsWith('data:')) return relativePath;
  if (!window.useStorage()) return relativePath;
  return window.__STORAGE_BASE + encodeURIComponent(relativePath) + '?alt=media';
};

(function () {
  function stripOrigin(p) {
    try {
      var u = new URL(p, location.origin);
      return u.origin === location.origin ? u.pathname + u.search : p;
    } catch (_) { return p; }
  }

  function isAssetPath(p) {
    return /^assets\/(images|media|categories)\//.test(p);
  }

  function resolve(p) {
    if (!p || !isAssetPath(stripOrigin(p))) return p;
    return window.assetUrl(stripOrigin(p));
  }

  var nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (nativeDescriptor && nativeDescriptor.configurable) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: function () { return nativeDescriptor.get.call(this); },
      set: function (val) {
        nativeDescriptor.set.call(this, resolve(val));
      },
      configurable: true,
      enumerable: true
    });
  }

  function walk(root) {
    var imgs = root.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute('src');
      if (src && isAssetPath(stripOrigin(src))) {
        imgs[i].setAttribute('src', window.assetUrl(stripOrigin(src)));
      }
    }
    var sources = root.querySelectorAll('source');
    for (var j = 0; j < sources.length; j++) {
      var ssrc = sources[j].getAttribute('src');
      if (ssrc && isAssetPath(stripOrigin(ssrc))) {
        sources[j].setAttribute('src', window.assetUrl(stripOrigin(ssrc)));
      }
      var srcset = sources[j].getAttribute('srcset');
      if (srcset) {
        sources[j].setAttribute('srcset', srcset.split(',').map(function (part) {
          var p = part.trim().split(/\s+/), url = p[0], rest = p.slice(1).join(' ');
          if (isAssetPath(stripOrigin(url))) url = window.assetUrl(stripOrigin(url));
          return url + (rest ? ' ' + rest : '');
        }).join(', '));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { walk(document); });
  } else {
    walk(document);
  }

  var observer = new MutationObserver(function (mutations) {
    for (var m = 0; m < mutations.length; m++) {
      for (var n = 0; n < mutations[m].addedNodes.length; n++) {
        if (mutations[m].addedNodes[n].querySelectorAll) {
          walk(mutations[m].addedNodes[n]);
        }
      }
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
