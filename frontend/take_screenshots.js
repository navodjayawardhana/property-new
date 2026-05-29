const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  const pages = [
    { url: 'http://localhost:3000/', name: 'home_v2' },
    { url: 'http://localhost:3000/buy', name: 'buy_v2' },
    { url: 'http://localhost:3000/news', name: 'news_v2' },
  ];
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `${p.name}.png`, fullPage: false });
    console.log(`${p.name} done`);
  }
  await browser.close();
})();
