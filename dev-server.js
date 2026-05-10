// dev-server.js — simple static file server for E2E tests
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '5mb' }));

// Proxy local /sync/commit to mock server at port 3000 to simplify same-origin testing
app.post('/sync/commit', async (req, res) => {
	try {
		const upstream = 'http://localhost:3000/sync/commit';
		const headers = { 'Content-Type': 'application/json' };
		if (req.headers['idempotency-key']) headers['Idempotency-Key'] = req.headers['idempotency-key'];
		const body = JSON.stringify(req.body);
		const r = await fetch(upstream, { method: 'POST', headers, body });
		const text = await r.text();
		res.status(r.status).send(text);
	} catch (e) {
		res.status(502).send('Proxy error');
	}
});

app.use(express.static(path.resolve(__dirname)));

app.listen(PORT, () => console.log('Dev static server listening on port', PORT));

module.exports = app;
