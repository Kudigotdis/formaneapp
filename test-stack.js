const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Capture all errors with stack traces
  page.on('pageerror', err => {
    console.log('PAGEERROR:', err.message);
    console.log('STACK:', err.stack);
    console.log('---');
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('requestfailed', req => {
    console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText);
  });
  
  await page.goto('https://kudigotdis.github.io/FOROMANEapp/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(10000);
  
  await browser.close();
})();
