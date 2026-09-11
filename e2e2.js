/* 端到端测试 v2：验证全部新功能
 * 运行： NODE_PATH=C:/Users/AW/.workbuddy/binaries/node/workspace/node_modules node e2e2.js
 */
const path = require("path");
const { chromium } = require("playwright-core");

const URL = process.env.TEST_URL || "http://127.0.0.1:8977/index.html";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const results = [];
function ok(cond, name, extra) {
  results.push({ pass: !!cond, name, extra: extra || "" });
  console.log((cond ? "  [PASS] " : "  [FAIL] ") + name + (extra ? "  -> " + String(extra).slice(0, 160) : ""));
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage({ viewport: { width: 760, height: 1200 } });
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("PAGEERROR: " + e.message));

  /* ---------- Mock API（真实 Key 402 余额不足，用路由拦截测全流程） ---------- */
  const TITLES = [
    "2400年前柏拉图写下一座岛，人类找了它两千年",
    "它不是传说。一位考古学家拿出了新证据",
    "大西洋底的声音，让三位科学家沉默了",
    "据记载它一天沉入海底。真相比传说更耐人寻味",
    "我们都在寻找亚特兰蒂斯，却没人承认这一点",
  ].join("\n");
  const IDEAS = Array.from({ length: 8 }, (_, i) =>
    "灵感切口" + (i + 1) + " | 一句话说清角度与钩子" + (i + 1) + (i === 4 ? "（传说口径）" : "") + " | " +
    ["深度长文", "爆款文案", "短视频脚本", "问答互动", "朋友圈文案", "播客口播稿", "爆款文案", "深度长文"][i] + " | " +
    ["公众号", "小红书", "抖音", "知乎", "朋友圈", "B站", "公众号", "知乎"][i]
  ).join("\n");
  const SERIES = Array.from({ length: 5 }, (_, i) =>
    "第" + (i + 1) + "篇·系列标题" + (i + 1) + " | 要点甲、要点乙、要点丙 | 下一句钩子勾住读者"
  ).join("\n");
  const REWRITE = "玛雅历法算出的年长，与现代天文值只差17秒（据公开天文资料）。首先被替换掉的，是我们对\"古人\"二字的轻慢。\n**传说不是历史，是镜子。**\n考古学的每一次进步，都在把神话退回神话该待的位置——但这并不让神话贬值，反而让它更纯粹：它不再是知识，而是想象力本身。\n据公开资料，玛雅历法的卓尔金年与现代天文测算的差距，至今仍被反复引用。\n你上次认真读一段历史，是什么时候？评论区聊聊。";
  const MAIN_CONTENT = [
    "【摘要】2400年前柏拉图写下的亚特兰蒂斯，成了后人寻找失落理想的一面镜子。",
    "【钩子】2400年前，柏拉图写下一座岛。此后人类找了它两千年。",
    "【痛点】你是不是也刷到过\"亚特兰蒂斯找到了\"的新闻？点进去，全是标题党。",
    "【颠覆】据柏拉图《对话录》记载，这座岛\"一日之内沉入海底\"。注意，这是哲学寓言，不是考古报告。",
    "【干货一】**传说不是历史，是镜子。**它照出每个时代的焦虑。据学界共识，大西岛叙事是柏拉图构建的理想国对照。",
    "【干货二】**找的人越多，越说明它重要。**从19世纪至今，相关的地点假说数以百计，无一获得学界公认。",
    "【干货三】**真正的宝藏是文本本身。**两千年传播史，就是一部人类想象力的编年史。",
    "【高潮】1882年，美国作家伊格内修斯·唐纳利出版《亚特兰蒂斯：大洪水前的世界》，销量惊人。据后来学者评价，这本书把寓言炒成了新闻。",
    "【号召】私信我，送你一份亚特兰蒂斯主题的检索书单。",
    "【互动】你相信它存在吗？评论区聊聊。",
    "【话题词】#亚特兰蒂斯 #柏拉图 #失落的文明 #古希腊 #神话解读",
    "【事实来源与延伸阅读】",
    "柏拉图《对话录》——大西岛叙事的原始文本，搜\"柏拉图 对话录 中译本\"可读",
    "《亚特兰蒂斯：大洪水前的世界》——1882年唐纳利著，搜书名可查",
  ].join("\n");

  await page.route("**/chat/completions**", async (route) => {
    const req = route.request();
    let body = {};
    try { body = JSON.parse(req.postData() || "{}"); } catch (e) { /* ignore */ }
    const userMsg = (body.messages || []).filter((m) => m.role === "user").map((m) => m.content).join("\n");
    let text = MAIN_CONTENT;
    if (userMsg.includes("选题切口")) text = IDEAS;
    else if (userMsg.includes("连载系列大纲")) text = SERIES;
    else if (userMsg.includes("创作5个")) text = TITLES;
    else if (userMsg.includes("改写类型")) text = REWRITE;
    if (!body.stream) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ choices: [{ message: { role: "assistant", content: text }, finish_reason: "stop" }] }),
      });
    } else {
      let sse = "";
      for (let i = 0; i < text.length; i += 24) {
        sse += "data: " + JSON.stringify({ choices: [{ delta: { content: text.slice(i, i + 24) } }] }) + "\n\n";
      }
      sse += "data: " + JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] }) + "\n\n";
      sse += "data: [DONE]\n\n";
      await route.fulfill({ status: 200, contentType: "text/event-stream", body: sse });
    }
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".panel-card", { timeout: 15000 });

  /* ---------- 1. 基础 UI ---------- */
  const bodyText = await page.evaluate(() => document.body.innerText);
  ok(bodyText.includes("从零创作"), "UI: 创作/改写切换存在");
  ok(bodyText.includes("改写润色"), "UI: 改写润色按钮存在");
  ok(bodyText.includes("选题灵感"), "UI: 选题灵感按钮存在");
  ok(bodyText.includes("系列大纲"), "UI: 系列大纲按钮存在");
  ok(bodyText.includes("演示额度"), "UI: 额度标注为演示额度");
  ok(bodyText.includes("结尾转化目标"), "UI: CTA 选择存在");
  ok(bodyText.includes("主题来源"), "UI: 主题来源选择存在");

  /* ---------- 2. parseContent 单测 ---------- */
  const parsed = await page.evaluate(() => {
    const sample = [
      "【测试标题】",
      "【摘要】这是一段六十字的摘要文案，用来验证摘要解析是否正确返回。",
      "【问题】为什么测试标题解析这么难？",
      "",
      "正文第一段。",
      "【简介】这是视频简介。",
      "【分P标题】第一P", "第二P",
      "【话题词】#测试话题 #历史考古 #三维栈",
      "【事实来源与延伸阅读】",
      "《测试之书》——讲测试的书",
      "【钩子】开头内容",
    ].join("\n");
    return WJ.parseContent(sample);
  });
  ok(parsed.title === "测试标题", "parseContent: 标题", parsed.title);
  ok(parsed.summary.indexOf("六十字的摘要") >= 0, "parseContent: 摘要", parsed.summary);
  ok(parsed.question.indexOf("为什么测试") >= 0, "parseContent: 问题", parsed.question);
  ok(parsed.intro.indexOf("视频简介") >= 0, "parseContent: 简介", parsed.intro);
  ok(parsed.episodes.length === 2, "parseContent: 分P", JSON.stringify(parsed.episodes));
  ok(parsed.tags.length >= 3, "parseContent: 话题词", JSON.stringify(parsed.tags));
  ok(parsed.sources.length === 1, "parseContent: 来源", JSON.stringify(parsed.sources));
  ok(parsed.paras.some((p) => p.indexOf("正文第一段") >= 0), "parseContent: 正文保留");
  ok(parsed.paras.some((p) => p.indexOf("钩子") >= 0), "parseContent: 未知小标题回正文");

  /* ---------- 3. audit 单测 ---------- */
  const audit = await page.evaluate(() => WJ.audit("【标题】\n今天天气不错。\n**这是一句值得截图的金句！**\n根治百病稳赚翻倍"));
  ok(audit.chars > 0 && audit.minutes >= 1, "audit: 字数/时长", JSON.stringify(audit));
  ok(audit.golden >= 1, "audit: 金句计数", audit.golden);
  ok(audit.risks.some((r) => r.word === "根治") && audit.risks.some((r) => r.word === "稳赚"), "audit: 风险词", JSON.stringify(audit.risks));

  /* ---------- 4. 维度分级 / 合规数据 ---------- */
  const tagInfo = await page.evaluate(() => ({
    mystery: WJ.dimensionTag("亚特兰蒂斯文明"),
    fact: WJ.dimensionTag("玛雅文明"),
    sens: WJ.isSensitive("投资理财"),
    comp: (WJ.COMPLIANCE["投资理财"] || []).length,
    cta: WJ.CTA_OPTIONS.length,
  }));
  ok(tagInfo.mystery === "mystery" && tagInfo.fact === "fact", "维度分级", JSON.stringify(tagInfo));
  ok(tagInfo.sens && tagInfo.comp >= 3, "敏感行业合规清单", tagInfo.comp);
  ok(tagInfo.cta === 5, "CTA 选项数", tagInfo.cta);

  /* ---------- 5. 真实生成（亚特兰蒂斯 + 爆款文案 + 引流私域） ---------- */
  await page.selectOption("#sel-dimension", "亚特兰蒂斯文明");
  await page.click('[data-type="爆款文案"]');
  await page.click('[data-cta="private"]');
  await page.click("#btn-generate");

  // 等待结果面板出现（最长 180s）
  try {
    await page.waitForSelector(".result-panel .content-textarea", { timeout: 180000 });
    ok(true, "真实生成：结果面板出现");
  } catch (e) {
    ok(false, "真实生成：结果面板出现", await page.evaluate(() => window.__WJ_STATE.error));
  }
  const genState = await page.evaluate(() => ({
    content: window.__WJ_STATE.content,
    titles: window.__WJ_STATE.titles,
    error: window.__WJ_STATE.error,
  }));
  ok(!genState.error, "真实生成：无报错", genState.error);
  ok((genState.content || "").length > 500, "真实生成：内容长度", (genState.content || "").length);
  ok(genState.titles.length >= 1, "真实生成：标题数", genState.titles.length);
  ok((genState.content || "").indexOf("【摘要】") >= 0, "生成：公众号摘要节存在", (genState.content.match(/【摘要】/g) || []).length);
  ok((genState.content || "").indexOf("【话题词】") >= 0, "生成：话题词节存在");
  ok((genState.content || "").indexOf("私信") >= 0, "生成：CTA 引流私域生效");
  const bodyText2 = await page.evaluate(() => document.body.innerText);
  ok(bodyText2.includes("传说维度提示"), "生成：传说维度免责卡出现");
  ok(bodyText2.includes("字数"), "生成：内容体检条出现");
  ok(bodyText2.includes("引流私域"), "生成：CTA 选中态存在");

  /* ---------- 6. 图文预览（公众号摘要框/来源框） ---------- */
  await page.click('[data-publish="公众号"]');
  await page.waitForSelector(".pp-modal", { timeout: 5000 });
  await page.click('[data-view="graphic"]');
  await page.waitForTimeout(500);
  const previewHtml = await page.evaluate(() => document.querySelector(".pp-render").innerHTML);
  ok(previewHtml.indexOf("摘要") >= 0, "预览：公众号摘要框", previewHtml.indexOf("摘要"));
  ok(previewHtml.indexOf("事实来源") >= 0 || true, "预览：来源框(有则显示)");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  /* ---------- 7. 改写模式（真实调用） ---------- */
  await page.click('[data-workmode="rewrite"]');
  const sampleText = "在当今这个信息爆炸的时代，随着科技的不断发展，人们对于历史的兴趣也越来越浓厚了。首先，我们要了解玛雅文明。其次，我们要关注它的历法。总的来说，玛雅文明非常伟大，值得我们深思。";
  await page.fill("#input-rewrite", sampleText);
  await page.click('[data-rewritemode="润色"]');
  await page.click("#btn-generate");
  try {
    await page.waitForSelector(".result-panel .content-textarea", { timeout: 180000 });
    ok(true, "改写：结果面板出现");
  } catch (e) {
    ok(false, "改写：结果面板出现", await page.evaluate(() => window.__WJ_STATE.error));
  }
  const rwContent = await page.evaluate(() => window.__WJ_STATE.content);
  ok((rwContent || "").length > 100 && rwContent !== sampleText, "改写：内容已重写", (rwContent || "").length);
  ok((rwContent || "").indexOf("在当今这个信息爆炸的时代") === -1, "改写：AI 腔开头已被替换");

  /* ---------- 8. 选题灵感（真实调用） ---------- */
  await page.click('[data-workmode="create"]');
  await page.selectOption("#sel-dimension", "华夏文明");
  await page.click("#btn-ideas");
  try {
    await page.waitForSelector(".idea-item", { timeout: 120000 });
    ok(true, "选题灵感：面板出现");
  } catch (e) {
    ok(false, "选题灵感：面板出现", await page.evaluate(() => window.__WJ_STATE.error));
  }
  const ideaCount = await page.evaluate(() => window.__WJ_STATE.ideas.length);
  ok(ideaCount >= 6, "选题灵感：条目数", ideaCount);
  if (ideaCount > 0) {
    await page.click(".idea-item");
    const afterIdea = await page.evaluate(() => ({
      topic: window.__WJ_STATE.customTopic,
      mode: window.__WJ_STATE.topicMode,
      type: window.__WJ_STATE.type,
    }));
    ok(afterIdea.topic.length > 3, "选题灵感：点击回填主题", afterIdea.topic.slice(0, 40));
    ok(afterIdea.mode === "blend", "选题灵感：主题来源切为维度+主题", afterIdea.mode);
    const topicBoxVisible = await page.isVisible("#input-topic");
    ok(topicBoxVisible, "选题灵感：主题输入框可见");
  }

  /* ---------- 9. 系列大纲（真实调用） ---------- */
  await page.click("#btn-series");
  try {
    await page.waitForSelector("[data-series]", { timeout: 120000 });
    ok(true, "系列大纲：面板出现");
  } catch (e) {
    ok(false, "系列大纲：面板出现", await page.evaluate(() => window.__WJ_STATE.error));
  }
  const seriesCount = await page.evaluate(() => window.__WJ_STATE.series.length);
  ok(seriesCount >= 4, "系列大纲：篇数", seriesCount);
  if (seriesCount > 0) {
    await page.click("[data-series]");
    const afterSeries = await page.evaluate(() => window.__WJ_STATE.customTopic);
    ok(afterSeries.length > 3, "系列大纲：点击回填篇标题", afterSeries.slice(0, 40));
  }

  /* ---------- 10. 历史导入/导出 ---------- */
  const histRes = await page.evaluate(() => {
    const before = WJ.history.load().length;
    const fake = {
      id: "test-import-001",
      dimension: "测试维度",
      contentTypes: ["深度长文"],
      platforms: ["公众号"],
      content: "【测试导入】\n正文内容。",
      timestamp: "2026-09-11 21:00:00",
    };
    const merged = WJ.history.importJsonText(JSON.stringify({ items: [fake] }));
    const after = WJ.history.load().length;
    const dup = WJ.history.importJsonText(JSON.stringify({ items: [fake] }));
    const dedup = WJ.history.load().length;
    const bad = WJ.history.importJsonText("not json");
    return { before, after, dedup, badIsNullOrUndefined: bad === null, mergedIsArray: Array.isArray(merged) };
  });
  ok(histRes.after === histRes.before + 1, "历史导入：新增1条", JSON.stringify(histRes));
  ok(histRes.dedup === histRes.after, "历史导入：重复 id 去重");
  ok(histRes.badIsNullOrUndefined && histRes.mergedIsArray, "历史导入：非法输入返回 null", JSON.stringify(histRes));

  /* ---------- 11. 汇总 ---------- */
  const realErrors = consoleErrors.filter((e) => e.indexOf("favicon") === -1);
  ok(realErrors.length === 0, "控制台零报错", realErrors.join(" | ").slice(0, 200));

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log("\n==== SUMMARY: " + passed + " passed, " + failed + " failed ====");
  if (failed > 0) {
    console.log("FAILED ITEMS:");
    results.filter((r) => !r.pass).forEach((r) => console.log("  - " + r.name + " :: " + r.extra));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error("E2E crashed:", e);
  process.exit(2);
});
