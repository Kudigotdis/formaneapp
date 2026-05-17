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
  body.innerHTML = renderIdentitySection() + renderSocialSection() + renderCategoriesSection() + renderProAccountSection();
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
      ${renderLocationSection()}
      ${renderContactSection()}
    </div>
  </div>`;
}

function renderLocationSection() {
  const s = UserState;
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Location</div>
    <div class="sub-accordion-body">
      <div style="padding:4px 0;"><label>Town / Village / City</label><p class="editable" data-field="town" data-section="location" data-value="${(s.location.town||'Gaborone').replace(/"/g,'&quot;')}" onclick="editLocationTown(this)">${s.location.town || 'Gaborone'}</p></div>
      <div style="padding:4px 0;"><label>Area / Neighbourhood</label><p class="editable" data-field="area" data-section="location" data-value="${(s.location.area||'').replace(/"/g,'&quot;')}" onclick="editLocationArea(this)">${s.location.area || '(tap to edit)'}</p></div>
      <div style="padding:4px 0;"><label>Google GPS Link</label><p class="editable" data-field="gps" data-section="location" data-value="${(s.location.gps||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${s.location.gps || '(tap to add link)'}</p><button class="add-entry-btn" style="margin-top:4px;" onclick="openGpsMap()"><i class="fas fa-map-marked-alt"></i> Open in Google Maps</button></div>
    </div>
  </div>`;
}

function renderContactSection() {
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Contact</div>
    <div class="sub-accordion-body">
      ${renderMobileEntries()}
      ${renderWhatsAppEntries()}
    </div>
  </div>`;
}

function renderSocialSection() {
  const s = UserState;
  let socialHTML = Object.entries(s.contacts.social).map(([k,v]) =>
    `<div style="padding:4px 0;"><label style="text-transform:capitalize;">${k}</label><p class="editable" data-field="${k}" data-section="social" data-value="${(v||'').replace(/"/g,'&quot;')}" onclick="editField(this)">${v || '(tap to edit)'}</p></div>`
  ).join('');
  return `<div class="accordion">
    <div class="accordion-header" onclick="toggleAcc(this)"><span>Social Media</span></div>
    <div class="accordion-body" style="padding:8px 12px;">${socialHTML}</div>
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

function renderCategoriesSection() {
  const count = UserState.interests.length;
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Categories</div>
    <div class="sub-accordion-body">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;">
        <span style="font-size:13px;font-weight:600;">🏷️ ${count} Selected</span>
      </div>
      <p style="font-size:13px;color:var(--grey-dark);cursor:pointer;padding:8px 0;" onclick="goTo('view-user-interests');renderInterestsPage();">Tap to manage categories <span style="color:var(--orange);">→</span></p>
    </div>
  </div>`;
}

function renderProAccountSection() {
  const s = UserState;
  const isPro = s.isTradesperson();
  const hasProListing = !!getClaimedProId(s.id);
  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">Pro Account</div>
    <div class="sub-accordion-body">
      <div style="padding:8px 0;">
        ${hasProListing
          ? '<div class="pro-card-header" style="display:flex;align-items:center;gap:12px;padding:10px 0;">' +
            '<span style="font-size:13px;color:var(--green, #27ae60);font-weight:600;">✓ Pro Account Active</span>' +
            '<button class="btn-outline btn-sm" onclick="goTo(\'view-pro-account\')" style="margin-left:auto;"><i class="fas fa-chevron-right"></i> Manage</button>' +
            '</div>'
          : '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:10px;">Activate your Pro account to get discovered by customers looking for your services.</p>' +
            '<button class="btn btn-sm" style="background:var(--orange);color:white;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;width:100%;font-weight:600;" onclick="goTo(\'view-pro-account\')"><i class="fas fa-user-tie"></i> Activate Pro Account</button>'
        }
      </div>
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

/* ─── AGENT VERIFICATION PORTAL ─── */

function renderAgentPortal() {
  const s = UserState;
  const isAdmin = s.role === 'Administrator';
  
  if (!isAdmin) return ''; // Only admins can see the portal for now

  return `<div class="sub-accordion">
    <div class="sub-accordion-header" onclick="toggleSubAcc(this)">
      <div style="display:flex; align-items:center; gap:8px;">
         <span>🛠️</span> Wirog Agent Portal
      </div>
    </div>
    <div class="sub-accordion-body">
      <div style="padding:10px 0;">
        <label>Verify User Account</label>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <input type="text" id="agent-user-search" placeholder="User ID or Phone" style="flex:1; font-size:12px;">
          <button class="btn-sm" style="background:var(--orange); color:white;" onclick="agentVerifyUser()">Verify</button>
        </div>
        <p style="font-size:10px; color:var(--grey-dark); margin-top:4px;">Scan user ID to unlock VIP features.</p>
      </div>
    </div>
  </div>`;
}

async function agentVerifyUser() {
  const input = document.getElementById('agent-user-search');
  const userId = input.value.trim();
  if (!userId) return showToast("Enter a User ID");

  showToast("Verifying user...");
  // In a real app, this would update Firestore. For now, we simulate success.
  setTimeout(() => {
    showToast("✅ User Verified Successfully!");
    input.value = "";
  }, 1000);
}

/* ─── SYNC TRIGGER ─── */

async function triggerPlatformSync() {
  if (!window.WirogMediaCache) return showToast("Sync Engine not ready");
  
  showToast("🔄 Starting Platform Sync...");
  try {
    await window.WirogMediaCache.syncFromManifest('manifest.json', (progress) => {
       console.log(`Sync Progress: ${progress}%`);
    });
    showToast("✅ Assets Synced Offline!");
  } catch (e) {
    showToast("❌ Sync Failed: " + e.message);
  }
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

// ─── PAYMENT PROOF / PROMO REQUESTS ───
window._paymentProofPending = null;

function openPaymentProofModal(method, amount, purpose) {
  const modal = document.getElementById('payment-proof-modal');
  if (!modal) return;
  const instEl = document.getElementById('payment-proof-instructions');
  const methodNames = { BTC: 'BTC Smega', Mascom: 'Mascom Myzaka', Orange: 'Orange Money' };
  const displayMethod = methodNames[method] || method;
  const isMobile = ['BTC','Mascom','Orange'].includes(method);
  if (isMobile) {
    instEl.innerHTML = `Pay P${amount} via <strong>${displayMethod}</strong> for ${purpose}. After payment, upload a screenshot or send proof via WhatsApp.`;
  } else {
    instEl.innerHTML = `Pay P${amount} via bank transfer for ${purpose}.<br><strong>FNB Botswana &middot; Game City Branch</strong><br>Account Name: Wirog Investments<br><br>After payment, upload proof or send via WhatsApp.`;
  }
  openModal('payment-proof-modal');
  window._paymentProofPending = { method, amount: Number(amount), purpose };
}

function handleProofFileInput(files) {
  if (!files || files.length === 0) return;
  const f = files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const imgData = e.target.result;
    const preview = document.getElementById('payment-proof-preview');
    preview.innerHTML = '';
    const img = document.createElement('img'); img.src = imgData; img.style.width = '140px'; img.style.height = '140px'; img.style.objectFit = 'cover'; img.style.borderRadius = '6px';
    preview.appendChild(img);
    window._paymentProofPending.image = imgData;
  };
  reader.readAsDataURL(f);
}

function sendPaymentWhatsApp() {
  if (!window._paymentProofPending) return showToast('No payment selected');
  const { method, amount, purpose } = window._paymentProofPending;
  const text = `I have paid P${amount} via ${method} for ${purpose}. User ID: ${UserState.id}`;
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  showToast('WhatsApp opened. Send proof message to Wirog.');
}

function submitPaymentProof() {
  if (!window._paymentProofPending) return showToast('No payment to submit');
  const payload = {
    id: genId(),
    userId: UserState.id,
    method: window._paymentProofPending.method,
    amount: window._paymentProofPending.amount,
    purpose: window._paymentProofPending.purpose,
    image: window._paymentProofPending.image || null,
    status: 'pending',
    createdAt: Date.now()
  };
  const reqs = JSON.parse(localStorage.getItem('wirog_payment_requests') || '[]');
  reqs.push(payload);
  localStorage.setItem('wirog_payment_requests', JSON.stringify(reqs));
  window._paymentProofPending = null;
  document.getElementById('payment-proof-preview').innerHTML = '';
  closeModal('payment-proof-modal');
  showToast('Payment proof submitted. Pending admin review.');
  // If admin view is open, refresh
  try { window.renderPromoRequestsList && window.renderPromoRequestsList(); } catch(e){}
}

function createPromoRequest(obj) {
  const reqs = JSON.parse(localStorage.getItem('wirog_promo_requests') || '[]');
  const payload = Object.assign({ id: genId(), status: 'pending', createdAt: Date.now() }, obj);
  reqs.push(payload);
  localStorage.setItem('wirog_promo_requests', JSON.stringify(reqs));
  showToast('Promo request submitted. Pending admin review.');
}

function renderPromoRequestsList() {
  const container = document.getElementById('promo-requests-list');
  if (!container) return;
  const reqs = JSON.parse(localStorage.getItem('wirog_promo_requests') || '[]');
  const paymentReqs = JSON.parse(localStorage.getItem('wirog_payment_requests') || '[]');
  const all = reqs.concat(paymentReqs);

  const pendingCount = all.filter(r => r.status === 'pending').length;
  const totalEl = document.getElementById('count-total');
  const pendingEl = document.getElementById('count-pending');
  if (totalEl) totalEl.textContent = all.length;
  if (pendingEl) pendingEl.textContent = pendingCount;

  if (all.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--grey-dark);"><p style="font-size:14px;">No pending promo requests found.</p></div>';
    return;
  }

  container.innerHTML = all.map(r => {
    const date = new Date(r.createdAt).toLocaleDateString();
    const statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1);
    const sc = {
      pending: { bg: '#fff8e1', color: '#ffa000' },
      approved: { bg: '#e8f5e9', color: '#2e7d32' },
      rejected: { bg: '#ffebee', color: '#f44336' }
    }[r.status] || { bg: '#f5f5f5', color: '#666' };
    const imgSrc = r.image || '';
    const category = r.purpose || r.method || 'Payment';
    const methodName = r.method || 'Bank Transfer';

    return '<div class="promo-card" style="background:white;border:1px solid var(--grey-light);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 4px rgba(0,0,0,0.02);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
        '<div>' +
          '<div style="font-weight:700;font-size:14px;color:#111;">User: ' + r.userId + '</div>' +
          '<div style="font-size:11px;color:var(--grey-dark);">' + date + '</div>' +
        '</div>' +
        '<span style="background:' + sc.bg + ';color:' + sc.color + ';font-size:10px;font-weight:800;padding:4px 8px;border-radius:6px;text-transform:uppercase;">' + statusLabel + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:12px;background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:12px;">' +
        (imgSrc ? '<img src="' + imgSrc + '" style="width:60px;height:60px;border-radius:6px;object-fit:cover;background:#eee;">' : '<div style="width:60px;height:60px;border-radius:6px;background:#eee;display:flex;align-items:center;justify-content:center;font-size:20px;">\ud83d\udcc4</div>') +
        '<div style="flex:1;">' +
          '<div style="font-size:12px;font-weight:600;color:var(--grey-dark);margin-bottom:2px;">Category</div>' +
          '<div style="font-size:13px;color:#333;">' + category + '</div>' +
          '<div style="font-size:12px;margin-top:4px;color:var(--orange);font-weight:600;">Method: ' + methodName + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn" onclick="approveRequest(\'' + r.id + '\')" style="flex:2;font-size:12px;padding:10px;background:#4CAF50;">Approve</button>' +
        (imgSrc ? '<button class="btn-outline" onclick="viewProof(\'' + r.id + '\')" style="flex:1;font-size:12px;padding:10px;">View Proof</button>' : '') +
        '<button class="btn-outline" onclick="rejectRequestPrompt(\'' + r.id + '\')" style="flex:1;font-size:12px;padding:10px;color:#f44336;border-color:#ffebee;">Reject</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function markDriveRecordReviewed(id) {
  const key = 'wirog_drive_records_reviewed';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  if (!arr.includes(id)) arr.push(id);
  localStorage.setItem(key, JSON.stringify(arr));
  showToast('Marked as reviewed');
  renderPromoRequestsList();
}

function approveRequest(id) {
  const prs = JSON.parse(localStorage.getItem('wirog_promo_requests') || '[]');
  const pidx = prs.findIndex(p=>p.id===id);
  if (pidx !== -1) {
    prs[pidx].status = 'approved';
    localStorage.setItem('wirog_promo_requests', JSON.stringify(prs));
    // Push to promos feed
    pushToPromosFeed(prs[pidx]);
    showToast('Promo request approved');
    renderPromoRequestsList();
    return;
  }
  const pays = JSON.parse(localStorage.getItem('wirog_payment_requests') || '[]');
  const p2 = pays.findIndex(p=>p.id===id);
  if (p2 !== -1) {
    pays[p2].status = 'approved';
    localStorage.setItem('wirog_payment_requests', JSON.stringify(pays));
    showToast('Payment approved');
    renderPromoRequestsList();
    return;
  }
  showToast('Request not found');
}

function pushToPromosFeed(req) {
  const promos = window._promos || JSON.parse(localStorage.getItem('wirog_promos') || '[]');
  const expiresAt = Date.now() + (req.durationDays || 3) * 86400000;
  const promo = {
    id: req.id || 'promo_' + Date.now(),
    title: req.title || req.purpose || 'Promoted Item',
    desc: req.desc || '',
    category: req.category || 'General',
    businessName: req.businessName || req.userId || 'Business',
    promo: {
      status: 'active',
      expiresAt: expiresAt,
      cost: req.amount || 0,
      durationDays: req.durationDays || 3
    },
    kpi: { views: 0, likes: 0, addedToNotes: 0 },
    createdAt: Date.now()
  };
  promos.push(promo);
  window._promos = promos;
  localStorage.setItem('wirog_promos', JSON.stringify(promos));
}

function rejectRequestPrompt(id) {
  const reason = prompt('Enter rejection reason:');
  if (!reason) return;
  rejectRequest(id, reason);
}

function rejectRequest(id, reason) {
  const prs = JSON.parse(localStorage.getItem('wirog_promo_requests') || '[]');
  const pidx = prs.findIndex(p=>p.id===id);
  if (pidx !== -1) { prs[pidx].status = 'rejected'; prs[pidx].reason = reason; localStorage.setItem('wirog_promo_requests', JSON.stringify(prs)); showToast('Promo request rejected'); renderPromoRequestsList(); return; }
  const pays = JSON.parse(localStorage.getItem('wirog_payment_requests') || '[]');
  const p2 = pays.findIndex(p=>p.id===id);
  if (p2 !== -1) { pays[p2].status = 'rejected'; pays[p2].reason = reason; localStorage.setItem('wirog_payment_requests', JSON.stringify(pays)); showToast('Payment rejected'); renderPromoRequestsList(); return; }
  showToast('Request not found');
}

window.openPaymentProofModal = openPaymentProofModal;
window.handleProofFileInput = handleProofFileInput;
window.sendPaymentWhatsApp = sendPaymentWhatsApp;
window.submitPaymentProof = submitPaymentProof;
window.createPromoRequest = createPromoRequest;
window.renderPromoRequestsList = renderPromoRequestsList;
window.approveRequest = approveRequest;
window.rejectRequestPrompt = rejectRequestPrompt;

// ─── BOOST COUNTER HELPERS ───
window.getBoostCounter = function() {
  return Math.max(0, parseInt(localStorage.getItem('wirog_boosts_remaining') || '12', 10));
};

window.decrementBoostCounter = function() {
  let b = window.getBoostCounter();
  b = Math.max(0, b - 1);
  localStorage.setItem('wirog_boosts_remaining', String(b));
  ['boost-counter', 'boost-counter-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(b);
  });
  return b;
};


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

// ─── LIKED PAGE ───
function renderLikedList(mode) {
  var titleEl = document.getElementById('liked-page-title');
  if (titleEl) titleEl.textContent = mode === 'products' ? 'Liked Products' : mode === 'tradesmen' ? 'Liked Tradesmen' : 'Liked Suppliers';

  var list = document.getElementById('favourite-suppliers-list');
  if (!list) return;

  var favIds = UserState.favouriteSuppliers;

  if (mode === 'products') {
    var likedItems = JSON.parse(localStorage.getItem('wirog_liked_items') || '[]');
    if (likedItems.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:32px 16px;color:var(--grey-dark);"><i class="fas fa-box" style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);"></i><p style="font-weight:600;">No liked products yet</p><p style="font-size:13px;margin-top:4px;">Browse the catalogue and heart items you like.</p></div>';
    } else {
      var cats = window.WIROG_PRODUCT_CATEGORIES ? (window.WIROG_PRODUCT_CATEGORIES.categories || []) : [];
      var catMap = {};
      cats.forEach(function(c) { catMap[c.name] = c; });

      var grouped = {};
      likedItems.forEach(function(id) {
        var item = null;
        if (window._catalogueItems) item = window._catalogueItems.find(function(i) { return i.id === id; });
        var catName = item && item.category ? item.category : 'Other';
        if (!grouped[catName]) grouped[catName] = [];
        grouped[catName].push(item || { id: id, name: id, category: catName });
      });

      var sortedCats = Object.keys(grouped).sort();
      var html = '';
      sortedCats.forEach(function(cat) {
        html += '<div style="padding:10px 0;border-bottom:1px solid var(--grey-light);cursor:pointer;" onclick="showLikedCategoryItems(\'' + cat.replace(/'/g,"\\'") + '\')">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:15px;font-weight:600;">' + cat + '</span>' +
            '<span style="font-size:13px;color:var(--grey-dark);">' + grouped[cat].length + ' <span style="color:var(--orange);">→</span></span>' +
          '</div></div>';
      });
      list.innerHTML = html;
    }
    return;
  }

  var allProfiles = window.DEMO_PROFILES || [];
  var allBiz = [...(window.SAMPLE_BUSINESSES || [])];
  if (UserState.hasBusiness()) {
    var biz = UserState.business;
    allBiz.push({
      id: 'biz_user', name: biz.name, category: biz.category, location: biz.town,
      initials: biz.name.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase(),
      color: window.APP_COLORS[biz.name.charCodeAt(0) % window.APP_COLORS.length],
      phone: biz.phone || '', public: true, description: ''
    });
  }

  var items;
  if (mode === 'tradesmen') {
    items = allProfiles.filter(function(p) {
      return favIds.indexOf(p.id) !== -1 && (p.role === 'Tradesperson (Contractor)' || p.role === 'Business & Materials Supplier');
    });
  } else {
    items = allBiz.filter(function(b) { return favIds.indexOf(b.id) !== -1; });
  }

  if (items.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:32px 16px;color:var(--grey-dark);"><i class="fas fa-heart" style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);"></i><p style="font-weight:600;">No liked ' + mode + ' yet</p><p style="font-size:13px;margin-top:4px;">Browse the directory and heart the ones you like.</p></div>';
    return;
  }

  items.sort(function(a, b) { return a.name.localeCompare(b.name); });
  list.innerHTML = items.map(function(item) {
    var init = item.initials || item.name.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase();
    var col = item.color || window.APP_COLORS[init.charCodeAt(0) % window.APP_COLORS.length];
    var loc = item.town || item.location || '';
    var role = item.role || item.category || '';
    var onClick = mode === 'tradesmen'
      ? 'openProProfile(\'' + item.id + '\')'
      : 'openBizProfile(\'' + item.id + '\',\'' + item.name.replace(/'/g,"\\'") + '\',\'' + init + '\',\'' + col + '\',\'' + loc + '\',\'' + (item.phone || '') + '\')';
    return '<div class="dir-card" onclick="' + onClick + '">' +
      '<div class="dir-avatar" style="background:' + col + ';">' + init + '</div>' +
      '<div class="dir-info"><h3>' + item.name + '</h3><p>' + role + ' · ' + loc + '</p></div>' +
      '<button onclick="event.stopPropagation();toggleFavDir(this,\'' + item.id + '\');renderLikedList(\'' + mode + '\')" style="background:none;border:none;cursor:pointer;padding:4px 8px;flex-shrink:0;margin-left:auto;" title="Remove">' +
        '<img src="assets/icons/heart_active_icon.png" style="width:22px;height:22px;display:block;">' +
      '</button></div>';
  }).join('');
}

function showLikedCategoryItems(catName) {
  var list = document.getElementById('favourite-suppliers-list');
  if (!list) return;
  var likedItems = JSON.parse(localStorage.getItem('wirog_liked_items') || '[]');
  var items = likedItems.map(function(id) {
    return window._catalogueItems ? window._catalogueItems.find(function(i) { return i.id === id; }) : null;
  }).filter(Boolean).filter(function(i) { return i.category === catName; });

  if (items.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--grey-dark);"><p>No items in this category.</p></div>';
    return;
  }

  list.innerHTML = '<div style="padding:4px 0;">' +
    '<button onclick="renderLikedList(\'products\')" style="background:none;border:none;color:var(--orange);cursor:pointer;font-size:13px;margin-bottom:8px;">← Back to Categories</button>' +
    items.map(function(i) {
      return '<div class="dir-card" style="cursor:default;">' +
        '<div class="dir-avatar" style="background:var(--orange-light);color:var(--orange);font-size:16px;"><i class="fas fa-box"></i></div>' +
        '<div class="dir-info"><h3>' + (i.name || i.id) + '</h3></div>' +
      '</div>';
    }).join('') + '</div>';
}

function renderFavouriteSuppliers() {
  renderLikedList('suppliers');
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
  avatar.style.background = 'white';
  avatar.style.color = color;

  var customAvatar = s.customAvatar || localStorage.getItem('wirog_custom_avatar_' + s.id);
  if (customAvatar) {
    avatar.innerHTML = '<img src="' + customAvatar + '" style="width:120px;height:120px;border-radius:8px;object-fit:cover;display:block;">';
  } else if (isGuest) {
    avatar.innerHTML = '<img src="assets/images/company_logos_dummy/new_wirog_logo22.webp" style="width:120px;height:120px;border-radius:8px;object-fit:cover;display:block;">';
  } else if (isAdmin) {
    avatar.innerHTML = initials;
  } else {
    const demoAcc = window.DEMO_PROFILES ? window.DEMO_PROFILES.find(a => a.id === s.id) : null;
    const fallbackImage = `assets/images/profile_pictures_dummy/${encodeURIComponent(name)}.jpg`;
    const imgSrc = (demoAcc && demoAcc.image) || (demoAcc && demoAcc.logo) || fallbackImage;
    avatar.innerHTML = '<img src="' + imgSrc + '" style="width:120px;height:120px;border-radius:8px;object-fit:cover;display:block;" onerror="this.outerHTML=\'' + initials + '\'">';
  }

  document.getElementById('acct-name').textContent = name;
  document.getElementById('acct-role').textContent = isAdmin ? 'Administrator' : s.role;
  const noteCount = (window._notes || []).filter(function(n) { return n.userId === s.id; }).length;
  const el = document.getElementById('pro-notes-count');
  if (el) el.textContent = noteCount + ' note' + (noteCount !== 1 ? 's' : '');
}

function handleAvatarChange(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    var avatar = document.getElementById('acct-avatar');
    avatar.innerHTML = '<img src="' + dataUrl + '" style="width:120px;height:120px;border-radius:8px;object-fit:cover;display:block;">';
    localStorage.setItem('wirog_custom_avatar_' + UserState.id, dataUrl);
    if (UserState.customAvatar !== undefined) UserState.customAvatar = dataUrl;
  };
  reader.readAsDataURL(file);
}

// ─── SWITCHER HELPERS ───
function getSwitcherImg(id, name) {
  if (id === 'guest' || id === 'admin') return '';
  var p = window.DEMO_PROFILES ? window.DEMO_PROFILES.find(function(a) { return a.id === id || a.name === name; }) : null;
  var src = (p && p.image) || 'assets/images/profile_pictures_dummy/' + id + '-avatar.jpg';
  return '<img src="' + src + '" class="switcher-profile-img" onerror="this.outerHTML=\'\'">';
}

function renderSwitcherOption(id, name, role, initials, color, extraAttr) {
  const noteCount = (window._notes || []).filter(function(n) { return n.userId === id; }).length;
  const isActive = UserState.id === id;
  var clickHandler = extraAttr || (' onclick="switchTo(\'' + id + '\')" ');
  var checkHtml = isActive ? '<i class="fas fa-check-circle switcher-check"></i>' : '';
  var img = getSwitcherImg(id, name);
  return '<div class="switcher-option"' + clickHandler + '>' +
    '<div class="switcher-avatar" style="background:' + color + ';">' + (img || initials) + '</div>' +
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

  // 5. Group all DEMO_ACCOUNTS by business association
  var grouped = {};
  var unassociated = [];
  window.DEMO_ACCOUNTS.forEach(function(a) {
    if (a.id === 'guest' || a.id === 'admin') return;
    var assoc = window.BUSINESS_ASSOCIATIONS ? window.BUSINESS_ASSOCIATIONS[a.id] : null;
    if (assoc) {
      if (!grouped[assoc.businessId]) grouped[assoc.businessId] = [];
      grouped[assoc.businessId].push(a);
    } else {
      unassociated.push(a);
    }
  });

  Object.keys(grouped).sort().forEach(function(bizId) {
    var biz = window.SAMPLE_BUSINESSES.find(function(b) { return b.id === bizId; });
    if (!biz) return;
    html += '<div class="switcher-section-header" style="font-size:10px;padding-top:2px;">' + biz.name + '</div>';
    grouped[bizId].forEach(function(a) {
      html += renderSwitcherOption(a.id, a.name, a.role, a.initials, a.color);
    });
  });

  // 6. Unassociated Demo Accounts
  if (unassociated.length > 0) {
    html += '<div class="switcher-section-header" style="font-size:10px;padding-top:2px;">Other Accounts</div>';
    unassociated.forEach(function(a) {
      html += renderSwitcherOption(a.id, a.name, a.role, a.initials, a.color);
    });
  }

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

  // Handle admin specially (password gate)
  if (id === 'admin') {
    closeSwitcher();
    openModal('admin-pw-modal');
    return;
  }

  // Data-driven business resolution via BUSINESS_ASSOCIATIONS
  var assoc = window.BUSINESS_ASSOCIATIONS ? window.BUSINESS_ASSOCIATIONS[id] : null;
  if (assoc) {
    var biz = window.SAMPLE_BUSINESSES.find(function(b) { return b.id === assoc.businessId; });
    if (biz) {
      UserState.business = {
        id: biz.id, name: biz.name, category: biz.category,
        town: biz.location.split(',').pop().trim(),
        phone: biz.phone || '', subscription: biz.subscription || 'free'
      };
      UserState.businessRole = assoc.role;
      renderBusinessCard();
    }
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0, interactions: 0 };
    UserState.interests = biz ? [biz.category] : [];
  } else if (id === 'guest') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0, interactions: 0 };
    UserState.interests = [];
  } else if (id === 'trade') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 45, likes: 12, noteAdds: 8, interactions: 0 };
    UserState.interests = ['Paint', 'Plumbing', 'Electrical'];
  } else if (id === 'general') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 12, likes: 3, noteAdds: 5, interactions: 0 };
    UserState.interests = ['Tiles & Flooring', 'Lighting', 'Paint'];
  } else if (id === 'user-gerald') {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 2, views: 68, likes: 15, noteAdds: 11, interactions: 0 };
    UserState.interests = ['Building Materials', 'Cement & Aggregates', 'Steel & Metal Products'];
  } else {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0, interactions: 0 };
    UserState.interests = [];
  }
  saveKpiToDB(); updateKPI(); renderAccount(); closeSwitcher();
  reloadNotesForUser();
  showToast(`Switched to ${account.name}`);
  goTo('view-account');
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

  var assoc = window.BUSINESS_ASSOCIATIONS ? window.BUSINESS_ASSOCIATIONS[id] : null;
  if (assoc) {
    var biz = window.SAMPLE_BUSINESSES.find(function(b) { return b.id === assoc.businessId; });
    if (biz) {
      UserState.business = {
        id: biz.id, name: biz.name, category: biz.category,
        town: biz.location.split(',').pop().trim(),
        phone: biz.phone || '', subscription: biz.subscription || 'free'
      };
      UserState.businessRole = assoc.role;
      renderBusinessCard();
    }
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0, interactions: 0 };
    UserState.interests = biz ? [biz.category] : [];
  } else {
    UserState.business = null;
    resetBusinessCard();
    UserState.kpi = { ads: 0, views: 0, likes: 0, noteAdds: 0, interactions: 0 };
    UserState.interests = [];
  }

  updateAccountHero();
  saveKpiToDB();
  updateKPI();
  renderAccount();
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

// ─── ROLE-BASED ACCORDION RENDERERS ───

function renderNotesAccordion() {
  var body = document.getElementById('notes-accordion-body');
  if (!body) return;
  if (UserState.isBrowser()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;">' +
      '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:12px;">Save and organise items from promos and catalogue. Create a profile to use Notes.</p>' +
      '<button class="btn btn-sm" onclick="openModal(\'register-modal\')" style="margin-bottom:8px;">Create Profile</button>' +
      '<button class="btn-outline btn-sm" onclick="openModal(\'login-modal\')">Sign In</button>' +
    '</div>';
  } else {
    body.innerHTML = '<div style="padding-top:8px;display:flex;flex-direction:column;gap:8px;">' +
      '<button class="btn btn-sm" onclick="navTab(\'view-notes\',\'nav-notes\')">View Notes</button>' +
      '<button class="btn btn-sm" onclick="openModal(\'buy-notes-modal\')">Buy Notes</button>' +
    '</div>';
  }
}

function renderFavSuppliersAccordion() {
  var body = document.getElementById('fav-suppliers-accordion-body');
  if (!body) return;
  if (UserState.isBrowser()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;">' +
      '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:12px;">Like products, tradesmen, and suppliers for quick access. Create a profile to unlock this feature.</p>' +
      '<button class="btn btn-sm" onclick="openModal(\'register-modal\')" style="margin-bottom:8px;">Create Profile</button>' +
      '<button class="btn-outline btn-sm" onclick="openModal(\'login-modal\')">Sign In</button>' +
    '</div>';
  } else {
    var favCount = UserState.favouriteSuppliers.length;
    body.innerHTML = '<div style="padding-top:8px;display:flex;flex-direction:column;gap:8px;">' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;" onclick="renderLikedList(\'products\');goTo(\'view-favourite-suppliers\')"><i class="fas fa-box"></i> Products</button>' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;" onclick="renderLikedList(\'tradesmen\');goTo(\'view-favourite-suppliers\')"><i class="fas fa-user-tie"></i> Tradesmen' + (favCount > 0 ? ' <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:10px;font-size:12px;">' + favCount + '</span>' : '') + '</button>' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;" onclick="renderLikedList(\'suppliers\');goTo(\'view-favourite-suppliers\')"><i class="fas fa-store"></i> Suppliers</button>' +
    '</div>';
  }
}

function renderBusinessCardHTML(biz) {
  if (!biz) return '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;margin-bottom:12px;">No business registered yet.</p>' +
    '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;margin-bottom:8px;" onclick="openCreateBiz()"><i class="fas fa-plus"></i> + List Business</button>' +
    '<button class="btn-outline btn-sm" onclick="openJoinBusiness()" style="width:100%;"><i class="fas fa-user-plus"></i> Join Business</button>';
  var init = biz.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  var col = window.APP_COLORS[init.charCodeAt(0) % window.APP_COLORS.length];
  var nameEsc = biz.name.replace(/'/g, "\\'");
  var isStaff = UserState.businessRole === 'staff';

  var logoHtml = biz.logo
    ? '<img src="' + biz.logo + '" class="biz-logo-img" style="width:44px;height:44px;border-radius:6px;object-fit:cover;">'
    : '<div class="biz-logo" style="background:' + col + ';">' + init + '</div>';

  var headerHtml = '<div class="listed-header">Listed</div>' +
    '<div class="biz-card-header" style="cursor:pointer;" onclick="toggleBizActions()">' +
      logoHtml +
      '<div class="biz-name-wrap"><h3>' + biz.name + '</h3><p>' + (biz.category || '') + ' \u00B7 ' + biz.town + '</p></div>' +
    '</div>';

  var actionsHtml = isStaff
    ? '<div style="padding:8px 16px;border-top:1px solid var(--grey-light);font-size:12px;color:var(--grey-dark);"><span style="background:var(--grey-light);padding:4px 8px;border-radius:4px;">Staff \u00B7 View only</span></div>'
    : '<div id="biz-actions-body" style="display:none;padding:10px 16px;border-top:1px solid var(--grey-light);">' +
        '<div class="biz-actions-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<button class="biz-action-btn" onclick="openArtworkSubmission()"><i class="fab fa-facebook"></i> Facebook Boost</button>' +
          '<button class="biz-action-btn" onclick="openPromoModal()"><i class="fas fa-bullhorn"></i> Promos</button>' +
          '<button class="biz-action-btn" onclick="openBizCatalogue(\'' + (biz.id || 'biz_user') + '\',\'' + nameEsc + '\',\'' + biz.town + '\',\'' + (biz.phone || '') + '\',\'' + col + '\',\'' + init + '\')"><i class="fas fa-list"></i> Catalogue</button>' +
          '<button class="biz-action-btn" onclick="openBusinessStaff(\'' + (biz.id || 'biz_user') + '\',\'' + nameEsc + '\')"><i class="fas fa-user-cog"></i> Staff</button>' +
          '<button class="biz-action-btn" onclick="renderPromoRequestsList()"><i class="fas fa-receipt"></i> Requests</button>' +
          '<button class="biz-action-btn" onclick="scrollToKPI()"><i class="fas fa-chart-line"></i> KPI Dashboard</button>' +
        '</div>' +
      '</div>';

  return headerHtml + actionsHtml;
}

function renderBusinessAccordion() {
  var body = document.getElementById('biz-accordion-body');
  if (!body) return;
  var s = UserState;

  if (s.isBrowser()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;">' +
      '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:12px;">List your business on Wirog to reach customers across Botswana. Create a profile to get started.</p>' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;margin-bottom:8px;" onclick="openModal(\'register-modal\')">Create Profile</button>' +
      '<button class="btn-outline btn-sm" onclick="renderDirectory()" style="display:block;text-align:center;">Browse Directory</button>' +
    '</div>';
  } else if (s.isSubscriber()) {
    var hasBiz = !!s.business;
    var isProUser = s.isTradesperson();
    body.innerHTML = '<div style="padding-top:8px;display:flex;flex-direction:column;gap:8px;">' +
      (!hasBiz ? '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;" onclick="openCreateBiz()"><i class="fas fa-plus"></i> + List Business</button>' : '') +
      (!isProUser ? '<button class="btn-outline btn-sm" onclick="openCreateProProfile()" style="width:100%;"><i class="fas fa-user-tie"></i> List as Pro</button>' : '') +
      (!hasBiz ? '<button class="btn-outline btn-sm" onclick="openJoinBusiness()" style="width:100%;"><i class="fas fa-user-plus"></i> Join Business</button>' : '') +
      (hasBiz ? '<div style="border-top:1px solid var(--grey-light);padding-top:8px;margin-top:4px;">' + renderBusinessCardHTML(s.business) + '</div>' : '') +
    '</div>';
  } else if (s.isPro()) {
    var html = '<div style="padding-top:8px;">' + renderProProfileAccordion() + '</div>' +
      (s.business ? '<div style="border-top:1px solid var(--grey-light);margin-top:8px;padding-top:8px;">' + renderBusinessCardHTML(s.business) + '</div>' : '');
    body.innerHTML = html;
  } else if (s.isStaff()) {
    var biz = s.business;
    var content = biz ? renderBusinessCardHTML(biz) : '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;">No business associated.</p>';
    body.innerHTML = '<div style="padding-top:8px;">' + content + '</div>';
  } else if (s.isBusinessOwner()) {
    var biz = s.business;
    var proSection = s.isPro() ? renderProProfileAccordion() : '';
    var bizCard = biz ? renderBusinessCardHTML(biz) : '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;margin-bottom:12px;">No business registered yet.</p>' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;width:100%;margin-bottom:8px;" onclick="openCreateBiz()"><i class="fas fa-plus"></i> + List Business</button>' +
      '<button class="btn-outline btn-sm" onclick="openJoinBusiness()" style="width:100%;"><i class="fas fa-user-plus"></i> Join Business</button>';
    body.innerHTML = '<div style="padding-top:8px;">' + proSection + (proSection ? '<div style="height:12px;"></div>' : '') + bizCard + '</div>';
  } else if (s.isAdmin()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;"><p style="font-size:13px;color:var(--grey-dark);">Manage the platform from the Super Admin panel above.</p></div>';
  } else {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;"><p style="font-size:13px;color:var(--grey-dark);">Business features coming soon.</p></div>';
  }
}

function renderKpiAccordion() {
  var body = document.getElementById('kpi-accordion-body');
  if (!body) return;
  var s = UserState;

  if (s.isBrowser()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;">' +
      '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:12px;">Track your ad performance, views, likes, and more. Create a profile and list your business to access KPIs.</p>' +
      '<button class="btn btn-sm" onclick="openModal(\'register-modal\')">Create Profile</button>' +
    '</div>';
  } else if (s.isSubscriber()) {
    body.innerHTML = '<div style="padding-top:8px;text-align:center;">' +
      '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:12px;">List your business to track views, likes, and ad performance.</p>' +
      '<button class="btn btn-sm" onclick="openCreateBiz()">List Your Business</button>' +
    '</div>';
  } else if (s.isAdmin()) {
    body.innerHTML = '<div class="kpi-grid">' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-ads">0</div><div class="kpi-label">Active Ads</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-views">0</div><div class="kpi-label">Total Views</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-likes">0</div><div class="kpi-label">Likes</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-note-adds">0</div><div class="kpi-label">Note Adds</div></div>' +
    '</div>' +
    '<p style="font-size:12px;color:var(--grey-dark);margin-top:8px;text-align:center;">Platform-wide stats coming soon.</p>';
    updateKPI();
  } else {
    body.innerHTML = '<div class="kpi-grid">' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-ads">0</div><div class="kpi-label">Active Ads</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-views">0</div><div class="kpi-label">Total Views</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-likes">0</div><div class="kpi-label">Likes</div></div>' +
      '<div class="kpi-card"><div class="kpi-value" id="kpi-note-adds">0</div><div class="kpi-label">Note Adds</div></div>' +
    '</div>' +
    (s.isStaff() ? '<p style="font-size:12px;color:var(--grey-dark);margin-top:8px;text-align:center;">Staff — view only</p>' : '');
    updateKPI();
  }
}

function scrollToKPI() {
  var el = document.querySelector('#kpi-accordion-body');
  if (el) {
    var acc = el.closest('.accordion');
    if (acc) acc.classList.add('open');
    renderKpiAccordion();
    setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
  }
}

function renderProAccountPage() {
  var content = document.getElementById('pro-account-content');
  if (!content) return;
  var s = UserState;
  var isPro = s.isTradesperson();
  var claimedProId = getClaimedProId ? getClaimedProId(s.id) : null;
  var proListing = claimedProId && getProListing ? getProListing(claimedProId) : null;
  var profile = claimedProId && getProProfile ? getProProfile(claimedProId) : null;
  var services = claimedProId && window.getProServices ? getProServices(claimedProId) : [];

  var skills = profile ? profile.skills || [] : [];
  var portfolio = profile ? profile.portfolio || [] : [];
  var rateType = profile ? profile.rateType : 'quote';
  var rateVal = profile ? profile.rate : '';
  var availability = profile ? profile.availability : 'available';

  var skillsHtml = skills.length > 0
    ? skills.map(function(skill) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--grey-light);font-size:13px;">' +
          '<span>' + skill + '</span>' +
          '<span style="color:#e74c3c;cursor:pointer;font-size:12px;padding:2px 6px;" onclick="removeProSkillInline(\'' + skill.replace(/'/g,"\\'") + '\')">✕</span>' +
        '</div>';
      }).join('')
    : '<p style="font-size:12px;color:var(--grey-dark);padding:6px 0;">No skills added yet.</p>';

  var projectsHtml = portfolio.length > 0
    ? portfolio.map(function(p, i) {
        return '<div style="padding:8px;border:1px solid var(--grey-light);border-radius:8px;margin-bottom:6px;font-size:13px;">' +
          '<div style="display:flex;justify-content:space-between;">' +
            '<strong>' + (p.title || 'Project') + '</strong>' +
            '<span style="color:#e74c3c;cursor:pointer;font-size:14px;" onclick="removeProProjectInline(' + i + ')">✕</span>' +
          '</div>' +
          (p.description ? '<p style="font-size:12px;color:var(--grey-dark);margin:4px 0 0;">' + p.description + '</p>' : '') +
        '</div>';
      }).join('')
    : '<p style="font-size:12px;color:var(--grey-dark);padding:6px 0;">No projects added yet.</p>';

  var servicesHtml = services.length > 0
    ? services.map(function(svc) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--grey-light);">' +
          '<div><div style="font-weight:600;font-size:13px;">' + svc.title + '</div>' +
          (svc.price ? '<div style="font-size:12px;color:var(--orange);">' + svc.price + '</div>' : '') +
          '</div>' +
          '<span style="color:#e74c3c;cursor:pointer;font-size:14px;" onclick="removeProServiceInline(' + (services.indexOf(svc)) + ')">✕</span>' +
        '</div>';
      }).join('')
    : '<p style="font-size:12px;color:var(--grey-dark);padding:6px 0;">No services added yet.</p>';

  var rateLabel = rateType === 'hourly' ? 'Per Hour' : rateType === 'fixed' ? 'Fixed Price' : 'Quote';
  var availLabel = availability === 'available' ? 'Available' : availability === 'busy' ? 'Busy' : 'Not Taking Jobs';
  var availColor = availability === 'available' ? 'var(--green, #27ae60)' : availability === 'busy' ? 'var(--orange)' : '#e74c3c';

  var html = '<div style="padding:12px;">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">' +
      '<button onclick="goBack()" class="biz-back-round"><img src="assets/icons/solid/chevron-left_white.webp" style="width:16px;height:16px;display:block;"></button>' +
      '<span style="font-size:18px;font-weight:700;">Pro Account</span>' +
    '</div>' +
    '<div class="biz-header-card" style="padding:16px;border:1px solid var(--grey-light);border-radius:12px;margin-bottom:16px;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div class="profile-avatar" style="width:60px;height:60px;font-size:28px;background:' + (proListing ? (proListing.color || '#ed6626') : '#ed6626') + ';">' +
          (proListing ? (proListing.initials || s.name.split(' ').map(function(w){return w[0]}).join('').slice(0,2).toUpperCase()) : '?') +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:16px;font-weight:700;">' + (proListing ? proListing.name : s.name) + '</div>' +
          '<div style="font-size:13px;color:var(--grey-dark);">' + (proListing ? (proListing.primaryTrade || 'Tradesperson') : 'Tradesperson') + '</div>' +
        '</div>' +
        (claimedProId ? '<span style="font-size:11px;color:var(--green, #27ae60);font-weight:600;background:#e8f5e9;padding:3px 8px;border-radius:4px;">Active</span>' : '') +
      '</div>' +
    '</div>';

  if (claimedProId) {
    html +=
      '<div class="accordion" style="margin-bottom:8px;">' +
        '<div class="accordion-header" onclick="toggleAcc(this)"><span><i class="fas fa-tools" style="color:var(--orange);margin-right:8px;"></i> Skills (' + skills.length + ')</span></div>' +
        '<div class="accordion-body" style="padding:8px 12px;">' +
          '<div id="pro-skills-inline-list">' + skillsHtml + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:8px;">' +
            '<input id="pro-skill-inline-input" placeholder="Add a skill" style="flex:1;padding:6px 8px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;">' +
            '<button class="btn-sm" onclick="addProSkillInline()" style="background:var(--orange);color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Add</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="accordion" style="margin-bottom:8px;">' +
        '<div class="accordion-header" onclick="toggleAcc(this)"><span><i class="fas fa-images" style="color:var(--orange);margin-right:8px;"></i> Projects (' + portfolio.length + ')</span></div>' +
        '<div class="accordion-body" style="padding:8px 12px;">' +
          '<div id="pro-projects-inline-list">' + projectsHtml + '</div>' +
          '<button class="btn-outline btn-sm" onclick="openAddProProjectInline()" style="width:100%;margin-top:6px;">+ Add Project</button>' +
        '</div>' +
      '</div>' +
      '<div class="accordion" style="margin-bottom:8px;">' +
        '<div class="accordion-header" onclick="toggleAcc(this)"><span><i class="fas fa-tag" style="color:var(--orange);margin-right:8px;"></i> Rates</span></div>' +
        '<div class="accordion-body" style="padding:8px 12px;">' +
          '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
            '<div style="flex:1;">' +
              '<label style="font-size:11px;color:var(--grey-dark);">Rate Type</label>' +
              '<select id="pro-rate-type-inline" onchange="saveProRatesInline()" style="width:100%;padding:6px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;">' +
                '<option value="quote"' + (rateType === 'quote' ? ' selected' : '') + '>Quote</option>' +
                '<option value="hourly"' + (rateType === 'hourly' ? ' selected' : '') + '>Hourly</option>' +
                '<option value="fixed"' + (rateType === 'fixed' ? ' selected' : '') + '>Fixed</option>' +
              '</select>' +
            '</div>' +
            '<div style="flex:1;">' +
              '<label style="font-size:11px;color:var(--grey-dark);">Rate (Pula)</label>' +
              '<input id="pro-rate-value-inline" value="' + rateVal + '" onchange="saveProRatesInline()" placeholder="0" style="width:100%;padding:6px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;">' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label style="font-size:11px;color:var(--grey-dark);">Availability</label>' +
            '<select id="pro-avail-inline" onchange="saveProRatesInline()" style="width:100%;padding:6px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;">' +
              '<option value="available"' + (availability === 'available' ? ' selected' : '') + '>Available</option>' +
              '<option value="busy"' + (availability === 'busy' ? ' selected' : '') + '>Busy</option>' +
              '<option value="not_taking"' + (availability === 'not_taking' ? ' selected' : '') + '>Not Taking Jobs</option>' +
            '</select>' +
          '</div>' +
          '<div style="margin-top:8px;padding:6px 10px;border-radius:6px;font-size:12px;background:var(--orange-light);">' +
            'Current: <strong>' + rateLabel + '</strong>' + (rateVal ? ' · P' + rateVal : '') +
            ' · <span style="color:' + availColor + ';">' + availLabel + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="accordion" style="margin-bottom:8px;">' +
        '<div class="accordion-header" onclick="toggleAcc(this)"><span><i class="fas fa-concierge-bell" style="color:var(--orange);margin-right:8px;"></i> Services (' + services.length + ')</span></div>' +
        '<div class="accordion-body" style="padding:8px 12px;">' +
          '<div id="pro-services-inline-list">' + servicesHtml + '</div>' +
          '<div style="border-top:1px solid var(--grey-light);padding-top:8px;margin-top:4px;">' +
            '<input id="pro-srv-title-inline" placeholder="Service title" style="width:100%;padding:6px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;margin-bottom:4px;box-sizing:border-box;">' +
            '<div style="display:flex;gap:6px;">' +
              '<input id="pro-srv-price-inline" placeholder="Price (e.g. P250/hr)" style="flex:1;padding:6px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;">' +
              '<button class="btn-sm" onclick="addProServiceInline()" style="background:var(--orange);color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">+ Add</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">' +
        '<button class="btn" style="background:var(--orange);color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" onclick="openProEditor()"><i class="fas fa-edit"></i> Edit Profile</button>' +
        '<button class="btn-outline" style="padding:12px;border-radius:8px;cursor:pointer;font-size:14px;" onclick="openProProfile(\'' + claimedProId + '\')"><i class="fas fa-eye"></i> View Public Profile</button>' +
      '</div>';
  } else {
    html += '<div style="text-align:center;padding:24px 0;">' +
      '<p style="font-size:14px;color:var(--grey-dark);margin-bottom:16px;">Activate your Pro account to get discovered by customers. You\'ll appear in the directory when people search for your trade.</p>' +
      '<button class="btn" style="background:var(--orange);color:white;border:none;padding:14px 24px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;" onclick="activateProAccount()"><i class="fas fa-user-tie"></i> Activate Pro Account</button>' +
    '</div>';
  }

  html += '</div>';
  content.innerHTML = html;
}

function addProSkillInline() {
  var input = document.getElementById('pro-skill-inline-input');
  if (!input) return;
  var skill = input.value.trim();
  if (!skill) { showToast('Enter a skill'); return; }
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var profile = getProProfile(claimedProId) || {};
  if (!profile.skills) profile.skills = [];
  if (profile.skills.indexOf(skill) === -1) profile.skills.push(skill);
  saveProProfile(claimedProId, profile);
  input.value = '';
  renderProAccountPage();
  showToast('Skill added');
}

function removeProSkillInline(skill) {
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var profile = getProProfile(claimedProId) || {};
  if (!profile.skills) return;
  profile.skills = profile.skills.filter(function(s) { return s !== skill; });
  saveProProfile(claimedProId, profile);
  renderProAccountPage();
  showToast('Skill removed');
}

function openAddProProjectInline() {
  var modal = document.getElementById('generic-modal');
  if (!modal) return;
  document.getElementById('generic-modal-title').textContent = 'Add Project';
  document.getElementById('generic-modal-body').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<label>Project Title</label><input id="pro-project-title-inline" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
      '<label>Description</label><textarea id="pro-project-desc-inline" rows="3" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;"></textarea>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-sm" onclick="saveProProjectInline()" style="flex:1;">Add Project</button>' +
        '<button class="btn-outline btn-sm" onclick="closeModal(\'generic-modal\')">Cancel</button>' +
      '</div>' +
    '</div>';
  openModal('generic-modal');
}

function saveProProjectInline() {
  var title = document.getElementById('pro-project-title-inline')?.value.trim();
  if (!title) { showToast('Enter a project title'); return; }
  var desc = document.getElementById('pro-project-desc-inline')?.value.trim() || '';
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var profile = getProProfile(claimedProId) || {};
  if (!profile.portfolio) profile.portfolio = [];
  profile.portfolio.push({ title: title, description: desc });
  saveProProfile(claimedProId, profile);
  closeModal('generic-modal');
  renderProAccountPage();
  showToast('Project added');
}

function removeProProjectInline(index) {
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var profile = getProProfile(claimedProId) || {};
  if (!profile.portfolio) return;
  profile.portfolio.splice(index, 1);
  saveProProfile(claimedProId, profile);
  renderProAccountPage();
  showToast('Project removed');
}

function saveProRatesInline() {
  var rateType = document.getElementById('pro-rate-type-inline')?.value;
  var rate = document.getElementById('pro-rate-value-inline')?.value || '';
  var availability = document.getElementById('pro-avail-inline')?.value;
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var profile = getProProfile(claimedProId) || {};
  profile.rateType = rateType;
  profile.rate = rate;
  profile.availability = availability;
  saveProProfile(claimedProId, profile);
  renderProAccountPage();
  showToast('Rates updated');
}

function addProServiceInline() {
  var title = document.getElementById('pro-srv-title-inline')?.value.trim();
  if (!title) { showToast('Enter a service title'); return; }
  var price = document.getElementById('pro-srv-price-inline')?.value.trim() || 'Quote';
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var services = getProServices(claimedProId) || [];
  services.push({ id: 'srv_' + Date.now(), title: title, price: price });
  saveProServices(claimedProId, services);
  document.getElementById('pro-srv-title-inline').value = '';
  document.getElementById('pro-srv-price-inline').value = '';
  renderProAccountPage();
  showToast('Service added');
}

function removeProServiceInline(idx) {
  var claimedProId = getClaimedProId ? getClaimedProId(UserState.id) : null;
  if (!claimedProId) return;
  var services = getProServices(claimedProId) || [];
  services.splice(idx, 1);
  saveProServices(claimedProId, services);
  renderProAccountPage();
  showToast('Service removed');
}

function activateProAccount() {
  var s = UserState;
  if (s.id === 'guest') {
    showToast('Create a profile first');
    openModal('register-modal');
    return;
  }
  s.role = 'Tradesperson (Contractor)';
  localStorage.setItem('wirog_role', 'Tradesperson (Contractor)');
  var demoPros = window.DEMO_PROFILES || [];
  var existing = demoPros.find(function(p) { return p.id === s.id; });
  if (existing && !getClaimedProId(s.id)) {
    var assoc = getProAssociations();
    assoc[s.id] = { proId: existing.id, role: 'owner' };
    saveProAssociations(assoc);
    var profile = defaultProProfile ? defaultProProfile(existing) : {};
    saveProProfile(existing.id, profile);
  }
  renderProAccountPage();
  updateAccountHero();
  renderDirectory();
  showToast('Pro account activated!');
}
window.renderProAccountPage = renderProAccountPage;
window.activateProAccount = activateProAccount;

function renderAccount() {
  renderNotesAccordion();
  renderFavSuppliersAccordion();
  renderBusinessAccordion();
  renderKpiAccordion();
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
  } else {
    if (guestCta) guestCta.style.display = 'none';
  }

  renderAccount();
  if (window.renderBudgetSummary) window.renderBudgetSummary();
}

function toggleBizActions() {
  const body = document.getElementById('biz-actions-body');
  if (!body) return;
  body.style.display = body.style.display !== 'none' ? 'none' : 'block';
}

function renderBusinessCard() {
  const biz = UserState.business;
  if (!biz) return;
  const init = biz.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const col = window.APP_COLORS[init.charCodeAt(0) % window.APP_COLORS.length];
  const isPublic = biz.subscription === 'catalogue';
  const nameEsc = biz.name.replace(/'/g, "\\'");
  const isStaff = UserState.businessRole === 'staff';
  const logoHtml = biz.logo
    ? '<img src="' + biz.logo + '" class="biz-logo-img" style="width:44px;height:44px;border-radius:6px;object-fit:cover;">'
    : '<div class="biz-logo" style="background:' + col + ';">' + init + '</div>';
  const actionsHtml = isStaff
    ? '<div style="padding:8px 16px;border-top:1px solid var(--grey-light);font-size:12px;color:var(--grey-dark);"><span style="background:var(--grey-light);padding:4px 8px;border-radius:4px;">Staff \u00B7 View only</span> <button class="btn-sm" style="margin-left:8px;background:var(--orange);color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;" onclick="openBusinessStaff(\'' + (biz.id || 'biz_user') + '\',\'' + nameEsc + '\')">Staff Panel</button></div>'
    : '<div id="biz-actions-body" style="display:none;padding:10px 16px;border-top:1px solid var(--grey-light);">' +
        '<div class="biz-actions-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<button class="biz-action-btn" onclick="openBizProfile(\'biz_user\',\'' + nameEsc + '\',\'' + init + '\',\'' + col + '\',\'' + biz.town + '\',\'' + (biz.phone || '') + '\',' + isPublic + ',\'\')"><i class="fas fa-eye"></i> View Profile</button>' +
          '<button class="biz-action-btn" onclick="openBizCatalogue(\'biz_user\',\'' + nameEsc + '\',\'' + biz.town + '\',\'' + (biz.phone || '') + '\',\'' + col + '\',\'' + init + '\')"><i class="fas fa-list"></i> Catalogue</button>' +
          '<button class="biz-action-btn" onclick="openPromoModal()"><i class="fas fa-bullhorn"></i> Promos</button>' +
          '<button class="biz-action-btn" onclick="openBusinessStaff(\'' + (biz.id || 'biz_user') + '\',\'' + nameEsc + '\')"><i class="fas fa-user-cog"></i> Staff</button>' +
        '</div>' +
      '</div>';
  document.getElementById('biz-card-content').innerHTML =
    '<div class="listed-header">Listed</div>' +
    '<div class="biz-card-header" style="cursor:pointer;" onclick="toggleBizActions()">' +
      logoHtml +
      '<div class="biz-name-wrap"><h3>' + biz.name + '</h3><p>' + biz.category + ' \u00B7 ' + biz.town + '</p></div>' +
    '</div>' + actionsHtml;
}

function resetBusinessCard() {
  document.getElementById('biz-card-content').innerHTML = '<p style="font-size:13px;color:var(--grey-dark);padding-top:8px;margin-bottom:12px;">No business registered yet.</p>' +
    '<button class="btn btn-sm" onclick="openCreateBiz()" style="margin-bottom:6px;width:100%;">+ List Business</button>' +
    '<button class="btn-outline btn-sm" onclick="openCreateProProfile()" style="width:100%;margin-bottom:4px;"><i class="fas fa-user-tie"></i> List as Pro</button>' +
    '<button class="btn-outline btn-sm" onclick="openJoinBusiness()" style="width:100%;"><i class="fas fa-user-plus"></i> Join Business</button>';
}

async function updateKPI() {
  var el;
  el = document.getElementById('kpi-ads'); if (el) el.textContent = UserState.kpi.ads;
  el = document.getElementById('kpi-views'); if (el) el.textContent = UserState.kpi.views;
  el = document.getElementById('kpi-likes'); if (el) el.textContent = UserState.kpi.likes;
  el = document.getElementById('kpi-note-adds'); if (el) el.textContent = UserState.kpi.noteAdds;
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
  
  // New File Inputs
  const logoInput = document.getElementById('biz-logo-input');
  const bannerInput = document.getElementById('biz-banner-input');
  const logoFile = logoInput?.files[0] || null;
  const bannerFile = bannerInput?.files[0] || null;

  if (!name) { showToast('Please enter a business name'); return; }

  const businessData = {
    name,
    category,
    town,
    phone,
    subscription: 'free',
    logoFile,   // Pass the physical blobs to the logic engine
    bannerFile
  };

  try {
    // TASK 2: Use the P350 Hierarchy Integration
    if (window.syncBusinessOnboarding) {
        showToast('Syncing business...');
        const docId = await window.syncBusinessOnboarding(businessData);
        console.log("Business synced to cloud. ID:", docId);
    }
    
    // Save locally to UserState for immediate UI feedback
    UserState.business = { id: 'biz_user', name, category, town, phone, subscription: 'free' };
    UserState.businessRole = 'owner';

    // Associate user as owner
    if (!window.BUSINESS_ASSOCIATIONS) window.BUSINESS_ASSOCIATIONS = {};
    window.BUSINESS_ASSOCIATIONS[UserState.id] = { businessId: 'biz_user', role: 'owner' };

    // Legacy local DB save
    const bizLocal = { id: 'biz_user', ...UserState.business };
    await WirogDB.put('businesses', bizLocal);

    renderBusinessCard(); 
    closeModal('biz-modal'); 
    renderDirectory();
    showToast('✅ Business saved and synced!');

  } catch (error) {
    console.error('Business Onboarding Error:', error);
    showToast('⚠️ Failed to sync: ' + error.message);
  }
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
    var stores = ['users','businesses','items','promos','notes','kpi','filters','profiles','credentials','mediaCache'];
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
    var stores = ['users','businesses','items','promos','notes','kpi','filters','profiles','credentials','mediaCache'];
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

// ─── PROFESSIONAL PROFILE ───

function getDefaultProProfile() {
  return {
    name: UserState.firstName + ' ' + UserState.surname,
    tradeCategory: '',
    phone: UserState.mobile || '',
    location: UserState.location.town || 'Gaborone',
    description: '',
    skills: [],
    projects: [],
    subscription: { type: '', expiresAt: null, status: 'pending' }
  };
}

function openCreateProProfile() {
  var existing = UserState.professional;
  var data = existing || getDefaultProProfile();
  var modal = document.getElementById('generic-modal');
  if (!modal) return;
  document.getElementById('generic-modal-title').textContent = existing ? 'Edit Professional Profile' : 'Create Professional Profile';
  document.getElementById('generic-modal-body').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<label>Full Name</label><input id="pro-name" value="' + (data.name||'').replace(/"/g,'&quot;') + '" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
      '<label>Trade Category</label><select id="pro-trade" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
        ['Plumber','Electrician','Carpenter','Painter','Builder','Tiler','Roofer','Gardener','Welder','Other'].map(function(t) {
          return '<option value="' + t + '"' + (data.tradeCategory === t ? ' selected' : '') + '>' + t + '</option>';
        }).join('') +
      '</select>' +
      '<label>Phone</label><input id="pro-phone" value="' + (data.phone||'').replace(/"/g,'&quot;') + '" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
      '<label>Location</label><input id="pro-location" value="' + (data.location||'').replace(/"/g,'&quot;') + '" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
      '<label>Description</label><textarea id="pro-desc" rows="3" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' + (data.description||'') + '</textarea>' +
      '<div style="background:var(--orange-light);border-radius:8px;padding:10px;font-size:12px;color:var(--orange);">' +
        '<strong>Pricing:</strong> P50.00 for 30 days or P400.00 for 1 year. Admin approval required.' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-sm" onclick="saveProProfile()" style="flex:1;">' + (existing ? 'Save Changes' : 'Submit for Approval') + '</button>' +
        '<button class="btn-outline btn-sm" onclick="closeModal(\'generic-modal\')">Cancel</button>' +
      '</div>' +
    '</div>';
  openModal('generic-modal');
}

function saveProProfile() {
  var name = document.getElementById('pro-name')?.value.trim();
  if (!name) { showToast('Please enter your name'); return; }
  var data = UserState.professional || getDefaultProProfile();
  data.name = name;
  data.tradeCategory = document.getElementById('pro-trade')?.value || '';
  data.phone = document.getElementById('pro-phone')?.value.trim() || '';
  data.location = document.getElementById('pro-location')?.value.trim() || '';
  data.description = document.getElementById('pro-desc')?.value.trim() || '';
  if (!data.subscription || !data.subscription.type) {
    data.subscription = { type: '30d', expiresAt: null, status: 'pending' };
  }
  UserState.professional = data;
  closeModal('generic-modal');
  renderBusinessAccordion();
  showToast('Professional profile saved! Pending admin approval.');
}

function renderProProfileAccordion() {
  var data = UserState.professional || getDefaultProProfile();
  var hasProfile = !!(data.name && data.tradeCategory);
  var skillsHtml = data.skills && data.skills.length
    ? data.skills.map(function(s) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--grey-light);font-size:13px;">' +
          '<span>' + s + '</span>' +
          '<span style="color:#e74c3c;cursor:pointer;font-size:12px;" onclick="removeProSkill(\'' + s.replace(/'/g,"\\'") + '\')">✕</span>' +
        '</div>';
      }).join('')
    : '<p style="font-size:12px;color:var(--grey-dark);">No skills added yet.</p>';
  var projectsHtml = data.projects && data.projects.length
    ? data.projects.map(function(p, i) {
        return '<div style="padding:8px;border:1px solid var(--grey-light);border-radius:8px;margin-bottom:8px;font-size:13px;">' +
          '<div style="display:flex;justify-content:space-between;"><strong>' + p.title + '</strong>' +
          '<span style="color:#e74c3c;cursor:pointer;" onclick="removeProProject(' + i + ')">✕</span></div>' +
          (p.description ? '<p style="font-size:12px;color:var(--grey-dark);margin:4px 0 0;">' + p.description + '</p>' : '') +
        '</div>';
      }).join('')
    : '<p style="font-size:12px;color:var(--grey-dark);">No projects added yet.</p>';
  return '<div class="sub-accordion">' +
    '<div class="sub-accordion-header" onclick="toggleSubAcc(this)">Professional Profile</div>' +
    '<div class="sub-accordion-body">' +
      (hasProfile
        ? '<div style="padding:8px 0;"><p><strong>' + data.name + '</strong> · ' + data.tradeCategory + '</p>' +
          '<p style="font-size:12px;color:var(--grey-dark);">' + data.location + (data.phone ? ' · ' + data.phone : '') + '</p>' +
          (data.description ? '<p style="font-size:12px;color:var(--grey-dark);margin-top:4px;">' + data.description + '</p>' : '') +
          '<button class="btn-outline btn-sm" onclick="openCreateProProfile()" style="margin-top:8px;width:100%;">Edit Profile</button>' +
          '<div style="margin-top:8px;font-size:11px;color:var(--orange);background:var(--orange-light);padding:6px 10px;border-radius:6px;">' +
            'Status: <strong>' + (data.subscription.status === 'approved' ? 'Approved' : 'Pending Approval') + '</strong>' +
          '</div></div>'
        : '<div style="padding:8px 0;text-align:center;">' +
          '<p style="font-size:13px;color:var(--grey-dark);margin-bottom:8px;">No professional profile yet.</p>' +
          '<button class="btn btn-sm" onclick="openCreateProProfile()">Create Professional Profile</button>' +
          '<p style="font-size:11px;color:var(--grey-dark);margin-top:8px;">P50/30d or P400/yr · Admin approval required</p></div>'
      ) +
      '<div class="sub-accordion" style="margin-top:8px;">' +
        '<div class="sub-accordion-header" onclick="toggleSubAcc(this)">Skills (' + (data.skills||[]).length + ')</div>' +
        '<div class="sub-accordion-body">' +
          skillsHtml +
          '<div style="display:flex;gap:6px;margin-top:8px;"><input id="new-skill-input" placeholder="Add a skill" style="flex:1;padding:6px 8px;border:1px solid var(--grey-light);border-radius:4px;font-size:12px;"><button class="btn-sm" onclick="addProSkill()" style="background:var(--orange);color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Add</button></div>' +
        '</div>' +
      '</div>' +
      '<div class="sub-accordion" style="margin-top:4px;">' +
        '<div class="sub-accordion-header" onclick="toggleSubAcc(this)">Projects (' + (data.projects||[]).length + ')</div>' +
        '<div class="sub-accordion-body">' +
          projectsHtml +
          '<button class="btn-outline btn-sm" onclick="openAddProProject()" style="width:100%;margin-top:4px;">+ Add Project</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function addProSkill() {
  var input = document.getElementById('new-skill-input');
  if (!input) return;
  var skill = input.value.trim();
  if (!skill) { showToast('Enter a skill'); return; }
  var data = UserState.professional || getDefaultProProfile();
  if (!data.skills) data.skills = [];
  if (data.skills.indexOf(skill) === -1) data.skills.push(skill);
  UserState.professional = data;
  renderBusinessAccordion();
  showToast('Skill added');
}

function removeProSkill(skill) {
  var data = UserState.professional;
  if (!data || !data.skills) return;
  data.skills = data.skills.filter(function(s) { return s !== skill; });
  UserState.professional = data;
  renderBusinessAccordion();
  showToast('Skill removed');
}

function openAddProProject() {
  var modal = document.getElementById('generic-modal');
  if (!modal) return;
  document.getElementById('generic-modal-title').textContent = 'Add Project';
  document.getElementById('generic-modal-body').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<label>Project Title</label><input id="pro-project-title" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;">' +
      '<label>Description</label><textarea id="pro-project-desc" rows="3" style="padding:8px;border:1px solid var(--grey-light);border-radius:6px;font-size:14px;"></textarea>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-sm" onclick="saveProProject()" style="flex:1;">Add Project</button>' +
        '<button class="btn-outline btn-sm" onclick="closeModal(\'generic-modal\')">Cancel</button>' +
      '</div>' +
    '</div>';
  openModal('generic-modal');
}

function saveProProject() {
  var title = document.getElementById('pro-project-title')?.value.trim();
  if (!title) { showToast('Enter a project title'); return; }
  var desc = document.getElementById('pro-project-desc')?.value.trim() || '';
  var data = UserState.professional || getDefaultProProfile();
  if (!data.projects) data.projects = [];
  data.projects.push({ title: title, description: desc });
  UserState.professional = data;
  closeModal('generic-modal');
  renderBusinessAccordion();
  showToast('Project added');
}

function removeProProject(index) {
  var data = UserState.professional;
  if (!data || !data.projects) return;
  data.projects.splice(index, 1);
  UserState.professional = data;
  renderBusinessAccordion();
  showToast('Project removed');
}

window.addProSkillInline = addProSkillInline;
window.removeProSkillInline = removeProSkillInline;
window.openAddProProjectInline = openAddProProjectInline;
window.saveProProjectInline = saveProProjectInline;
window.removeProProjectInline = removeProProjectInline;
window.saveProRatesInline = saveProRatesInline;
window.addProServiceInline = addProServiceInline;
window.removeProServiceInline = removeProServiceInline;

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

function updateDriveRowUI(row) {
  if (!row) row = document.getElementById('drive-sync-row');
  if (!row) return;

  var isSignedIn = window.DriveAPI && typeof window.DriveAPI.isSignedIn === 'function' && window.DriveAPI.isSignedIn();

  if (isSignedIn) {
    row.innerHTML =
      '<i class="fab fa-google-drive" style="color:#34a853;width:20px;font-size:16px;"></i>' +
      '<span>Google Drive <span style="font-size:11px;color:#34a853;font-weight:600;">Synced</span></span>' +
      '<span style="margin-left:auto;color:var(--grey-dark);font-size:12px;"><i class="fas fa-sign-out-alt"></i></span>';
  } else {
    row.innerHTML =
      '<i class="fab fa-google-drive" style="color:var(--grey-dark);width:20px;font-size:16px;"></i>' +
      '<span>Sign in to Google Drive</span>' +
      '<span style="margin-left:auto;color:var(--orange);font-size:12px;"><i class="fas fa-chevron-right"></i></span>';
  }
}

async function toggleDriveSync() {
  if (!window.DriveAPI) {
    showToast('Drive API not loaded');
    return;
  }

  var isSignedIn = typeof window.DriveAPI.isSignedIn === 'function' && window.DriveAPI.isSignedIn();

  if (isSignedIn) {
    window.DriveAPI.signOut();
    showToast('Disconnected from Google Drive');
    updateDriveRowUI();
    return;
  }

  if (typeof window.DriveAPI.signIn !== 'function') {
    showToast('Drive sign-in not available');
    return;
  }

  try {
    showToast('Connecting to Google Drive...');
    await window.DriveAPI.signIn();
    showToast('Connected to Google Drive!');

    // Create folder for current user if they're a real user
    if (window.Auth && typeof window.Auth.isRealUser === 'function' && window.Auth.isRealUser()) {
      window.DriveAPI.ensureUserFolder(UserState.id).catch(function(e) {
        console.warn('Drive folder creation failed:', e);
      });
    }

    // Flush any pending sync items
    if (window.SyncQueue && typeof window.SyncQueue.flushAll === 'function') {
      window.SyncQueue.flushAll().catch(function(e) {
        console.warn('Sync flush after Drive sign-in failed:', e);
      });
    }
  } catch(e) {
    showToast('Drive sign-in failed: ' + (e.message || e));
    console.error('Drive sign-in error:', e);
  }
  updateDriveRowUI();
}

function updateDriveSyncUI() {
  var row = injectDriveRow();
  updateDriveRowUI(row);
}

window.installApp = installApp;
window.clearAppCache = clearAppCache;
window.deleteAccount = deleteAccount;
window.confirmDeleteAccount = confirmDeleteAccount;
window.renderNotesAccordion = renderNotesAccordion;
window.renderFavSuppliersAccordion = renderFavSuppliersAccordion;
window.renderBusinessAccordion = renderBusinessAccordion;
window.renderKpiAccordion = renderKpiAccordion;
window.renderAccount = renderAccount;
window.scrollToKPI = scrollToKPI;
window.openCreateProProfile = openCreateProProfile;
window.saveProProfile = saveProProfile;
window.addProSkill = addProSkill;
window.removeProSkill = removeProSkill;
window.openAddProProject = openAddProProject;
window.saveProProject = saveProProject;
window.removeProProject = removeProProject;
window.renderAgentPortal = renderAgentPortal;
window.agentVerifyUser = agentVerifyUser;
window.triggerPlatformSync = triggerPlatformSync;

