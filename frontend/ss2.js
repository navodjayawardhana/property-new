const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));

  // Navbar crop
  await page.screenshot({ path: 'navbar_v3.png', clip: { x: 0, y: 0, width: 1440, height: 60 } });

  // Footer crop - scroll to bottom first
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 500));
  const footerH = await page.evaluate(() => {
    const f = document.querySelector('footer');
    return { top: f.getBoundingClientRect().top + window.scrollY, height: f.scrollHeight };
  });
  await page.screenshot({ path: 'footer_v3.png', clip: { x: 0, y: footerH.top - window.scrollY || 0, width: 1440, height: Math.min(footerH.height, 500) } });

  await browser.close();
  console.log('done');
})();
