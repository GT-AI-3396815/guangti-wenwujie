/* 预览排版截图：基于已生成的历史记录直接打开发布预览 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 860 } });
  await page.goto('http://127.0.0.1:8977/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // 页面加载后历史里有上一次生成的记录，直接点发布
  await page.evaluate(() => {
    var els = document.querySelectorAll('[data-publish]');
    if (els.length) els[0].click();
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'shots/07-preview-new.png' });

  // 切到图文版截一张
  await page.evaluate(() => {
    var tabs = document.querySelectorAll('[data-pmode], .pp-tabs button, .pm-tab');
    for (var i = 0; i < tabs.length; i++) { if (/图文/.test(tabs[i].textContent)) { tabs[i].click(); break; } }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'shots/08-preview-imgtext.png' });
  await browser.close();
  console.log('done');
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
