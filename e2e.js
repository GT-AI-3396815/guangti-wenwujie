/* 端到端测试：用 playwright-core + 本机 Chrome 跑真实流程
 * 运行： NODE_PATH=<workspace>/node_modules node e2e.js
 */
const path = require("path");
const { chromium } = require("playwright-core");

const URL = process.env.TEST_URL || "http://127.0.0.1:8977/index.html";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = path.join(__dirname, "shots");

const log = (...a) => console.log(...a);

function ok(cond, name, extra) {
  log((cond ? "  [PASS] " : "  [FAIL] ") + name + (extra ? "  -> " + extra : ""));
  return cond;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  log("=== 1. 加载页面 ===");
  await page.goto(URL, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(800);
  log("  title =", await page.title());
  ok((await page.title()).indexOf("文无界") >= 0, "标题为「光体•文无界」");

  log("=== 2. 基础渲染 ===");
  const base = await page.evaluate(() => ({
    brand: document.querySelector(".brand-text h1")?.textContent,
    sub: document.querySelector(".brand-text p")?.textContent,
    footer: document.querySelector(".app-footer p")?.textContent,
    dims: document.querySelectorAll("#sel-dimension option").length,
    types: document.querySelectorAll("[data-type]").length,
    plats: document.querySelectorAll("[data-platform]").length,
    quota: document.querySelector(".hint-text")?.textContent,
  }));
  log("  " + JSON.stringify(base));
  ok(base.brand === "光体•文无界", "品牌名已改名");
  ok(base.dims === 55, "维度下拉 54 项 + 占位", base.dims);
  ok(base.types === 6, "内容类型 6 个", base.types);
  ok(base.plats === 9, "目标平台 9 个", base.plats);
  ok(/100\/100/.test(base.quota || ""), "额度显示正常", base.quota);

  log("=== 3. 交互：切行业 / 选类型 / 选平台 ===");
  await page.click('[data-mode="industry"]');
  await page.waitForTimeout(200);
  const firstInd = await page.evaluate(
    () => document.querySelectorAll("#sel-dimension option")[1]?.textContent
  );
  ok(firstInd === "身心灵疗愈", "切到行业维度", firstInd);

  await page.click('[data-mode="civilization"]');
  await page.waitForTimeout(200);
  await page.selectOption("#sel-dimension", "三星堆文明");
  await page.waitForTimeout(200);
  await page.click('[data-type="深度长文"]');
  await page.click('[data-platform="公众号"]');
  const sel = await page.evaluate(() => ({
    dim: document.getElementById("sel-dimension").value,
    type: document.querySelector(".content-pill.active")?.textContent,
    plat: document.querySelector(".platform-pill.active")?.textContent,
  }));
  log("  " + JSON.stringify(sel));
  ok(sel.dim === "三星堆文明" && sel.type === "深度长文" && sel.plat === "公众号", "维度/类型/平台选中正确");

  log("=== 4. 未选维度的校验 ===");
  await page.evaluate(() => {
    const s = document.getElementById("sel-dimension");
    s.value = "";
    s.dispatchEvent(new Event("change"));
  });
  await page.waitForTimeout(200);
  await page.click("#btn-generate");
  await page.waitForTimeout(500);
  const errText = await page.evaluate(
    () => document.querySelector(".error-panel")?.textContent || ""
  );
  ok(/选择/.test(errText), "未选维度时给出提示", errText.trim());

  log("=== 5. 真实生成（接口调用，最长 180s） ===");
  await page.selectOption("#sel-dimension", "三星堆文明");
  await page.waitForTimeout(200);
  await page.click("#btn-generate");
  const t0 = Date.now();
  let gen = null;
  for (let i = 0; i < 90; i++) {
    await page.waitForTimeout(2000);
    gen = await page.evaluate(() => {
      const S = window.__WJ_STATE || {};
      return {
        loading: S.loading,
        len: (S.content || "").length,
        error: S.error,
        ta: !!document.getElementById("content"),
      };
    });
    if (!gen.loading) break;
  }
  const secs = Math.round((Date.now() - t0) / 1000);
  log("  用时 " + secs + "s  状态: " + JSON.stringify(gen));
  ok(gen.ta === true, "生成后出现内容编辑框");
  ok(gen.len > 500, "正文长度合理（>500 字）", gen.len);
  ok(!gen.error, "无生成错误", gen.error || "");

  if (gen.ta) {
    const detail = await page.evaluate(() => ({
      titles: document.querySelectorAll(".title-option").length,
      firstTitle: document.querySelector(".title-option")?.textContent,
      quota: document.querySelector(".hint-text")?.textContent,
      badge: document.querySelector(".history-badge")?.textContent,
    }));
    log("  " + JSON.stringify(detail));
    ok(detail.titles >= 1, "生成了爆款标题候选", detail.titles);
    ok(/99/.test(detail.quota || ""), "额度已扣减为 99", detail.quota);
    ok(detail.badge === "1", "历史记录计数为 1", detail.badge);
    await page.screenshot({ path: path.join(OUT, "02-result.png"), fullPage: false });
  }

  log("=== 6. 发布预览：文字版 -> 图文版 ===");
  if (gen.ta) {
    await page.click('[data-publish="公众号"]');
    await page.waitForTimeout(600);
    const pv = await page.evaluate(() => ({
      overlay: !!document.querySelector("#pp-overlay"),
      badge: document.querySelector(".pp-badge")?.textContent,
      len: document.querySelector(".pp-render")?.innerHTML.length || 0,
    }));
    log("  文字版: " + JSON.stringify(pv));
    ok(pv.overlay && pv.len > 200, "预览弹窗渲染出内容");

    await page.click('[data-view="graphic"]');
    await page.waitForTimeout(2500);
    const gv = await page.evaluate(() => {
      const imgs = document.querySelectorAll(".pp-render img");
      return {
        imgs: imgs.length,
        isData: (imgs[0]?.src || "").slice(0, 15),
        len: (imgs[0]?.src || "").length,
      };
    });
    log("  图文版: " + JSON.stringify(gv));
    ok(gv.imgs >= 1, "图文版生成了配图", gv.imgs + " 张");
    ok(gv.isData.indexOf("data:image") === 0, "配图为 canvas data URL", gv.isData);
    await page.screenshot({ path: path.join(OUT, "03-preview.png") });

    log("=== 7. 发布流程三步 ===");
    await page.click('[data-act="confirm"]');
    await page.waitForTimeout(500);
    const step2 = await page.evaluate(() => !!document.querySelector("[data-act=publish]"));
    ok(step2, "进入确认发布步骤");
    await page.click('[data-act="publish"]');
    await page.waitForTimeout(1800);
    const done = await page.evaluate(
      () => (document.querySelector(".pp-body")?.textContent || "").indexOf("发布成功") >= 0
    );
    ok(done, "发布成功页展示");
    await page.click('[data-act="cancel"]');
    await page.waitForTimeout(400);
  }

  log("=== 8. 刷新后历史持久化 ===");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({
    badge: document.querySelector(".history-badge")?.textContent || null,
    quota: document.querySelector(".hint-text")?.textContent,
  }));
  log("  " + JSON.stringify(after));
  ok(after.badge === "1", "刷新后历史记录仍在", after.badge);
  ok(/99/.test(after.quota || ""), "刷新后额度正确", after.quota);

  log("=== 9. 点开历史并回填 ===");
  await page.click("#btn-history");
  await page.waitForTimeout(400);
  await page.click(".history-item");
  await page.waitForTimeout(600);
  const loaded = await page.evaluate(() => ({
    dim: window.__WJ_STATE.dimension,
    len: (window.__WJ_STATE.content || "").length,
    ta: !!document.getElementById("content"),
  }));
  log("  " + JSON.stringify(loaded));
  ok(loaded.dim === "三星堆文明" && loaded.len > 500, "历史回填正确");

  await page.screenshot({ path: path.join(OUT, "01-main.png"), fullPage: false });

  log("=== 10. 移动端视口 ===");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const mob = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    scrollW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  }));
  log("  " + JSON.stringify(mob));
  ok(!mob.overflow, "移动端无横向溢出");
  await page.screenshot({ path: path.join(OUT, "04-mobile.png"), fullPage: false });

  log("=== 11. 错误汇总 ===");
  log("  pageerror: " + JSON.stringify(pageErrors));
  log("  console.error: " + JSON.stringify(consoleErrors.slice(0, 5)));
  ok(pageErrors.length === 0, "无未捕获页面异常");
  ok(consoleErrors.length === 0, "无 console 错误");

  await browser.close();
  log("=== 测试结束 ===");
})().catch((e) => {
  console.error("测试脚本异常:", e);
  process.exit(1);
});
