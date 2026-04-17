const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: 'home_screenshot.png', fullPage: false });
  console.log('Hero screenshot done');
  await page.screenshot({ path: 'home_full.png', fullPage: true });
  console.log('Full page screenshot done');
  await browser.close();
})();
