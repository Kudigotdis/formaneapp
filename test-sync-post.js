(async function(){
  const url = 'http://localhost:3000/sync/commit';
  const id = 'test_sync_' + Date.now();
  const body = { type: 'promos', payload: { id: 'test123', title: 'FromScript' }, meta: { clientId: 'script' } };
  try {
    console.log('POST 1 ->', url);
    let r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': id }, body: JSON.stringify(body) });
    console.log('Status', r.status);
    console.log('Body', await r.json());

    console.log('\nPOST 2 (duplicate idempotency) ->', url);
    r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': id }, body: JSON.stringify(body) });
    console.log('Status', r.status);
    console.log('Body', await r.json());
  } catch (e) {
    console.error('Request failed', e);
  }
})();