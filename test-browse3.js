const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const allLogs = [];
  page.on('console', msg => {
    allLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => allLogs.push({ type: 'pageerror', text: err.message }));
  try {
    await page.goto('https://kudigotdis.github.io/FOROMANEapp/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for scripts to execute
    await page.waitForTimeout(5000);
    
    const state = await page.evaluate(() => ({
      readyState: document.readyState,
      authExists: typeof window.Auth !== 'undefined',
      userStateId: window.UserState?.id,
      enterAppExists: typeof window.enterApp === 'function',
      navTabExists: typeof window.navTab === 'function',
      currentView: window.currentView,
      welcomeActive: document.getElementById('view-welcome')?.classList.contains('active'),
      promosActive: document.getElementById('view-promos')?.classList.contains('active'),
      headerHidden: document.getElementById('app-header')?.classList.contains('shell-hidden'),
      navDisplay: document.getElementById('bottom-nav')?.style.display,
      filterBarDisplay: document.getElementById('filter-bar')?.style.display,
    }));
    allLogs.push({ type: 'state', text: JSON.stringify(state, null, 2) });
    
    // Try to click Browse
    try {
      await page.evaluate(() => {
        if (window.Auth) {
          window.Auth.loginAsGuest();
          return 'loginAsGuest called';
        }
        return 'Auth not available';
      });
      await page.waitForTimeout(1000);
      
      const state2 = await page.evaluate(() => ({
        currentView: window.currentView,
        welcomeActive: document.getElementById('view-welcome')?.classList.contains('active'),
        promosActive: document.getElementById('view-promos')?.classList.contains('active'),
        headerHidden: document.getElementById('app-header')?.classList.contains('shell-hidden'),
        navDisplay: document.getElementById('bottom-nav')?.style.display,
        userStateId: window.UserState?.id,
      }));
      allLogs.push({ type: 'after-click', text: JSON.stringify(state2, null, 2) });
    } catch(e) {
      allLogs.push({ type: 'click-error', text: e.message });
    }
    
  } catch(e) {
    allLogs.push({ type: 'fatal', text: e.message });
  }
  console.log(JSON.stringify(allLogs, null, 2));
  await browser.close();
})();
