const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  for (const [url, name] of [['http://localhost:3000/', 'home_v3'], ['http://localhost:3000/buy', 'buy_v3']]) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `${name}.png`, fullPage: true });
    console.log(name + ' done');
  }
  await browser.close();
})();
