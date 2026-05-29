const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const errors = [];
  const failedReqs = [];
  
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', msg: err.message, stack: err.stack?.split('\n').slice(0,3).join('|') });
  });
  
  page.on('console', msg => {
    errors.push({ type: 'console-' + msg.type(), text: msg.text() });
  });
  
  page.on('requestfailed', req => {
    failedReqs.push({ url: req.url(), reason: req.failure()?.errorText });
  });
  
  // Abort fonts and other slow resources that aren't critical
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    if (type === 'font' || type === 'image' || type === 'media') {
      req.abort();
    } else {
      req.continue();
    }
  });
  
  try {
    await page.goto('https://kudigotdis.github.io/FOROMANEapp/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    const state = await page.evaluate(() => ({
      currentView: window.currentView,
      welcomeActive: document.getElementById('view-welcome')?.classList.contains('active'),
      authExists: typeof window.Auth !== 'undefined',
      userStateId: window.UserState?.id,
      enterAppExists: typeof window.enterApp === 'function',
    }));
    
    console.log('STATE:', JSON.stringify(state));
    
    // Try Auth.loginAsGuest
    const clickResult = await page.evaluate(() => {
      if (typeof window.Auth?.loginAsGuest === 'function') {
        try {
          window.Auth.loginAsGuest();
          return 'success';
        } catch(e) {
          return 'error: ' + e.message;
        }
      }
      return 'loginAsGuest not found';
    });
    console.log('CLICK:', clickResult);
    
    await page.waitForTimeout(1000);
    
    const state2 = await page.evaluate(() => ({
      currentView: window.currentView,
      welcomeActive: document.getElementById('view-welcome')?.classList.contains('active'),
      promosActive: document.getElementById('view-promos')?.classList.contains('active'),
      headerHidden: document.getElementById('app-header')?.classList.contains('shell-hidden'),
      navDisplay: document.getElementById('bottom-nav')?.style.display,
    }));
    console.log('STATE2:', JSON.stringify(state2));
    
  } catch(e) {
    errors.push({ type: 'fatal', msg: e.message });
  }
  
  console.log('FAILED REQS:', JSON.stringify(failedReqs.slice(0,10)));
  console.log('ERRORS:', JSON.stringify(errors));
  
  await browser.close();
})();
