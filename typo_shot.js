/* 直接渲染排版样张并截图 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  await page.goto('http://127.0.0.1:8977/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);

  const sample = [
    '青铜神树指向的方向，不是天空，而是另一个坐标',
    '【一、一道反常识的裂缝】',
    '1986年7月，四川广汉砖厂取土的工人一锹下去，碰到的不是石头，是一截断裂的青铜。考古队随后清理出的器物坑里，躺着高3.96米的青铜神树——**它不是祭祀用品，更像一台记录天象的机器**。',
    '九只鸟站在树枝上。山海经里恰好写着“九日居下枝”。巧合到让人不安。',
    '【二、铸造者的数学】',
    '神树分三层，每层三枝，枝头立鸟。故宫博物院的研究者测量过，树干的锥度与现代机床加工的公差在毫米级。**四千年前的工匠，在没有文字的情况下，传递了一套完整的数理系统**。',
    '我们习惯了“原始人”这个词，却解释不了他们怎么做到的。',
    '三星堆不是孤例。它与金沙、与中原青铜器之间，隔着一条至今没人填上的断层。',
  ].join('\n');

  await page.evaluate((content) => {
    var html = window.WJ.renderPlatform(content, '公众号', '三星堆文明', '深度长文', 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', []);
    document.body.innerHTML = '<body style="margin:0;background:#eee;padding:16px;"><div id="pv" style="box-shadow:0 4px 24px rgba(0,0,0,.12);">' + html + '</div></body>';
  }, sample);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'shots/09-typography.png', fullPage: true });
  await browser.close();
  console.log('done');
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
