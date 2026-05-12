#!/usr/bin/env node
/**
 * drive-upload-server.js
 * Small express server to accept artwork uploads and place them into the
 * category folder in Google Drive created by create_drive_structure_oauth.js.
 *
 * Requirements:
 *  - place `wirog-config.json` in project root (contains client_id/client_secret)
 *  - run `node scripts/create_drive_structure_oauth.js` once and authorize; it will create
 *    `drive-category-folders.json` and `drive-oauth-token.json`.
 *  - run this server: `node scripts/drive-upload-server.js`
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');

const UPLOAD_PORT = process.env.UPLOAD_PORT || 3001;
const PROJECT_ROOT = process.cwd();

function loadConfig() {
  const cfgPath = path.join(PROJECT_ROOT, 'wirog-config.json');
  if (!fs.existsSync(cfgPath)) throw new Error('wirog-config.json not found in project root');
  return require(cfgPath);
}

function loadDriveFolders() {
  const p = path.join(PROJECT_ROOT, 'drive-category-folders.json');
  if (!fs.existsSync(p)) throw new Error('drive-category-folders.json not found; run create_drive_structure_oauth.js first');
  return require(p);
}

function loadTokens() {
  const p = path.join(PROJECT_ROOT, 'drive-oauth-token.json');
  if (!fs.existsSync(p)) throw new Error('drive-oauth-token.json not found; run create_drive_structure_oauth.js to generate tokens');
  return require(p);
}

async function makeDriveClient() {
  const cfg = loadConfig();
  const tokens = loadTokens();
  const oAuth2Client = new google.auth.OAuth2(cfg.web.client_id, cfg.web.client_secret, 'urn:ietf:wg:oauth:2.0:oob');
  oAuth2Client.setCredentials(tokens);
  try { await oAuth2Client.getAccessToken(); } catch(e) { console.warn('Failed to refresh token', e && e.message); }
  return google.drive({ version: 'v3', auth: oAuth2Client });
}

async function findOrCreateFolder(drive, parentId, name) {
  const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q: query, fields: 'files(id,name)', pageSize: 1 });
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, parents: [parentId], mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id'
  });
  return created.data.id;
}

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/upload-artwork', upload.array('files', 12), async (req, res) => {
  try {
    const drive = await makeDriveClient();
    const cfg = loadConfig();
    const businessesRootId = cfg.businesses_folder_id || cfg.folderSchema?.businesses?.parentId;
    if (!businessesRootId) return res.status(400).json({ error: 'businesses_folder_id not set in config; run Drive setup script first' });

    const userId = req.body.userId || 'unknown';
    const businessName = req.body.businessName || userId;
    const category = req.body.category || 'uncategorized';
    const boostDay = req.body.boostDay || '';

    const bizFolderId = await findOrCreateFolder(drive, businessesRootId, 'biz_' + userId);
    const fbFolderId = await findOrCreateFolder(drive, bizFolderId, 'facebook_submissions');
    const ts = Date.now().toString();
    const subFolderId = await findOrCreateFolder(drive, fbFolderId, 'sub_' + ts);

    const results = [];
    for (const file of req.files || []) {
      const meta = { name: file.originalname, parents: [subFolderId] };
      const media = { mimeType: file.mimetype, body: Buffer.from(file.buffer) };
      const created = await drive.files.create({ requestBody: meta, media, fields: 'id,name,webViewLink' });
      results.push({ id: created.data.id, name: created.data.name, link: created.data.webViewLink });
    }

    // Write metadata.json
    const metadata = { userId, businessName, category, boostDay, files: results, status: 'pending', createdAt: Date.now() };
    const metaFile = await drive.files.create({
      requestBody: { name: 'metadata.json', parents: [subFolderId] },
      media: { mimeType: 'application/json', body: JSON.stringify(metadata, null, 2) },
      fields: 'id'
    });

    // Append to pending_index.json in admin folder
    try {
      const adminFolderId = cfg.admin_folder_id || cfg.folderSchema?.admin?.parentId;
      if (adminFolderId) {
        const pendingIndexId = await findOrCreateFolder(drive, adminFolderId, 'facebook_approvals');
        const indexFile = await drive.files.list({ q: `'${pendingIndexId}' in parents and name='pending_index.json' and trashed=false`, fields: 'files(id)', pageSize: 1 });
        let existingIndex = [];
        if (indexFile.data.files && indexFile.data.files.length > 0) {
          const dl = await drive.files.get({ fileId: indexFile.data.files[0].id, alt: 'media' });
          existingIndex = Array.isArray(dl.data) ? dl.data : [];
        }
        existingIndex.push(metadata);
        await drive.files.create({
          requestBody: { name: 'pending_index.json', parents: [pendingIndexId] },
          media: { mimeType: 'application/json', body: JSON.stringify(existingIndex, null, 2) },
          fields: 'id'
        });
      }
    } catch (indexErr) {
      console.warn('Could not update pending_index.json', indexErr && indexErr.message);
    }

    res.json({ ok: true, uploaded: results, submissionId: 'sub_' + ts });
  } catch (e) {
    console.error('Upload error', e && e.stack || e);
    res.status(500).json({ error: e && e.message || 'Upload failed' });
  }
});

app.get('/api/drive-records', async (req, res) => {
  try {
    const drive = await makeDriveClient();
    const cfg = loadConfig();
    const adminFolderId = cfg.admin_folder_id || cfg.folderSchema?.admin?.parentId;
    if (!adminFolderId) return res.json([]);
    const fbFolderId = await findOrCreateFolder(drive, adminFolderId, 'facebook_approvals');
    const indexFile = await drive.files.list({ q: `'${fbFolderId}' in parents and name='pending_index.json' and trashed=false`, fields: 'files(id)', pageSize: 1 });
    if (!indexFile.data.files || indexFile.data.files.length === 0) return res.json([]);
    const dl = await drive.files.get({ fileId: indexFile.data.files[0].id, alt: 'media' });
    res.json(Array.isArray(dl.data) ? dl.data : []);
  } catch (e) {
    console.error('Error fetching records', e && e.message);
    res.status(500).json({ error: e && e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/drive_upload_records.json', (req, res) => {
  const p = path.join(PROJECT_ROOT, 'drive_upload_records.json');
  if (fs.existsSync(p)) return res.json(JSON.parse(fs.readFileSync(p)));
  res.json([]);
});

function genId() { return '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

app.listen(UPLOAD_PORT, () => console.log('Drive upload server listening on port', UPLOAD_PORT));
