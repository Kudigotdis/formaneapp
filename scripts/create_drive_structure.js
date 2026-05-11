#!/usr/bin/env node
/**
 * create_drive_structure.js
 *
 * Creates a Drive folder layout for WirogApp using a service account.
 * Usage:
 *   - Place your service account JSON key at ./service-account.json OR set env var GOOGLE_SERVICE_ACCOUNT_JSON to the path
 *   - Run: node scripts/create_drive_structure.js
 *
 * The script will create a root folder named `WirogApp` (if missing) and subfolders listed below,
 * then write `drive-structure.json` with the resulting folder IDs.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function loadAuth() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || path.join(process.cwd(), 'service-account.json');
  if (!fs.existsSync(keyPath)) {
    console.error('Service account JSON not found at', keyPath);
    console.error('Set env var GOOGLE_SERVICE_ACCOUNT_JSON or place service-account.json in project root.');
    process.exit(2);
  }
  const key = require(keyPath);
  const jwt = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive']
  );
  await jwt.authorize();
  return jwt;
}

async function ensureFolder(drive, name, parentId = null) {
  // Look for existing folder with name under parent
  const qParts = [`name = '${name.replace(/'/g, "\\'")}'`, "mimeType = 'application/vnd.google-apps.folder'", "trashed = false"];
  if (parentId) qParts.push(`'${parentId}' in parents`);
  const q = qParts.join(' and ');
  const res = await drive.files.list({ q, fields: 'files(id,name)', spaces: 'drive' });
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;

  const meta = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) meta.parents = [parentId];
  const created = await drive.files.create({ requestBody: meta, fields: 'id,name' });
  return created.data.id;
}

async function main() {
  const auth = await loadAuth();
  const drive = google.drive({ version: 'v3', auth });

  const rootName = 'WirogApp';
  console.log('Ensuring root folder', rootName);
  const rootId = await ensureFolder(drive, rootName, null);

  const structure = {
    root: { id: rootId, name: rootName },
    promos: {},
    catalogue: {},
    profiles: { avatars: null, profiles_meta: null },
    logos: {},
    tasks: {},
    facebook_submissions: {},
    system: { backups: null, manifests: null }
  };

  // Create top-level folders
  structure.promos.id = await ensureFolder(drive, 'promos', rootId);
  structure.catalogue.id = await ensureFolder(drive, 'catalogue', rootId);
  structure.profiles.avatars = await ensureFolder(drive, 'profiles/avatars', rootId);
  structure.profiles.profiles_meta = await ensureFolder(drive, 'profiles/profiles_meta', rootId);
  structure.logos.id = await ensureFolder(drive, 'logos', rootId);
  structure.tasks.id = await ensureFolder(drive, 'tasks', rootId);
  structure.facebook_submissions.id = await ensureFolder(drive, 'facebook_submissions', rootId);
  structure.system.backups = await ensureFolder(drive, 'system/backups', rootId);
  structure.system.manifests = await ensureFolder(drive, 'system/manifests', rootId);

  const outPath = path.join(process.cwd(), 'drive-structure.json');
  fs.writeFileSync(outPath, JSON.stringify(structure, null, 2));
  console.log('Drive structure created/written to', outPath);
  console.log(JSON.stringify(structure, null, 2));
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
