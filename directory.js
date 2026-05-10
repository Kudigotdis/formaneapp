/* ════════════════════════════════════════════════════════
   WIROG DIRECTORY - Business & Pro listings with A-Z nav
   ════════════════════════════════════════════════════════ */

let dirMode = 'companies';
let dirCategory = '';

function toggleDirMode() {
  dirMode = dirMode === 'companies' ? 'pros' : 'companies';
  document.getElementById('dir-type-btn').textContent = dirMode === 'companies' ? 'Companies' : 'Pros';
  document.getElementById('dir-cat-filter').style.display = dirMode === 'companies' ? 'flex' : 'none';
  renderDirectory();
}

function filterDirCategory(btn, cat) {
  dirCategory = cat;
  document.querySelectorAll('#dir-cat-filter .promo-filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDirectory();
}

function renderDirCatFilters() {
  const container = document.getElementById('dir-cat-filter');
  if (!container) return;
  const cats = [...new Set(window.SAMPLE_BUSINESSES.map(b => b.category).filter(Boolean))].sort();
  container.innerHTML =
    '<button class="promo-filter-chip' + (dirCategory === '' ? ' active' : '') + '" data-cat="" onclick="filterDirCategory(this,\'\')">All</button>' +
    cats.map(c => '<button class="promo-filter-chip' + (dirCategory === c ? ' active' : '') + '" data-cat="' + c.replace(/"/g,'&quot;') + '" onclick="filterDirCategory(this,\'' + c.replace(/'/g,"\\'") + '\')">' + c + '</button>').join('');
}

function renderDirectory() {
  const el = document.getElementById('directory-list');
  const alphaNav = document.getElementById('alpha-nav');
  if (!el) return;

  if (dirMode === 'pros') {
    renderPros(el, alphaNav);
    return;
  }

  renderDirCatFilters();

  let businesses = [...window.SAMPLE_BUSINESSES];

  if (UserState.hasBusiness()) {
    const biz = UserState.business;
    const isPublic = biz.subscription === 'full' || biz.subscription === 'catalogue';
    businesses.push({
      id: 'biz_user',
      name: biz.name,
      category: biz.category,
      location: biz.town,
      initials: biz.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: window.APP_COLORS[biz.name.charCodeAt(0) % window.APP_COLORS.length],
      phone: biz.phone || '',
      public: isPublic,
      description: biz.description || '',
      isUserBiz: true,
      subscription: biz.subscription || 'free'
    });
  }

  if (dirCategory) {
    businesses = businesses.filter(b => b.category === dirCategory);
  }

  if (businesses.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:48px 16px;color:var(--grey-dark);"><i class="fas fa-address-book" style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);"></i><p>No businesses yet.</p></div>';
    if (alphaNav) alphaNav.innerHTML = '';
    return;
  }

  businesses.sort((a, b) => a.name.localeCompare(b.name));

  el.innerHTML = '';
  const letterGroups = {};

  businesses.forEach(b => {
    const letter = b.name.charAt(0).toUpperCase();
    if (!letterGroups[letter]) letterGroups[letter] = [];
    letterGroups[letter].push(b);
  });

  Object.keys(letterGroups).sort().forEach(letter => {
    const section = document.createElement('div');
    section.id = 'alpha-' + letter;

    const letterHeader = document.createElement('div');
    letterHeader.style.cssText = 'padding:8px 16px 4px; font-family:var(--font-head); font-size:18px; font-weight:700; color:var(--orange); background:var(--bg); position:sticky; top:0; z-index:2;';
    letterHeader.textContent = letter;
    el.appendChild(letterHeader);

    letterGroups[letter].forEach(b => {
      const d = document.createElement('div');
      d.className = 'dir-card';
      d.onclick = () => openBizProfile(b.id, b.name, b.initials, b.color, b.location, b.phone, b.public, b.description, b.isUserBiz);
      d.innerHTML = `
        <div class="dir-avatar" style="background:${b.color};">${b.initials}</div>
        <div class="dir-info">
          <h3>${b.name}</h3>
          <p>${b.category} · ${b.location}</p>
        </div>
        <button onclick="event.stopPropagation();toggleFavDir(this,'${b.id}')" style="background:none;border:none;cursor:pointer;padding:4px 8px;flex-shrink:0;margin-left:auto;" title="Toggle favourite">
          <img src="assets/icons/${UserState.isFavourite(b.id) ? 'heart_active_icon' : 'heart_inactive_icon'}.png" style="width:22px;height:22px;display:block;">
        </button>
      `;
      el.appendChild(d);
    });
  });

  renderAlphaNav(letterGroups);
}

function renderPros(el, alphaNav) {
  const pros = window.SAMPLE_PROFESSIONALS || [];
  if (pros.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:48px 16px;color:var(--grey-dark);"><i class="fas fa-user-tie" style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);"></i><p>No pros listed yet.</p></div>';
    if (alphaNav) alphaNav.innerHTML = '';
    return;
  }

  pros.sort(function(a, b) { return a.name.localeCompare(b.name); });
  el.innerHTML = '';
  var letterGroups = {};

  pros.forEach(function(p) {
    var letter = p.name.charAt(0).toUpperCase();
    if (!letterGroups[letter]) letterGroups[letter] = [];
    letterGroups[letter].push(p);
  });

  Object.keys(letterGroups).sort().forEach(function(letter) {
    var section = document.createElement('div');
    section.id = 'alpha-' + letter;

    var letterHeader = document.createElement('div');
    letterHeader.style.cssText = 'padding:8px 16px 4px; font-family:var(--font-head); font-size:18px; font-weight:700; color:var(--orange); background:var(--bg); position:sticky; top:0; z-index:2;';
    letterHeader.textContent = letter;
    el.appendChild(letterHeader);

    letterGroups[letter].forEach(function(p) {
      var d = document.createElement('div');
      d.className = 'dir-card';
      d.onclick = function() { openProProfile(p.id); };
      var skillsHtml = p.skills && p.skills.length > 0
        ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">' +
          p.skills.slice(0, 3).map(function(s) { return '<span style="font-size:10px;background:var(--grey-light);padding:2px 8px;border-radius:8px;color:var(--text-main);">' + s + '</span>'; }).join('') +
          (p.skills.length > 3 ? '<span style="font-size:10px;color:var(--grey-dark);">+' + (p.skills.length - 3) + '</span>' : '') +
          '</div>'
        : '';
      d.innerHTML =
        '<div class="dir-avatar" style="background:' + p.color + ';">' + p.initials + '</div>' +
        '<div class="dir-info">' +
          '<h3>' + p.name + '</h3>' +
          '<p>' + p.trade + ' &middot; ' + p.location + '</p>' +
          skillsHtml +
        '</div>' +
        '<button onclick="event.stopPropagation();toggleFavDir(this,\'' + p.id + '\')" style="background:none;border:none;cursor:pointer;padding:4px 8px;flex-shrink:0;margin-left:auto;" title="Toggle favourite">' +
          '<img src="assets/icons/' + (UserState.isFavourite(p.id) ? 'heart_active_icon' : 'heart_inactive_icon') + '.png" style="width:22px;height:22px;display:block;">' +
        '</button>';
      el.appendChild(d);
    });
  });

  renderAlphaNav(letterGroups);
}

function renderAlphaNav(letterGroups) {
  const alphaNav = document.getElementById('alpha-nav');
  if (!alphaNav) return;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const activeLetters = Object.keys(letterGroups);

  alphaNav.innerHTML = letters.map(letter => {
    const isActive = activeLetters.includes(letter);
    return `<a href="#alpha-${letter}" class="${isActive ? '' : 'inactive'}" style="${isActive ? '' : 'opacity:0.3;'}" onclick="scrollToAlpha('${letter}')">${letter}</a>`;
  }).join('');
}

function scrollToAlpha(letter) {
  const section = document.getElementById('alpha-' + letter);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function openBizProfile(bizId, name, init, color, location, phone, isPublic, description, isUserBiz) {
  const content = document.getElementById('biz-profile-content');
  if (!content) return;

  const isOwner = isUserBiz === true;

  let biz = window.SAMPLE_BUSINESSES.find(b => b.id === bizId || b.name === name);
  if (!biz && isOwner && UserState.hasBusiness()) {
    biz = UserState.business;
  }

  const categories = biz && biz.categories ? biz.categories : (biz && biz.category ? [biz.category] : []);
  const catCount = categories.length;
  const cataloguePublic = biz && biz.cataloguePublic !== undefined ? biz.cataloguePublic : (isOwner ? (UserState.business && (UserState.business.subscription === 'full' || UserState.business.subscription === 'catalogue')) : true);

  let promos = window._promos.filter(p => p.businessId === bizId || p.businessName === name);
  const promoCount = promos.length;

  const phoneClean = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const phoneWa = phone ? phone.replace(/[^0-9]/g, '') : '';
  const nameEsc = name.replace(/'/g, "\\'");
  const locationEsc = location.replace(/'/g, "\\'");

  const catPills = categories.map(c => `<span class="pill">${c}</span>`).join('');

  content.innerHTML = `
    <div style="text-align:center; margin-bottom:20px;">
      <div class="avatar" style="width:72px; height:72px; font-size:26px; margin:0 auto; background:${color};">${init}</div>
      <h2 style="font-family:var(--font-head); font-size:24px; font-weight:700; margin-top:10px;">${name}</h2>
      <p style="color:var(--grey-dark); font-size:13px;"><i class="fas fa-map-marker-alt" style="color:var(--orange);"></i> ${location}</p>
      ${description ? `<p style="font-size:13px; color:var(--text-sub); margin-top:8px; padding:0 20px;">${description}</p>` : ''}
      ${catCount > 0 ? `<div class="biz-categories">${catPills}</div>` : ''}
    </div>
    <div class="accordion">
      <div class="accordion-header" onclick="openBizPromos('${bizId}','${nameEsc}')">
        <span><i class="fas fa-bullhorn" style="color:var(--orange);margin-right:8px;"></i> Promos</span>
        <span style="color:var(--orange);font-size:14px;font-weight:700;">${promoCount}</span>
      </div>
    </div>
    <div class="accordion">
      <div class="accordion-header" onclick="openBizCatalogue('${bizId}','${nameEsc}','${locationEsc}','${phoneWa}','${color}','${init}')">
        <span><i class="fas fa-store" style="color:var(--orange);margin-right:8px;"></i> Catalogue</span>
        <span style="color:var(--orange);font-size:14px;font-weight:700;">${catCount}</span>
      </div>
    </div>
    <div class="biz-bottom-bar">
      <button onclick="goBack()" class="biz-back-round"><img src="assets/icons/solid/chevron-left_white.webp" alt="Back"></button>
      <img src="assets/icons/Call_on.png" class="biz-bar-icon" onclick="callBusiness('${phoneClean}')">
      <img src="assets/icons/facebook_icon_on.png" class="biz-bar-icon" onclick="openFacebook('${nameEsc}')">
      <img src="assets/icons/GPS_On.png" class="biz-bar-icon" onclick="openMaps('${nameEsc}','${locationEsc}')">
      <img src="assets/icons/whatsApp_icon_on.png" class="biz-bar-icon" onclick="openWhatsApp('${phoneWa}','${nameEsc}')">
      <img src="assets/icons/${UserState.isFavourite(bizId) ? 'heart_active_icon' : 'heart_inactive_icon'}.png" class="biz-bar-icon" onclick="toggleFavBiz('${bizId}')" id="biz-heart-icon">
    </div>
  `;

  goTo('view-business');
}

function openProProfile(proId) {
  const content = document.getElementById('pro-profile-content');
  if (!content) return;

  const pro = (window.SAMPLE_PROFESSIONALS || []).find(function(p) { return p.id === proId; });
  if (!pro) { showToast('Professional not found'); return; }

  const phoneClean = pro.phone ? pro.phone.replace(/[^0-9+]/g, '') : '';
  const phoneWa = pro.phone ? pro.phone.replace(/[^0-9]/g, '') : '';
  const nameEsc = pro.name.replace(/'/g, "\\'");

  const skillPills = (pro.skills || []).map(function(s) { return '<span class="pill">' + s + '</span>'; }).join('');

  let promos = window._promos.filter(function(p) { return p.businessId === proId || p.businessName === pro.name; });
  const promoCount = promos.length;

  var starsHtml = '';
  if (pro.rating) {
    var full = Math.floor(pro.rating);
    var half = pro.rating - full >= 0.5;
    for (var i = 0; i < full; i++) starsHtml += '\u2B50';
    if (half) starsHtml += '\u2B50';
    starsHtml += ' <span style="font-size:12px;color:var(--grey-dark);font-weight:600;">' + pro.rating.toFixed(1) + '</span>';
  }

  content.innerHTML =
    '<div style="text-align:center; margin-bottom:20px;">' +
      '<div class="avatar" style="width:72px; height:72px; font-size:26px; margin:0 auto; background:' + pro.color + ';">' + pro.initials + '</div>' +
      '<h2 style="font-family:var(--font-head); font-size:24px; font-weight:700; margin-top:10px;">' + nameEsc + '</h2>' +
      '<p style="color:var(--orange); font-size:14px; font-weight:600;">' + pro.trade + '</p>' +
      '<p style="color:var(--grey-dark); font-size:13px;"><i class="fas fa-map-marker-alt" style="color:var(--orange);"></i> ' + pro.location + '</p>' +
      (starsHtml ? '<div style="margin-top:6px;">' + starsHtml + '</div>' : '') +
      (pro.description ? '<p style="font-size:13px; color:var(--text-sub); margin-top:8px; padding:0 20px;">' + pro.description + '</p>' : '') +
      (skillPills ? '<div class="biz-categories" style="margin-top:10px;">' + skillPills + '</div>' : '') +
    '</div>' +
    '<div class="accordion">' +
      '<div class="accordion-header" onclick="openBizPromos(\'' + proId + '\',\'' + nameEsc + '\')">' +
        '<span><i class="fas fa-bullhorn" style="color:var(--orange);margin-right:8px;"></i> Promos</span>' +
        '<span style="color:var(--orange);font-size:14px;font-weight:700;">' + promoCount + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="biz-bottom-bar">' +
      '<button onclick="goBack()" class="biz-back-round"><img src="assets/icons/solid/chevron-left_white.webp" alt="Back"></button>' +
      '<img src="assets/icons/Call_on.png" class="biz-bar-icon" onclick="callBusiness(\'' + phoneClean + '\')">' +
      '<img src="assets/icons/whatsApp_icon_on.png" class="biz-bar-icon" onclick="openWhatsApp(\'' + phoneWa + '\',\'' + nameEsc + '\')">' +
      '<img src="assets/icons/' + (UserState.isFavourite(proId) ? 'heart_active_icon' : 'heart_inactive_icon') + '.png" class="biz-bar-icon" onclick="toggleFavBiz(\'' + proId + '\')" id="pro-heart-icon">' +
    '</div>';

  goTo('view-pro-profile');
}

function openBizPromos(bizId, businessName) {
  const promos = window._promos.filter(p => p.businessId === bizId || p.businessName === businessName);
  const biz = window.SAMPLE_BUSINESSES.find(b => b.id === bizId || b.name === businessName);
  const content = document.getElementById('biz-promos-content');
  if (!content) return;

  const isOwner = bizId === 'biz_user';

  let html = `
    <div style="background:#2a2a2a; padding:16px; color:white;">
      <button onclick="goBack()" style="background:none;border:none;color:white;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;margin-bottom:10px;">
        <img src="assets/icons/solid/chevron-left_white.webp" style="width:16px;height:16px;"> Back
      </button>
      <h2 style="font-family:var(--font-head);font-size:20px;font-weight:700;margin:0;">${businessName}</h2>
      <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:4px 0 0 0;">${biz ? biz.location : ''}</p>
      <p style="font-size:13px;color:var(--orange);margin:8px 0 0 0;font-weight:600;">${promos.length} Active Promo${promos.length !== 1 ? 's' : ''}</p>
    </div>
    <div style="padding:12px;">
  `;

  if (promos.length === 0) {
    html += '<p style="text-align:center;padding:32px;color:var(--grey-dark);font-size:14px;">No active promos for this business.</p>';
  } else {
    promos.forEach(p => {
      const status = p.promo ? (function(){ var n=new Date(),e=new Date(p.promo.expiresAt);return n>=e?'Ended':Math.ceil((e-n)/(86400000))+'d remaining';})() : 'Active';
      const kpi = p.kpi || {};
      const tags = p.tags || [];
      const tagHtml = tags.length > 0 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">' + tags.slice(0,3).map(function(t){return '<span style="font-size:10px;background:var(--grey-light);padding:2px 8px;border-radius:8px;">'+t+'</span>';}).join('') + (tags.length>3?'<span style="font-size:10px;color:var(--grey-dark);">+'+(tags.length-3)+'</span>':'') + '</div>' : '';

      html +=
        '<div class="biz-promo-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
            '<div>' +
              '<div style="font-size:15px;font-weight:600;">' + (p.emoji || '') + ' ' + p.title + '</div>' +
              '<div style="font-size:11px;color:var(--grey-dark);margin-top:2px;">' + (p.category || '') + '</div>' +
              tagHtml +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div style="font-size:18px;font-weight:800;color:var(--orange);">P ' + ((p.basePrice || p.price || 0) * (p.qty || 1)).toFixed(2) + '</div>' +
              '<div style="font-size:11px;color:var(--grey-dark);">' + (p.unit || 'each') + '</div>' +
            '</div>' +
          '</div>' +
          (isOwner && p.promo ? '<div style="font-size:11px;color:var(--grey-dark);margin-top:4px;">Cost: P ' + (p.promo.cost || 0).toFixed(2) + ' | ' + status + '</div>' : '') +
          (isOwner ? '<div style="display:flex;gap:12px;font-size:11px;color:var(--grey-dark);margin-top:4px;"><span>\ud83d\udc41 ' + (kpi.views||0) + '</span><span>\u2764\ufe0f ' + (kpi.likes||0) + '</span><span>\ud83d\udccb ' + (kpi.addedToNotes||0) + '</span></div>' : '') +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--grey-light);">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button class="qty-btn" onclick="changeQty(\'' + p.id + '\',-1,' + (p.basePrice || p.price || 0) + ')">\u2212</button>' +
              '<span style="min-width:20px;text-align:center;font-weight:600;">' + (p.qty || 1) + '</span>' +
              '<button class="qty-btn" onclick="changeQty(\'' + p.id + '\',1,' + (p.basePrice || p.price || 0) + ')">+</button>' +
            '</div>' +
            '<button class="btn btn-sm" onclick="addToNote(\'' + p.id + '\')">Add to Note</button>' +
          '</div>' +
        '</div>';
    });
  }

  html += '</div>';
  content.innerHTML = html;
  goTo('view-business-promos');
}

function openBizCatalogue(bizId, businessName, location, phoneWa, color, init) {
  const content = document.getElementById('biz-catalogue-content');
  if (!content) return;

  let biz = window.SAMPLE_BUSINESSES.find(b => b.id === bizId || b.name === businessName);
  const isOwner = bizId === 'biz_user' || (biz && biz.id === 'biz_user');

  const categories = biz && biz.categories ? biz.categories : [];
  const cataloguePublic = biz && biz.cataloguePublic !== undefined ? biz.cataloguePublic : true;

  if (!cataloguePublic && !isOwner) {
    const nameEsc = (businessName || '').replace(/'/g, "\\'");
    content.innerHTML = `
      <div style="padding:16px;">
        <button onclick="goBack()" class="back-btn" style="margin-bottom:16px;"><i class="fas fa-arrow-left"></i> Back</button>
        <div style="text-align:center; padding:32px 16px;">
          <div style="font-size:48px; margin-bottom:16px;">\ud83d\udd12</div>
          <h3 style="font-family:var(--font-head);font-size:20px;font-weight:700;margin-bottom:8px;">Catalogue Private</h3>
          <p style="font-size:14px;color:var(--grey-dark);margin-bottom:20px;">
            This catalogue is currently private.<br>
            WhatsApp the business and ask them to<br>
            publicise their catalogue.
          </p>
          <button class="btn" onclick="requestCatalogueAccess('${nameEsc}','${phoneWa}')">
            <img src="assets/icons/whatsApp_icon_on.png" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"> Send WhatsApp Message
          </button>
        </div>
      </div>
    `;
    goTo('view-business-catalogue');
    return;
  }

  const nameEsc = (businessName || '').replace(/'/g, "\\'");
  const backAction = isOwner ? "goTo('view-account')" : 'goBack()';

  const totalItems = biz && biz.categories ? biz.categories.length : 0;

  let html = `
    <div style="background:#2a2a2a;padding:16px;color:white;position:sticky;top:0;z-index:10;">
      <button onclick="${backAction}" style="background:none;border:none;color:white;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;margin-bottom:10px;">
        <img src="assets/icons/solid/chevron-left_white.webp" style="width:16px;height:16px;"> Back
      </button>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="avatar-square" style="width:48px;height:48px;font-size:18px;background:${color};">${init}</div>
        <div>
          <h2 style="font-family:var(--font-head);font-size:18px;font-weight:700;margin:0;">${nameEsc}</h2>
          <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:2px 0 0 0;">${totalItems} categor${totalItems !== 1 ? 'ies' : 'y'}</p>
        </div>
      </div>
    </div>
    <div style="padding:12px;">
  `;

  if (isOwner) {
    const userItems = window._userItems || [];
    const realBizId = biz && biz.id;
    const demoItems = (window.DEMO_CATALOGUE_ITEMS || []).filter(it => it.businessId === realBizId);
    const catMap = {};
    userItems.concat(demoItems).forEach(it => {
      const c = it.category || 'Other';
      if (!catMap[c]) catMap[c] = [];
      catMap[c].push(it);
    });
    const catKeys = Object.keys(catMap);
    if (catKeys.length === 0) {
      html += '<div style="text-align:center;padding:40px 16px;color:var(--grey-dark);"><div style="font-size:40px;margin-bottom:12px;">📦</div><p style="font-size:14px;font-weight:600;">Your catalogue is empty</p><p style="font-size:12px;margin-top:4px;">Add items to showcase your products.</p></div>';
    } else {
      catKeys.forEach(cat => {
        const catItems = catMap[cat];
        html += `
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:15px;font-weight:700;color:var(--orange);">${cat}</span>
              <span style="font-size:11px;color:var(--grey-dark);">${catItems.length} item${catItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${catItems.map(it => {
                const price = (it.pricingResult && it.pricingResult.unitPrice) || it.basePrice || it.price || 0;
                const unit = it.unit || 'each';
                const img = it.images && it.images[0] ? it.images[0] : '';
                return `
                  <div class="catalogue-card" onclick="${it.businessId === 'biz_user' ? '' : "addToNoteQuick('" + it.id + "','" + it.title.replace(/'/g,"\\'") + "'," + price + ",'" + unit + "','" + (businessName || '').replace(/'/g,"\\'") + "')"}">
                    ${img ? '<img src="' + img + '" class="catalogue-card-img" onerror="this.style.display=\'none\'">' : '<div class="catalogue-card-img catalogue-card-img-ph">' + (it.emoji || '📦') + '</div>'}
                    <div class="catalogue-card-body">
                      <div class="catalogue-card-title">${it.title}</div>
                      <div class="catalogue-card-price">P ${price.toFixed(2)} <span class="catalogue-card-unit">${unit}</span></div>
                      <div style="display:flex;gap:6px;margin-top:6px;">
                        ${it.businessId === 'biz_user' ? '<button class="btn-sm" onclick="event.stopPropagation();editPromo(\'' + it.id + '\')" style="flex:1;">Edit</button>' : '<button class="btn-sm" onclick="event.stopPropagation();addToNoteQuick(\'' + it.id + '\',\'' + it.title.replace(/'/g,"\\'") + '\',' + price + ',\'' + unit + '\',\'' + (businessName || '').replace(/'/g,"\\'") + '\')" style="flex:1;">+ Note</button>'}
                        ${it.businessId === 'biz_user' ? '<button class="btn-sm" style="flex:1;background:var(--grey-light);color:var(--grey-dark);border:1px solid var(--grey-light);" onclick="event.stopPropagation();deleteItem(\'' + it.id + '\')">Delete</button>' : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });
    }
    html += '<button class="btn" style="margin-top:8px;width:100%;" onclick="openItemModal()">+ Add to Catalogue</button>';
  } else {
    let promos = window._promos.filter(p => p.businessId === bizId || p.businessName === businessName);
    const realBizId = biz && biz.id;
    const demoItems = (window.DEMO_CATALOGUE_ITEMS || []).filter(it => it.businessId === realBizId || it.businessName === businessName);
    const allItems = promos.concat(demoItems);
    if (categories.length === 0 && allItems.length === 0) {
      html += '<div style="text-align:center;padding:40px 16px;color:var(--grey-dark);"><div style="font-size:40px;margin-bottom:12px;">📦</div><p style="font-size:14px;font-weight:600;">No catalogue items yet</p><p style="font-size:12px;margin-top:4px;">Check back later or contact the business.</p></div>';
    } else {
      const catMap = {};
      const catsToUse = categories.length > 0 ? categories : [...new Set(allItems.map(i => i.category || 'Other'))];
      catsToUse.forEach(c => { if (!catMap[c]) catMap[c] = []; });
      allItems.forEach(it => {
        const c = it.category || 'Other';
        if (!catMap[c]) catMap[c] = [];
        catMap[c].push(it);
      });
      Object.keys(catMap).forEach(cat => {
        const catItems = catMap[cat];
        html += `
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:15px;font-weight:700;color:var(--orange);">${cat}</span>
              <span style="font-size:11px;color:var(--grey-dark);">${catItems.length} item${catItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${catItems.map(p => {
                const price = (p.basePrice || p.price || 0);
                const unit = p.unit || 'each';
                const img = p.images && p.images[0] ? p.images[0] : '';
                return `
                  <div class="catalogue-card" onclick="addToNoteQuick('${p.id}','${(p.title || '').replace(/'/g,"\\'")}',${price},'${unit}','${(businessName || '').replace(/'/g,"\\'")}')">
                    ${img ? '<img src="' + img + '" class="catalogue-card-img" onerror="this.style.display=\'none\'">' : '<div class="catalogue-card-img catalogue-card-img-ph">' + (p.emoji || '📦') + '</div>'}
                    <div class="catalogue-card-body">
                      <div class="catalogue-card-title">${p.title || ''}</div>
                      <div class="catalogue-card-price">P ${price.toFixed(2)} <span class="catalogue-card-unit">${unit}</span></div>
                      <button class="btn-sm" style="margin-top:6px;width:100%;" onclick="event.stopPropagation();addToNoteQuick('${p.id}','${(p.title || '').replace(/'/g,"\\'")}',${price},'${unit}','${(businessName || '').replace(/'/g,"\\'")}')">+ Add to Note</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });
    }
  }

  html += '</div>';
  content.innerHTML = html;
  goTo('view-business-catalogue');
}

function requestCatalogueAccess(businessName, phone) {
  const text = 'Hello ' + businessName + ', I found you on Wirog Supply Solutions and would like to view your full catalogue. Could you please make your catalogue public so I can see all your products? Thank you.';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

function toggleFavBiz(bizId) {
  UserState.toggleFavourite(bizId);
  const src = 'assets/icons/' + (UserState.isFavourite(bizId) ? 'heart_active_icon' : 'heart_inactive_icon') + '.png';
  var icon = document.getElementById('biz-heart-icon');
  if (icon) icon.src = src;
  icon = document.getElementById('pro-heart-icon');
  if (icon) icon.src = src;
  // Also update directory list heart icons
  document.querySelectorAll('.dir-card button img').forEach(function(img) {
    var btn = img.closest('button');
    if (btn && btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + bizId + "'")) {
      img.src = src;
    }
  });
}

function callBusiness(phone) {
  if (!phone) { showToast('No phone number available'); return; }
  window.open(`tel:${phone}`);
}

function openWhatsApp(phone, businessName) {
  if (!phone) { showToast('No phone number available'); return; }
  const text = `Hello ${businessName}, I found you on Wirog Supply Solutions and would like to inquire about your products.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

function openFacebook(businessName) {
  window.open(`https://www.facebook.com/search/top?q=${encodeURIComponent(businessName)}`, '_blank');
}

function openMaps(name, location) {
  const query = `${name} ${location} Botswana`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
}

function shareBusiness(name, location) {
  const text = `Check out ${name} in ${location} on Wirog Supply Solutions!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function toggleFavDir(btn, id) {
  UserState.toggleFavourite(id);
  const img = btn.querySelector('img');
  if (img) {
    img.src = 'assets/icons/' + (UserState.isFavourite(id) ? 'heart_active_icon' : 'heart_inactive_icon') + '.png';
  }
}

window.renderAlphaNav = renderAlphaNav;
window.renderDirectory = renderDirectory;
window.openBizProfile = openBizProfile;
window.openBizPromos = openBizPromos;
window.openBizCatalogue = openBizCatalogue;
window.requestCatalogueAccess = requestCatalogueAccess;
window.scrollToAlpha = scrollToAlpha;
window.callBusiness = callBusiness;
window.openWhatsApp = openWhatsApp;
window.openFacebook = openFacebook;
window.openMaps = openMaps;
window.shareBusiness = shareBusiness;
window.toggleFavDir = toggleFavDir;
window.toggleFavBiz = toggleFavBiz;
window.toggleDirMode = toggleDirMode;
window.openProProfile = openProProfile;
window.filterDirCategory = filterDirCategory;
