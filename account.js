/* ════════════════════════════════════════════════════════
   WIROG ACCOUNT - Personal details, contacts, location, interests, favourites
   ════════════════════════════════════════════════════════ */

let _pendingEdit = null;

function genId() {
  return '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function toggleSubAcc(header) {
  header.parentElement.classList.toggle('open');
}

// ─── PERSONAL DETAILS ───
function renderPersonalDetails() {
  const body = document.getElementById('personal-details-body');
  if (!body) return;
  body.innerHTML = renderIdentitySection() + renderContactSection() + renderInterestsSection();
}

function renderIdentitySection() {
  const s = UserState;
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Identity</div>
    <div class="sub-accordion-body">
      <div style="padding:4px 0;"><label>First Name</label><p class="editable" data-field="firstName" data-value="${(s.firstName||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.firstName || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Surname</label><p class="editable" data-field="surname" data-value="${(s.surname||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.surname || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Username / Handle</label><p class="editable" data-field="username" data-value="${(s.username||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.username || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Date of Birth</label><p class="editable" data-field="dateOfBirth" data-value="${(s.dateOfBirth||'').replace(/"/g,'&quot;')}" onclick="editDateField(this)">${s.dateOfBirth || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Gender</label><div class="gender-toggle"><button class="${s.gender==='Male'?'active':''}" onclick="setGender('Male')">Male</button><button class="${s.gender==='Female'?'active':''}" onclick="setGender('Female')">Female</button></div></div>
      <div style="padding:4px 0;"><label>Nationality</label><p class="editable" data-field="nationality" data-value="${(s.nationality||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.nationality || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Race</label><p class="editable" data-field="race" data-value="${(s.race||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.race || '(tap to edit)'}</p></div>
    </div>
  </div>`;
}

function renderContactSection() {
  const s = UserState;
  let socialHTML = Object.entries(s.contacts.social).map(([k,v]) =>
    `<div style="padding:4px 0;"><label style="text-transform:capitalize;">${k}</label><p class="editable" data-field="${k}" data-section="social" data-value="${(v||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${v || '(tap to edit)'}</p></div>`
  ).join('');

  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Contact & Location</div>
    <div class="sub-accordion-body">
      ${renderMobileEntries()}
      ${renderWhatsAppEntries()}
      <div style="padding:4px 0;"><label>Town / Village / City</label><p class="editable" data-field="town" data-section="location" data-value="${(s.location.town||'Gaborone').replace(/"/g,'&quot;')}" onclick="editLocationTown(this)">${s.location.town || 'Gaborone'}</p></div>
      <div style="padding:4px 0;"><label>Area / Neighbourhood</label><p class="editable" data-field="area" data-section="location" data-value="${(s.location.area||'').replace(/"/g,'&quot;')}" onclick="editLocationArea(this)">${s.location.area || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Google GPS Link</label><p class="editable" data-field="gps" data-section="location" data-value="${(s.location.gps||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.location.gps || '(tap to add link)'}</p><button class="add-entry-btn" style="margin-top:4px;" onclick="openGpsMap()"><i class="fas fa-map-marked-alt"></i> Open in Google Maps</button></div>
      <div class="sub-accordion" style="margin-top:8px;">
        <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Social Media</div>
        <div class="sub-accordion-body">${socialHTML}</div>
      </div>
    </div>
  </div>`;
}

function renderMobileEntries() {
  const mobiles = UserState.contacts.mobiles;
  let html = `<div class="sub-accordion"><div class="sub-accordion-header" onclick="toggleSubAcc(this)">Mobile Numbers</div><div class="sub-accordion-body">`;
  mobiles.forEach(m => {
    html += `<div class="contact-entry">
      <button class="star-btn ${m.isPrimary?'active':'inactive'}" onclick="setPrimaryMobile('${m.id}')">${m.isPrimary?'★':'☆'}</button>${m.isPrimary?' <span style="font-size:11px;color:var(--orange);font-weight:600;">Main Contact</span>':''}
      <label>Title</label><input value="${(m.title||'').replace(/"/g,'&quot;')}" onchange="updateMobileField('${m.id}','title',this.value)" placeholder="e.g. Primary, Work, Home">
      <label>Network</label><select onchange="updateMobileField('${m.id}','network',this.value)"><option value="BTC" ${m.network==='BTC'?'selected':''}>BTC</option><option value="Mascom" ${m.network==='Mascom'?'selected':''}>Mascom</option><option value="Orange" ${m.network==='Orange'?'selected':''}>Orange</option></select>
      <label>Number</label><input value="${(m.number||'').replace(/"/g,'&quot;')}" onchange="updateMobileField('${m.id}','number',this.value)" placeholder="71234567">
      <button class="remove-btn" onclick="removeMobileEntry('${m.id}')"><img src="assets/icons/solid/xmark_orange.webp" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"> Remove</button>
    </div>`;
  });
  html += `<button class="add-entry-btn" onclick="addMobileEntry()"><i class="fas fa-plus"></i> Add Mobile Number</button></div></div>`;
  return html;
}

function renderWhatsAppEntries() {
  const was = UserState.contacts.whatsapps;
  let html = `<div class="sub-accordion"><div class="sub-accordion-header" onclick="toggleSubAcc(this)">WhatsApp Numbers</div><div class="sub-accordion-body">`;
  was.forEach(w => {
    html += `<div class="contact-entry">
      <button class="star-btn ${w.isPrimary?'active':'inactive'}" onclick="setPrimaryWhatsApp('${w.id}')">${w.isPrimary?'★':'☆'}</button>${w.isPrimary?' <span style="font-size:11px;color:var(--orange);font-weight:600;">Main Contact</span>':''}
      <label>Title</label><input value="${(w.title||'').replace(/"/g,'&quot;')}" onchange="updateWhatsAppField('${w.id}','title',this.value)" placeholder="e.g. Primary, Work">
      <label>Country Code</label><input value="${(w.countryCode||'+267').replace(/"/g,'&quot;')}" onchange="updateWhatsAppField('${w.id}','countryCode',this.value)" placeholder="+267">
      <label>Number</label><input value="${(w.number||'').replace(/"/g,'&quot;')}" onchange="updateWhatsAppField('${w.id}','number',this.value)" placeholder="71234567">
      <button class="remove-btn" onclick="removeWhatsAppEntry('${w.id}')"><img src="assets/icons/solid/xmark_orange.webp" style="width:14px;height:14px;display:inline-block;vertical-align:middle;"> Remove</button>
    </div>`;
  });
  html += `<button class="add-entry-btn" onclick="addWhatsAppEntry()"><i class="fas fa-plus"></i> Add WhatsApp Number</button></div></div>`;
  return html;
}

function renderInterestsSection() {
  const count = UserState.interests.length;
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Interests & Categories</div>
    <div class="sub-accordion-body">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;">
        <span style="font-size:13px;font-weight:600;">🏷️ ${count} Selected</span>
      </div>
      <p style="font-size:13px;color:var(--grey-dark);cursor:pointer;padding:8px 0;" onclick="goTo('view-user-interests');renderInterestsPage();">Tap to manage interests <span style="color:var(--orange);">→</span></p>
    </div>
  </div>`;
}

// ─── INLINE EDITING ───
function editField(el) {
  const field = el.dataset.field;
  const section = el.dataset.section || 'identity';
  const oldVal = el.dataset.value || '';
  const parent = el.parentNode;

  if (_pendingEdit) cancelField(_pendingEdit);

  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldVal;
  input.style.cssText = 'width:100%;margin:4px 0;padding:8px 10px;border:1px solid var(--orange);border-radius:6px;font-size:14px;box-sizing:border-box;background:white;';
  input.dataset.oldVal = oldVal;
  input.dataset.field = field;
  input.dataset.section = section;

  const restoreP = () => {
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = oldVal || '(tap to edit)';
    p.dataset.field = field;
    p.dataset.section = section;
    p.dataset.value = oldVal;
    p.onclick = () => editField(p);
    parent.replaceChild(p, input);
    _pendingEdit = null;
  };

  input.onblur = () => {
    const newVal = input.value.trim();
    if (newVal !== oldVal) {
      showInlineSave(parent, input, field, section, oldVal, newVal, restoreP);
    } else {
      restoreP();
    }
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { restoreP(); showToast('Cancelled'); }
  };

  parent.replaceChild(input, el);
  _pendingEdit = { field, oldVal, restoreP };
  input.focus();
  input.select();
}

function showInlineSave(parent, input, field, section, oldVal, newVal, restoreP) {
  let bar = parent.querySelector('.save-bar');
  if (bar) bar.remove();

  bar = document.createElement('div');
  bar.className = 'save-bar';
  bar.innerHTML = `<span>✓ Save changes?</span><button class="save-btn" onclick="confirmField('${field}','${section}','${newVal.replace(/'/g,"\\'")}','${oldVal.replace(/'/g,"\\'")}',this)">Save</button><button class="cancel-btn" onclick="cancelField(this)">Cancel</button>`;
  parent.appendChild(bar);
}

function confirmField(field, section, newVal, oldVal, btn) {
  if (section === 'location') {
    UserState.updateLocation(field, newVal);
  } else if (section === 'social') {
    UserState.updateSocial(field, newVal);
  } else {
    UserState.updateIdentity(field, newVal);
    if (field === 'firstName' || field === 'surname') updateAccountHero();
  }

  const input = btn?.closest('.save-bar')?.previousElementSibling;
  if (input && input.tagName === 'INPUT') {
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = newVal || '(tap to edit)';
    p.dataset.field = field;
    p.dataset.section = section;
    p.dataset.value = newVal;
    p.onclick = () => editField(p);
    input.parentNode.replaceChild(p, input);
  }

  const bar = btn?.closest('.save-bar');
  if (bar) bar.remove();
  _pendingEdit = null;
  showToast('Saved!');
}

function cancelField(el) {
  const bar = el?.closest ? el.closest('.save-bar') : null;
  if (bar) {
    const input = bar.previousElementSibling;
    if (input && input.tagName === 'INPUT') {
      const p = document.createElement('p');
      p.className = 'editable';
      p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
      p.textContent = input.dataset.oldVal || '(tap to edit)';
      p.dataset.field = input.dataset.field;
      p.dataset.section = input.dataset.section;
      p.dataset.value = input.dataset.oldVal;
      p.onclick = () => editField(p);
      input.parentNode.replaceChild(p, input);
    }
    bar.remove();
  }
  _pendingEdit = null;
}

// ─── DATE FIELD ───
function editDateField(el) {
  const field = el.dataset.field;
  const oldVal = el.dataset.value || '';
  const parent = el.parentNode;

  const input = document.createElement('input');
  input.type = 'date';
  input.value = oldVal;
  input.style.cssText = 'width:100%;margin:4px 0;padding:8px 10px;border:1px solid var(--orange);border-radius:6px;font-size:14px;box-sizing:border-box;background:white;';

  const restore = () => {
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = oldVal || '(tap to edit)';
    p.dataset.field = field;
    p.dataset.value = oldVal;
    p.onclick = () => editDateField(p);
    parent.replaceChild(p, input);
  };

  input.onchange = () => {
    const newVal = input.value;
    if (newVal !== oldVal) {
      UserState.updateIdentity(field, newVal);
      showToast('Saved!');
    }
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = newVal || '(tap to edit)';
    p.dataset.field = field;
    p.dataset.value = newVal;
    p.onclick = () => editDateField(p);
    parent.replaceChild(p, input);
  };

  input.onblur = () => {
    if (!input.value) { restore(); }
  };

  parent.replaceChild(input, el);
  input.focus();
  input.showPicker?.();
}

// ─── GENDER ───
function setGender(val) {
  UserState.updateIdentity('gender', val);
  const btns = document.querySelectorAll('.gender-toggle button');
  btns.forEach(b => b.classList.toggle('active', b.textContent === val));
  showToast('Saved!');
}

// ─── LOCATION TOWN (dropdown from LOCATIONS_DATA) ───
async function editLocationTown(el) {
  const oldVal = el.dataset.value || 'Gaborone';
  const parent = el.parentNode;

  // Ensure locations are loaded
  if (!window.LOCATIONS_DATA && !window.locationData) {
    await loadLocations();
  }
  const data = window.LOCATIONS_DATA || window.locationData || { districts: [] };
  const towns = new Set();
  data.districts.forEach(d => d.towns.forEach(t => towns.add(t.name)));
  const sorted = [...towns].sort();

  const select = document.createElement('select');
  select.style.cssText = 'width:100%;margin:4px 0;padding:8px 10px;border:1px solid var(--orange);border-radius:6px;font-size:14px;box-sizing:border-box;background:white;';
  sorted.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    if (t === oldVal) opt.selected = true;
    select.appendChild(opt);
  });

  const restore = () => {
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = oldVal;
    p.dataset.field = 'town';
    p.dataset.section = 'location';
    p.dataset.value = oldVal;
    p.onclick = () => editLocationTown(p);
    parent.replaceChild(p, select);
  };

  select.onchange = () => {
    const newVal = select.value;
    UserState.updateLocation('town', newVal);
    UserState.location.area = '';
    UserState._persistLocation();
    showToast('Saved!');
    renderPersonalDetails();
  };

  parent.replaceChild(select, el);
  select.focus();
}

// ─── LOCATION AREA (dependent dropdown) ───
async function editLocationArea(el) {
  const oldVal = el.dataset.value || '';
  const parent = el.parentNode;
  const selectedTown = UserState.location.town || 'Gaborone';

  if (!window.LOCATIONS_DATA && !window.locationData) {
    await loadLocations();
  }
  const data = window.LOCATIONS_DATA || window.locationData || { districts: [] };
  let areas = [];
  for (const d of data.districts) {
    const town = d.towns.find(t => t.name === selectedTown);
    if (town) { areas = town.areas || []; break; }
  }

  const select = document.createElement('select');
  select.style.cssText = 'width:100%;margin:4px 0;padding:8px 10px;border:1px solid var(--orange);border-radius:6px;font-size:14px;box-sizing:border-box;background:white;';
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = 'All Area';
  if (!oldVal) allOpt.selected = true;
  select.appendChild(allOpt);
  areas.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    if (a === oldVal) opt.selected = true;
    select.appendChild(opt);
  });

  const restore = () => {
    const p = document.createElement('p');
    p.className = 'editable';
    p.style.cssText = 'padding:8px 0;margin:0;font-size:14px;cursor:pointer;';
    p.textContent = oldVal || '(tap to edit)';
    p.dataset.field = 'area';
    p.dataset.section = 'location';
    p.dataset.value = oldVal;
    p.onclick = () => editLocationArea(p);
    parent.replaceChild(p, select);
  };

  select.onchange = () => {
    const newVal = select.value;
    UserState.updateLocation('area', newVal);
    showToast('Saved!');
    renderPersonalDetails();
  };

  parent.replaceChild(select, el);
  select.focus();
}

function openGpsMap() {
  const town = UserState.location.town || 'Gaborone';
  const area = UserState.location.area || '';
  const q = encodeURIComponent([area, town, 'Botswana'].filter(Boolean).join(', '));
  window.open(`https://maps.google.com/maps?q=${q}`, '_blank');
}

// ─── CONTACT MANAGEMENT ───
function addMobileEntry() {
  const m = { id: genId(), title: '', network: 'BTC', number: '', isPrimary: false };
  UserState.addMobile(m);
  renderPersonalDetails();
  // Re-open the mobile sub-accordion
  document.querySelectorAll('.sub-accordion-header').forEach(h => {
    if (h.textContent.includes('Mobile Numbers')) h.parentElement.classList.add('open');
  });
}

function removeMobileEntry(id) {
  UserState.removeMobile(id);
  renderPersonalDetails();
  showToast('Removed');
}

function setPrimaryMobile(id) {
  UserState.setPrimaryMobile(id);
  renderPersonalDetails();
  showToast('Primary updated');
}

function updateMobileField(id, field, value) {
  const m = UserState.contacts.mobiles.find(x => x.id === id);
  if (m) { m[field] = value; UserState._persistContacts(); }
}

function addWhatsAppEntry() {
  const w = { id: genId(), title: '', countryCode: '+267', number: '', isPrimary: false };
  UserState.addWhatsApp(w);
  renderPersonalDetails();
  document.querySelectorAll('.sub-accordion-header').forEach(h => {
    if (h.textContent.includes('WhatsApp Numbers')) h.parentElement.classList.add('open');
  });
}

function removeWhatsAppEntry(id) {
  UserState.removeWhatsApp(id);
  renderPersonalDetails();
  showToast('Removed');
}

function setPrimaryWhatsApp(id) {
  UserState.setPrimaryWhatsApp(id);
  renderPersonalDetails();
  showToast('Primary updated');
}

function updateWhatsAppField(id, field, value) {
  const w = UserState.contacts.whatsapps.find(x => x.id === id);
  if (w) { w[field] = value; UserState._persistContacts(); }
}

// ─── FAVOURITE SUPPLIERS PAGE ───
function renderFavouriteSuppliers() {
  const list = document.getElementById('favourite-suppliers-list');
  if (!list) return;

  const favIds = UserState.favouriteSuppliers;
  const allBiz = [...(window.SAMPLE_BUSINESSES || [])];

  if (UserState.hasBusiness()) {
    const biz = UserState.business;
    allBiz.push({
      id: 'biz_user', name: biz.name, category: biz.category, location: biz.town,
      initials: biz.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
      color: window.APP_COLORS[biz.name.charCodeAt(0) % window.APP_COLORS.length],
      phone: biz.phone || '', public: true, description: ''
    });
  }

  const favourites = allBiz.filter(b => favIds.includes(b.id)).sort((a,b) => a.name.localeCompare(b.name));

  if (favourites.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px 16px;color:var(--grey-dark);"><i class="fas fa-heart" style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);"></i><p>No favourite suppliers yet.</p><p style="font-size:12px;margin-top:6px;">Save suppliers from the Directory to see them here.</p></div>`;
    return;
  }

  list.innerHTML = favourites.map(b => `
    <div class="fav-card" onclick="openBizProfile('${b.id}','${b.name.replace(/'/g,"\\'")}','${b.initials}','${b.color}','${b.location}','${b.phone||''}',${b.public||false},'${(b.description||'').replace(/'/g,"\\'")}')">
      <div class="fav-avatar" style="background:${b.color};">${b.initials}</div>
      <div class="fav-info">
        <div class="fav-name">${b.name}</div>
        <div class="fav-meta">${b.category} · ${b.location}</div>
      </div>
      <button class="fav-remove" onclick="event.stopPropagation();removeFavourite('${b.id}')"><img src="assets/icons/solid/xmark_orange.webp" style="width:14px;height:14px;display:block;"></button>
    </div>
  `).join('');
}

function removeFavourite(id) {
  UserState.toggleFavourite(id);
  renderFavouriteSuppliers();
  showToast('Removed from favourites');
}

// ─── INTERESTS PAGE ───
function renderInterestsPage() {
  const body = document.getElementById('interests-page-body');
  if (!body) return;

  const data = window.WIROG_PRODUCT_CATEGORIES;
  if (!data || !data.categories) {
    body.innerHTML = '<p style="padding:20px;text-align:center;color:var(--grey-dark);">Categories not loaded</p>';
    return;
  }

  const allSelected = UserState.interests.length === 0;
  let html = `<div style="padding:12px 16px;border-bottom:1px solid var(--grey-light);cursor:pointer;font-size:15px;font-weight:600;background:${allSelected ? 'var(--orange-light)' : 'transparent'};" onclick="toggleAllInterests()">
    <input type="checkbox" ${allSelected ? 'checked' : ''} style="margin-right:10px;accent-color:var(--orange);">All Interests
  </div>`;

  const renderItem = (cat, level) => {
    const indent = (level - 1) * 16;
    const isChecked = UserState.interests.includes(cat.name);
    const hasChildren = cat.children && cat.children.length > 0;
    const safeName = cat.name.replace(/'/g, "\\'");
    const childId = 'int-ch-' + (cat.slug || cat.id || safeName).replace(/[^a-z0-9-]/gi, '');

    const rowClick = hasChildren
      ? `event.stopPropagation();toggleCategoryChildren('${childId}')`
      : `event.stopPropagation();toggleInterestCheckbox('${safeName}', this.querySelector('input').checked)`;

    let itemHtml = `<div style="padding:8px 16px;border-bottom:1px solid var(--grey-light);cursor:pointer;font-size:14px;padding-left:${indent + 16}px;display:flex;align-items:center;" onclick="${rowClick}">
      <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-right:8px;" onclick="event.stopPropagation();toggleInterestCheckbox('${safeName}', this.checked)">${cat.name}
    </div>`;

    if (hasChildren) {
      itemHtml += `<div id="${childId}" style="display:none;">`;
      cat.children.forEach(child => { itemHtml += renderItem(child, level + 1); });
      itemHtml += `</div>`;
    }
    return itemHtml;
  };

  data.categories.forEach(cat => { html += renderItem(cat, 1); });
  body.innerHTML = html;
}

function toggleInterestCheckbox(name, checked) {
  if (checked) {
    if (!UserState.interests.includes(name)) UserState.interests.push(name);
  } else {
    UserState.interests = UserState.interests.filter(c => c !== name);
  }
  renderInterestsPage();
}

function toggleAllInterests() {
  const allCats = [];
  const data = window.WIROG_PRODUCT_CATEGORIES || { categories: [] };
  data.categories.forEach(cat => {
    if (cat.children) {
      cat.children.forEach(sub => { allCats.push(sub.name); });
    } else {
      allCats.push(cat.name);
    }
  });
  if (UserState.interests.length === 0) {
    UserState.interests = allCats;
  } else {
    UserState.interests = [];
  }
  renderInterestsPage();
}

function toggleCategoryChildren(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function saveInterestsFromPage() {
  UserState._persistInterests();
  showToast('Interests saved!');
  goTo('view-account');
}

// ─── ACCOUNT UI ───
function updateAccountHero() {
  const s = UserState;
  const isGuest = s.id === 'guest';
  const isAdmin = s.role === 'Administrator';
  const name = isGuest ? 'Browse as Guest' : ((s.firstName + ' ' + s.surname).trim() || s.name);
  const initials = isGuest ? '?' : (isAdmin ? 'AD' : name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase());
  const color = isGuest ? '#999' : (isAdmin ? '#2a2a2a' : window.APP_COLORS[initials.charCodeAt(0) % window.APP_COLORS.length]);
  const avatar = document.getElementById('acct-avatar');
  avatar.style.background = color;

  if (isGuest) {
    avatar.innerHTML = '<img src="assets/images/company_logos_dummy/new_wirog_logo22.webp" style="width:82px;height:82px;border-radius:50%;object-fit:cover;display:block;">';
  } else if (isAdmin) {
    avatar.innerHTML = initials;
  } else {
    const demoAcc = window.DEMO_ACCOUNTS.find(a => a.id === s.id);
    const logo = demoAcc?.logo || null;
    const imgSrc = logo || `assets/images/profile_pictures_dummy/${encodeURIComponent(name)}.jpg`;
    avatar.innerHTML = `<img src="${imgSrc}" style="width:82px;height:82px;border-radius:50%;object-fit:cover;display:block;" onerror="this.outerHTML='${initials}'">`;
  }

  document.getElementById('acct-name').textContent = name;
  document.getElementById('acct-role').textContent = isAdmin ? 'Administrator' : s.role;
  const badgeMap = {
    'Browser': 'Guest',
    'General User': 'Active Free Plan',
    'Tradesperson (Contractor)': 'Tradesperson Plan',
    'Business & Materials Supplier': 'Supplier Plan',
    'Administrator': 'Admin'
  };
  document.getElementById('acct-badge').textContent = badgeMap[s.role] || 'Active Free Plan';
  const noteCount = (window._notes || []).filter(function(n) { return n.userId === s.id; }).length;
  const el = document.getElementById('pro-notes-count');
  if (el) el.textContent = noteCount + ' note' + (noteCount !== 1 ? 's' : '');
}

// ─── SWITCHER HELPERS ───
function renderSwitcherOption(id, name, role, initials, color, extraAttr) {
  const noteCount = (window._notes || []).filter(function(n) { return n.userId === id; }).length;
  const isActive = UserState.id === id;
  var clickHandler = extraAttr || (' onclick="switchTo(\'' + id + '\')" ');
  var checkHtml = isActive ? '<i class="fas fa-check-circle switcher-check"></i>' : '';
  return '<div class="switcher-option"' + clickHandler + '>' +
    '<div class="switcher-avatar" style="background:' + color + ';">' + initials + '</div>' +
    '<div class="switcher-info"><h4>' + name + '</h4><p>' + role + '</p></div>' +
    '<div style="display:flex;align-items:center;gap:8px;margin-left:auto;"><span class="note-count-badge">' + noteCount + '</span>' + checkHtml + '</div>' +
  '</div>';
}

function openSwitcher() {
  const list = document.getElementById('switcher-list');
  if (!list) return;

  var html = '';

  // 1. Browse as Guest
  html += renderSwitcherOption('guest', 'Browse as Guest', 'Browser', '?', '#999');

  // 2. Divider
  html += '<div class="switcher-section-divider"></div>';

  // 3. Featured header
  html += '<div class="switcher-section-header">Featured</div>';

  // 4. Admin
  html += '<div class="switcher-option" onclick="event.stopPropagation();closeSwitcher();openModal(\'admin-pw-modal\')">' +
    '<div class="switcher-avatar" style="background:#2a2a2a;">AD</div>' +
    '<div class="switcher-info"><h4>Admin</h4><p>Administrator</p></div>' +
    '<i class="fas fa-lock" style="color:var(--grey-mid);margin-left:auto;font-size:14px;"></i>' +
  '</div>';

  // 5. Board Kings & Staff
  html += '<div class="switcher-section-header" style="font-size:10px;padding-top:2px;">Board Kings</div>';
  var bkIds = ['supplier', 'staff-kudi', 'staff-mark', 'staff-smokey', 'staff-tshepang', 'user-william', 'user-robert'];
  bkIds.forEach(function(id) {
    var a = window.DEMO_ACCOUNTS.find(function(x) { return x.id === id; });
    if (a) html += renderSwitcherOption(a.id, a.name, a.role, a.initials, a.color);
  });

  // 6. Demo Accounts
  html += '<div class="switcher-section-header" style="font-size:10px;padding-top:2px;">Demo Accounts</div>';
  var demoIds = ['general', 'trade', 'user-gerald', 'owner-biz2', 'owner-biz3', 'owner-biz4'];
  demoIds.forEach(function(id) {
    var a = window.DEMO_ACCOUNTS.find(function(x) { return x.id === id; });
    if (a) html += renderSwitcherOption(a.id, a.name, a.role, a.initials, a.color);
  });

  // 7. Divider + Other Accounts button
  html += '<div class="switcher-section-divider"></div>';
  html += '<div class="switcher-other-btn" onclick="event.stopPropagation();closeSwitcher();openOtherUsers();">Other Accounts <span style="font-size:16px;">\u2192</span></div>';

  list.innerHTML = html;
  openModal('switcher-modal');
}

function closeSwitcher() { closeModal('switcher-modal'); }

async function switchTo(id) {
  const account = window.DEMO_ACCOUNTS.find(a => a.id === id);
  if (!account) { closeSwitcher(); return; }
  await saveKpiToDB();
  UserState.set(account.id, account.name, account.role, '', account.town, '');
  localStorage.setItem('wirog_userId', id);
  updateAccountHero();
  if (id === 'supplier') {
    UserState.business = { name: 'Board Kings', category: 'Boards & Timber', town: 'Gaborone', phone: '+267 71234567', subscription: 'full' };
    renderBusinessCard();
    UserState.kpi = { ads: 14, views: 1204, likes: 85, noteAdds: 32 };
    UserState.interests = ['Boards & Timber', 'Tools & Equipment', 'Hardware & Fasteners'];
  } else if (id === 'trade') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 45, likes: 12, noteAdds: 8 };
    UserState.interests = ['Paint', 'Plumbing', 'Electrical'];
  } else if (id === 'general') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 12, likes: 3, noteAdds: 5 };
    UserState.interests = ['Tiles & Flooring', 'Lighting', 'Paint'];
  } else if (id === 'user-gerald') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 2, views: 68, likes: 15, noteAdds: 11 };
    UserState.interests = ['Building Materials', 'Cement & Aggregates', 'Steel & Metal Products'];
  } else if (id === 'owner-biz2') {
    UserState.business = { name: 'BuildIt Gabs', category: 'Paint', town: 'Gaborone', phone: '+267 72345678', subscription: 'full' };
    renderBusinessCard();
    UserState.kpi = { ads: 22, views: 890, likes: 62, noteAdds: 18 };
    UserState.interests = ['Paint', 'Hardware & Fasteners', 'Tools & Equipment'];
  } else if (id === 'owner-biz3') {
    UserState.business = { name: 'Francistown Steel', category: 'Steel & Metal Products', town: 'Francistown', phone: '+267 73456789', subscription: 'full' };
    renderBusinessCard();
    UserState.kpi = { ads: 18, views: 720, likes: 48, noteAdds: 14 };
    UserState.interests = ['Steel & Metal Products', 'Cement & Aggregates', 'Roofing & Ceiling'];
  } else if (id === 'owner-biz4') {
    UserState.business = { name: 'Gabs Plumbing Depot', category: 'Plumbing', town: 'Gaborone', phone: '+267 74567890', subscription: 'full' };
    renderBusinessCard();
    UserState.kpi = { ads: 15, views: 560, likes: 38, noteAdds: 20 };
    UserState.interests = ['Plumbing', 'Sanitaryware', 'Bathroom & Kitchen'];
  } else if (id === 'staff-kudi' || id === 'staff-mark' || id === 'staff-smokey' || id === 'staff-tshepang') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 35, likes: 8, noteAdds: 18 };
    UserState.interests = ['Boards & Timber', 'Hardware & Fasteners', 'Tools & Equipment'];
  } else if (id === 'guest') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
  } else if (id === 'admin') {
    closeSwitcher();
    openModal('admin-pw-modal');
    return;
  } else {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
    UserState.interests = [];
  }
  saveKpiToDB(); updateKPI(); closeSwitcher();
  reloadNotesForUser();
  showToast(`Switched to ${account.name}`);
}

// ─── OTHER USERS (from DEMO_PROFILES) ───
function openOtherUsers() {
  var coreIds = window.DEMO_ACCOUNTS.map(function(a) { return a.id; });
  var allProfiles = window.DEMO_PROFILES || [];
  var filtered = allProfiles.filter(function(p) { return !coreIds.includes(p.id); });

  filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });

  window._otherUsersData = filtered;
  renderOtherUsersList(filtered);

  var letters = [...new Set(filtered.map(function(p) { return p.name[0].toUpperCase(); }))].sort();
  renderOtherUsersAlpha(letters);

  openModal('other-users-modal');
}

function renderOtherUsersList(profiles) {
  var list = document.getElementById('other-users-list');
  if (!list) return;

  if (!profiles || profiles.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--grey-dark);font-size:14px;">No accounts found.</div>';
    return;
  }

  var grouped = {};
  profiles.forEach(function(p) {
    var letter = p.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(p);
  });

  var html = '';
  Object.keys(grouped).sort().forEach(function(letter) {
    html += '<div class="other-user-section-label" id="other-section-' + letter + '">' + letter + '</div>';
    grouped[letter].forEach(function(p) {
      var isActive = UserState.id === p.id;
      html += '<div class="other-user-item" onclick="switchToOtherUser(\'' + p.id + '\')">' +
        '<div class="other-user-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
        '<div class="other-user-info"><h4>' + p.name + '</h4><p>' + p.role + ' \u00b7 ' + p.town + '</p></div>' +
        (isActive ? '<i class="fas fa-check-circle switcher-check" style="margin-left:auto;"></i>' : '') +
      '</div>';
    });
  });

  list.innerHTML = html;
}

function renderOtherUsersAlpha(letters) {
  var strip = document.getElementById('other-users-alpha');
  if (!strip) return;
  strip.innerHTML = letters.map(function(l) {
    return '<a href="#" onclick="event.preventDefault();scrollToOtherSection(\'' + l + '\')">' + l + '</a>';
  }).join('');
}

function scrollToOtherSection(letter) {
  var el = document.getElementById('other-section-' + letter);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterOtherUsers(search) {
  var term = search.toLowerCase().trim();
  var all = window._otherUsersData || [];
  var filtered = term
    ? all.filter(function(p) { return p.name.toLowerCase().includes(term) || p.role.toLowerCase().includes(term) || p.town.toLowerCase().includes(term); })
    : all;
  renderOtherUsersList(filtered);
  var letters = [...new Set(filtered.map(function(p) { return p.name[0].toUpperCase(); }))].sort();
  renderOtherUsersAlpha(letters);
}

async function switchToOtherUser(id) {
  var allProfiles = window.DEMO_PROFILES || [];
  var profile = allProfiles.find(function(p) { return p.id === id; });
  if (!profile) return;

  await saveKpiToDB();

  UserState.set(profile.id, profile.name, profile.role, '', profile.town, profile.phone || '');
  UserState.firstName = profile.firstName || '';
  UserState.surname = profile.surname || '';
  localStorage.setItem('wirog_userId', profile.id);

  UserState.business = null;
  resetBusinessCard();
  UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0 };
  UserState.interests = [];

  updateAccountHero();
  saveKpiToDB();
  updateKPI();
  closeModal('other-users-modal');
  reloadNotesForUser();
  showToast('Switched to ' + profile.name);
}

async function saveKpiToDB() {
  try {
    await WirogDB.put('kpi', { id: UserState.id, ...UserState.kpi });
    try {
      if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
        await window.SyncQueue.enqueue('kpi', { id: UserState.id, ...UserState.kpi }, { clientId: UserState.id });
        if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
      }
    } catch(e) { console.warn('Failed to enqueue KPI for sync:', e); }
  } catch(e) { console.error('Failed to save KPI to DB:', e); }
}

function updateAccountUI() {
  updateAccountHero();
  const isGuest = UserState.id === 'guest';
  const isAdmin = UserState.role === 'Administrator';
  const guestCta = document.getElementById('guest-cta');

  const adminDash = document.getElementById('admin-dashboard-entry');
  if (adminDash) adminDash.style.display = isAdmin ? 'block' : 'none';

  var delRow = document.getElementById('delete-account-row');
  if (delRow) delRow.style.display = (isGuest || isAdmin) ? 'none' : '';

  if (isGuest) {
    if (guestCta) guestCta.style.display = 'block';
    resetBusinessCard();
  } else if (isAdmin) {
    if (guestCta) guestCta.style.display = 'none';
    const adminDash = document.getElementById('admin-dashboard-entry');
    if (adminDash) adminDash.style.display = 'block';
    document.getElementById('biz-card-content').innerHTML = '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;">Manage the platform from the Admin Dashboard.</p>';
  } else {
    if (guestCta) guestCta.style.display = 'none';
    if (UserState.hasBusiness()) { renderBusinessCard(); updateSubStatus(); }
    else { resetBusinessCard(); }
  }
}

function toggleBizActions() {
  const body = document.getElementById('biz-actions-body');
  const chevron = document.getElementById('biz-actions-chevron');
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

function renderBusinessCard() {
  const biz = UserState.business;
  if (!biz) return;
  const init = biz.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const col = window.APP_COLORS[init.charCodeAt(0) % window.APP_COLORS.length];
  const isPublic = biz.subscription === 'catalogue';
  const nameEsc = biz.name.replace(/'/g, "\\'");
  document.getElementById('biz-card-content').innerHTML = `
    <div class="biz-card-header" style="cursor:pointer;" onclick="toggleBizActions()">
      ${biz.name === 'Board Kings' ? `<img src="assets/images/company_logos_dummy/Board_Kings_Logo_.webp" class="biz-logo-img">` : `<div class="biz-logo" style="background:${col};">${init}</div>`}
      <div class="biz-name-wrap"><h3>${biz.name}</h3><p>${biz.category} · ${biz.town}</p></div>
      <span id="biz-actions-chevron" style="margin-left:auto;color:var(--grey-mid);font-size:12px;transition:transform 0.2s;">▶</span>
    </div>
    <div id="biz-actions-body" style="display:none;padding:10px 16px;border-top:1px solid var(--grey-light);">
      <button class="btn-outline btn-sm" style="margin-top:4px;" onclick="openBizProfile('biz_user','${nameEsc}','${init}','${col}','${biz.town}','${biz.phone || ''}',${isPublic},'')">
        <i class="fas fa-eye"></i> View Profile
      </button>
      <button class="btn-outline btn-sm" style="margin-top:6px;" onclick="openBizCatalogue('biz_user','${nameEsc}','${biz.town}','${biz.phone || ''}','${col}','${init}')">
        <i class="fas fa-list"></i> Edit Catalogue
      </button>
      <button class="btn-outline btn-sm" style="margin-top:6px;" onclick="openPromoModal()">
        <i class="fas fa-bullhorn"></i> Create Promo
      </button>
    </div>`;
}

function resetBusinessCard() {
  document.getElementById('biz-card-content').innerHTML = '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;margin-bottom:12px;">No business registered yet.</p><button class="btn btn-sm" onclick="openCreateBiz()">+ Add Business</button>';
}

async function updateKPI() {
  document.getElementById('kpi-ads').textContent = UserState.kpi.ads;
  document.getElementById('kpi-views').textContent = UserState.kpi.views;
  document.getElementById('kpi-likes').textContent = UserState.kpi.likes;
  document.getElementById('kpi-note-adds').textContent = UserState.kpi.noteAdds;
  await saveKpiToDB();
}

function openCreateBiz() {
  const biz = UserState.business;
  if (biz) {
    document.getElementById('biz-name').value = biz.name || '';
    document.getElementById('biz-cat').value = biz.category || 'Timber & Boards';
    document.getElementById('biz-town').value = biz.town || 'Gaborone';
    document.getElementById('biz-phone').value = biz.phone || '';
    document.querySelector('#biz-modal .modal-title').textContent = 'Edit Business';
  } else {
    document.getElementById('biz-name').value = '';
    document.getElementById('biz-cat').value = 'Timber & Boards';
    document.getElementById('biz-town').value = 'Gaborone';
    document.getElementById('biz-phone').value = '';
    document.querySelector('#biz-modal .modal-title').textContent = 'Add Business';
  }
  openModal('biz-modal');
}

async function saveBusiness() {
  const name = document.getElementById('biz-name').value.trim();
  const category = document.getElementById('biz-cat').value;
  const town = document.getElementById('biz-town').value;
  const phone = document.getElementById('biz-phone').value.trim();
  if (!name) { showToast('Please enter a business name'); return; }
  const biz = { id: 'biz_user', name, category, town, phone, subscription: 'free' };
  UserState.business = { name, category, town, phone, subscription: 'free' };
  try { await WirogDB.put('businesses', biz); } catch(e) { console.error('Failed to save business to DB:', e); }
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('businesses', biz, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue business for sync:', e); }
  renderBusinessCard(); closeModal('biz-modal'); renderDirectory();
  showToast('✅ Business saved!');
}

function shareApp() {
  const text = "Check out Wirog Supply Solutions - Botswana's premier B2B marketplace for building materials and trades!";
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

async function upgradeSubscription(tier) {
  if (!UserState.business) { showToast('Please add a business first'); return; }
  if (tier === 'boost') {
    UserState.business.subscription = 'boost';
    try { await WirogDB.put('businesses', { id: 'biz_user', ...UserState.business }); } catch(e) {}
    try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('businesses', { id: 'biz_user', ...UserState.business }, { clientId: UserState.id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue business update for sync:', e); }
    renderBusinessCard(); renderDirectory();
    showToast('✅ Directory & Boost activated! (P300/yr)');
  } else if (tier === 'catalogue') {
    UserState.business.subscription = 'catalogue';
    try { await WirogDB.put('businesses', { id: 'biz_user', ...UserState.business }); } catch(e) {}
      try { if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') { await window.SyncQueue.enqueue('businesses', { id: 'biz_user', ...UserState.business }, { clientId: UserState.id }); if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{}); } } catch(e) { console.warn('Failed to enqueue business update for sync:', e); }
    renderBusinessCard(); renderDirectory();
    showToast('✅ Public Catalogue activated! (P1,000)');
  }
  updateSubStatus();
}

function updateSubStatus() {
  const el = document.getElementById('sub-tier-name');
  if (!el || !UserState.business) return;
  const sub = UserState.business.subscription || 'free';
  const labels = { free: 'Free Onboarding', boost: 'Directory & Boost', catalogue: 'Public Catalogue' };
  el.textContent = labels[sub] || 'Free Plan';
}

// ─── SETTINGS FUNCTIONS ───
function installApp() {
  var prompt = window._installPrompt;
  if (prompt) {
    prompt.prompt();
    prompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') showToast('App installed!');
      else showToast('Install cancelled');
      window._installPrompt = null;
    });
  } else {
    showToast('App already installed or not supported');
  }
}

async function clearAppCache() {
  try {
    var stores = ['users','businesses','items','promos','notes','kpi','filters','profiles','credentials'];
    for (var i = 0; i < stores.length; i++) {
      if (WirogDB.db && WirogDB.db.objectStoreNames.contains(stores[i])) {
        await WirogDB.clear(stores[i]);
      }
    }
  } catch(e) { console.warn('Failed to clear some IndexedDB stores:', e); }

  try {
    var cacheKeys = await caches.keys();
    for (var j = 0; j < cacheKeys.length; j++) {
      await caches.delete(cacheKeys[j]);
    }
  } catch(e) { console.warn('Failed to clear caches:', e); }

  localStorage.clear();
  UserState.clear();
  showToast('Cache cleared');
}

function deleteAccount() {
  var isReal = window.Auth && window.Auth.isRealUser();
  if (!isReal) {
    showToast('Guest and demo accounts cannot be deleted');
    return;
  }
  openModal('delete-account-modal');
}

async function confirmDeleteAccount() {
  closeModal('delete-account-modal');

  try {
    var stores = ['users','businesses','items','promos','notes','kpi','filters','profiles','credentials'];
    for (var i = 0; i < stores.length; i++) {
      if (WirogDB.db && WirogDB.db.objectStoreNames.contains(stores[i])) {
        await WirogDB.clear(stores[i]);
      }
    }
  } catch(e) { console.warn('Failed to clear stores:', e); }

  try {
    var cacheKeys = await caches.keys();
    for (var j = 0; j < cacheKeys.length; j++) {
      await caches.delete(cacheKeys[j]);
    }
  } catch(e) { console.warn('Failed to clear caches:', e); }

  localStorage.clear();
  UserState.clear();
  showToast('Account deleted');

  document.getElementById('view-welcome')?.classList.add('active');
  var activeView = document.querySelector('.view.active');
  if (activeView) activeView.classList.remove('active');
  if (window.manageUI) manageUI('view-welcome');
}

// ─── WINDOW EXPORTS ───
window.openSwitcher = openSwitcher;
window.closeSwitcher = closeSwitcher;
window.switchTo = switchTo;
window.openOtherUsers = openOtherUsers;
window.switchToOtherUser = switchToOtherUser;
window.filterOtherUsers = filterOtherUsers;
window.scrollToOtherSection = scrollToOtherSection;
window.updateAccountUI = updateAccountUI;
window.updateKPI = updateKPI;
window.openCreateBiz = openCreateBiz;
window.saveBusiness = saveBusiness;
window.upgradeSubscription = upgradeSubscription;
window.updateSubStatus = updateSubStatus;
window.renderPersonalDetails = renderPersonalDetails;
window.renderFavouriteSuppliers = renderFavouriteSuppliers;
window.renderInterestsPage = renderInterestsPage;
window.saveInterestsFromPage = saveInterestsFromPage;
window.toggleSubAcc = toggleSubAcc;
window.toggleBizActions = toggleBizActions;
window.editField = editField;
window.confirmField = confirmField;
window.cancelField = cancelField;
window.editLocationTown = editLocationTown;
window.editLocationArea = editLocationArea;
window.openGpsMap = openGpsMap;
window.setGender = setGender;
window.editDateField = editDateField;
window.addMobileEntry = addMobileEntry;
window.removeMobileEntry = removeMobileEntry;
window.setPrimaryMobile = setPrimaryMobile;
window.updateMobileField = updateMobileField;
window.addWhatsAppEntry = addWhatsAppEntry;
window.removeWhatsAppEntry = removeWhatsAppEntry;
window.setPrimaryWhatsApp = setPrimaryWhatsApp;
window.updateWhatsAppField = updateWhatsAppField;
window.removeFavourite = removeFavourite;
window.toggleInterestCheckbox = toggleInterestCheckbox;
window.toggleAllInterests = toggleAllInterests;
window.toggleCategoryChildren = toggleCategoryChildren;
window.installApp = installApp;
window.clearAppCache = clearAppCache;
window.deleteAccount = deleteAccount;
window.confirmDeleteAccount = confirmDeleteAccount;
