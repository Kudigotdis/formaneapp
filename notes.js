/* ════════════════════════════════════════════════════════
   WIROG NOTES - Notes management & WhatsApp sharing
   ════════════════════════════════════════════════════════ */

const DEMO_USER_MAP = {
  'user-guest': 'guest',
  'user-kago': 'general',
  'user-thabo': 'trade'
};

if (!window._notes) {
  window._notes = [];
  const currentId = UserState.id;
  if (currentId === 'guest') {
    window._notes.push(
      { id: 'note_1', title: 'Phakalane Site Prep', thumbnail: '', body: '', userId: 'guest', items: [
        { title: 'Meranti Planks 22x144mm', emoji: '\ud83e\udeb5', price: 85, unit: 'per meter', business: 'Board Kings', qty: 10 },
        { title: 'Dulux Trade Emulsion 20L', emoji: '\ud83c\udfa8', price: 520, unit: 'each', business: 'BuildIt Gabs', qty: 1 }
      ]},
      { id: 'note_2', title: 'Office Shopfitting', thumbnail: '', body: '', userId: 'guest', items: [
        { title: 'Quarry Tiles 300x300mm', emoji: '\u2b1b', price: 185, unit: 'per box', business: 'Tile Express BW', qty: 12 }
      ]}
    );
  }
}

async function seedDemoNotes() {
  if (!window.DEMO_NOTES || !WirogDB.db) return;
  try {
    const existing = await WirogDB.getAll('notes');
    if (existing.length > 0) return;
    for (const note of window.DEMO_NOTES) {
      const mapped = { ...note, userId: DEMO_USER_MAP[note.userId] || note.userId };
      await WirogDB.put('notes', mapped);
    }
    window._notes = await WirogDB.getAll('notes');
  } catch(e) {
    console.error('Failed to seed demo notes:', e);
  }
}

function reloadNotesForUser() {
  renderNotes();
}

function renderNotes() {
  const el = document.getElementById('notes-list');
  if (!el) return;

  const uid = UserState.id;
  const userNotes = (window._notes || []).filter(function(n) {
    return n.userId === uid;
  });

  const maxFree = 10;
  const used = userNotes.length;
  const remaining = Math.max(0, maxFree - used);

  const counterEl = document.getElementById('notes-remaining-counter');
  if (counterEl) {
    counterEl.textContent = remaining + ' of ' + maxFree + ' free notes remaining' +
      (used > maxFree ? ' — ' + (used - maxFree) + ' bonus' : '');
  }

  if (userNotes.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:40px 16px;color:var(--grey-dark);">
        <i class="fas fa-clipboard-list" style="font-size:36px;margin-bottom:10px;display:block;color:var(--grey-mid);"></i>
        <p style="font-size:14px;font-weight:600;margin-bottom:4px;">No notes yet</p>
        <p style="font-size:12px;">Create a note to start saving items from the Promos feed.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = userNotes.map(note => {
    const total = note.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const count = note.items.reduce((sum, item) => sum + (item.qty || 1), 0);
    const emoji = note.items.length > 0 ? (note.items[0].emoji || '\ud83d\udccb') : '\ud83d\udccb';
    return `
      <div class="note-card" onclick="openNote('${note.id}')">
        <div style="display:flex;gap:14px;align-items:center;flex:1;">
          <div style="font-size:26px;">${emoji}</div>
          <div><h3 style="font-size:15px;">${note.title}</h3><p class="note-meta">${count} items for P ${total.toFixed(2)}</p></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="assets/icons/whatsApp_icon_on.png" style="width:36px;height:36px;cursor:pointer;" onclick="event.stopPropagation();shareNoteWhatsApp('${note.id}')">
          <span style="font-size:18px;color:var(--grey-mid);">\u203A</span>
        </div>
      </div>
    `;
  }).join('');
}

function openNote(noteId) {
  const note = window._notes.find(n => n.id === noteId);
  if (!note) return;

  const total = note.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  document.getElementById('note-total-val').textContent = 'P ' + total.toFixed(2);

  document.getElementById('note-title-display').textContent = note.title;

  const img = document.getElementById('note-thumbnail-img');
  const placeholder = document.getElementById('note-thumbnail-placeholder');
  const container = document.getElementById('note-thumbnail');
  if (note.thumbnail) {
    img.src = note.thumbnail;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    container.classList.remove('empty');
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    container.classList.add('empty');
  }

  document.getElementById('note-body-input').textContent = note.body || '';

  const list = document.getElementById('note-items-list');
  if (note.items.length === 0) {
    list.innerHTML = '<div class="note-empty-state">' +
      '<p>Tap on Promos to find products and services you can add to your note.</p>' +
      '<img src="assets/icons/solid/bullhorn-2_orange.webp" class="note-empty-icon" style="cursor:pointer;" onclick="navTab(\'view-promos\',\'nav-promos\')">' +
      '</div>';
  } else {
    list.innerHTML = note.items.map((item, idx) => `
      <div class="note-item-row">
        <div class="note-item-icon" onclick="openNoteItemView('${noteId}',${idx})" style="cursor:pointer;">${item.emoji || '\ud83d\udce6'}</div>
        <div class="ni-info">
          <h4>${item.title}</h4>
          <p class="ni-cost">P ${item.price.toFixed(2)} ${item.unit} \u00d7 ${item.qty || 1}</p>
          <p class="ni-business">${item.business}</p>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateNoteItemQty('${noteId}',${idx},1)">+</button>
          <span class="ni-qty" style="min-width:20px;text-align:center;">${item.qty || 1}</span>
          <button class="qty-btn" onclick="updateNoteItemQty('${noteId}',${idx},-1)">\u2212</button>
        </div>
      </div>
    `).join('');
  }

  window._currentNoteId = noteId;
  goTo('view-note-open');
}

async function updateNoteItemQty(noteId, itemIdx, delta) {
  const note = window._notes.find(n => n.id === noteId);
  if (!note || !note.items[itemIdx]) return;

  const item = note.items[itemIdx];
  const oldQty = item.qty || 1;
  const newQty = Math.max(0, oldQty + delta);

  if (newQty === 0) {
    if (!confirm('Remove this item from the note?')) return;
    note.items.splice(itemIdx, 1);
    try {
      await WirogDB.put('notes', note);
      if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
        await window.SyncQueue.enqueue('notes', note, { clientId: UserState.id });
        if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
      }
    } catch(e) {}
    if (window.currentView === 'view-note-open') openNote(noteId);
    else renderNotes();
    return;
  }

  item.qty = newQty;

  try {
    await WirogDB.put('notes', note);
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('notes', note, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) {}

  const row = document.querySelector(`#note-items-list .note-item-row:nth-child(${itemIdx + 1})`);
  if (row) {
    const qtySpan = row.querySelector('.ni-qty');
    if (qtySpan) qtySpan.textContent = newQty;
    const costEl = row.querySelector('.ni-cost');
    if (costEl) costEl.textContent = `P ${item.price.toFixed(2)} ${item.unit} \u00d7 ${newQty}`;
  }

  const newTotal = note.items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
  const totalEl = document.getElementById('note-total-val');
  if (totalEl) totalEl.textContent = 'P ' + newTotal.toFixed(2);
}

async function createNote() {
  const note = {
    id: 'note_' + Date.now(),
    title: 'New Note',
    thumbnail: '',
    body: '',
    userId: UserState.id,
    items: []
  };
  window._notes.push(note);
  try {
    await WirogDB.put('notes', note);
  } catch(e) {
    console.error('Failed to save note to DB:', e);
  }
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('notes', note, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue new note for sync:', e); }
  renderNotes();
  openNote(note.id);
}

function editNoteTitle(noteId) {
  const id = noteId || window._currentNoteId;
  const note = window._notes.find(n => n.id === id);
  if (!note) return;
  const newTitle = prompt('Enter note title:', note.title);
  if (newTitle && newTitle.trim()) {
    note.title = newTitle.trim();
    const titleEl = document.getElementById('note-title-display');
    if (titleEl) titleEl.textContent = note.title;
    renderNotes();
  }
}

function changeNoteThumbnail() {
  const note = window._notes.find(n => n.id === window._currentNoteId);
  if (!note) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const dataUrl = ev.target.result;
      note.thumbnail = dataUrl;
      const img = document.getElementById('note-thumbnail-img');
      const placeholder = document.getElementById('note-thumbnail-placeholder');
      const container = document.getElementById('note-thumbnail');
      img.src = dataUrl;
      img.style.display = 'block';
      placeholder.style.display = 'none';
      container.classList.remove('empty');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function saveNoteBody() {
  const note = window._notes.find(n => n.id === window._currentNoteId);
  if (!note) return;
  note.body = document.getElementById('note-body-input').textContent;
  clearTimeout(window._noteBodyTimer);
  window._noteBodyTimer = setTimeout(async function() {
    try {
      await WirogDB.put('notes', note);
      if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
        try { await window.SyncQueue.enqueue('notes', note, { clientId: UserState.id }); } catch(e) { console.warn('Failed to enqueue note body save:', e); }
        if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
      }
    } catch(e) {}
  }, 500);
}

function deleteCurrentNote() {
  if (!confirm('Delete this note and all its items?')) return;
  const idx = window._notes.findIndex(n => n.id === window._currentNoteId);
  if (idx === -1) return;
  window._notes.splice(idx, 1);
  renderNotes();
  goTo('view-notes');
}

function payNotesBTC() {
  closeModal('buy-notes-modal');
  const text = 'I want to purchase 25 additional Wirog Notes via BTC Smega. My user ID: ' + UserState.id;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  showToast('Tap Send on WhatsApp to complete payment');
}

function payNotesMascom() {
  closeModal('buy-notes-modal');
  const text = 'I want to purchase 25 additional Wirog Notes via Mascom Myzaka. My user ID: ' + UserState.id;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  showToast('Tap Send on WhatsApp to complete payment');
}

function payNotesOrange() {
  closeModal('buy-notes-modal');
  const text = 'I want to purchase 25 additional Wirog Notes via Orange Money. My user ID: ' + UserState.id;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  showToast('Tap Send on WhatsApp to complete payment');
}

function shareNoteWhatsApp(noteId) {
  const id = noteId || window._currentNoteId;
  const note = window._notes.find(n => n.id === id);
  if (!note) { showToast('No notes to share'); return; }

  const total = note.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  let text = `*${note.title}* - Wirog Supply Solutions\n\n`;
  note.items.forEach((item, idx) => {
    text += `${idx + 1}. ${item.emoji || '\ud83d\udce6'} ${item.title}\n   P ${item.price.toFixed(2)} ${item.unit} x ${item.qty || 1} = P ${(item.price * (item.qty || 1)).toFixed(2)}\n   From: ${item.business}\n\n`;
  });
  text += `\n*Total: P ${total.toFixed(2)}*`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function openNoteItemView(noteId, itemIdx) {
  const note = window._notes.find(n => n.id === noteId);
  if (!note || !note.items[itemIdx]) return;
  const item = note.items[itemIdx];
  const promo = window._promos && window._promos.find(p => p.title === item.title && p.businessName === item.business);
  const content = document.getElementById('item-view-content');
  if (!content) return;
  const totalCost = (item.price * (item.qty || 1)).toFixed(2);
  const tags = promo && promo.tags && promo.tags.length ? promo.tags.map(t => '<span style="background:var(--grey-light);padding:3px 8px;border-radius:4px;font-size:12px;">' + t + '</span>').join(' ') : '';
  const categories = promo && promo.category ? '<p style="font-size:12px;color:var(--grey-dark);margin-bottom:4px;">Category: <strong>' + promo.category + '</strong></p>' : '';
  const images = promo && promo.images && promo.images.length ? promo.images.slice(0, 3).map(function(img) { return '<img src="' + img + '" style="width:80px;height:80px;object-fit:cover;border-radius:6px;">'; }).join('') : '';
  content.innerHTML =
    '<div style="margin-bottom:16px;">' +
      '<div style="font-size:32px;margin-bottom:8px;">' + (item.emoji || '\ud83d\udce6') + '</div>' +
      '<h3 style="font-size:20px;font-weight:700;margin-bottom:4px;">' + item.title + '</h3>' +
      categories +
      (promo && promo.desc ? '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:8px;">' + promo.desc + '</p>' : '') +
    '</div>' +
    '<div style="background:var(--grey-light);border-radius:8px;padding:12px;margin-bottom:12px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="font-size:13px;color:var(--grey-dark);">Unit Price</span>' +
        '<strong style="font-size:14px;">P ' + item.price.toFixed(2) + ' ' + item.unit + '</strong>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
        '<span style="font-size:13px;color:var(--grey-dark);">Quantity</span>' +
        '<strong style="font-size:14px;">' + (item.qty || 1) + '</strong>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--grey-mid);padding-top:6px;">' +
        '<span style="font-size:13px;color:var(--grey-dark);">Total</span>' +
        '<strong style="font-size:16px;color:var(--orange);">P ' + totalCost + '</strong>' +
      '</div>' +
    '</div>' +
    '<div style="margin-bottom:12px;">' +
      '<p style="font-size:12px;color:var(--grey-dark);margin-bottom:4px;">Service Provider</p>' +
      '<p style="font-size:14px;font-weight:600;">' + item.business + '</p>' +
    '</div>' +
    (tags ? '<div><p style="font-size:12px;color:var(--grey-dark);margin-bottom:6px;">Tags</p><div style="display:flex;flex-wrap:wrap;gap:6px;">' + tags + '</div></div>' : '') +
    (images ? '<div style="margin-top:12px;"><p style="font-size:12px;color:var(--grey-dark);margin-bottom:6px;">Images</p><div style="display:flex;gap:8px;">' + images + '</div></div>' : '');
  openModal('item-view-modal');
}

window.renderNotes = renderNotes;
window.openNote = openNote;
window.createNote = createNote;
window.openNoteItemView = openNoteItemView;
window.shareNoteWhatsApp = shareNoteWhatsApp;
window.updateNoteItemQty = updateNoteItemQty;
window.editNoteTitle = editNoteTitle;
window.changeNoteThumbnail = changeNoteThumbnail;
window.deleteCurrentNote = deleteCurrentNote;
window.saveNoteBody = saveNoteBody;
window.seedDemoNotes = seedDemoNotes;
window.reloadNotesForUser = reloadNotesForUser;
window.payNotesBTC = payNotesBTC;
window.payNotesMascom = payNotesMascom;
window.payNotesOrange = payNotesOrange;
