#!/bin/bash
# 端到端测试：真实调用接口生成 -> 预览图文版 -> 刷新验证历史持久化
URL="http://127.0.0.1:8977/index.html"
AB() { timeout 60 agent-browser "$@" 2>&1; }
SHOT="C:/Users/AW/WorkBuddy/2026-09-08-18-52-06/guangti-wenwujie"

echo "=== 1. open ==="
AB open "$URL"

echo "=== 2. 选择：文明 / 三星堆文明 / 深度长文 / 公众号 ==="
AB eval 'var s=document.getElementById("sel-dimension"); s.value="三星堆文明"; s.dispatchEvent(new Event("change")); "ok"'
AB click '[data-type="深度长文"]'
AB click '[data-platform="公众号"]'
AB eval 'JSON.stringify({dim:(document.getElementById("sel-dimension")||{}).value, type:(document.querySelector(".content-pill.active")||{}).textContent, plat:(document.querySelector(".platform-pill.active")||{}).textContent})'

echo "=== 3. 点击一键生成（真实接口，预计 40-90 秒） ==="
AB click '#btn-generate'

for i in $(seq 1 30); do
  sleep 5
  R=$(AB eval 'JSON.stringify({loading: !!document.querySelector(".spinner"), hasContent: !!document.getElementById("content"), err: (document.querySelector(".error-panel")||{}).textContent||null})')
  echo "  [${i}x5s] $R"
  case "$R" in
    *'"hasContent":true'*) echo "  -> 生成完成"; break;;
    *'"err":"'*) echo "  -> 出现错误"; break;;
  esac
done

echo "=== 4. 检查生成结果 ==="
AB eval 'JSON.stringify({
  titleCount: document.querySelectorAll("[data-title]").length,
  firstTitle: (document.querySelector(".title-option")||{}).textContent,
  contentLen: (document.getElementById("content")||{}).value ? document.getElementById("content").value.length : 0,
  quota: (document.querySelector(".hint-text")||{}).textContent,
  historyBadge: (document.querySelector(".history-badge")||{}).textContent
})'

echo "=== 5. 截图（结果页） ==="
AB screenshot "$SHOT/shot-result.png"

echo "=== 6. 打开发布预览 -> 文字版 ==="
AB click '[data-publish="公众号"]'
sleep 2
AB eval 'JSON.stringify({
  overlay: !!document.querySelector("#pp-overlay"),
  badge: (document.querySelector(".pp-badge")||{}).textContent,
  renderLen: (document.querySelector(".pp-render")||{}).innerHTML ? document.querySelector(".pp-render").innerHTML.length : 0
})'

echo "=== 7. 切到图文版（生成配图） ==="
AB click '[data-view="graphic"]'
sleep 4
AB eval 'JSON.stringify({
  imgs: document.querySelectorAll(".pp-render img").length,
  imgLen: (document.querySelector(".pp-render img")||{}).src ? document.querySelector(".pp-render img").src.length : 0,
  isData: ((document.querySelector(".pp-render img")||{}).src||"").slice(0,20)
})'
AB screenshot "$SHOT/shot-preview.png"

echo "=== 8. 走完发布流程 ==="
AB click '[data-act="confirm"]'
sleep 2
AB eval 'JSON.stringify({step2: !!document.querySelector("[data-act=publish]"), note:(document.querySelector(".pp-confirm-note")||{}).textContent||null})'
AB click '[data-act="publish"]'
sleep 3
AB eval 'JSON.stringify({success: (document.querySelector(".pp-body")||{}).textContent.indexOf("发布成功")>=0})'
AB screenshot "$SHOT/shot-published.png"
AB click '[data-act="cancel"]'
sleep 1

echo "=== 9. 刷新页面，验证历史持久化 ==="
AB open "$URL"
sleep 2
AB eval 'JSON.stringify({
  historyBadge: (document.querySelector(".history-badge")||{}).textContent,
  quota: (document.querySelector(".hint-text")||{}).textContent
})'

echo "=== 10. errors ==="
AB errors
echo "=== done ==="
