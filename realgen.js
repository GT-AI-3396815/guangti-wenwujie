/* 真实生成验证：新 Key + 优化后提示词，验证质量与排版 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('http://127.0.0.1:8977/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const result = await page.evaluate(async () => {
    var s = document.getElementById('sel-dimension');
    s.value = '三星堆文明';
    s.dispatchEvent(new Event('change'));
    document.querySelector('[data-type="爆款文案"]').click();
    document.querySelector('[data-platform="小红书"]').click();
    document.getElementById('btn-generate').click();
    for (var i = 0; i < 90; i++) {
      await new Promise(function (r) { setTimeout(r, 2000); });
      if (!window.__WJ_STATE.loading) break;
    }
    var S = window.__WJ_STATE;
    var c = S.content || '';
    var aiFlavor = ['在这个', '众所周知', '不禁让人', '让我们一起', '总的来说', '毫无疑问', '首先，', '其次，'].filter(function (w) { return c.indexOf(w) >= 0; });
    return {
      len: c.length,
      error: S.error,
      titles: (S.titles || []).length,
      quota: S.quota && S.quota.remaining,
      aiFlavorHits: aiFlavor,
      boldCount: (c.match(/\*\*/g) || []).length / 2,
      head: c.slice(0, 120),
    };
  });
  console.log(JSON.stringify(result, null, 1));

  if (result.len > 300) {
    // 打开预览看排版
    await page.evaluate(() => {
      var btns = document.querySelectorAll('button, .result-actions button, [id*=preview]');
      for (var i = 0; i < btns.length; i++) { if (/预览|发布/.test(btns[i].textContent)) { btns[i].click(); break; } }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'shots/06-quality.png', fullPage: false });
  }
  console.log('pageerror:', errors.length ? errors : '[]');
  console.log(result.len > 300 && !result.error && result.aiFlavorHits.length === 0 ? '[PASS] 真实生成通过' : '[CHECK] 见上方数据');
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
