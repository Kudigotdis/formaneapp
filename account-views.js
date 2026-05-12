// account-views.js — add-item modal, artwork submission, area/category pills, promo requests UI
(function(){
  let _selectedCategories = [];
  let _gpsLat = null;
  let _gpsLng = null;

  function getAllCategories() {
    return (window.WIROG_PRODUCT_CATEGORIES && window.WIROG_PRODUCT_CATEGORIES.categories) || [];
  }

  function getAllTowns() {
    const loc = window.LOCATIONS;
    if (!loc || !loc.districts) return [];
    const towns = [];
    loc.districts.forEach(d => (d.towns || []).forEach(t => towns.push(t.name)));
    return towns;
  }

  function getAreasForTown(townName) {
    const loc = window.LOCATIONS;
    if (!loc || !loc.districts) return [];
    const areas = [];
    loc.districts.forEach(d => (d.towns || []).forEach(t => {
      if (t.name === townName && t.areas) areas.push(...t.areas);
    }));
    return areas;
  }

  function getCurrentUser() {
    const u = (window.User && window.User.current) || null;
    return u || { name: 'You', id: localStorage.getItem('wirog_user_id') || 'guest' };
  }

  function syncBoostCounter() {
    const key = 'wirog_boosts_remaining';
    let b = parseInt(localStorage.getItem(key) || '12', 10);
    b = Math.max(0, b);
    ['boost-counter', 'boost-counter-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(b);
    });
    return b;
  }

  function getBusinessCategories() {
    const biz = getCurrentUser().business;
    if (biz && biz.category) return [biz.category];
    return [];
  }

  /* ─── CATEGORY PILLS ─── */
  function renderItemCategoryPills() {
    const container = document.getElementById('item-category-pills');
    if (!container) return;
    container.innerHTML = '';
    _selectedCategories = [];
    const cats = getAllCategories();
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.onclick = () => toggleItemCategoryPill(btn);
      container.appendChild(btn);
    });
    updateCategoryDisplay();
  }

  function toggleItemCategoryPill(btn) {
    btn.classList.toggle('pill-selected');
    const id = btn.dataset.id;
    const name = btn.textContent;
    if (btn.classList.contains('pill-selected')) {
      if (!_selectedCategories.find(c => c.id === id)) _selectedCategories.push({ id, name });
    } else {
      _selectedCategories = _selectedCategories.filter(c => c.id !== id);
    }
    updateCategoryDisplay();
    updatePromoCostEstimate();
  }

  function updateCategoryDisplay() {
    const el = document.getElementById('item-cat-display');
    if (!el) return;
    const count = _selectedCategories.length;
    el.textContent = count === 0 ? '' : count + ' categor' + (count === 1 ? 'y selected' : 'ies selected');
  }

  /* ─── AREA PILLS ─── */
  let _selectedAreas = [];

  window.openItemAreaSelector = function() {
    const town = document.getElementById('item-town') ? document.getElementById('item-town').value : 'Gaborone';
    const areas = getAreasForTown(town);
    const existing = document.getElementById('area-selector-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'area-selector-overlay';
    overlay.className = 'modal-overlay';
    overlay.style.display = 'block';
    overlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-header">
          <span class="modal-title">Select Areas in ${town}</span>
          <button class="modal-close" onclick="closeModal('area-selector-overlay')"><img src="assets/icons/solid/xmark_orange.webp" style="width:18px;height:18px;"></button>
        </div>
        <div class="modal-body">
          <div id="area-pills-container" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>
          <button class="btn" onclick="applyAreaSelection()">Apply (${_selectedAreas.length} selected)</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const container = document.getElementById('area-pills-container');
    areas.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'pill' + (_selectedAreas.includes(a) ? ' pill-selected' : '');
      btn.textContent = a;
      btn.onclick = () => {
        btn.classList.toggle('pill-selected');
        const name = btn.textContent;
        if (btn.classList.contains('pill-selected')) {
          if (!_selectedAreas.includes(name)) _selectedAreas.push(name);
        } else {
          _selectedAreas = _selectedAreas.filter(x => x !== name);
        }
        const apply = overlay.querySelector('.btn');
        if (apply) apply.textContent = 'Apply (' + _selectedAreas.length + ' selected)';
      };
      container.appendChild(btn);
    });
  };

  window.applyAreaSelection = function() {
    closeModal('area-selector-overlay');
    const display = document.getElementById('item-area-display');
    if (display) display.textContent = _selectedAreas.length ? _selectedAreas.join(', ') : '';
    const btn = document.getElementById('item-area-btn');
    if (btn) btn.textContent = _selectedAreas.length ? 'Areas (' + _selectedAreas.length + ')' : 'Select areas';
  };

  /* ─── GPS PIN ─── */
  window.pinItemLocation = function() {
    if (!navigator.geolocation) { showToast('Geolocation not supported'); return; }
    showToast('Getting location...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        _gpsLat = pos.coords.latitude;
        _gpsLng = pos.coords.longitude;
        const display = document.getElementById('item-gps-display');
        if (display) {
          display.textContent = '\uD83D\uDCCD ' + _gpsLat.toFixed(4) + ', ' + _gpsLng.toFixed(4) + ' · Radius: ' + (document.getElementById('item-gps-radius') ? document.getElementById('item-gps-radius').value || '2' : '2') + ' km';
          display.style.display = 'block';
        }
        showToast('Location pinned');
      },
      err => { showToast('Could not get location: ' + err.message); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  window.clearItemLocation = function() {
    _gpsLat = null;
    _gpsLng = null;
    const display = document.getElementById('item-gps-display');
    if (display) { display.textContent = ''; display.style.display = 'none'; }
    const radius = document.getElementById('item-gps-radius');
    if (radius) radius.value = '';
  };

  /* ─── OPEN ADD ITEM MODAL ─── */
  window.openAddItemModal = function(){
    const user = getCurrentUser();
    const sheet = document.getElementById('add-item-modal');
    if (!sheet) return;
    sheet.style.display = 'block';

  const creator = document.getElementById('add-item-creator');
  if (creator) creator.textContent = 'Creator: ' + user.name;

  // Show "Allow staff edits" checkbox only for owners, hide for staff
  var staffCheckRow = document.getElementById('item-allow-staff-edits');
  if (staffCheckRow) {
    staffCheckRow.closest('label').style.display = UserState.businessRole === 'staff' ? 'none' : '';
  }

    renderItemCategoryPills();
    populateTownSelects();

    _selectedAreas = [];
    const areaBtn = document.getElementById('item-area-btn');
    if (areaBtn) areaBtn.textContent = 'Select areas';
    const areaDisp = document.getElementById('item-area-display');
    if (areaDisp) areaDisp.textContent = '';

    clearItemLocation();

    document.getElementById('add-item-promo-unlocked').style.display = 'none';
    document.getElementById('add-item-promo-locked').style.display = 'block';

    document.getElementById('item-title').focus();
  };

  /* ─── SAVE ADD ITEM ─── */
  window.saveAddItem = function(){
    const title = document.getElementById('item-title') ? document.getElementById('item-title').value.trim() : '';
    if (!title) { showToast('Please enter an item title'); return; }

    const user = getCurrentUser();
    const item = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: title,
      desc: document.getElementById('item-desc') ? document.getElementById('item-desc').value : '',
      creatorId: user.id,
      creatorName: user.name,
      allowStaffEdits: document.getElementById('item-allow-staff-edits') ? document.getElementById('item-allow-staff-edits').checked : false,
      categories: _selectedCategories.map(c => c.name),
      town: document.getElementById('item-town') ? document.getElementById('item-town').value : 'Gaborone',
      areas: _selectedAreas,
      gpsLat: _gpsLat,
      gpsLng: _gpsLng,
      gpsRadius: parseFloat(document.getElementById('item-gps-radius') ? document.getElementById('item-gps-radius').value : 0) || 0,
      tags: Array.from(document.querySelectorAll('#item-tag-container .tag')).map(t => t.textContent.trim()).filter(Boolean),
      price: parseFloat(document.getElementById('item-price') ? document.getElementById('item-price').value : 0) || 0,
      unit: document.getElementById('item-unit') ? document.getElementById('item-unit').value : 'each',
      variables: getVariables(),
      tierType: document.getElementById('item-tier-type') ? document.getElementById('item-tier-type').value : 'none',
      discountType: document.getElementById('item-discount-type') ? document.getElementById('item-discount-type').value : 'none',
      discountValue: parseFloat(document.getElementById('item-discount-value') ? document.getElementById('item-discount-value').value : 0) || 0,
      region: document.getElementById('item-region') ? document.getElementById('item-region').value : 'local',
      startDate: document.getElementById('item-start-date') ? document.getElementById('item-start-date').value : '',
      endDate: document.getElementById('item-end-date') ? document.getElementById('item-end-date').value : '',
      inCatalogue: true,
      createdAt: Date.now()
    };

    const items = JSON.parse(localStorage.getItem('wirog_items') || '[]');
    items.push(item);
    localStorage.setItem('wirog_items', JSON.stringify(items));

    showToast('Item saved to catalogue');
    updateMyCatalogueList();

    document.getElementById('add-item-promo-locked').style.display = 'none';
    document.getElementById('add-item-promo-unlocked').style.display = 'block';
  };

  function getVariables() {
    const rows = document.querySelectorAll('#item-variables-container .variable-row');
    const vars = [];
    rows.forEach(r => {
      const nameInput = r.querySelector('.var-name');
      const priceInput = r.querySelector('.var-price');
      if (nameInput && priceInput) vars.push({ name: nameInput.value, price: parseFloat(priceInput.value) || 0 });
    });
    return vars;
  }

  function updateMyCatalogueList() {
    const container = document.getElementById('my-catalogue-list');
    if (!container) return;
    const items = JSON.parse(localStorage.getItem('wirog_items') || '[]');
    if (items.length === 0) {
      container.innerHTML = '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;margin-bottom:12px;">No items in catalogue yet.</p>';
      return;
    }
    container.innerHTML = items.map((item, i) =>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--grey-light);font-size:13px;">' +
      '<span>' + item.title + '</span>' +
      '<span style="color:var(--grey-dark);font-size:12px;">P' + item.price.toFixed(2) + '</span>' +
      '</div>'
    ).join('');
  }

  /* ─── DELETE ADD ITEM ─── */
  window.deleteAddItem = function(){
    const items = JSON.parse(localStorage.getItem('wirog_items') || '[]');
    if (items.length === 0) {
      document.getElementById('item-title').value = '';
      document.getElementById('item-desc').value = '';
      document.getElementById('item-price').value = '';
      document.getElementById('item-tag-container').innerHTML = '';
      showToast('Form cleared');
      return;
    }
    items.pop();
    localStorage.setItem('wirog_items', JSON.stringify(items));
    showToast('Last item removed');
    updateMyCatalogueList();
    document.getElementById('add-item-promo-unlocked').style.display = 'none';
    document.getElementById('add-item-promo-locked').style.display = 'block';
  };

  /* ─── TOWN SELECT POPULATION ─── */
  function populateTownSelects(){
    const towns = getAllTowns();
    const selects = document.querySelectorAll('select[id$="-town"], select[id="item-town"]');
    selects.forEach(s => {
      s.innerHTML = '';
      towns.forEach(tn => {
        const opt = document.createElement('option');
        opt.value = tn;
        opt.textContent = tn;
        s.appendChild(opt);
      });
      s.value = 'Gaborone';
    });
  }

  /* ─── ARTWORK SUBMISSION ─── */
  let _artworkFiles = [];

  window.openArtworkSubmission = function(){
    const modal = document.getElementById('artwork-submission-modal');
    if (!modal) return;
    modal.style.display = 'block';
    _artworkFiles = [];
    syncBoostCounter();
    populateArtCategory();
    renderBoostSubmissionStatus();
    document.getElementById('art-upload-input').value = '';
    document.getElementById('art-previews').innerHTML = '';
    document.getElementById('art-upload-count').textContent = '0 of 12 images selected';
    document.querySelectorAll('#artwork-submission-modal .pill').forEach(p => p.classList.remove('pill-selected'));
    document.getElementById('boost-day-next').textContent = '';
    const nextDate = getNextBoostDay();
    if (nextDate) document.getElementById('boost-day-next').textContent = 'Next available: ' + nextDate;
  };

  function populateArtCategory() {
    const sel = document.getElementById('art-category');
    if (!sel) return;
    sel.innerHTML = '';
    const bizCats = getBusinessCategories();
    const cats = getAllCategories();
    (bizCats.length ? cats.filter(c => bizCats.includes(c.name)) : cats).forEach(c => {
      const o = document.createElement('option');
      o.value = c.id || c.name;
      o.textContent = c.name;
      sel.appendChild(o);
    });
  }

  window.handleArtworkFiles = function(files) {
    if (!files || files.length === 0) return;
    const max = 12;
    const remaining = max - _artworkFiles.length;
    const toAdd = Math.min(remaining, files.length);
    for (let i = 0; i < toAdd; i++) _artworkFiles.push(files[i]);
    renderArtPreviews();
    document.getElementById('art-upload-count').textContent = _artworkFiles.length + ' of 12 images selected';
    if (_artworkFiles.length >= max) showToast('Max 12 images reached');
  };

  function renderArtPreviews() {
    const container = document.getElementById('art-previews');
    if (!container) return;
    container.innerHTML = '';
    _artworkFiles.forEach((f, idx) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      const img = document.createElement('img');
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      img.style.cursor = 'pointer';
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(f);
      wrapper.appendChild(img);
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '&times;';
      removeBtn.style.cssText = 'position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:none;background:#e74c3c;color:white;font-size:14px;line-height:1;cursor:pointer;';
      removeBtn.onclick = () => {
        _artworkFiles.splice(idx, 1);
        renderArtPreviews();
        document.getElementById('art-upload-count').textContent = _artworkFiles.length + ' of 12 images selected';
      };
      wrapper.appendChild(removeBtn);
      container.appendChild(wrapper);
    });
  }

  function getNextBoostDay() {
    const dayMap = { monday: 1, wednesday: 3, friday: 5 };
    const now = new Date();
    const today = now.getDay();
    let nearest = null;
    let nearestDiff = 8;
    Object.entries(dayMap).forEach(([name, dayNum]) => {
      let diff = dayNum - today;
      if (diff <= 0) diff += 7;
      if (diff < nearestDiff) { nearestDiff = diff; nearest = name; }
    });
    if (!nearest) return null;
    const next = new Date(now);
    next.setDate(now.getDate() + nearestDiff);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[next.getDay()] + ' ' + next.getDate() + ' ' + next.toLocaleString('default',{month:'short'});
  }

  window.selectBoostDay = function(day) {
    document.querySelectorAll('#artwork-submission-modal .pill').forEach(b => b.classList.remove('pill-selected'));
    const btn = Array.from(document.querySelectorAll('#artwork-submission-modal .pill')).find(b => b.dataset.day === day);
    if (btn) btn.classList.add('pill-selected');
    const nextDate = getNextBoostDay();
    const el = document.getElementById('boost-day-next');
    if (el) el.textContent = 'Next: ' + (nextDate || 'TBD');
  };

  window.submitArtwork = function() {
    (async function() {
      if (_artworkFiles.length === 0) { showToast('Please select at least 1 image (max 12)'); return; }
      const category = document.getElementById('art-category') ? document.getElementById('art-category').value : 'uncategorized';
      const boostBtn = document.querySelector('#artwork-submission-modal .pill-selected');
      const boostDay = boostBtn ? boostBtn.dataset.day : '';
      if (!boostDay) { showToast('Please select a boost day'); return; }
      const user = getCurrentUser();
      const biz = user.business || {};
      const form = new FormData();
      form.append('category', category);
      form.append('userId', user.id);
      form.append('boostDay', boostDay);
      form.append('businessName', biz.name || user.name);
      _artworkFiles.forEach(f => form.append('files', f, f.name));

      const uploadUrl = (window.UPLOAD_SERVER_URL || 'http://localhost:3001') + '/upload-artwork';
      showToast('Uploading artwork...');
      try {
        const resp = await fetch(uploadUrl, { method: 'POST', body: form });
        if (!resp.ok) throw new Error('Server responded ' + resp.status);
        const json = await resp.json();
        if (json && json.ok) {
          const key = 'wirog_boosts_remaining';
          let b = parseInt(localStorage.getItem(key) || '12', 10);
          b = Math.max(0, b - 1);
          localStorage.setItem(key, String(b));
          syncBoostCounter();

          const submission = {
            id: 'sub_' + Date.now(),
            category, boostDay, businessName: biz.name || user.name,
            userId: user.id,
            imageCount: _artworkFiles.length,
            status: 'pending',
            createdAt: Date.now()
          };
          const subs = JSON.parse(localStorage.getItem('wirog_artwork_submissions') || '[]');
          subs.push(submission);
          localStorage.setItem('wirog_artwork_submissions', JSON.stringify(subs));

          showToast('Artwork submitted. Admin will review. Boosts left: ' + b);
          _artworkFiles = [];
          closeModal('artwork-submission-modal');
          renderBoostSubmissionStatus();
        } else {
          throw new Error((json && json.error) || 'Unknown server error');
        }
      } catch (e) {
        console.error('Upload failed', e);
        showToast('Upload failed: ' + (e.message || e));
      }
    })();
  };

  function renderBoostSubmissionStatus() {
    const list = document.getElementById('artwork-submission-list');
    if (!list) return;
    const subs = JSON.parse(localStorage.getItem('wirog_artwork_submissions') || '[]');
    if (subs.length === 0) {
      list.innerHTML = '<p style="color:var(--grey-dark);">No submissions yet.</p>';
      return;
    }
    list.innerHTML = subs.slice().reverse().map(s => {
      const date = new Date(s.createdAt).toLocaleDateString();
      const statusColors = { pending: 'var(--orange)', approved: '#2e7d32', rejected: '#e74c3c', live: '#1565c0', completed: 'var(--grey-dark)' };
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--grey-light);">' +
        '<div><span style="font-weight:600;text-transform:capitalize;">' + s.boostDay + '</span> · ' + s.category + '<br><span style="font-size:11px;color:var(--grey-dark);">' + date + ' · ' + s.imageCount + ' img</span></div>' +
        '<span style="font-size:12px;font-weight:600;color:' + (statusColors[s.status] || 'var(--grey-dark)') + ';text-transform:capitalize;">' + s.status + '</span>' +
        '</div>';
    }).join('');
  }

  /* ─── PROMO REQUESTS VIEW ─── */
  window.renderPromoRequests = function(){
    const modal = document.getElementById('promo-requests-view') || createPromoRequestsView();
    openModal('promo-requests-view');
    setTimeout(() => { try { window.renderPromoRequestsList && window.renderPromoRequestsList(); } catch(e){} }, 60);
  };

  function createPromoRequestsView(){
    const div = document.createElement('div');
    div.id = 'promo-requests-view';
    div.className = 'modal-overlay';
    div.style.cssText = 'align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
    div.innerHTML =
      '<div class="modal-sheet" style="width:95%;max-width:600px;border-radius:16px;background:white;display:flex;flex-direction:column;max-height:85vh;">' +

        '<div class="modal-header" style="padding:20px;border-bottom:1px solid var(--grey-light);display:flex;justify-content:space-between;align-items:center;">' +
          '<div>' +
            '<h2 class="modal-title" style="font-size:18px;font-weight:800;margin:0;">Promo Requests</h2>' +
            '<span style="font-size:12px;color:var(--grey-dark);">Admin Control Panel</span>' +
          '</div>' +
          '<button class="modal-close" onclick="closeModal(\'promo-requests-view\')" style="background:none;border:none;cursor:pointer;padding:5px;"><img src="assets/icons/solid/xmark_orange.webp" style="width:20px;height:20px;"></button>' +
        '</div>' +

        '<div style="display:flex;gap:10px;padding:12px 20px;background:#f9f9f9;border-bottom:1px solid var(--grey-light);">' +
          '<div style="font-size:11px;font-weight:700;color:var(--orange);background:var(--orange-light);padding:4px 8px;border-radius:4px;">PENDING: <span id="count-pending">0</span></div>' +
          '<div style="font-size:11px;font-weight:700;color:var(--grey-dark);">TOTAL: <span id="count-total">0</span></div>' +
        '</div>' +

        '<div class="modal-body" id="promo-requests-list" style="overflow-y:auto;padding:16px;background:#fdfdfd;flex-grow:1;">' +
          '<div id="requests-empty-state" style="text-align:center;padding:40px 20px;color:var(--grey-dark);"><p style="font-size:14px;">No pending promo requests found.</p></div>' +
        '</div>' +

      '</div>';
    document.body.appendChild(div);
    return div;
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function(){
    fetch('locations.json').then(r => r.json()).then(json => {
      window.LOCATIONS = json;
      populateTownSelects();
    }).catch(() => {});
    syncBoostCounter();
    updateMyCatalogueList();
  });

  window.WirogAccountViews = {
    openAddItemModal: window.openAddItemModal,
    saveAddItem: window.saveAddItem,
    deleteAddItem: window.deleteAddItem,
    openArtworkSubmission: window.openArtworkSubmission,
    renderPromoRequests: window.renderPromoRequests
  };
})();
