#!/usr/bin/env node
/**
 * create_drive_structure.js
 *
 * Creates the full Drive folder layout for WirogApp using a service account.
 * This is an ALTERNATIVE to the Google Apps Script method — use either one.
 *
 * Usage:
 *   - Place your service account JSON key at ./service-account.json
 *     OR set env var GOOGLE_SERVICE_ACCOUNT_JSON to the path
 *   - Run: node scripts/create_drive_structure.js
 *
 * The script outputs drive-structure.json with all created folder IDs.
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

async function ensureFolder(drive, name, parentId) {
  const qParts = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false"
  ];
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

  const rootName = 'Wirog App Drive';
  console.log('Ensuring root folder:', rootName);
  const rootId = await ensureFolder(drive, rootName, null);

  // App System
  const appSystemId = await ensureFolder(drive, 'app-system', rootId);
  const iconsId = await ensureFolder(drive, 'icons', appSystemId);
  await ensureFolder(drive, 'solid', iconsId);
  await ensureFolder(drive, 'brands', iconsId);
  const categoryImagesId = await ensureFolder(drive, 'category-images', appSystemId);

  const categories = [
    'attire-uniform', 'bathroom-kitchen', 'boards-timber', 'building-materials',
    'cement-aggregates', 'chemicals', 'design-plans', 'doors-windows', 'electrical',
    'gardening-outdoor-living', 'generators-power-solutions', 'geysers-heating',
    'hardware-fasteners', 'home-decor', 'lighting', 'paint', 'partitioning',
    'plumbing', 'pre-builds-shipping-containers', 'rooting-ceiling', 'safety-security',
    'sanitaryware', 'solar-supplies', 'shelving-storage', 'steel-metal-products',
    'tiles-flooring', 'tools-equipment'
  ];
  const categoryIds = {};
  for (const cat of categories) {
    categoryIds[cat] = await ensureFolder(drive, cat, categoryImagesId);
    console.log('  category:', cat, '→', categoryIds[cat]);
  }

  await ensureFolder(drive, 'platform-media', appSystemId);

  // Clients root
  const clientsRootId = await ensureFolder(drive, 'clients', rootId);

  // Four-tier parent folders
  const usersFolderId = await ensureFolder(drive, 'users', clientsRootId);
  const prosFolderId = await ensureFolder(drive, 'pros', clientsRootId);
  const businessesFolderId = await ensureFolder(drive, 'businesses', clientsRootId);

  const result = {
    root: { id: rootId, name: rootName },
    app_system: {
      folder_id: appSystemId,
      icons_id: iconsId,
      category_images_id: categoryImagesId,
      categories: categoryIds,
      platform_media_id: null // created above if you track it
    },
    clients_root_id: clientsRootId,
    users_folder_id: usersFolderId,
    pros_folder_id: prosFolderId,
    businesses_folder_id: businessesFolderId
  };

  const outPath = path.join(process.cwd(), 'drive-structure.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('\nDrive structure written to', outPath);
  console.log('\n=== COPY THESE INTO wirog-config.json ===');
  console.log('"clients_root_id": "' + clientsRootId + '",');
  console.log('"users_folder_id": "' + usersFolderId + '",');
  console.log('"pros_folder_id": "' + prosFolderId + '",');
  console.log('"businesses_folder_id": "' + businessesFolderId + '"');
  console.log('==========================================');
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
