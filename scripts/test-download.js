#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function main() {
  const root = process.cwd();
  const cfgPath = path.join(root, 'wirog-config.json');
  const tokenPath = path.join(root, 'drive-oauth-token.json');
  const fileId = process.env.FILE_ID || process.argv[2];

  if (!fileId) {
    console.error('Usage: FILE_ID=<id> node scripts/test-download.js <id>');
    process.exit(1);
  }
  if (!fs.existsSync(cfgPath)) { console.error('wirog-config.json not found'); process.exit(1); }
  if (!fs.existsSync(tokenPath)) { console.error('drive-oauth-token.json not found'); process.exit(1); }

  const cfg = readJSON(cfgPath);
  const tokens = readJSON(tokenPath);
  const clientId = cfg.client_id || (cfg.web && cfg.web.client_id);
  const clientSecret = cfg.client_secret || (cfg.web && cfg.web.client_secret);
  if (!clientId || !clientSecret) { console.error('Missing client_id/client_secret in wirog-config.json'); process.exit(1); }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials(tokens);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  try {
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    let data = '';
    await new Promise((resolve, reject) => {
      res.data.on('data', chunk => data += chunk.toString());
      res.data.on('end', () => resolve());
      res.data.on('error', err => reject(err));
    });
    console.log('Downloaded file content:\n' + data);
  } catch (err) {
    console.error('Download failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
