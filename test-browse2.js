const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const allLogs = [];
  page.on('console', msg => {
    allLogs.push({ type: msg.type(), text: msg.text(), args: msg.args().length });
  });
  page.on('pageerror', err => allLogs.push({ type: 'pageerror', text: err.message, stack: err.stack }));
  try {
    await page.goto('https://kudigotdis.github.io/FOROMANEapp/', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Get all page content state
    const state = await page.evaluate(() => ({
      readyState: document.readyState,
      currentView: window.currentView,
      viewHistoryLen: window.viewHistory ? window.viewHistory.length : 0,
      welcomeActive: document.getElementById('view-welcome')?.classList.contains('active'),
      promosActive: document.getElementById('view-promos')?.classList.contains('active'),
      headerHidden: document.getElementById('app-header')?.classList.contains('shell-hidden'),
      navDisplay: document.getElementById('bottom-nav')?.style.display,
      authExists: typeof window.Auth !== 'undefined',
      userStateId: window.UserState?.id,
      demoAccountsLen: window.DEMO_ACCOUNTS?.length,
      enterAppExists: typeof window.enterApp === 'function',
      navTabExists: typeof window.navTab === 'function',
    }));
    allLogs.push({ type: 'state', text: JSON.stringify(state, null, 2) });
    
  } catch(e) {
    allLogs.push({ type: 'fatal', text: e.message });
  }
  console.log(JSON.stringify(allLogs, null, 2));
  await browser.close();
})();
