/* 快速验证 v2：logo 渲染、新 API Key 生效、排版元素、console 零报错，并截图 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('http://127.0.0.1:8977/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    var logo = document.querySelector('.brand-logo img');
    var s = window.__WJ_STATE || {};
    return {
      logoRendered: !!logo && logo.src.indexOf('data:image/png') === 0 && logo.naturalWidth > 0,
      logoNatural: logo ? logo.naturalWidth : 0,
      key: (window.WJ && window.WJ.getConfig ? window.WJ.getConfig().apiKey.slice(0, 8) : 'N/A'),
      brand: document.querySelector('.brand-text h1')?.textContent,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'shots/05-newlogo.png', clip: { x: 0, y: 0, width: 1280, height: 500 } });

  // 预览排版验证：塞入假内容直接调渲染层
  const tpl = await page.evaluate(() => {
    var html = window.WJ.renderPlatform('测试标题\n【第一章 起源】\n这是正文段落，带**加粗金句**。\n> 引用行\n正文第二段。', '公众号', '三星堆文明', '深度长文', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', []);
    return {
      hasLogoAvatar: html.indexOf(WJ.LOGO_SRC) >= 0,
      hasAccentBar: html.indexOf('border-left:3px solid #c9a96e') >= 0,
      hasLetterSpacing: html.indexOf('letter-spacing') >= 0,
    };
  });
  console.log(JSON.stringify(tpl, null, 1));
  console.log('console errors:', errors.length ? errors : '[]');
  var pass = info.logoRendered && info.key === 'sk-8653ab' && tpl.hasLogoAvatar && tpl.hasAccentBar && errors.length === 0;
  console.log(pass ? '[PASS] 全部通过' : '[FAIL] 存在问题');
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
