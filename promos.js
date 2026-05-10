/* ════════════════════════════════════════════════════════
   WIROG PROMOS - Feed rendering, KPI, status tracking,
   countdown timer, tags display
   ════════════════════════════════════════════════════════ */

function openBizFromPromo(businessId, businessName) {
  let biz = window.SAMPLE_BUSINESSES.find(b => b.id === businessId || b.name === businessName);
  if (!biz) biz = window.SAMPLE_BUSINESSES.find(b => b.name === businessName);
  if (biz) {
    openBizProfile(biz.id, biz.name, biz.initials, biz.color, biz.location, biz.phone || '', biz.public, biz.description || '', false);
  } else {
    openBizProfile(businessId, businessName, '', '#999', '', '', false, '', false);
  }
}

/* ─── PROMO STATUS CHECKER ─── */
function checkPromoStatuses() {
  const now = new Date();
  let changed = false;

  (window._promos || []).forEach(p => {
    if (!p.promo) return;
    if (p.promo.status === 'active' && p.promo.expiresAt) {
      const expires = new Date(p.promo.expiresAt);
      if (now >= expires) {
        p.promo.status = 'ended';
        p.promo.active = false;
        changed = true;
      }
    }
  });

  if (changed) {
    renderPromos();
  }
}

// Check every 60 seconds
setInterval(checkPromoStatuses, 60000);

/* ─── FORMAT REMAINING TIME ─── */
function getPromoRemaining(expiresAt) {
  if (!expiresAt) return { text: '', expired: true };
  const now = new Date();
  const end = new Date(expiresAt);
  const diff = end - now;
  if (diff <= 0) return { text: 'Ended', expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { text: days + 'd ' + hours + 'h remaining', expired: false };
  if (hours > 0) return { text: hours + 'h ' + mins + 'm remaining', expired: false };
  return { text: mins + 'm remaining', expired: false };
}

/* ─── RENDER KPI ─── */
function renderKpiStrip(kpi) {
  if (!kpi) return '';
  const v = kpi.views || 0;
  const l = kpi.likes || 0;
  const i = kpi.interactions || 0;
  return '<div class="promo-kpi">' +
    '<span><span class="kpi-icon">\ud83d\udc41</span> ' + v + '</span>' +
    '<span><span class="kpi-icon">\u2764\ufe0f</span> ' + l + '</span>' +
    '<span><span class="kpi-icon">\ud83d\udccb</span> ' + i + '</span>' +
    '</div>';
}

/* ─── RENDER TAGS ─── */
function renderPromoTags(tags) {
  if (!tags || tags.length === 0) return '';
  const maxTags = 3;
  const overflow = tags.length - maxTags;
  return '<div class="promo-tags">' +
    tags.map(function(t, i) {
      return '<span class="promo-tag' + (i >= maxTags ? ' promo-tag-hidden' : '') + '">' + t + '</span>';
    }).join('') +
    (overflow > 0 ? '<span class="promo-tag promo-tag-more" onclick="this.parentElement.classList.toggle(\'expanded\');this.style.display=\'none\'">+' + overflow + '</span>' : '') +
    '</div>';
}

/* ─── MAIN RENDER ─── */
function renderPromos() {
  const feed = document.getElementById('promo-feed');
  if (!feed) return;

  const promos = (typeof applyFilters === 'function') ? applyFilters() : (window._promos || []);

  if (promos.length === 0) {
    feed.innerHTML =
      '<div style="text-align:center;padding:48px 16px;color:var(--grey-dark);">' +
      '<div style="font-size:40px;margin-bottom:12px;display:block;color:var(--grey-mid);">\ud83d\udce2</div>' +
      '<p style="font-size:15px;font-weight:600;margin-bottom:6px;">No promos yet</p>' +
      '<p style="font-size:13px;">Switch to a Business account to add items and boost them to the Promos feed!</p>' +
      '<button class="btn btn-sm" style="margin-top:16px;max-width:200px;margin-left:auto;margin-right:auto;" onclick="openSwitcher()">Switch Account</button>' +
      '</div>';
    return;
  }

  feed.innerHTML = '';
  var _isGuest = window.Auth && window.Auth.isGuest();
  promos.forEach(p => {
    const isOwnPromo = p.businessId === 'biz_user';
    const status = p.promo ? getPromoRemaining(p.promo.expiresAt) : { text: '', expired: false };
    const kpiHtml = renderKpiStrip(p.kpi);
    const tagsHtml = renderPromoTags(p.tags);

    const card = document.createElement('div');
    card.className = 'promo-card';
    card.id = 'promo-' + p.id;

    // Status badge
    let statusBadge = '';
    if (isOwnPromo) {
      if (status.expired) {
        statusBadge = '<div class="promo-status-badge ended">Ended</div>';
      } else {
        statusBadge = '<div class="promo-status-badge active">' + status.text + '</div>';
      }
    }

    // Image source (carousel if multiple)
    let imgHtml;
    if (p.images && p.images.length > 1) {
      imgHtml = '<div class="promo-carousel" id="carousel-' + p.id + '">';
      p.images.forEach(function(img) {
        imgHtml += '<img src="' + img + '" class="promo-img" alt="' + p.title + '" onerror="this.parentElement.removeChild(this)">';
      });
      imgHtml += '</div>' +
        '<div class="carousel-dots" id="dots-' + p.id + '">';
      p.images.forEach(function(_, i) {
        imgHtml += '<span class="carousel-dot' + (i === 0 ? ' active' : '') + '" onclick="scrollCarouselTo(\'' + p.id + '\',' + i + ')"></span>';
      });
      imgHtml += '</div>';
    } else if (p.images && p.images.length === 1) {
      imgHtml = '<img src="' + p.images[0] + '" class="promo-img" alt="' + p.title + '" onerror="this.style.display=\'none\'">';
    } else {
      imgHtml = '<div class="promo-img-ph ' + (p.bg || 'img-amber') + '"><span class="promo-img-emoji">' + (p.emoji || '\ud83d\udce6') + '</span></div>';
    }

    card.innerHTML =
      '<div class="promo-img-wrap" onclick="trackPromoView(\'' + p.id + '\'); togglePromo(\'' + p.id + '\')">' +
        imgHtml +
        statusBadge +
        '<div class="promo-tap-hint">Tap for details</div>' +
      '</div>' +
      '<div class="promo-details">' +
        '<div class="promo-supplier" onclick="openBizFromPromo(\'' + p.businessId + '\',\'' + p.businessName.replace(/'/g,"\\'") + '\')">' +
          '<div class="avatar-square" style="background:' + p.businessColor + ';">' + p.businessInit + '</div>' +
          '<div>' +
            '<div style="font-size:14px;">' + p.businessName + '</div>' +
            '<div style="font-size:11px;color:var(--grey-dark);font-weight:400;">' + p.location + '</div>' +
          '</div>' +
        '</div>' +
        (isOwnPromo ? '<div style="font-size:10px;color:var(--orange);font-weight:600;margin-bottom:4px;">Your Promo</div>' : '') +
        '<div class="promo-cat">' + (p.category || 'General') + '</div>' +
        '<div class="promo-title">' + p.title + '</div>' +
        '<div class="promo-desc">' + (p.desc || '') + '</div>' +
        tagsHtml +
        '<div class="qty-row">' +
          '<div class="qty-price">P <span class="cp">' + ((p.basePrice || p.price || 0) * (p.qty || 1)).toFixed(2) + '</span> <span style="font-size:12px;font-weight:400;color:var(--grey-dark);">' + (p.unit || 'each') + '</span></div>' +
          '<div class="qty-controls">' +
            '<button class="qty-btn" onclick="changeQty(\'' + p.id + '\',-1,' + (p.basePrice || p.price || 0) + ')">\u2212</button>' +
            '<span class="qv" style="min-width:20px;text-align:center;">' + (p.qty || 1) + '</span>' +
            '<button class="qty-btn" onclick="changeQty(\'' + p.id + '\',1,' + (p.basePrice || p.price || 0) + ')">+</button>' +
          '</div>' +
        '</div>' +

        // KPI strip (own promos only)
        (isOwnPromo ? kpiHtml : '') +

        // Cost info (own promos only)
        (isOwnPromo && p.promo ? '<div class="promo-cost-info">Cost: P ' + (p.promo.cost || p.cost || 0).toFixed(2) + '</div>' : '') +

        (_isGuest ? '' :
        '<div class="promo-actions">' +
          '<button class="action-btn" onclick="addToNote(\'' + p.id + '\')"><img src="assets/icons/solid/add-to-note_orange.webp" style="width:14px;height:14px;vertical-align:middle;"> Add to Note</button>' +
          '<button class="action-btn" onclick="sharePromo(\'' + p.id + '\')"><img src="assets/icons/solid/share-nodes.svg" style="width:14px;height:14px;vertical-align:middle;"></button>' +
          (isOwnPromo || window.Auth?.isAdmin() ?
          '<button class="action-btn" onclick="openFbPromo(\'' + p.id + '\')"><img src="assets/icons/brands/facebook-f.svg" style="width:14px;height:14px;vertical-align:middle;"></button>' : '') +
          (isOwnPromo ? '' :
          '<button class="action-btn ' + (p.liked ? 'liked' : '') + '" id="like-' + p.id + '" onclick="toggleLike(\'' + p.id + '\')">' +
            '<img src="assets/icons/heart_' + (p.liked ? 'active' : 'inactive') + '_icon.png" style="width:16px;height:16px;vertical-align:middle;">' +
          '</button>') +
        '</div>') +
      '</div>';

    feed.appendChild(card);
  });
}

/* ─── TRACK PROMO VIEW ─── */
const _viewedPromos = JSON.parse(localStorage.getItem('_viewedPromos') || '{}');

async function trackPromoView(id) {
  const idStr = String(id);
  if (_viewedPromos[idStr]) return;
  _viewedPromos[idStr] = true;
  localStorage.setItem('_viewedPromos', JSON.stringify(_viewedPromos));

  UserState.kpi.views++;
  try { await WirogDB.put('kpi', { id: UserState.id, ...UserState.kpi }); } catch(e) {}
  updateKPI();

  // Track per-promo KPI
  const p = window._promos.find(x => String(x.id) === idStr);
  if (p && p.kpi) {
    p.kpi.views = (p.kpi.views || 0) + 1;
    try { await WirogDB.put('promos', p); } catch(e) {}
    // Enqueue promo KPI update for sync
    try {
      if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
        await window.SyncQueue.enqueue('promos_update', { id: p.id, kpi: p.kpi }, { clientId: UserState.id });
        if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
      }
    } catch(e) { console.warn('Failed to enqueue promo view update:', e); }
  }
}

function togglePromo(id) {
  const cards = document.querySelectorAll('.promo-card.open');
  const current = document.getElementById('promo-' + id);
  if (!current) return;
  const wasOpen = current.classList.contains('open');
  cards.forEach(c => c.classList.remove('open'));
  if (!wasOpen) current.classList.add('open');
}

function changeQty(promoId, delta, basePrice) {
  const card = document.getElementById('promo-' + promoId);
  if (!card) return;
  const qv = card.querySelector('.qv');
  const cp = card.querySelector('.cp');
  let q = parseInt(qv.innerText) + delta;
  if (q < 1) q = 1;
  qv.innerText = q;
  cp.innerText = (q * basePrice).toFixed(2);
  const p = window._promos.find(x => String(x.id) === String(promoId));
  if (p) {
    p.qty = q;
    if (p.kpi) p.kpi.interactions = (p.kpi.interactions || 0) + 1;
  }
}

async function toggleLike(id) {
  const p = window._promos.find(x => String(x.id) === String(id));
  if (!p) return;
  p.liked = !p.liked;
  const btn = document.getElementById('like-' + id);
  if (!btn) return;
  btn.className = 'action-btn' + (p.liked ? ' liked' : '');
  btn.innerHTML = '<img src="assets/icons/heart_' + (p.liked ? 'active' : 'inactive') + '_icon.png" style="width:16px;height:16px;vertical-align:middle;">';

  if (p.liked) {
    UserState.kpi.likes++;
    if (p.kpi) p.kpi.likes = (p.kpi.likes || 0) + 1;
  } else {
    UserState.kpi.likes = Math.max(0, UserState.kpi.likes - 1);
    if (p.kpi) p.kpi.likes = Math.max(0, (p.kpi.likes || 0) - 1);
  }

  try { await WirogDB.put('promos', p); } catch(e) { console.error('Failed to save like to DB:', e); }
  // Enqueue like change for background sync
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('promos_update', { id: p.id, liked: p.liked, kpi: p.kpi }, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue promo like update:', e); }
  updateKPI();
  showToast(p.liked ? '\u2764\ufe0f Liked!' : 'Removed like');
}

async function addToNote(promoId) {
  const p = window._promos.find(x => String(x.id) === String(promoId));
  if (!p) return;
  const card = document.getElementById('promo-' + promoId);
  if (!card) return;
  const qv = card.querySelector('.qv');
  const qty = parseInt(qv.innerText);

  let note = window._notes.find(n => n.title === 'Saved from Promos');
  if (!note) {
    note = { id: 'note_' + Date.now(), title: 'Saved from Promos', userId: UserState.id, items: [] };
    window._notes.push(note);
  }

  note.items.push({
    title: p.title, emoji: p.emoji || '\ud83d\udce6', price: p.basePrice || p.price || 0,
    unit: p.unit || 'each', business: p.businessName, qty: qty
  });

  try { await WirogDB.put('notes', note); } catch(e) { console.error('Failed to save note to DB:', e); }

  // Enqueue note save for background sync
  try {
    if (window.SyncQueue && typeof window.SyncQueue.enqueue === 'function') {
      await window.SyncQueue.enqueue('notes', note, { clientId: UserState.id });
      if (window.requestBackgroundSync) window.requestBackgroundSync().catch(()=>{});
    }
  } catch(e) { console.warn('Failed to enqueue note for sync:', e); }

  if (p.kpi) p.kpi.addedToNotes = (p.kpi.addedToNotes || 0) + 1;
  UserState.kpi.noteAdds++;
  updateKPI();
  showToast('\u2705 Added to note!');
}

function sharePromo(id) {
  const p = window._promos.find(x => String(x.id) === String(id));
  if (!p) return;
  const text = 'Check out: ' + p.title + ' - P' + ((p.basePrice || p.price || 0)).toFixed(2) + ' ' + (p.unit || 'each') + ' from ' + p.businessName + ' on Wirog Supply Solutions!';
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

/* ─── CAROUSEL HELPERS ─── */
function scrollCarouselTo(promoId, index) {
  var carousel = document.getElementById('carousel-' + promoId);
  if (!carousel) return;
  var imgs = carousel.querySelectorAll('img');
  if (imgs[index]) {
    imgs[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }
}

function updateCarouselDots(promoId) {
  var carousel = document.getElementById('carousel-' + promoId);
  var dots = document.getElementById('dots-' + promoId);
  if (!carousel || !dots) return;
  var idx = Math.round(carousel.scrollLeft / (carousel.clientWidth || 1));
  if (idx >= dots.children.length) idx = dots.children.length - 1;
  if (idx < 0) idx = 0;
  Array.from(dots.children).forEach(function(d, i) {
    d.classList.toggle('active', i === idx);
  });
}

// Bind scroll listener via mutation observer for dynamically rendered carousels
document.addEventListener('scroll', function(e) {
  var target = e.target;
  if (target && target.classList && target.classList.contains('promo-carousel')) {
    updateCarouselDots(target.id.replace('carousel-', ''));
  }
}, true);

/* ─── INIT ─── */
window._promos = [...(window.SAMPLE_PROMOS || [])];
window.togglePromo = togglePromo;
window.changeQty = changeQty;
window.toggleLike = toggleLike;
window.addToNote = addToNote;
window.sharePromo = sharePromo;
window.renderPromos = renderPromos;
window.trackPromoView = trackPromoView;
window.checkPromoStatuses = checkPromoStatuses;

/* ─── FACEBOOK PROMO ─── */
function openFbPromo(promoId) {
  const p = window._promos.find(x => String(x.id) === String(promoId));
  if (!p) return;
  const preview = document.getElementById('fb-promo-preview');
  if (!preview) return;
  preview.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
      '<div class="avatar-square" style="background:' + (p.businessColor || '#999') + ';width:36px;height:36px;font-size:14px;">' + (p.businessInit || '?') + '</div>' +
      '<div><strong>' + (p.businessName || 'Business') + '</strong><br><span style="font-size:11px;color:var(--grey-dark);">' + (p.location || '') + '</span></div>' +
    '</div>' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:4px;">' + (p.title || '') + '</div>' +
    '<div style="font-size:12px;color:var(--grey-dark);margin-bottom:4px;">' + (p.desc || '') + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:var(--orange);">P ' + ((p.basePrice || p.price || 0) * (p.qty || 1)).toFixed(2) + ' ' + (p.unit || 'each') + '</div>';
  document.getElementById('fb-promo-message').value = '';
  window._fbPromoId = promoId;
  openModal('fb-promo-modal');
}

function submitFbPromo() {
  const p = window._promos.find(x => String(x.id) === String(window._fbPromoId));
  if (!p) { showToast('Promo not found'); return; }
  const msg = document.getElementById('fb-promo-message').value.trim();
  const text = msg
    ? msg + '\n\n' + p.title + ' - P' + ((p.basePrice || p.price || 0)).toFixed(2) + ' ' + (p.unit || 'each') + ' from ' + p.businessName + ' on Wirog Supply Solutions!'
    : p.title + ' - P' + ((p.basePrice || p.price || 0)).toFixed(2) + ' ' + (p.unit || 'each') + ' from ' + p.businessName + '\n\nAvailable on Wirog Supply Solutions. Download the app or visit wirog.co.bw';
  const url = 'https://www.facebook.com/sharer/sharer.php?quote=' + encodeURIComponent(text) + '&u=' + encodeURIComponent('https://wirog.co.bw');
  closeModal('fb-promo-modal');
  window.open(url, '_blank');
  showToast('Opened Facebook share dialog');
}

window.openFbPromo = openFbPromo;
window.submitFbPromo = submitFbPromo;

/* ─── QUICK ADD TO NOTE (from catalogue) ─── */
async function addToNoteQuick(id, title, price, unit, business) {
  if (window.Auth?.isGuest()) { showToast('Create a profile to save notes'); return; }
  let note = window._notes.find(n => n.title === 'Saved from Catalogue');
  if (!note) {
    note = { id: 'note_' + Date.now(), title: 'Saved from Catalogue', userId: UserState.id, items: [] };
    window._notes.push(note);
    try { await WirogDB.put('notes', note); } catch(e) {}
  }
  note.items.push({ title: title, emoji: '📦', price: price, unit: unit, business: business, qty: 1 });
  try { await WirogDB.put('notes', note); } catch(e) { console.error('Failed to save note:', e); }
  renderNotes();
  showToast('✅ Added to note!');
}

window.addToNoteQuick = addToNoteQuick;
