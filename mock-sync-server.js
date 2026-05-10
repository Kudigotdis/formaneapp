// mock-sync-server.js — simple Express server to test /sync/commit
// Usage: node mock-sync-server.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));

// Simple in-memory idempotency map
const seen = new Map();

app.post('/sync/commit', (req, res) => {
  const idempotency = req.headers['idempotency-key'] || (req.body && req.body.meta && req.body.meta.clientId) || null;
  if (!idempotency) return res.status(400).json({ status: 'error', message: 'Missing Idempotency-Key' });

  if (seen.has(idempotency)) {
    return res.json({ status: 'ok', serverId: seen.get(idempotency), duplicate: true });
  }

  // Simulate simple validation and creation
  const serverId = 'srv_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  seen.set(idempotency, serverId);

  console.log('Accepted sync item', idempotency, '->', serverId, 'type=', req.body && req.body.type);

  res.json({ status: 'ok', serverId });
});

app.listen(PORT, () => console.log('Mock sync server listening on port', PORT));

module.exports = app;
