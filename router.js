/* ════════════════════════════════════════════════════════
   WIROG ROUTER - View switching & navigation
   Always starts on Promos tab
   ════════════════════════════════════════════════════════ */

let currentView = 'view-promos';
let prevView = null;

function goTo(viewId) {
  prevView = currentView;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    document.getElementById('router').scrollTop = 0;
    currentView = viewId;
    manageUI(viewId);
    updateNavIcons();

    if (viewId === 'view-account' && window.updateAccountUI) {
      window.updateAccountUI();
    }
  }
}

function goBack() {
  if (prevView && !['view-promos','view-directory','view-notes','view-account'].includes(prevView)) {
    goTo(prevView);
  } else {
    goTo('view-promos');
  }
}

function navTab(viewId, navId) {
  prevView = currentView;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    document.getElementById('router').scrollTop = 0;
    currentView = viewId;
  }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(navId).classList.add('active');

  manageUI(viewId);
  updateNavIcons();

  if (viewId === 'view-account' && window.updateAccountUI) {
    window.updateAccountUI();
  }
}

function manageUI(viewId) {
  const header = document.getElementById('app-header');
  const bottomNav = document.getElementById('bottom-nav');
  const filterBar = document.getElementById('filter-bar');

  if (viewId === 'view-welcome' || viewId === 'view-admin' || viewId === 'view-analytics' || viewId === 'view-analytics-month') {
    if (header) header.classList.add('shell-hidden');
    if (bottomNav) bottomNav.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';
    return;
  }

  const showFilter = viewId === 'view-promos' || viewId === 'view-directory';

  if (header) header.classList.remove('shell-hidden');
  if (bottomNav) bottomNav.style.display = 'flex';
  if (filterBar) filterBar.style.display = showFilter ? 'flex' : 'none';

  const promoTypeRow = document.getElementById('promo-type-row');
  if (promoTypeRow) promoTypeRow.style.display = viewId === 'view-promos' ? '' : 'none';

  const bizTypeRow = document.getElementById('business-type-filter-row');
  if (bizTypeRow) bizTypeRow.style.display = viewId === 'view-directory' ? '' : 'none';

  if (viewId === 'view-directory') {
    renderDirectory();
  }
}

function enterApp() {
  document.getElementById('app-header').classList.remove('shell-hidden');
  document.getElementById('bottom-nav').style.display = 'flex';
  navTab('view-promos', 'nav-promos');
}

window.goTo = goTo;
window.goBack = goBack;
window.navTab = navTab;
window.enterApp = enterApp;
