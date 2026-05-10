/* ════════════════════════════════════════════════════════
   WIROG APP - Core initialization & boot sequence
   ════════════════════════════════════════════════════════ */

async function init() {
  console.log('Initializing Wirog (Supply Solutions) v2.0.0...');

  try {
    await WirogDB.init();
  } catch(err) {
    console.error('IndexedDB unavailable, running in offline mode:', err);
  }

  await loadProductCategories();

  try {
    await loadSavedData();
  } catch(err) {
    console.error('Failed to load saved data:', err);
  }

  const savedId = localStorage.getItem('wirog_userId');
  if (savedId) {
    const account = window.DEMO_ACCOUNTS.find(a => a.id === savedId);
    if (account) {
      UserState.set(account.id, account.name, account.role, '', account.town, '');
      if (account.id === 'supplier') {
        UserState.business = { name: 'Board Kings', category: 'Boards & Timber', town: 'Gaborone', phone: '+267 71234567', subscription: 'full' };
        UserState.kpi = { ads: 14, views: 1204, likes: 85, noteAdds: 32 };
        UserState.interests = ['Boards & Timber', 'Tools & Equipment', 'Hardware & Fasteners'];
      } else if (account.id === 'owner-biz2') {
        UserState.business = { name: 'BuildIt Gabs', category: 'Paint', town: 'Gaborone', phone: '+267 72345678', subscription: 'full' };
        UserState.kpi = { ads: 22, views: 890, likes: 62, noteAdds: 18 };
        UserState.interests = ['Paint', 'Hardware & Fasteners', 'Tools & Equipment'];
      } else if (account.id === 'owner-biz3') {
        UserState.business = { name: 'Francistown Steel', category: 'Steel & Metal Products', town: 'Francistown', phone: '+267 73456789', subscription: 'full' };
        UserState.kpi = { ads: 18, views: 720, likes: 48, noteAdds: 14 };
        UserState.interests = ['Steel & Metal Products', 'Cement & Aggregates', 'Roofing & Ceiling'];
      } else if (account.id === 'owner-biz4') {
        UserState.business = { name: 'Gabs Plumbing Depot', category: 'Plumbing', town: 'Gaborone', phone: '+267 74567890', subscription: 'full' };
        UserState.kpi = { ads: 15, views: 560, likes: 38, noteAdds: 20 };
        UserState.interests = ['Plumbing', 'Sanitaryware', 'Bathroom & Kitchen'];
      } else if (account.id === 'user-gerald') {
        UserState.interests = ['Building Materials', 'Cement & Aggregates', 'Steel & Metal Products'];
      } else if (account.id === 'trade') {
        UserState.interests = ['Paint', 'Plumbing', 'Electrical'];
      } else if (account.id === 'general') {
        UserState.interests = ['Tiles & Flooring', 'Lighting', 'Paint'];
      } else if (account.id.startsWith('staff-')) {
        UserState.business = null;
        UserState.kpi = { ads: 0, views: 35, likes: 8, noteAdds: 18 };
        UserState.interests = ['Boards & Timber', 'Hardware & Fasteners', 'Tools & Equipment'];
      }
    }
  }

  try {
    await loadProfileFromDB();
  } catch(err) {
    console.error('Failed to load profile:', err);
  }

  try {
    await loadBusinessFromDB();
  } catch(err) {
    console.error('Failed to load business:', err);
  }

  try {
    await loadKpiFromDB();
  } catch(err) {
    console.error('Failed to load KPI:', err);
  }

  try {
    await loadCategoriesFromDB();
  } catch(err) {
    console.error('Failed to load categories:', err);
  }

  if (savedId && savedId !== 'guest') {
    enterApp();
    updateAccountUI();
    updateKPI();
    renderPromos();
    renderNotes();
  } else {
    document.getElementById('view-welcome')?.classList.add('active');
  }
}

async function loadSavedData() {
  if (!WirogDB.db) return;

  try {
    const savedItems = await WirogDB.getAll('items');
    if (savedItems.length > 0) {
      window._userItems = savedItems;
      const promoItems = savedItems.filter(it => it.inPromo || (it.promo && it.promo.active));
      window._promos = [...window._promos, ...promoItems];
    }
  } catch(e) { console.error('Failed to load items:', e); }

  try {
    const savedNotes = await WirogDB.getAll('notes');
    if (savedNotes.length > 0) {
      window._notes = savedNotes;
    } else {
      await seedDemoNotes();
    }
  } catch(e) { console.error('Failed to load notes:', e); }

  reloadNotesForUser();

  try {
    const promoCount = await WirogDB.getAll('promos');
    if (promoCount.length === 0) {
      for (const promo of window.SAMPLE_PROMOS) {
        await WirogDB.put('promos', promo);
      }
    }
  } catch(e) { console.error('Failed to seed promos:', e); }
}

async function loadProfileFromDB() {
  if (!WirogDB.db) return;
  try {
    const saved = await WirogDB.get('users', 'user_current');
    if (saved) {
      UserState.set(saved.id || UserState.id, saved.name || UserState.name, saved.role || UserState.role, '', saved.town || UserState.town, saved.mobile || '');
      if (saved.interests && saved.interests.length > 0) {
        UserState.interests = saved.interests;
      }
    }
  } catch(e) { console.error('Failed to load profile:', e); }
}

async function loadBusinessFromDB() {
  if (!WirogDB.db) return;
  try {
    const saved = await WirogDB.get('businesses', 'biz_user');
    if (saved) {
      if (saved.name === 'Botswana Timber Ltd') saved.name = 'Board Kings';
      UserState.business = { name: saved.name, category: saved.category, town: saved.town, phone: saved.phone, subscription: saved.subscription || 'free' };
    }
  } catch(e) { console.error('Failed to load business:', e); }
}

async function loadKpiFromDB() {
  if (!WirogDB.db) return;
  try {
    const saved = await WirogDB.get('kpi', UserState.id);
    if (saved) {
      UserState.kpi = { ads: saved.ads || 0, views: saved.views || 0, likes: saved.likes || 0, noteAdds: saved.noteAdds || 0 };
    }
  } catch(e) { console.error('Failed to load KPI:', e); }
}

async function loadProductCategories() {
  if (!window.WIROG_PRODUCT_CATEGORIES) {
    console.warn('WIROG_PRODUCT_CATEGORIES not loaded from script tag');
  }
}

window.addEventListener('online', () => showToast('Back online'));
window.addEventListener('offline', () => showToast('Offline - data saved locally'));

document.addEventListener('click', e => {
  if (e.target.closest('.btn') && navigator.vibrate) {
    navigator.vibrate(20);
  }
});

init();
