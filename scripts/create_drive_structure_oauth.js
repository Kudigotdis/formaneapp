#!/usr/bin/env node
/**
 * create_drive_structure_oauth.js
 *
 * Creates the Drive folder layout for Foromane using OAuth2 (installed app flow).
 * Usage:
 *  - Copy your private foromane-config.json to project root or set env FOROMANE_CONFIG_PATH
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
const http = require('http');
const url = require('url');

function readConfig() {
  const cfgPath = process.env.FOROMANE_CONFIG_PATH || path.join(process.cwd(), 'foromane-config.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('foromane-config.json not found at', cfgPath);
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
    console.error('foromane-config.json missing client_id / client_secret under web');
    process.exit(2);
  }

  const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata'];

  // Prefer a localhost redirect URI if provided in the credential JSON so we can
  // automatically receive the callback instead of using the deprecated OOB flow.
  let redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
  let incomingCode = null;
  if (cfg.web && Array.isArray(cfg.web.redirect_uris)) {
    const local = cfg.web.redirect_uris.find(u => u.startsWith('http://localhost'));
    if (local) redirectUri = local;
  }

  const oAuth2Client = new google.auth.OAuth2(cfg.web.client_id, cfg.web.client_secret, redirectUri);
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });

  // If we've previously saved tokens, load them and skip the interactive flow.
  const tokenPath = path.join(process.cwd(), 'drive-oauth-token.json');
  let haveTokens = false;
  if (fs.existsSync(tokenPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      oAuth2Client.setCredentials(saved);
      haveTokens = true;
      console.log('Loaded existing OAuth tokens from drive-oauth-token.json');
    } catch (e) {
      console.warn('Failed to load drive-oauth-token.json, proceeding with interactive auth:', e && e.message);
    }
  }

  if (!haveTokens) {
    // If the code was provided via environment (manual redirect paste), use it.
    const envCode = process.env.OAUTH_CODE;
    if (envCode) {
      try {
        const { tokens } = await oAuth2Client.getToken(envCode);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(path.join(process.cwd(), 'drive-oauth-token.json'), JSON.stringify(tokens, null, 2));
        console.log('Saved OAuth tokens to drive-oauth-token.json (from OAUTH_CODE).');
        haveTokens = true;
      } catch (e) {
        console.error('Failed to exchange OAUTH_CODE for tokens:', e && e.message);
        process.exit(1);
      }
    }
    
    if (redirectUri.startsWith('http://localhost')) {
    // Start a temporary HTTP server to receive the OAuth2 callback.
    const parsed = url.parse(redirectUri);
    const port = parsed.port || 80;
    const pathname = parsed.pathname || '/';

    const server = http.createServer((req, res) => {
      const q = url.parse(req.url, true).query;
      if (q && q.code) {
        incomingCode = q.code;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorization received</h1><p>You can close this window.</p>');
        server.close();
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>No code found</h1>');
      }
    });

    await new Promise((resolve, reject) => {
      server.listen(port, () => resolve());
      server.on('error', reject);
    });

    console.log('\n1) Open the URL below in your browser and authorize access (callback to localhost):\n');
    console.log(authUrl + '\n');

    // Wait for the incoming code via the HTTP server (timeout after 5 minutes)
    const start = Date.now();
    while (!incomingCode && Date.now() - start < 5 * 60 * 1000) {
      // sleep 500ms
      await new Promise(r => setTimeout(r, 500));
    }

    if (!incomingCode) {
      console.error('Timed out waiting for the OAuth callback.');
      process.exit(1);
    }

    const code = incomingCode;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    try {
      fs.writeFileSync(path.join(process.cwd(), 'drive-oauth-token.json'), JSON.stringify(tokens, null, 2));
      console.log('Saved OAuth tokens to drive-oauth-token.json (keep this file private).');
    } catch (e) { console.warn('Failed to write drive-oauth-token.json', e); }
    }
    else {
      console.log('\n1) Open the URL below in your browser and authorize access:\n');
      console.log(authUrl + '\n');
      const code = await ask('2) Paste the authorization code here: ');
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      try {
        fs.writeFileSync(path.join(process.cwd(), 'drive-oauth-token.json'), JSON.stringify(tokens, null, 2));
        console.log('Saved OAuth tokens to drive-oauth-token.json (keep this file private).');
      } catch (e) { console.warn('Failed to write drive-oauth-token.json', e); }
    }
  }

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const rootName = (cfg.root_folder_name) ? cfg.root_folder_name : 'Foromane App Drive';
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

  // Also ensure client folders (clients -> users, pros, businesses)
  console.log('Creating client folders under root...');
  const clientsRootId = await ensureFolder(drive, 'clients', rootId);
  const usersFolderId = await ensureFolder(drive, 'users', clientsRootId);
  const prosFolderId = await ensureFolder(drive, 'pros', clientsRootId);
  const businessesFolderId = await ensureFolder(drive, 'businesses', clientsRootId);

  out.clients_root_id = clientsRootId;
  out.users_folder_id = usersFolderId;
  out.pros_folder_id = prosFolderId;
  out.businesses_folder_id = businessesFolderId;

  fs.writeFileSync(path.join(process.cwd(), 'drive-structure.json'), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'drive-category-folders.json'), JSON.stringify(mapping, null, 2));

  // Update foromane-config.json with created client folder IDs if present
  try {
    const cfgPath = process.env.FOROMANE_CONFIG_PATH || path.join(process.cwd(), 'foromane-config.json');
    if (fs.existsSync(cfgPath)) {
      const localCfg = require(cfgPath);
      localCfg.clients_root_id = clientsRootId;
      localCfg.users_folder_id = usersFolderId;
      localCfg.pros_folder_id = prosFolderId;
      localCfg.businesses_folder_id = businessesFolderId;
      fs.writeFileSync(cfgPath, JSON.stringify(localCfg, null, 2));
      console.log('Updated', cfgPath, 'with client folder IDs.');
    }
  } catch (e) {
    console.warn('Failed to update foromane-config.json:', e && e.message);
  }

  console.log('\nDone. drive-structure.json and drive-category-folders.json written to project root.');
  console.log('Keep these files private.');
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
