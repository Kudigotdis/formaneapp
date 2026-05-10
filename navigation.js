/* ════════════════════════════════════════════════════════
   WIROG NAVIGATION - Bottom nav sync & icon swapping
   ════════════════════════════════════════════════════════ */

const NAV_ICONS = {
  'nav-promos':    { active: 'assets/icons/solid/bullhorn-2_active.webp',    inactive: 'assets/icons/solid/bullhorn-2_inactive.webp' },
  'nav-directory': { active: 'assets/icons/solid/address-book-2_active.webp', inactive: 'assets/icons/solid/address-book-2_inactive.webp' },
  'nav-notes':     { active: 'assets/icons/solid/clipboard-list_active.webp', inactive: 'assets/icons/solid/clipboard-list_inactive.webp' },
  'nav-account':   { active: 'assets/icons/solid/user-circle_active.webp',   inactive: 'assets/icons/solid/user-circle_inactive.webp' }
};

function updateNavIcons() {
  document.querySelectorAll('.nav-item').forEach(n => {
    const img = n.querySelector('.nav-icon');
    if (!img) return;
    const map = NAV_ICONS[n.id];
    if (!map) return;
    img.src = n.classList.contains('active') ? map.active : map.inactive;
  });
}

function syncNav(viewId) {
  const navMap = {
    'view-promos': 'nav-promos',
    'view-directory': 'nav-directory',
    'view-notes': 'nav-notes',
    'view-account': 'nav-account'
  };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navId = navMap[viewId];
  if (navId) {
    document.getElementById(navId).classList.add('active');
  }
  updateNavIcons();
}

window.NAV_ICONS = NAV_ICONS;
window.updateNavIcons = updateNavIcons;
window.syncNav = syncNav;
