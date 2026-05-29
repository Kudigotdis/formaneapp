const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') logs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));
  try {
    await page.goto('https://kudigotdis.github.io/FOROMANEapp/', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Click Browse
    const btn = await page.$('button[onclick*="loginAsGuest"]');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(1000);
      logs.push({ type: 'info', text: 'Browse button clicked' });
    } else {
      logs.push({ type: 'info', text: 'Browse button NOT FOUND' });
    }
    
    const currentUrl = page.url();
    logs.push({ type: 'info', text: 'URL after click: ' + currentUrl });
    
    // Check visible state
    const welcomeVisible = await page.$eval('#view-welcome', el => el.classList.contains('active')).catch(() => 'N/A');
    const promosVisible = await page.$eval('#view-promos', el => el.classList.contains('active')).catch(() => 'N/A');
    logs.push({ type: 'info', text: 'Welcome active: ' + welcomeVisible + ', Promos active: ' + promosVisible });
    
    const headerHidden = await page.$eval('#app-header', el => el.classList.contains('shell-hidden')).catch(() => 'N/A');
    logs.push({ type: 'info', text: 'Header shell-hidden: ' + headerHidden });
    
    const navDisplay = await page.$eval('#bottom-nav', el => el.style.display).catch(() => 'N/A');
    logs.push({ type: 'info', text: 'Bottom nav display: ' + navDisplay });
    
    // Check filter bar
    const filterDisplay = await page.$eval('#filter-bar', el => el.style.display).catch(() => 'N/A');
    logs.push({ type: 'info', text: 'Filter bar display: ' + filterDisplay });
    
    // Check if promos feed rendered
    const promosHtml = await page.$eval('#promo-feed', el => el.innerHTML.length > 0).catch(() => 'N/A');
    logs.push({ type: 'info', text: 'Promo feed has content: ' + promosHtml });
    
  } catch(e) {
    logs.push({ type: 'fatal', text: e.message });
  }
  console.log(JSON.stringify(logs, null, 2));
  await browser.close();
})();
