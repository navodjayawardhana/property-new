const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'navbar_v3.png', clip: { x: 0, y: 0, width: 1440, height: 60 } });

  const fullH = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({ path: 'footer_v3.png', clip: { x: 0, y: fullH - 420, width: 1440, height: 420 } });

  console.log('done, fullH=' + fullH);
  await browser.close();
})();
