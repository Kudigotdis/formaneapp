/* ════════════════════════════════════════════════════════
   FOROMANE DRIVE API — Browser Google Drive Client
   Uses Google Identity Services (GIS) for OAuth 2.0
   Drive API v3 via fetch — no gapi client library needed
   ════════════════════════════════════════════════════════ */

;(function() {

  var SCOPES = 'https://www.googleapis.com/auth/drive.file';
  var DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

  var GIS_URL = 'https://accounts.google.com/gsi/client';

  var tokenClient = null;
  var accessToken = null;
  var gisLoaded = false;
  var initPromise = null;

  var onSignInCallbacks = [];
  var onSignOutCallbacks = [];

  /* ─── Internal helpers ─── */

  function loadGIS() {
    return new Promise(function(resolve, reject) {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        gisLoaded = true;
        return resolve();
      }
      var s = document.createElement('script');
      s.src = GIS_URL;
      s.async = true;
      s.defer = true;
      s.onload = function() { gisLoaded = true; resolve(); };
      s.onerror = function() { reject(new Error('Failed to load GIS')); };
      document.head.appendChild(s);
    });
  }

  function buildConfig() {
    var c = window.googleConfig || {};
    return {
      clientId: c.clientId || '977050279257-97rltt8ldnr96fgmi4klbsglgrlavk97.apps.googleusercontent.com',
      clientsRootId: c.clientsRootId || '1PEvHwhoxe0eQ75G2Gs_bfMsUBV5mMGPA',
      usersFolderId: c.usersFolderId || null,
      prosFolderId: c.prosFolderId || null,
      businessesFolderId: c.businessesFolderId || null,
      folderSchema: c.folderSchema || {
        user: { subfolders: ['profile_picture','notes','documents'], files: ['liked_promos.json','favourite_suppliers.json','notes_index.json','kpi_cache.json','subscription.json'] },
        pro: { subfolders: ['portfolio','promos','catalogue','cover_photo','documents','staff','reviews'], files: ['profile.json'] },
        business: { subfolders: ['logo','profile','promos','catalogue','cover_photo','staff','documents','reviews'], files: ['business_profile.json'] }
      }
    };
  }

  function ensureSignedIn() {
    if (!accessToken) throw new Error('Not signed in. Call DriveAPI.signIn() first.');
  }

  /* ─── Drive API raw request ─── */

  async function api(method, path, body) {
    ensureSignedIn();
    var url = 'https://www.googleapis.com/drive/v3/' + path;
    var opts = {
      method: method,
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    };
    if (body) {
      if (body instanceof FormData || body instanceof Blob) {
        opts.body = body;
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }
    var res = await fetch(url, opts);
    if (res.status === 401) {
      accessToken = null;
      throw new Error('Token expired. Call DriveAPI.signIn() again.');
    }
    if (res.status === 204) return null;
    var text = await res.text();
    if (!res.ok) {
      var err;
      try { err = JSON.parse(text); } catch(e) { err = { error: { message: text } }; }
      throw new Error(err.error && err.error.message ? err.error.message : 'Drive API error ' + res.status);
    }
    try { return JSON.parse(text); } catch(e) { return text; }
  }

  /* ─── Multipart upload helper ─── */

  async function multipartUpload(parentId, fileName, blob, mimeType) {
    ensureSignedIn();
    var metadata = { name: fileName, parents: [parentId], mimeType: mimeType || blob.type || 'application/octet-stream' };
    var boundary = 'drive_boundary_' + Date.now();
    var body = '';
    body += '--' + boundary + '\r\n';
    body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
    body += JSON.stringify(metadata) + '\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Type: ' + (mimeType || blob.type || 'application/octet-stream') + '\r\n\r\n';

    var encoder = new TextEncoder();
    var headBytes = encoder.encode(body);
    var tailBytes = encoder.encode('\r\n--' + boundary + '--\r\n');
    var totalLength = headBytes.length + blob.size + tailBytes.length;

    var combined = new Uint8Array(totalLength);
    combined.set(headBytes, 0);
    combined.set(new Uint8Array(await blob.arrayBuffer()), headBytes.length);
    combined.set(tailBytes, headBytes.length + blob.size);

    var res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'multipart/related; boundary=' + boundary,
        'Content-Length': totalLength
      },
      body: combined
    });
    if (!res.ok) {
      var txt = await res.text().catch(function(){return '';});
      throw new Error('Upload failed: ' + res.status + ' ' + txt);
    }
    return await res.json();
  }

  /* ─── Public API ─── */

  var DriveAPI = {

    /* ─── Auth ─── */

    async init() {
      if (initPromise) return initPromise;
      initPromise = (async function() {
        await loadGIS();

        var cfg = buildConfig();
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: cfg.clientId,
          scope: SCOPES,
          callback: function(resp) {
            if (resp.error) {
              console.error('OAuth error:', resp.error, resp.error_description || '');
              return;
            }
            accessToken = resp.access_token;
            onSignInCallbacks.forEach(function(fn) { try { fn(); } catch(e) {} });
          }
        });

        // Try restoring a saved token
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem('foromane_drive_token')); } catch(e) {}
        if (saved && saved.expires_at > Date.now()) {
          accessToken = saved.access_token;
        }
      })();
      return initPromise;
    },

    signIn() {
      return new Promise(function(resolve, reject) {
        DriveAPI.init().then(function() {
          if (accessToken) {
            onSignInCallbacks.forEach(function(fn) { try { fn(); } catch(e) {} });
            return resolve();
          }
          tokenClient.callback = function(resp) {
            if (resp.error) return reject(new Error(resp.error_description || resp.error));
            accessToken = resp.access_token;
            localStorage.setItem('foromane_drive_token', JSON.stringify({
              access_token: resp.access_token,
              expires_at: Date.now() + (resp.expires_in || 3600) * 1000
            }));
            onSignInCallbacks.forEach(function(fn) { try { fn(); } catch(e) {} });
            resolve();
          };
          tokenClient.requestAccessToken({ prompt: 'consent' });
        }).catch(reject);
      });
    },

    signOut() {
      if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, function() {
          accessToken = null;
          localStorage.removeItem('foromane_drive_token');
          onSignOutCallbacks.forEach(function(fn) { try { fn(); } catch(e) {} });
        });
      } else {
        accessToken = null;
        localStorage.removeItem('foromane_drive_token');
        onSignOutCallbacks.forEach(function(fn) { try { fn(); } catch(e) {} });
      }
    },

    isSignedIn() {
      return !!accessToken;
    },

    onSignIn(fn) {
      onSignInCallbacks.push(fn);
    },

    onSignOut(fn) {
      onSignOutCallbacks.push(fn);
    },

    /* ─── Folder operations ─── */

    async findFolder(parentId, name) {
      var q = "name='" + name.replace(/'/g, "\\'") + "' and '" + parentId + "' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false";
      var res = await api('GET', 'files?q=' + encodeURIComponent(q) + '&pageSize=1&fields=files(id,name)');
      return (res.files && res.files.length > 0) ? res.files[0] : null;
    },

    async createFolder(parentId, name) {
      return await api('POST', 'files', {
        name: name,
        parents: [parentId],
        mimeType: 'application/vnd.google-apps.folder'
      });
    },

    async findOrCreateFolder(parentId, name) {
      var existing = await this.findFolder(parentId, name);
      if (existing) return existing;
      return await this.createFolder(parentId, name);
    },

    async findOrCreateEntityFolder(parentTierId, entityId) {
      return await this.findOrCreateFolder(parentTierId, entityId);
    },

    async ensureEntityFolders(parentTierId, entityId, schema) {
      var entityFolder = await this.findOrCreateEntityFolder(parentTierId, entityId);
      // Create subfolders
      if (schema.subfolders) {
        for (var i = 0; i < schema.subfolders.length; i++) {
          await this.findOrCreateFolder(entityFolder.id, schema.subfolders[i]);
        }
      }
      return entityFolder;
    },

    async resolveTier(tier) {
      var cfg = buildConfig();
      var tierFolderId = null;

      if (tier === 'user') {
        tierFolderId = cfg.usersFolderId;
      } else if (tier === 'pro') {
        tierFolderId = cfg.prosFolderId;
      } else if (tier === 'business') {
        tierFolderId = cfg.businessesFolderId;
      }

      // If the config has the hard-coded ID (after script was run), use it
      if (tierFolderId && tierFolderId !== 'RUN_SCRIPT_FIRST') {
        return tierFolderId;
      }

      // Otherwise find by name under clients_root
      var parentName = tier + 's';
      var folder = await this.findFolder(cfg.clientsRootId, parentName);
      if (folder) return folder.id;

      // Create if not found
      folder = await this.createFolder(cfg.clientsRootId, parentName);
      return folder.id;
    },

    async ensureUserFolder(userId) {
      var tierId = await this.resolveTier('user');
      var schema = buildConfig().folderSchema.user;
      return await this.ensureEntityFolders(tierId, userId, schema);
    },

    async ensureProFolder(proId) {
      var tierId = await this.resolveTier('pro');
      var schema = buildConfig().folderSchema.pro;
      return await this.ensureEntityFolders(tierId, proId, schema);
    },

    async ensureBusinessFolder(bizId) {
      var tierId = await this.resolveTier('business');
      var schema = buildConfig().folderSchema.business;
      return await this.ensureEntityFolders(tierId, bizId, schema);
    },

    /* ─── File operations ─── */

    async uploadFile(parentId, fileName, blob, mimeType) {
      return await multipartUpload(parentId, fileName, blob, mimeType);
    },

    async findFile(parentId, fileName) {
      var q = "name='" + fileName.replace(/'/g, "\\'") + "' and '" + parentId + "' in parents and trashed=false";
      var res = await api('GET', 'files?q=' + encodeURIComponent(q) + '&pageSize=1&fields=files(id,name,mimeType,size)');
      return (res.files && res.files.length > 0) ? res.files[0] : null;
    },

    async downloadFile(fileId) {
      var res = await fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      if (!res.ok) throw new Error('Download failed: ' + res.status);
      return await res.blob();
    },

    async readJSON(parentId, fileName) {
      var file = await this.findFile(parentId, fileName);
      if (!file) return null;
      var blob = await this.downloadFile(file.id);
      var text = await new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsText(blob);
      });
      try { return JSON.parse(text); } catch(e) { return text; }
    },

    async upsertJSON(parentId, fileName, data) {
      var existing = await this.findFile(parentId, fileName);
      var jsonStr = JSON.stringify(data, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json' });

      if (existing) {
        // Update existing file content via multipart upload with patch
        var metadata = { name: fileName };
        var boundary = 'drive_boundary_' + Date.now();
        var body = '';
        body += '--' + boundary + '\r\n';
        body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
        body += JSON.stringify(metadata) + '\r\n';
        body += '--' + boundary + '\r\n';
        body += 'Content-Type: application/json\r\n\r\n';
        body += jsonStr + '\r\n';
        body += '--' + boundary + '--\r\n';

        var encoder = new TextEncoder();
        var bytes = encoder.encode(body);

        var res = await fetch('https://www.googleapis.com/upload/drive/v3/files/' + existing.id + '?uploadType=multipart', {
          method: 'PATCH',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'multipart/related; boundary=' + boundary,
            'Content-Length': bytes.length
          },
          body: bytes
        });
        if (!res.ok) {
          var txt = await res.text().catch(function(){return '';});
          throw new Error('Update failed: ' + res.status + ' ' + txt);
        }
        return await res.json();
      }

      // Create new file
      return await multipartUpload(parentId, fileName, blob, 'application/json');
    },

    async deleteFile(fileId) {
      return await api('DELETE', 'files/' + fileId);
    },

    /* ─── High-level sync ─── */

    async pullUser(userId) {
      ensureSignedIn();
      var tierId = await this.resolveTier('user');
      var userFolder = await this.findFolder(tierId, userId);
      if (!userFolder) return null;

      var schema = buildConfig().folderSchema.user;
      var result = {};

      // Read JSON files
      for (var i = 0; i < schema.files.length; i++) {
        var fname = schema.files[i];
        var key = fname.replace('.json', '');
        var data = await this.readJSON(userFolder.id, fname);
        if (data !== null) result[key] = data;
      }

      return result;
    },

    async pushUser(userId, data) {
      ensureSignedIn();
      var userFolder = await this.ensureUserFolder(userId);
      var schema = buildConfig().folderSchema.user;

      for (var i = 0; i < schema.files.length; i++) {
        var fname = schema.files[i];
        var key = fname.replace('.json', '');
        if (data[key] !== undefined) {
          await this.upsertJSON(userFolder.id, fname, data[key]);
        }
      }
    },

    async pushProfileImage(userId, blob) {
      var userFolder = await this.ensureUserFolder(userId);
      var pfFolder = await this.findOrCreateFolder(userFolder.id, 'profile_picture');
      return await this.uploadFile(pfFolder.id, 'avatar.webp', blob, 'image/webp');
    },

    async pullProfileImage(userId) {
      var tierId = await this.resolveTier('user');
      var userFolder = await this.findFolder(tierId, userId);
      if (!userFolder) return null;
      var pfFolder = await this.findFolder(userFolder.id, 'profile_picture');
      if (!pfFolder) return null;
      var file = await this.findFile(pfFolder.id, 'avatar.webp');
      if (!file) return null;
      return await this.downloadFile(file.id);
    },

    async ensureAllTierFolders() {
      // One-shot to create users/, pros/, businesses/ under clients_root
      // and record their IDs
      var cfg = buildConfig();
      var results = {};

      var tiers = ['users', 'pros', 'businesses'];
      for (var i = 0; i < tiers.length; i++) {
        var t = tiers[i];
        var folder = await this.findOrCreateFolder(cfg.clientsRootId, t);
        results[t + '_folder_id'] = folder.id;
      }
      return results;
    }
  };

  window.DriveAPI = DriveAPI;

})();
