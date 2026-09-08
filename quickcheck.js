/* 快速验证：加载页面，收集 console 错误，检查渲染 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('http://127.0.0.1:8977/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => ({
    title: document.title,
    brand: document.querySelector('.brand-text h1')?.textContent,
    faviconBlocked: performance.getEntriesByType('resource')
      .filter((r) => r.responseStatus >= 400)
      .map((r) => r.name),
  }));
  console.log(JSON.stringify(info, null, 1));
  console.log('console errors:', errors.length ? errors : '[]');
  console.log(errors.length === 0 && info.brand === '光体•文无界' ? '[PASS] 快速验证通过' : '[FAIL] 仍存在问题');
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
