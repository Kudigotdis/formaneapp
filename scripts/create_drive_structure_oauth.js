#!/usr/bin/env node
/**
 * create_drive_structure_oauth.js
 *
 * Creates the Drive folder layout for Wirog using OAuth2 (installed app flow).
 * Usage:
 *  - Copy your private wirog-config.json to project root or set env WIROG_CONFIG_PATH
 *  - Run: node scripts/create_drive_structure_oauth.js
 *  - Follow the printed URL, authorize, then paste the code back into the terminal.
 *
 * This writes `drive-structure.json` and `drive-category-folders.json` mapping category slugs
 * to created folder IDs.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

function readConfig() {
  const cfgPath = process.env.WIROG_CONFIG_PATH || path.join(process.cwd(), 'wirog-config.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('wirog-config.json not found at', cfgPath);
    process.exit(2);
  }
  return require(cfgPath);
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function ensureFolder(drive, name, parentId = null) {
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
  const cfg = readConfig();
  if (!cfg.web || !cfg.web.client_id || !cfg.web.client_secret) {
    console.error('wirog-config.json missing client_id / client_secret under web');
    process.exit(2);
  }

  const oAuth2Client = new google.auth.OAuth2(cfg.web.client_id, cfg.web.client_secret, 'urn:ietf:wg:oauth:2.0:oob');
  const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata'];
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });

  console.log('\n1) Open the URL below in your browser and authorize access:\n');
  console.log(authUrl + '\n');
  const code = await ask('2) Paste the authorization code here: ');
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const rootName = (cfg.root_folder_name) ? cfg.root_folder_name : 'Wirog App Drive';
  console.log('Ensuring root folder:', rootName);
  const rootId = await ensureFolder(drive, rootName, null);

  console.log('Creating top-level system folders...');
  const promosId = await ensureFolder(drive, 'promos', rootId);
  const facebookSubmissionsId = await ensureFolder(drive, 'facebook_submissions', rootId);

  // Create a folder per category slug under facebook_submissions
  console.log('Creating category folders under facebook_submissions...');
  const categories = cfg.app_system && cfg.app_system.categories ? Object.keys(cfg.app_system.categories) : [];
  const mapping = {};
  for (const slug of categories) {
    const folderName = slug;
    const id = await ensureFolder(drive, folderName, facebookSubmissionsId);
    mapping[slug] = id;
    console.log('  -', slug, id);
  }

  const out = {
    root: { id: rootId, name: rootName },
    promos: { id: promosId },
    facebook_submissions: { id: facebookSubmissionsId, categories: mapping },
    createdAt: Date.now()
  };

  fs.writeFileSync(path.join(process.cwd(), 'drive-structure.json'), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'drive-category-folders.json'), JSON.stringify(mapping, null, 2));

  console.log('\nDone. drive-structure.json and drive-category-folders.json written to project root.');
  console.log('Keep these files private.');
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
