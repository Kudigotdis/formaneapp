#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  const root = process.cwd();
  const cfgPath = path.join(root, 'wirog-config.json');
  const tokenPath = path.join(root, 'drive-oauth-token.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('wirog-config.json not found');
    process.exit(1);
  }
  if (!fs.existsSync(tokenPath)) {
    console.error('drive-oauth-token.json not found');
    process.exit(1);
  }

  const cfg = readJSON(cfgPath);
  const tokens = readJSON(tokenPath);
  const clientId = cfg.client_id || (cfg.web && cfg.web.client_id);
  const clientSecret = cfg.client_secret || (cfg.web && cfg.web.client_secret);
  if (!clientId || !clientSecret) {
    console.error('Missing client_id or client_secret in wirog-config.json');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials(tokens);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const usersFolderId = cfg.users_folder_id;
  if (!usersFolderId) {
    console.error('users_folder_id not set in wirog-config.json');
    process.exit(1);
  }

  const fileName = `wirog_test_${Date.now()}.json`;
  const content = JSON.stringify({ test: 'wirog-test', createdAt: new Date().toISOString() }, null, 2);

  try {
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [usersFolderId],
        mimeType: 'application/json'
      },
      media: {
        mimeType: 'application/json',
        body: content
      },
      fields: 'id'
    });

    console.log('Uploaded test file. File ID:', res.data.id);
  } catch (err) {
    console.error('Upload failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
