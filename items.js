/* ════════════════════════════════════════════════════════
   WIROG ITEMS - Item CRUD, WIROG-1 accordion creator,
   Pricing Engine integration, Tags, Image Picker,
   Geofencing, Scheduling, Promo boosting
   ════════════════════════════════════════════════════════ */

if (!window._userItems) window._userItems = [];

/* ─── OPEN MODAL ─── */
function openItemModal() {
  document.getElementById('item-section-identity').classList.add('open');
  document.getElementById('item-section-money').classList.remove('open');
  document.getElementById('item-section-visibility').classList.remove('open');
  document.getElementById('item-section-promo').classList.add('open');

  _selectedItemCategory = '';
  document.getElementById('item-cat-btn').textContent = 'Select Category';
  document.getElementById('item-cat-display').style.display = 'none';
  document.getElementById('item-cat-selector').style.display = 'none';
  initScheduleGrid();
  updateFreePromoStatus();
  updatePromoCostEstimate();

  // Reset form values
  document.getElementById('item-title').value = '';
  document.getElementById('item-desc').value = '';
  document.getElementById('item-price').value = '';
  document.getElementById('item-tag-input').value = '';
  document.getElementById('item-tag-container').innerHTML = '';
  document.getElementById('item-variables-container').innerHTML = '';
  document.getElementById('item-tier-type').value = 'none';
  document.getElementById('item-tier-rules').style.display = 'none';
  document.getElementById('item-tier-rules').innerHTML = '';
  document.getElementById('item-discount-type').value = 'none';
  document.getElementById('item-discount-value').value = '0';
  document.getElementById('item-promo-days').value = '3';
  document.getElementById('item-region').value = 'local';
  document.getElementById('item-start-date').value = '';
  document.getElementById('item-end-date').value = '';

  document.querySelector('#item-modal .modal-title').textContent = 'Add Item to Catalogue';
  document.getElementById('item-save-btn').textContent = 'Save Item & Submit to Promos';

  // Reset modifiers
  ['urgency','nightShift','remoteArea','hazard'].forEach(m => {
    document.getElementById('mod-' + m).checked = false;
  });

  document.getElementById('item-pricing-preview').innerHTML = '';
  updatePricingPreview();

  openModal('item-modal');
}

function toggleItemSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open');
}

/* ─── CATEGORIES ─── */
let _selectedItemCategory = '';

function openItemCategorySelector() {
  const container = document.getElementById('item-cat-list');
  const wrapper = document.getElementById('item-cat-selector');
  if (!container || !wrapper) return;

  if (wrapper.style.display === 'block') {
    wrapper.style.display = 'none';
    return;
  }

  const data = window.WIROG_PRODUCT_CATEGORIES || { categories: [] };
  container.innerHTML = '';
  data.categories.forEach(cat => {
    const group = document.createElement('div');
    group.style.cssText = 'font-weight:700;font-size:13px;padding:8px 12px 4px;color:var(--orange);background:var(--grey-light);';
    group.textContent = cat.name;
    container.appendChild(group);

    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(sub => {
        const btn = document.createElement('button');
        btn.style.cssText = 'display:block;width:100%;text-align:left;padding:8px 16px;font-size:13px;background:none;border:none;cursor:pointer;border-bottom:1px solid var(--grey-light);';
        btn.textContent = sub.name;
        btn.onclick = () => selectItemCategory(sub.name);
        container.appendChild(btn);
      });
    }
  });

  wrapper.style.display = 'block';
}

function selectItemCategory(cat) {
  _selectedItemCategory = cat;
  document.getElementById('item-cat-btn').textContent = cat;
  document.getElementById('item-cat-display').textContent = 'Selected: ' + cat;
  document.getElementById('item-cat-display').style.display = 'block';
  document.getElementById('item-cat-selector').style.display = 'none';
  populateItemUnits(cat);
  buildItemImagePicker(cat);
  updatePricingPreview();
  updatePromoCostEstimate();
}

function getSelectedCategory() {
  return _selectedItemCategory;
}

/* ─── UNITS ─── */
function populateItemUnits(category) {
  const select = document.getElementById('item-unit');
  if (!select) return;
  const units = window.PricingEngine.getUnitsForCategory(category);
  select.innerHTML = units.map(u => '<option>' + u + '</option>').join('');
}

/* ─── IMAGE PICKER (from 703 category images) ─── */
let _selectedItemImage = '';

function buildItemImagePicker(category) {
  const container = document.getElementById('item-image-picker');
  if (!container) return;
  container.innerHTML = '';

  const slug = category ? category.toLowerCase().replace(/[&]+/g,'and').replace(/[\s]+/g,'-').replace(/[^a-z0-9-]/g,'') : '';
  const basePath = 'assets/images/categories_examples/';

  // Try to find images matching the category
  const catSlugMap = {
    'attire-uniform':'attire-uniform', 'bathroom-kitchen':'bathroom-kitchen', 'boards-timber':'boards-timber',
    'building-materials':'building-materials', 'cement-aggregates':'cement-aggregates', 'chemicals':'chemicals',
    'design-plans':'design-plans', 'doors-windows':'doors-windows', 'electrical':'electrical',
    'gardening-outdoor-living':'gardening-outdoor-living', 'generators-power-solutions':'generators-power-solutions',
    'geysers-heating':'geysers-heating', 'hardware-fasteners':'hardware-fasteners', 'home-decor':'home-decor',
    'lighting':'lighting', 'paint':'paint', 'partitioning':'partitioning', 'plumbing':'plumbing',
    'pre-builds-shipping-containers':'pre-builds-shipping-containers', 'roofing-ceiling':'roofing-ceiling',
    'safety-security':'safety-security', 'sanitaryware':'sanitaryware', 'solar-supplies':'solar-supplies',
    'shelving-storage':'shelving-storage', 'steel-metal-products':'steel-metal-products',
    'tiles-flooring':'tiles-flooring', 'tools-equipment':'tools-equipment'
  };

  const cats = window.WIROG_PRODUCT_CATEGORIES?.categories || [];
  let targetSlug = slug;
  // Find the slug for the selected category
  for (const c of cats) {
    if (c.children) {
      for (const sub of c.children) {
        if (sub.name === category) { targetSlug = c.slug; break; }
        if (sub.children) {
          for (const sub2 of sub.children) {
            if (sub2.name === category) { targetSlug = c.slug; break; }
          }
        }
      }
    }
  }

  // Load first matching images from the category folder
  const imgFolder = basePath + targetSlug + '/';
  // We'll use known image naming patterns
  const imgCount = 12;
  let foundAny = false;
  for (let i = 1; i <= imgCount; i++) {
    const imgPath = imgFolder + targetSlug + '_' + i + '.webp';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:80px;height:80px;border-radius:6px;overflow:hidden;border:2px solid var(--grey-light);cursor:pointer;flex-shrink:0;position:relative;';
    wrapper.innerHTML = '<img src="' + imgPath + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display=\'none\'" onclick="selectItemImage(this,\'' + imgPath + '\')">';
    container.appendChild(wrapper);
    foundAny = true;
  }

  if (!foundAny) {
    // Fallback: show colored placeholder
    const colors = ['#ffd4b0','#b0d4ff','#b0ffb0','#ffb0b0','#d4b0ff'];
    colors.forEach((c, i) => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:80px;height:80px;border-radius:6px;overflow:hidden;border:2px solid var(--grey-light);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:28px;background:' + c + ';';
      wrapper.textContent = ['📦','🔧','🪚','🔨','📐'][i];
      wrapper.onclick = function(){ selectItemImage(this, ''); };
      container.appendChild(wrapper);
    });
  }

  _selectedItemImage = '';
}

function selectItemImage(el, path) {
  document.querySelectorAll('#item-image-picker > div').forEach(d => {
    d.style.borderColor = 'var(--grey-light)';
  });
  el.parentElement.style.borderColor = 'var(--orange)';
  _selectedItemImage = path;
}

/* ─── PROMO IMAGE UPLOAD ─── */
let _promoImages = [];

function handlePromoImageUpload(files) {
  const remaining = 5 - _promoImages.length;
  const toProcess = Math.min(files.length, remaining);
  for (let i = 0; i < toProcess; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;
    const reader = new FileReader();
    reader.onload = function(e) {
      _promoImages.push({ data: e.target.result, name: file.name, size: file.size });
      renderPromoImagePreviews();
      updatePromoImageCalc();
    };
    reader.readAsDataURL(file);
  }
  document.getElementById('promo-image-input').value = '';
}

function removePromoImage(idx) {
  _promoImages.splice(idx, 1);
  renderPromoImagePreviews();
  updatePromoImageCalc();
}

function renderPromoImagePreviews() {
  const container = document.getElementById('promo-image-previews');
  const dropzone = document.getElementById('promo-image-dropzone');
  if (!container) return;
  container.innerHTML = _promoImages.map(function(img, i) {
    const sizeKB = (img.size / 1024).toFixed(1);
    return '<div class="promo-img-thumb-wrap">' +
      '<img src="' + img.data + '" class="promo-img-thumb" alt="' + img.name + '">' +
      '<button class="promo-img-remove" onclick="removePromoImage(' + i + ')" type="button">&times;</button>' +
      '<div class="promo-img-size">' + sizeKB + ' KB</div>' +
      '</div>';
  }).join('');
  if (dropzone) {
    if (_promoImages.length >= 5) {
      dropzone.style.display = 'none';
    } else {
      dropzone.style.display = 'block';
    }
  }
}

function updatePromoImageCalc() {
  const countEl = document.getElementById('promo-img-count');
  const sizeEl = document.getElementById('promo-img-total-size');
  const calcEl = document.getElementById('promo-image-calc');
  if (!countEl || !sizeEl || !calcEl) return;
  const totalBytes = _promoImages.reduce(function(sum, img) { return sum + img.size; }, 0);
  const totalKB = (totalBytes / 1024).toFixed(1);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
  countEl.textContent = _promoImages.length + ' of 5';
  sizeEl.textContent = totalBytes >= 1048576 ? totalMB + ' MB' : totalKB + ' KB';
  calcEl.style.display = _promoImages.length > 0 ? 'block' : 'none';
}

/* ─── PROMO TAG SELECTOR ─── */
let _promoTags = [];
let _promoAvailableTags = [];

function openPromoTagSelector() {
  const cat = document.getElementById('promo-item-cat').value;
  const title = document.getElementById('promo-item-title').value.trim();
  const desc = document.getElementById('promo-item-desc').value.trim();

  const autoTags = window.PricingEngine.generateTags([cat], title, desc, []);
  _promoAvailableTags = autoTags.filter(function(t) { return t; });
  if (_promoAvailableTags.length === 0) {
    _promoAvailableTags = [cat].filter(Boolean);
  }
  _promoAvailableTags = _promoAvailableTags.filter(function(t, i) { return _promoAvailableTags.indexOf(t) === i; });

  renderPromoSelectedTags();
  renderPromoSuggestions();
  openModal('promo-tag-modal');
}

function addPromoTag() {
  const input = document.getElementById('promo-tag-input');
  const tag = input.value.trim();
  if (!tag || _promoTags.includes(tag)) return;
  _promoTags.push(tag);
  input.value = '';
  renderPromoSelectedTags();
  renderPromoSuggestions();
}

function removePromoTag(tag) {
  _promoTags = _promoTags.filter(function(t) { return t !== tag; });
  renderPromoSelectedTags();
  renderPromoSuggestions();
}

function togglePromoSuggestionTag(tag, checked) {
  if (checked) {
    if (!_promoTags.includes(tag)) _promoTags.push(tag);
  } else {
    _promoTags = _promoTags.filter(function(t) { return t !== tag; });
  }
  renderPromoSelectedTags();
  renderPromoSuggestions();
}

function applyPromoTags() {
  syncPromoTagDisplay();
  closeModal('promo-tag-modal');
}

function syncPromoTagDisplay() {
  const display = document.getElementById('promo-tag-display');
  if (!display) return;
  display.innerHTML = _promoTags.map(function(t) {
    return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--orange-light);color:var(--orange);padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;">' +
      t +
      '<span style="cursor:pointer;font-size:14px;line-height:1;" onclick="removePromoTag(\'' + t.replace(/'/g,"\\'") + '\');syncPromoTagDisplay();">&times;</span></span>';
  }).join('');
}

function renderPromoSelectedTags() {
  const container = document.getElementById('promo-selected-tags');
  if (!container) return;
  container.innerHTML = _promoTags.map(function(t) {
    return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--orange-light);color:var(--orange);padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;">' +
      t +
      '<span style="cursor:pointer;font-size:14px;line-height:1;" onclick="removePromoTag(\'' + t.replace(/'/g,"\\'") + '\')">&times;</span></span>';
  }).join('');
}

function renderPromoSuggestions() {
  const container = document.getElementById('promo-tag-suggestions');
  if (!container) return;
  if (_promoAvailableTags.length === 0) {
    container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--grey-dark);font-size:13px;">No tag suggestions available. Type your own above.</div>';
    return;
  }
  container.innerHTML =
    '<div style="padding:12px 16px;font-size:13px;font-weight:700;color:var(--orange);text-transform:uppercase;">Suggested Tags</div>' +
    _promoAvailableTags.map(function(tag) {
      const isChecked = _promoTags.includes(tag);
      return '<div style="padding:10px 16px;border-bottom:1px solid var(--grey-light);font-size:14px;cursor:pointer;display:flex;align-items:center;" onclick="togglePromoSuggestionTag(\'' + tag.replace(/'/g,"\\'") + '\', !this.querySelector(\'input\').checked)">' +
        '<input type="checkbox" ' + (isChecked ? 'checked' : '') + ' style="margin-right:10px;" onclick="event.stopPropagation();togglePromoSuggestionTag(\'' + tag.replace(/'/g,"\\'") + '\', this.checked)">' +
        tag +
        '</div>';
    }).join('');
}

/* ─── TAGS ─── */
let _itemTags = [];

function addItemTag() {
  const input = document.getElementById('item-tag-input');
  const tag = input.value.trim();
  if (!tag || _itemTags.includes(tag)) return;
  _itemTags.push(tag);
  input.value = '';
  renderItemTags();
}

function removeItemTag(tag) {
  _itemTags = _itemTags.filter(t => t !== tag);
  renderItemTags();
}

function renderItemTags() {
  const container = document.getElementById('item-tag-container');
  if (!container) return;
  container.innerHTML = _itemTags.map(t =>
    '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--orange-light);color:var(--orange);padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;">' +
    t +
    '<span style="cursor:pointer;font-size:14px;line-height:1;" onclick="removeItemTag(\'' + t.replace(/'/g,"\\'") + '\')">&times;</span></span>'
  ).join('');
}

/* ─── VARIABLES ─── */
let _itemVarCount = 0;

function addItemVariable() {
  const container = document.getElementById('item-variables-container');
  if (!container) return;
  _itemVarCount++;
  const id = 'var_' + _itemVarCount;
  const row = document.createElement('div');
  row.id = id + '_row';
  row.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
  row.innerHTML =
    '<input type="text" placeholder="Name (e.g. Delivery)" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
    '<input type="number" placeholder="Qty" style="width:60px;margin:0;" oninput="updatePricingPreview()">' +
    '<input type="number" placeholder="Rate" style="width:80px;margin:0;" oninput="updatePricingPreview()">' +
    '<span style="cursor:pointer;color:var(--grey-mid);font-size:18px;" onclick="removeItemVariable(\'' + id + '\')">&times;</span>';
  container.appendChild(row);
}

function removeItemVariable(id) {
  const row = document.getElementById(id + '_row');
  if (row) row.remove();
  updatePricingPreview();
}

/* ─── PRICING PREVIEW ─── */
function updatePricingPreview() {
  const basePrice = parseFloat(document.getElementById('item-price').value) || 0;
  const variables = getItemVariables();
  const modifiers = {
    urgency: document.getElementById('mod-urgency').checked,
    nightShift: document.getElementById('mod-nightShift').checked,
    remoteArea: document.getElementById('mod-remoteArea').checked,
    hazard: document.getElementById('mod-hazard').checked
  };
  const discountType = document.getElementById('item-discount-type').value;
  const discountVal = parseFloat(document.getElementById('item-discount-value').value) || 0;
  const discount = discountType === 'none' ? { type: 'none', value: 0 } : { type: discountType, value: discountVal };

  window.PricingEngine.renderPricingPreview('item-pricing-preview', {
    basePrice,
    variables,
    modifiers,
    discount,
    qty: 1,
    tiers: getItemTiers()
  });
}

function getItemVariables() {
  const vars = [];
  document.querySelectorAll('#item-variables-container > div').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 3) {
      const name = inputs[0].value.trim();
      const value = parseFloat(inputs[1].value) || 0;
      const rate = parseFloat(inputs[2].value) || 0;
      if (name) vars.push({ name, value, rate });
    }
  });
  return vars;
}

function getItemTiers() {
  const type = document.getElementById('item-tier-type').value;
  if (type === 'none') return null;
  const rules = [];
  document.querySelectorAll('#item-tier-rules .tier-rule-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    if (type === 'bulk' && inputs.length >= 2) {
      rules.push({ minQty: parseFloat(inputs[0].value) || 0, price: parseFloat(inputs[1].value) || 0 });
    } else if (type === 'stepped' && inputs.length >= 3) {
      rules.push({ from: parseFloat(inputs[0].value) || 0, to: parseFloat(inputs[1].value) || 0, price: parseFloat(inputs[2].value) || 0 });
    } else if (type === 'threshold' && inputs.length >= 2) {
      rules.push({ minSpend: parseFloat(inputs[0].value) || 0, discount: parseFloat(inputs[1].value) || 0 });
    }
  });
  return { type, rules };
}

function onTierTypeChange() {
  const type = document.getElementById('item-tier-type').value;
  const container = document.getElementById('item-tier-rules');
  if (type === 'none') {
    container.style.display = 'none';
    container.innerHTML = '';
    updatePricingPreview();
    return;
  }
  container.style.display = 'block';

  let html = '<div style="margin-bottom:6px;font-size:12px;color:var(--grey-dark);">';
  if (type === 'bulk') html += 'Min Qty → Price per unit';
  else if (type === 'stepped') html += 'From → To → Price per unit (iterative)';
  else if (type === 'threshold') html += 'Min Spend → Discount %';
  html += '</div>';

  html += '<div id="tier-rules-list">';
  html += buildTierRuleRow(type, 0);
  html += '</div>';
  html += '<button class="add-entry-btn" onclick="addTierRule()" style="margin-top:4px;">+ Add Tier</button>';
  container.innerHTML = html;
  updatePricingPreview();
}

function buildTierRuleRow(type, idx) {
  if (type === 'bulk') {
    return '<div class="tier-rule-row" style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
      '<input type="number" placeholder="Min qty" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<input type="number" placeholder="Price" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<span style="cursor:pointer;color:var(--grey-mid);" onclick="this.parentElement.remove();updatePricingPreview();">&times;</span></div>';
  } else if (type === 'stepped') {
    return '<div class="tier-rule-row" style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
      '<input type="number" placeholder="From" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<input type="number" placeholder="To" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<input type="number" placeholder="Price" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<span style="cursor:pointer;color:var(--grey-mid);" onclick="this.parentElement.remove();updatePricingPreview();">&times;</span></div>';
  } else if (type === 'threshold') {
    return '<div class="tier-rule-row" style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
      '<input type="number" placeholder="Min spend (P)" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<input type="number" placeholder="Discount %" style="flex:1;margin:0;" oninput="updatePricingPreview()">' +
      '<span style="cursor:pointer;color:var(--grey-mid);" onclick="this.parentElement.remove();updatePricingPreview();">&times;</span></div>';
  }
  return '';
}

let _tierRuleCount = 1;
function addTierRule() {
  const type = document.getElementById('item-tier-type').value;
  const list = document.getElementById('tier-rules-list');
  if (list) {
    const row = document.createElement('div');
    row.innerHTML = buildTierRuleRow(type, _tierRuleCount++);
    list.appendChild(row.firstElementChild || row);
  }
}

/* ─── SCHEDULE GRID ─── */
let _scheduleDays = {};

function initScheduleGrid() {
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const container = document.getElementById('item-day-rows');
  if (!container) return;
  container.innerHTML = '';

  dayNames.forEach((day, i) => {
    if (!_scheduleDays[day]) {
      _scheduleDays[day] = { active: i < 5, from: '09:00', to: '17:00' };
    }
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--grey-light);';
    row.innerHTML =
      '<label style="display:flex;align-items:center;gap:6px;text-transform:none;font-weight:400;font-size:13px;color:var(--text-main);margin:0;width:100px;cursor:pointer;">' +
      '<input type="checkbox" ' + (_scheduleDays[day].active ? 'checked' : '') + ' onchange="toggleScheduleDay(\'' + day + '\',this.checked)" style="width:auto;margin:0;"> ' +
      day.slice(0,3) + '</label>' +
      '<input type="time" value="' + _scheduleDays[day].from + '" style="flex:1;margin:0;padding:6px 8px;" onchange="updateScheduleDay(\'' + day + '\',\'from\',this.value)">' +
      '<span style="color:var(--grey-dark);font-size:12px;">to</span>' +
      '<input type="time" value="' + _scheduleDays[day].to + '" style="flex:1;margin:0;padding:6px 8px;" onchange="updateScheduleDay(\'' + day + '\',\'to\',this.value)">';
    container.appendChild(row);
  });
}

function toggleScheduleDay(day, active) {
  if (!_scheduleDays[day]) _scheduleDays[day] = { active: false, from: '09:00', to: '17:00' };
  _scheduleDays[day].active = active;
}

function updateScheduleDay(day, field, value) {
  if (!_scheduleDays[day]) _scheduleDays[day] = { active: false, from: '09:00', to: '17:00' };
  _scheduleDays[day][field] = value;
}

function applySchedulePreset(preset) {
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  dayNames.forEach((day, i) => {
    if (!_scheduleDays[day]) _scheduleDays[day] = { active: false, from: '09:00', to: '17:00' };
    if (preset === 'weekday') {
      _scheduleDays[day].active = i < 5;
      _scheduleDays[day].from = '09:00';
      _scheduleDays[day].to = '17:00';
    } else if (preset === 'weekend') {
      _scheduleDays[day].active = i >= 5;
      _scheduleDays[day].from = '09:00';
      _scheduleDays[day].to = '17:00';
    } else if (preset === 'everyday') {
      _scheduleDays[day].active = true;
      _scheduleDays[day].from = '08:00';
      _scheduleDays[day].to = '18:00';
    }
  });
  initScheduleGrid();
}

/* ─── REGION / GEOFENCING ─── */
function onItemRegionChange() {
  const region = document.getElementById('item-region').value;
  const detail = document.getElementById('item-location-detail');
  if (detail) {
    detail.style.display = region === 'nationwide' ? 'none' : 'block';
  }
}

/* ─── PROMO COST ESTIMATE ─── */
function updatePromoCostEstimate() {
  const days = parseInt(document.getElementById('item-promo-days').value) || 3;
  const region = document.getElementById('item-region').value;
  const town = document.getElementById('item-town')?.value || 'Gaborone';
  const freeUsed = UserState.freePromoUsed;

  const cost = window.PricingEngine.calcPromoCost(days, region, town, freeUsed);

  const detailEl = document.getElementById('item-promo-cost-detail');
  if (detailEl) {
    detailEl.innerHTML = cost.breakdown.map(b =>
      '<div class="cost-row"><span>' + b.label + '</span><span>P ' + b.amount.toFixed(2) + '</span></div>'
    ).join('');
  }

  const totalEl = document.getElementById('item-promo-cost-total');
  if (totalEl) totalEl.textContent = 'P ' + cost.total.toFixed(2);

  const saveBtn = document.getElementById('item-save-btn');
  const subtext = document.getElementById('item-save-subtext');
  if (saveBtn) {
    if (cost.free) {
      saveBtn.textContent = 'Save Item & Submit to Promos (Free)';
      if (subtext) subtext.textContent = 'This promo is free! (local promotion)';
    } else {
      saveBtn.textContent = 'Save Item & Submit to Promos (P ' + cost.total.toFixed(2) + ')';
      if (subtext) subtext.textContent = 'Item will be saved to your catalogue and boosted to the Promos feed.';
    }
  }
}

function updateFreePromoStatus() {
  const el = document.getElementById('item-free-promo-status');
  if (!el) return;
  if (UserState.canUseFreePromo()) {
    el.textContent = 'You have 1 free promo this week!';
  } else {
    el.textContent = 'Free promo used this week. P25 per item.';
  }
}

/* ─── UPDATE ITEM PREVIEW ─── */
function updateItemPreview() {
  // Title preview callback for identity section
}

/* ─── SAVE ITEM ─── */
async function saveItem() {
  const title = document.getElementById('item-title').value.trim();
  const desc = document.getElementById('item-desc').value.trim();
  const category = _selectedItemCategory || 'General';
  const categoryPath = [category];
  const basePrice = parseFloat(document.getElementById('item-price').value) || 0;
  const unit = document.getElementById('item-unit').value;
  const region = document.getElementById('item-region').value;
  const promoDays = parseInt(document.getElementById('item-promo-days').value) || 3;
  const startDate = document.getElementById('item-start-date').value;
  const endDate = document.getElementById('item-end-date').value;

  if (!title) { showToast('Please enter an item title'); return; }
  if (!UserState.business) { showToast('Please add a business first'); return; }

  // Gather all data
  const variables = getItemVariables();
  const modifiers = {
    urgency: document.getElementById('mod-urgency').checked,
    nightShift: document.getElementById('mod-nightShift').checked,
    remoteArea: document.getElementById('mod-remoteArea').checked,
    hazard: document.getElementById('mod-hazard').checked
  };
  const discountType = document.getElementById('item-discount-type').value;
  const discountVal = parseFloat(document.getElementById('item-discount-value').value) || 0;
  const tiers = getItemTiers();

  // Generate tags
  const customTags = _itemTags || [];
  const autoTags = window.PricingEngine.generateTags(categoryPath, title, desc, customTags);

  // Calculate pricing
  const pricing = window.PricingEngine.calcPrice(basePrice, variables, modifiers,
    discountType === 'none' ? { type: 'none', value: 0 } : { type: discountType, value: discountVal });

  // Calculate promo cost
  const town = document.getElementById('item-town')?.value || UserState.business?.town || 'Gaborone';
  const promoCost = window.PricingEngine.calcPromoCost(promoDays, region, town, UserState.freePromoUsed);

  // Build schedule days
  const scheduleDays = [];
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  dayNames.forEach(day => {
    if (_scheduleDays[day] && _scheduleDays[day].active) {
      scheduleDays.push({ day, from: _scheduleDays[day].from, to: _scheduleDays[day].to });
    }
  });

  const emoji = window.ITEM_EMOJIS[category] || '\ud83d\udce6';
  const bg = window.BG_CLASSES[Math.floor(Math.random() * window.BG_CLASSES.length)];
  const bizInit = UserState.business.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bizColor = window.APP_COLORS[bizInit.charCodeAt(0) % window.APP_COLORS.length];

  const now = new Date();
  const promoEndDate = new Date(now);
  promoEndDate.setDate(promoEndDate.getDate() + promoCost.effectiveDays);

  const item = {
    id: 'item_' + Date.now(),
    title,
    desc,
    category,
    categoryPath,
    tags: autoTags,
    images: _selectedItemImage ? [_selectedItemImage] : [],
    basePrice,
    unit,
    variables,
    modifiers,
    tiers,
    discount: discountType === 'none' ? null : { type: discountType, value: discountVal },
    pricingResult: {
      unitPrice: pricing.total,
      modifierMultiplier: pricing.modifierMultiplier,
      discountAmount: pricing.discountAmount,
      breakdown: pricing.breakdown
    },
    geofencing: {
      region,
      town: document.getElementById('item-town')?.value || '',
      area: document.getElementById('item-area')?.value || '',
      gps: {
        lat: document.getElementById('item-gps-lat')?.value || '',
        lng: document.getElementById('item-gps-lng')?.value || '',
        radius: parseFloat(document.getElementById('item-gps-radius')?.value) || 0
      }
    },
    scheduling: {
      startDate: startDate || now.toISOString(),
      endDate: endDate || '',
      days: scheduleDays
    },
    promo: {
      active: true,
      cost: promoCost.total,
      days: promoCost.effectiveDays,
      freePromoUsed: UserState.canUseFreePromo() && region === 'local' ? false : promoCost.total > 0,
      submittedAt: now.toISOString(),
      expiresAt: promoEndDate.toISOString(),
      status: 'active'
    },
    kpi: { views: 0, likes: 0, interactions: 0, addedToNotes: 0 },
    businessId: 'biz_user',
    businessName: UserState.business.name,
    businessInit: bizInit,
    businessColor: bizColor,
    location: town,
    phone: UserState.business.phone || '',
    emoji,
    bg,
    promoType: 'Buy New',
    qty: 1,
    liked: false,
    createdAt: now.toISOString()
  };

  window._userItems.push(item);

  try {
    await WirogDB.put('items', item);
  } catch(e) {
    console.error('Failed to save item to DB:', e);
  }

  // Always add to promos
  if (!window._promos) window._promos = [];
  window._promos.unshift(item);

  try {
    await WirogDB.put('promos', item);
  } catch(e) {
    console.error('Failed to save promo to DB:', e);
  }

  // Enqueue for background sync if SyncQueue is available
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('promos', item, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue promo for sync:', e); }

  // Track promo usage
  if (promoCost.total > 0) {
    UserState.useFreePromo();
  }
  UserState.recordPromoSubmission();
  UserState.kpi.ads++;
  updateKPI();

  renderPromos();
  renderBusinessCard();

  showToast('\u2705 Item saved & boosted to Promos!');

  // Reset form
  document.getElementById('item-title').value = '';
  document.getElementById('item-desc').value = '';
  document.getElementById('item-price').value = '';
  _itemTags = [];
  renderItemTags();
  _selectedItemImage = '';
  _scheduleDays = {};
  document.getElementById('item-variables-container').innerHTML = '';
  document.getElementById('item-tier-rules').innerHTML = '';
  document.getElementById('item-tier-rules').style.display = 'none';

  closeModal('item-modal');
}

/* ─── DELETE ITEM ─── */
async function deleteItem(itemId) {
  if (!confirm('Delete this item from your catalogue?')) return;

  window._userItems = window._userItems.filter(it => it.id !== itemId);
  window._promos = window._promos.filter(p => p.id !== itemId);

  try {
    await WirogDB.delete('items', itemId);
  } catch(e) { console.error('Failed to delete item from DB:', e); }
  try {
    await WirogDB.delete('promos', itemId);
  } catch(e) { console.error('Failed to delete promo from DB:', e); }

  // Enqueue delete operations for sync
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('delete', { store: 'items', id: itemId }, { clientId: UserState.id });
      await window.SyncQueue.enqueue('delete', { store: 'promos', id: itemId }, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue delete for item:', e); }

  renderBusinessCard();
  renderPromos();
  showToast('Item deleted');
}

/* ─── EDIT/DELETE PROMO (for backward compat) ─── */
function editPromo(promoId) {
  const p = window._promos.find(x => x.id === promoId);
  if (!p) return;
  const isActive = p.promo && p.promo.status === 'active';
  populatePromoCategories();
  document.getElementById('promo-item-title').value = p.title || '';
  document.getElementById('promo-item-desc').value = p.desc || '';
  document.getElementById('promo-type').value = p.promoType || 'Buy New';
  document.getElementById('promo-item-cat').value = p.category || '';
  document.getElementById('promo-item-price').value = p.basePrice || p.price || '';
  document.getElementById('promo-item-unit').value = p.unit || 'each';
  document.getElementById('promo-region').value = p.geofencing?.region || (p.region || 'local');
  document.getElementById('promo-days').value = p.promo?.days || p.days || 3;

  _promoImages = (p.images || []).filter(function(i) { return typeof i === 'string' && i.length > 0; }).map(function(dataUrl) {
    return { data: dataUrl, name: 'image.png', size: Math.round(dataUrl.length * 0.75) };
  });
  _promoTags = (p.tags || []).filter(function(t) { return t; });
  renderPromoImagePreviews();
  updatePromoImageCalc();
  syncPromoTagDisplay();

  window._editingPromoId = promoId;
  window._editingPromoActive = isActive;
  document.querySelector('#promo-modal .modal-title').textContent = isActive ? 'Edit Active Promo' : 'Edit Promo / Ad';
  updatePromoCost();
  openModal('promo-modal');
  if (isActive) showToast('Editing active promo — save to update');
}

async function deletePromo(promoId) {
  if (!confirm('Delete this promo? This cannot be undone.')) return;

  window._promos = window._promos.filter(p => p.id !== promoId);
  window._userItems = window._userItems.filter(it => it.id !== promoId);

  try {
    await WirogDB.delete('promos', promoId);
  } catch(e) { console.error('Failed to delete promo from DB:', e); }
  try {
    await WirogDB.delete('items', promoId);
  } catch(e) { console.error('Failed to delete item from DB:', e); }

  // Enqueue delete operations for sync
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('delete', { store: 'promos', id: promoId }, { clientId: UserState.id });
      await window.SyncQueue.enqueue('delete', { store: 'items', id: promoId }, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue delete for promo:', e); }

  renderPromos();
  if (UserState.hasBusiness()) renderBusinessCard();
  UserState.kpi.ads = Math.max(0, UserState.kpi.ads - 1);
  updateKPI();
  showToast('Promo deleted');
}

/* ─── PROMO MODAL FUNCTIONS (standalone) ─── */
function openPromoModal() {
  window._editingPromoId = null;
  document.querySelector('#promo-modal .modal-title').textContent = 'Create Promo / Ad';
  populatePromoCategories();
  document.getElementById('promo-item-title').value = '';
  document.getElementById('promo-item-desc').value = '';
  document.getElementById('promo-type').value = 'Buy New';
  document.getElementById('promo-item-price').value = '';
  document.getElementById('promo-item-unit').value = 'each';
  document.getElementById('promo-region').value = 'local';
  document.getElementById('promo-days').value = '3';
  _promoImages = [];
  _promoTags = [];
  renderPromoImagePreviews();
  updatePromoImageCalc();
  syncPromoTagDisplay();
  updatePromoCost();
  updatePromoFreeIndicator();
  openModal('promo-modal');
}

function populatePromoCategories() {
  const select = document.getElementById('promo-item-cat');
  if (!select) return;
  select.innerHTML = '';
  try {
    const data = window.WIROG_PRODUCT_CATEGORIES || { categories: [] };
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub.name;
            opt.textContent = '  ' + sub.name;
            select.appendChild(opt);
            if (sub.children && sub.children.length > 0) {
              sub.children.forEach(sub2 => {
                const opt2 = document.createElement('option');
                opt2.value = sub2.name;
                opt2.textContent = '    ' + sub2.name;
                select.appendChild(opt2);
              });
            }
          });
        } else {
          const opt = document.createElement('option');
          opt.value = cat.name;
          opt.textContent = cat.name;
          select.appendChild(opt);
        }
      });
    }
  } catch(e) {}
}

function updatePromoFreeIndicator() {
  const el = document.getElementById('promo-free-indicator');
  if (!el) return;
  if (UserState.canUseFreePromo()) {
    el.textContent = '\u2705 1 free promo remaining this week';
    el.style.display = 'block';
  } else {
    el.textContent = 'Free promo used. P25 per item.';
    el.style.display = 'block';
  }
}

function updatePromoCost() {
  const region = document.getElementById('promo-region').value;
  const days = parseInt(document.getElementById('promo-days').value) || 3;
  const town = UserState.business?.town || 'Gaborone';

  const cost = window.PricingEngine.calcPromoCost(days, region, town, UserState.freePromoUsed);

  document.getElementById('cost-base').textContent = 'P ' + cost.base.toFixed(2);

  const regionRow = document.getElementById('cost-region-row');
  if (cost.nationalBoost > 0) {
    if (regionRow) { regionRow.style.display = 'flex'; }
    document.getElementById('cost-region').textContent = '+ P ' + cost.nationalBoost.toFixed(2);
  } else {
    if (regionRow) { regionRow.style.display = 'none'; }
  }

  const daysRow = document.getElementById('cost-days-row');
  if (cost.extraDays > 0) {
    if (daysRow) { daysRow.style.display = 'flex'; }
    document.getElementById('cost-days-label').textContent = 'Extra ' + cost.extraDays + ' day(s) (P15/day)';
    document.getElementById('cost-days').textContent = '+ P ' + cost.extraDaysCost.toFixed(2);
  } else {
    if (daysRow) { daysRow.style.display = 'none'; }
  }

  document.getElementById('cost-total').textContent = 'P ' + cost.total.toFixed(2);
}

async function submitPromo() {
  const title = document.getElementById('promo-item-title').value.trim();
  const desc = document.getElementById('promo-item-desc').value.trim();
  const promoType = document.getElementById('promo-type').value;
  const category = document.getElementById('promo-item-cat').value;
  const price = parseFloat(document.getElementById('promo-item-price').value) || 0;
  const unit = document.getElementById('promo-item-unit').value;
  const region = document.getElementById('promo-region').value;
  const days = parseInt(document.getElementById('promo-days').value) || 3;

  if (!title) { showToast('Please enter an item title'); return; }
  if (!UserState.business) { showToast('Please add a business first'); return; }
  if (price <= 0) { showToast('Please enter a valid price'); return; }

  const town = UserState.business?.town || 'Gaborone';
  const cost = window.PricingEngine.calcPromoCost(days, region, town, UserState.freePromoUsed);
  const emoji = window.ITEM_EMOJIS[category] || '\ud83d\udce6';
  const bg = window.BG_CLASSES[Math.floor(Math.random() * window.BG_CLASSES.length)];
  const bizInit = UserState.business.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bizColor = window.APP_COLORS[bizInit.charCodeAt(0) % window.APP_COLORS.length];

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + cost.effectiveDays);

  const isEditing = window._editingPromoId;
  const isEditingActive = window._editingPromoActive;
  const promoId = isEditing || 'promo_' + Date.now();

  const originalPromo = isEditing ? window._promos.find(p => p.id === isEditing) : null;
  const originalExpiry = (isEditingActive && originalPromo?.promo?.expiresAt) ? originalPromo.promo.expiresAt : endDate.toISOString();

  const finalTags = _promoTags.length > 0 ? _promoTags : window.PricingEngine.generateTags([category], title, desc, []);
  const finalImages = _promoImages.map(function(i) { return i.data; });

  const item = {
    id: promoId,
    title, desc, category,
    categoryPath: [category],
    tags: finalTags,
    images: finalImages,
    basePrice: price, unit,
    variables: [],
    modifiers: {},
    tiers: null,
    discount: null,
    pricingResult: { unitPrice: price, modifierMultiplier: 1, discountAmount: 0, breakdown: [] },
    geofencing: { region, town, area: '', gps: { lat: '', lng: '', radius: 0 } },
    scheduling: { startDate: now.toISOString(), endDate: originalExpiry, days: [] },
    promo: {
      active: true,
      cost: cost.total,
      days: cost.effectiveDays,
      freePromoUsed: cost.total === 0,
      submittedAt: originalPromo?.promo?.submittedAt || now.toISOString(),
      expiresAt: originalExpiry,
      status: 'active'
    },
    kpi: originalPromo?.kpi || { views: 0, likes: 0, interactions: 0, addedToNotes: 0 },
    businessId: 'biz_user',
    businessName: UserState.business.name,
    businessInit: bizInit,
    businessColor: bizColor,
    location: town,
    phone: UserState.business.phone || '',
    emoji, bg,
    promoType, region,
    qty: 1,
    liked: originalPromo?.liked || false,
    cost: cost.total,
    days: cost.effectiveDays,
    endDate: originalExpiry,
    createdAt: originalPromo?.createdAt || now.toISOString(),
  };

  window._editingPromoId = null;
  window._editingPromoActive = false;
  document.querySelector('#promo-modal .modal-title').textContent = 'Create Promo / Ad';

  renderPromos();
  updateKPI();
  renderBusinessCard();

  closeModal('promo-modal');
  showToast(isEditing ? '\u2705 Promo updated!' : '\ud83c\udf89 Promo submitted! (P ' + cost.total.toFixed(2) + ')');
}

/* ─── EXPOSE GLOBALS ─── */
window.openItemModal = openItemModal;
window.toggleItemSection = toggleItemSection;
window.onItemCategoryChange = onItemCategoryChange;
window.addItemTag = addItemTag;
window.removeItemTag = removeItemTag;
window.addItemVariable = addItemVariable;
window.removeItemVariable = removeItemVariable;
window.updatePricingPreview = updatePricingPreview;
window.onTierTypeChange = onTierTypeChange;
window.addTierRule = addTierRule;
window.initScheduleGrid = initScheduleGrid;
window.toggleScheduleDay = toggleScheduleDay;
window.updateScheduleDay = updateScheduleDay;
window.applySchedulePreset = applySchedulePreset;
window.onItemRegionChange = onItemRegionChange;
window.updatePromoCostEstimate = updatePromoCostEstimate;
window.updateItemPreview = updateItemPreview;
window.saveItem = saveItem;
window.deleteItem = deleteItem;
window.openPromoModal = openPromoModal;
window.submitPromo = submitPromo;
window.updatePromoCost = updatePromoCost;
window.editPromo = editPromo;
window.deletePromo = deletePromo;
window.selectItemImage = selectItemImage;
window.handlePromoImageUpload = handlePromoImageUpload;
window.removePromoImage = removePromoImage;
window.openPromoTagSelector = openPromoTagSelector;
window.addPromoTag = addPromoTag;
window.removePromoTag = removePromoTag;
window.togglePromoSuggestionTag = togglePromoSuggestionTag;
window.applyPromoTags = applyPromoTags;
window.syncPromoTagDisplay = syncPromoTagDisplay;
window.openItemCategorySelector = openItemCategorySelector;
window.selectItemCategory = selectItemCategory;
window.getSelectedCategory = getSelectedCategory;
