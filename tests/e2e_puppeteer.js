const child_process = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');

async function startProcess(cmd, args, opts = {}) {
  const p = child_process.spawn(cmd, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  p.stdout.setEncoding('utf8');
  p.stderr.setEncoding('utf8');
  return p;
}

(async () => {
  console.log('Starting mock sync server...');
  const mock = await startProcess(process.execPath, [path.join(ROOT, 'mock-sync-server.js')]);

  mock.stdout.on('data', d => process.stdout.write('[mock] ' + d));
  mock.stderr.on('data', d => process.stderr.write('[mock:err] ' + d));

  console.log('Starting dev static server...');
  const dev = await startProcess(process.execPath, [path.join(ROOT, 'dev-server.js')]);
  dev.stdout.on('data', d => process.stdout.write('[dev] ' + d));
  dev.stderr.on('data', d => process.stderr.write('[dev:err] ' + d));

  // Wait briefly for servers to start
  await new Promise(r => setTimeout(r, 1200));

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log('[page]', msg.text()));

  const url = 'http://localhost:8080';
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Load sw-register helper and register SW
  await page.evaluate(async () => {
    const txt = await fetch('/sw-register.js').then(r => r.text());
    eval(txt);
    const res = await registerWirogSW();
    window._e2e_sw_res = res;
    return res;
  });

  // Ensure SyncQueue is available (load sync.js if necessary)
  const syncLoaded = await page.evaluate(async () => {
    if (!window.SyncQueue) {
      const txt = await fetch('/sync.js').then(r=>r.text());
      eval(txt);
    }
    // set endpoint to mock server
    if (window.SyncQueue) window.SyncQueue.syncEndpoint = 'http://localhost:3000/sync/commit';
    return !!window.SyncQueue;
  });

  if (!syncLoaded) throw new Error('SyncQueue not available');

  // Enqueue a test item and flush
  await page.evaluate(async () => {
    const id = 'puppeteer_test_' + Date.now();
    await window.SyncQueue.enqueue('promos', { id, title: 'Puppeteer E2E Test' }, { clientId: 'puppeteer' });
    // flush immediately
    const res = await window.SyncQueue.flush();
    window._e2e_flush = res;
    return res;
  });

  console.log('Waiting for mock server to log accepted item...');

  // Wait for mock server stdout to contain 'Accepted sync item'
  const found = await new Promise((resolve, reject) => {
    let logged = '';
    const timeout = setTimeout(() => {
      resolve(false);
    }, 8000);
    function onData(d) {
      logged += d.toString();
      if (logged.includes('Accepted sync item')) {
        clearTimeout(timeout);
        resolve(true);
      }
    }
    mock.stdout.on('data', onData);
  });

  if (found) console.log('Mock server received sync item');
  else console.warn('Mock server did NOT log receipt within timeout');

  await browser.close();

  mock.kill();
  dev.kill();

  if (!found) process.exit(2);
  console.log('E2E Puppeteer test completed successfully');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
