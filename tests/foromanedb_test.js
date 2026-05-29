const assert = require('assert');
const path = require('path');

// Provide a fake IndexedDB implementation for Node
const fakeIndexedDB = require('fake-indexeddb');
const IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// Load the ForomaneDB module into a vm-like sandbox to attach to window
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync(path.join(__dirname, '..', 'db.js'), 'utf8');
const sandbox = { window: {}, console, indexedDB: fakeIndexedDB, IDBKeyRange };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const ForomaneDB = sandbox.window.ForomaneDB;
(async function runTests(){
  // init
  await ForomaneDB.init();
  assert.ok(ForomaneDB.db, 'DB should be initialized');

  // put & get
  await ForomaneDB.put('filters', { id: 'selectedCategories', categories: ['A','B'] });
  const f = await ForomaneDB.get('filters', 'selectedCategories');
  assert.strictEqual(f.id, 'selectedCategories');
  assert.deepStrictEqual(f.categories, ['A','B']);

  // add & getAll
  await ForomaneDB.add('notes', { id: 'note_1', title: 'Note 1', userId: 'u1', items: [] });
  await ForomaneDB.add('notes', { id: 'note_2', title: 'Note 2', userId: 'u1', items: [] });
  const notes = await ForomaneDB.getAll('notes');
  assert.ok(Array.isArray(notes) && notes.length >= 2);

  // delete
  await ForomaneDB.delete('notes', 'note_1');
  const after = await ForomaneDB.get('notes', 'note_1');
  assert.strictEqual(after, undefined);

  // clear
  await ForomaneDB.clear('notes');
  const empty = await ForomaneDB.getAll('notes');
  assert.ok(Array.isArray(empty) && empty.length === 0);

  console.log('ForomaneDB tests passed');
})();
