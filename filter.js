/* ════════════════════════════════════════════════════════
   WIROG FILTERS - Filters bar, category & location sheets
   ════════════════════════════════════════════════════════ */

let promoTypeIdx = 0;
const promoTypes = ['Buy New', 'Buy Used', 'To Rent', 'For Auction'];

let selectedCategories = []; // Multi-select array for categories
let userInterestsCollapsed = true; // User Interests collapsible state
let currentLocationMode = 'placeA';
let selectedPlaceA = 'Nation Wide';
let selectedPlaceB = 'All Area';
let locationStep = 'district';
let locationSelectedDistrict = null;
let locationSelectedTown = null;
let selectedTown = '';
let locationData = null;
let locationLoadPromise = null;

function openPromoTypeModal() {
  const container = document.getElementById('promo-type-options');
  const types = ['Buy New', 'Buy Used', 'To Rent', 'For Auction'];
  container.innerHTML = types.map(type => {
    const isSelected = type === promoTypes[promoTypeIdx];
    return `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; cursor:pointer; ${isSelected ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectPromoType('${type}')">${type}${isSelected ? ' <img src="assets/icons/solid/check-2_orange.webp" style="width:16px;height:16px;float:right;">' : ''}</div>`;
  }).join('');
  openModal('promo-type-modal');
}

function selectPromoType(type) {
  promoTypeIdx = promoTypes.indexOf(type);
  document.getElementById('promo-type-btn').textContent = type;
  closeModal('promo-type-modal');
  renderPromos();
}

function applyFilters() {
  let filtered = [...window._promos];
  const currentPromoType = promoTypes[promoTypeIdx];
  if (currentPromoType) {
    filtered = filtered.filter(p => {
      if (!p.promoType) return true;
      return p.promoType === currentPromoType;
    });
  }
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(p => 
      selectedCategories.includes(p.category)
    );
  }
  if (selectedPlaceA && selectedPlaceA !== 'Nation Wide') {
    filtered = filtered.filter(p => p.location && p.location.includes(selectedPlaceA));
  }
  if (selectedPlaceB !== 'All Area') {
    filtered = filtered.filter(p => p.location && p.location.includes(selectedPlaceB));
  }
  return filtered;
}

function cyclePromoType() {
  promoTypeIdx = (promoTypeIdx + 1) % promoTypes.length;
  document.getElementById('promo-type-btn').textContent = promoTypes[promoTypeIdx];
  renderPromos();
}

function toggleCategoryCheckbox(catName, isChecked) {
  if (catName === 'All Services') {
    selectedCategories = [];
    renderCategoryCheckboxes();
    return;
  }
  
  if (isChecked) {
    if (!selectedCategories.includes(catName)) {
      selectedCategories.push(catName);
    }
  } else {
    selectedCategories = selectedCategories.filter(c => c !== catName);
  }
  
  renderCategoryCheckboxes();
}

function renderCategoryCheckboxes() {
  const body = document.getElementById('category-sheet-body');
  if (!body) return;
  
  body.innerHTML = buildCategoryHTML(window.WIROG_PRODUCT_CATEGORIES);
}

function applyCategoryFilter() {
  updateCategoryFilterText();
  closeModal('category-modal');
  renderPromos();
  saveCategoriesToDB();
}

function updateCategoryFilterText() {
  const btn = document.getElementById('category-filter-btn');
  if (selectedCategories.length === 0) {
    btn.textContent = 'All Services';
  } else if (selectedCategories.length === 1) {
    btn.textContent = selectedCategories[0];
  } else {
    btn.textContent = '+' + selectedCategories.length + ' Services';
  }
}

async function saveCategoriesToDB() {
  if (!WirogDB.db) return;
  try {
    await WirogDB.put('filters', { id: 'selectedCategories', categories: selectedCategories });
    try {
      if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
        await window.SyncQueue.enqueue('filters', { id: 'selectedCategories', categories: selectedCategories }, { clientId: UserState.id });
        if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
      }
    } catch(e) { console.warn('Failed to enqueue filters for sync:', e); }
  } catch(e) { console.error('Failed to save categories:', e); }
}

async function loadCategoriesFromDB() {
  if (!WirogDB.db) return;
  try {
    const saved = await WirogDB.get('filters', 'selectedCategories');
    if (saved && saved.categories) {
      selectedCategories = saved.categories;
      updateCategoryFilterText();
    }
  } catch(e) { console.error('Failed to load categories:', e); }
}

async function loadLocations() {
  if (locationData) return;
  if (locationLoadPromise) return locationLoadPromise;

  locationLoadPromise = new Promise(resolve => {
    if (window.LOCATIONS_DATA) {
      locationData = window.LOCATIONS_DATA;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'locations.js';
    script.onload = () => {
      locationData = window.LOCATIONS_DATA || { districts: [] };
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load locations.js');
      locationData = { districts: [] };
      resolve();
    };
    document.head.appendChild(script);
  });

  return locationLoadPromise;
}

function buildCategoryHTML(data) {
  let html = '';
  
  // All Services option
  const allChecked = selectedCategories.length === 0;
  html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); cursor:pointer; font-size:15px; font-weight:600; background:${allChecked ? 'var(--orange-light)' : 'transparent'};" onclick="toggleCategoryCheckbox('All Services', true)">
    <input type="checkbox" ${allChecked ? 'checked' : ''} style="margin-right:10px; accent-color:var(--orange);">All Services
  </div>`;
  
  // User Interests section (if user has interests) - collapsible
  const userInterests = UserState.interests || [];
  if (userInterests.length > 0) {
    const chevron = userInterestsCollapsed ? '▶' : '▼';
    html += `<div style="padding:12px 16px; background:var(--orange-light); font-size:13px; font-weight:700; color:var(--orange); text-transform:uppercase; cursor:pointer; display:flex; align-items:center;" onclick="toggleUserInterestsCollapsed()"><span style="margin-right:8px;">${chevron}</span>User Interests (${userInterests.length})</div>`;
    if (!userInterestsCollapsed) {
      userInterests.forEach(interest => {
        const isChecked = selectedCategories.includes(interest);
        html += `<div style="padding:10px 16px 10px 28px; border-bottom:1px solid var(--grey-light); font-size:14px; cursor:pointer;" onclick="event.stopPropagation(); toggleCategoryCheckbox('${interest.replace(/'/g, "\\'")}', ${!isChecked})">
          <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-right:10px; accent-color:var(--orange);" onclick="event.stopPropagation(); toggleCategoryCheckbox('${interest.replace(/'/g, "\\'")}', this.checked)">${interest}
        </div>`;
      });
    }
  }
  
  // All Categories section
  html += `<div style="padding:12px 16px; font-size:13px; font-weight:700; color:var(--orange); text-transform:uppercase;">All Categories</div>`;
  
  const cats = (data && data.categories) ? data.categories : [];
  
  // Build hierarchical list with collapsible levels
  const renderItem = (cat, level) => {
    const indent = (level - 1) * 16;
    const isChecked = selectedCategories.includes(cat.name);
    const hasChildren = cat.children && cat.children.length > 0;
    const safeName = cat.name.replace(/'/g, "\\'");
    const childId = 'ch-' + (cat.slug || cat.id || safeName).replace(/[^a-z0-9-]/gi, '');
    
    const rowClick = hasChildren
      ? `event.stopPropagation(); toggleCategoryChildren('${childId}')`
      : `event.stopPropagation(); toggleCategoryCheckbox('${safeName}', !this.querySelector('input').checked)`;
    
    let itemHtml = `<div style="padding:8px 16px; border-bottom:1px solid var(--grey-light); cursor:pointer; font-size:14px; padding-left:${indent + 16}px; display:flex; align-items:center;" onclick="${rowClick}">
      <input type="checkbox" ${isChecked ? 'checked' : ''} style="margin-right:8px;" onclick="event.stopPropagation(); toggleCategoryCheckbox('${safeName}', this.checked)">${cat.name}
    </div>`;
    
    if (hasChildren) {
      itemHtml += `<div id="${childId}" style="display:none;">`;
      cat.children.forEach(child => {
        itemHtml += renderItem(child, level + 1);
      });
      itemHtml += `</div>`;
    }
    
    return itemHtml;
  };
  
  cats.forEach(cat => {
    html += renderItem(cat, 1);
  });
  
  return html;
}

function toggleUserInterests() {
  const userInterests = UserState.interests || [];
  if (userInterests.length > 0) {
    const allSelected = userInterests.every(i => selectedCategories.includes(i));
    if (allSelected) {
      selectedCategories = selectedCategories.filter(c => !userInterests.includes(c));
    } else {
      userInterests.forEach(interest => {
        if (!selectedCategories.includes(interest)) {
          selectedCategories.push(interest);
        }
      });
    }
    renderCategoryCheckboxes();
  }
}

function toggleUserInterestsCollapsed() {
  userInterestsCollapsed = !userInterestsCollapsed;
  renderCategoryCheckboxes();
}

function toggleCategoryChildren(id, el) {
  const container = document.getElementById(id);
  if (container) {
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'block' : 'none';
    if (el) el.textContent = isHidden ? '▼' : '▶';
  }
}

async function openLocationSheet(mode) {
  currentLocationMode = mode;
  const title = mode === 'placeA' ? 'Select Town / City' : 'Select Area / Neighbourhood';
  document.getElementById('location-modal-title').textContent = title;
  const body = document.getElementById('location-sheet-body');
  if (body) body.innerHTML = '<p style="padding:20px; text-align:center; color:var(--grey-dark);">Loading locations...</p>';
  openModal('location-modal');
  await loadLocations();
  renderLocationOptions();
}

function renderLocationOptions() {
  const body = document.getElementById('location-sheet-body');
  if (!body) return;

  if (!locationData || !locationData.districts) {
    body.innerHTML = '<p style="padding:20px; text-align:center; color:var(--grey-dark);">Locations not loaded</p>';
    return;
  }

  let html = '';

  if (currentLocationMode === 'placeA') {
    const townsSet = new Set();
    locationData.districts.forEach(d => {
      d.towns.forEach(t => townsSet.add(t.name));
    });
    const pinned = ['Gaborone','Mogoditshane','Tlokweng','Francistown','Maun','Molepolole','Serowe','Palapye','Mochudi','Mahalapye','Kanye','Selibe Phikwe','Letlhakane','Ramotswa','Lobatse'];
    const pinnedSet = new Set(pinned);
    const allTowns = [...townsSet].sort();
    const remaining = allTowns.filter(t => !pinnedSet.has(t));

    // Nation Wide
    const nwActive = selectedPlaceA === 'Nation Wide';
    html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; font-weight:600; cursor:pointer; ${nwActive ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectLocation('Nation Wide', 'placeA')">Nation Wide${nwActive ? ' <i class="fas fa-check" style="float:right;"></i>' : ''}</div>`;

    // Pinned towns
    html += `<div style="padding:10px 16px; font-size:12px; color:var(--grey-dark);">Popular towns / cities</div>`;
    pinned.forEach(name => {
      const active = selectedPlaceA === name;
      html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; cursor:pointer; ${active ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectLocation('${name.replace(/'/g, "\\'")}', 'placeA')">${name}${active ? ' <i class="fas fa-check" style="float:right;"></i>' : ''}</div>`;
    });

    // Rest
    html += `<div style="padding:10px 16px; font-size:12px; color:var(--grey-dark);">All towns / cities</div>`;
    remaining.forEach(name => {
      const active = selectedPlaceA === name;
      html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; cursor:pointer; ${active ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectLocation('${name.replace(/'/g, "\\'")}', 'placeA')">${name}${active ? ' <i class="fas fa-check" style="float:right;"></i>' : ''}</div>`;
    });
  } else {
    let areas = [];
    for (const d of locationData.districts) {
      const town = d.towns.find(t => t.name === selectedPlaceA);
      if (town) {
        areas = town.areas || [];
        break;
      }
    }
    html += `<div style="padding:10px 16px; font-size:12px; color:var(--grey-dark);">Areas in ${selectedPlaceA}</div>`;
    // All Areas option at top
    const allAreasActive = selectedPlaceB === 'All Area';
    html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; font-weight:600; cursor:pointer; ${allAreasActive ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectLocation('All Area', 'placeB')">All Areas${allAreasActive ? ' <i class="fas fa-check" style="float:right;"></i>' : ''}</div>`;
    if (areas.length === 0) {
      html += '<p style="padding:20px; text-align:center; color:var(--grey-dark);">No areas found</p>';
    } else {
      areas.forEach(name => {
        const active = selectedPlaceB === name;
        html += `<div style="padding:14px 16px; border-bottom:1px solid var(--grey-light); font-size:15px; cursor:pointer; ${active ? 'background:var(--orange-light); font-weight:600; color:var(--orange);' : ''}" onclick="selectLocation('${name.replace(/'/g, "\\'")}', 'placeB')">${name}${active ? ' <i class="fas fa-check" style="float:right;"></i>' : ''}</div>`;
      });
    }
  }

  body.innerHTML = html;
}

function selectLocation(name, mode) {
  if (mode === 'placeA') {
    selectedPlaceA = name;
    document.querySelectorAll('#place-a-btn').forEach(function(b) { b.textContent = name; });
    selectedPlaceB = 'All Area';
    document.querySelectorAll('#place-b-btn').forEach(function(b) { b.textContent = 'All Area'; });
  } else {
    selectedPlaceB = name;
    document.querySelectorAll('#place-b-btn').forEach(function(b) { b.textContent = name; });
  }
  closeModal('location-modal');
  var cv = typeof currentView !== 'undefined' ? currentView : '';
  if (cv === 'view-directory') { renderDirectory(); } else { renderPromos(); }
}

function openCategorySheet() {
  renderCategoryCheckboxes();
  openModal('category-modal');
}

window.cyclePromoType = cyclePromoType;
window.openCategorySheet = openCategorySheet;
window.selectCategory = window.applyCategoryFilter || function(){};
window.openLocationSheet = openLocationSheet;
window.selectLocation = selectLocation;
window.loadLocations = loadLocations;
window.buildCategoryHTML = buildCategoryHTML;
window.openSearchModal = openSearchModal;
window.doSearch = doSearch;
window.openPromoTypeModal = openPromoTypeModal;
window.selectPromoType = selectPromoType;
window.toggleUserInterestsCollapsed = toggleUserInterestsCollapsed;
window.toggleCategoryCheckbox = toggleCategoryCheckbox;
window.applyCategoryFilter = applyCategoryFilter;
window.renderCategoryCheckboxes = renderCategoryCheckboxes;
window.toggleUserInterests = toggleUserInterests;
window.toggleCategoryChildren = toggleCategoryChildren;
window.updateCategoryFilterText = updateCategoryFilterText;
window.loadCategoriesFromDB = loadCategoriesFromDB;

let currentSearchMode = 'all';
function setSearchMode(mode) {
  currentSearchMode = mode;
  const pills = document.querySelectorAll('#search-modal .pill');
  pills.forEach(p => {
    p.classList.toggle('active', p.textContent.toLowerCase() === mode);
  });
  doSearch(document.getElementById('search-input').value);
}

function openSearchModal() {
  currentSearchMode = 'all';
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
  
  const pills = document.querySelectorAll('#search-modal .pill');
  pills.forEach(p => p.classList.remove('active'));
  const allPill = pills[0];
  if (allPill) allPill.classList.add('active');

  openModal('search-modal');
  document.getElementById('search-input').focus();
}

function doSearch(query) {
  const results = document.getElementById('search-results');
  if (!query || query.trim() === '') {
    results.innerHTML = '<p style="color:var(--grey-dark); font-size:13px; text-align:center; padding:20px;">Type to search promos...</p>';
    return;
  }
  const q = query.toLowerCase();
  const matches = window._promos.filter(p => {
    const brand = p.brand || '';
    const title = p.title || '';
    const bizName = p.businessName || '';
    const cat = p.category || '';
    const desc = p.desc || '';

    if (currentSearchMode === 'brand') return brand.toLowerCase().includes(q);
    if (currentSearchMode === 'business') return bizName.toLowerCase().includes(q);
    
    return title.toLowerCase().includes(q) ||
           brand.toLowerCase().includes(q) ||
           bizName.toLowerCase().includes(q) ||
           cat.toLowerCase().includes(q) ||
           desc.toLowerCase().includes(q);
  });

  if (matches.length === 0) {
    results.innerHTML = '<p style="color:var(--grey-dark); font-size:13px; text-align:center; padding:20px;">No results found</p>';
    return;
  }

  results.innerHTML = matches.map(p => {
    const brandHtml = p.brand ? '<span style="color:var(--orange); font-weight:700; cursor:pointer;" onclick="event.stopPropagation(); doSearch(\'' + p.brand.replace(/'/g, "\\'") + '\'); document.getElementById(\'search-input\').value=\'' + p.brand.replace(/'/g, "\\'") + '\'; setSearchMode(\'brand\');">\ud83c\udff7\ufe0f ' + p.brand + '</span>' : '';
    
    return '<div style="padding:10px; border-bottom:1px solid var(--grey-light); cursor:pointer;" onclick="closeModal(\'search-modal\'); document.getElementById(\'promo-' + p.id + '\').scrollIntoView({behavior:\'smooth\'}); document.getElementById(\'promo-' + p.id + '\').classList.add(\'open\');">' +
      '<div style="font-size:14px; font-weight:600;">' + p.title + '</div>' +
      '<div style="font-size:12px; color:var(--grey-dark);">' +
        p.category + ' \u00b7 ' + p.businessName + ' \u00b7 P' + (p.price || 0).toFixed(2) +
        (brandHtml ? '<br>' + brandHtml : '') +
      '</div>' +
    '</div>';
  }).join('');
}
