#!/bin/bash
# 静态交互测试：不调用真实 API
# 说明：每条 agent-browser 命令都套 timeout，避免单条挂死拖垮整轮
URL="http://127.0.0.1:8977/index.html"
AB() { timeout 40 agent-browser "$@" 2>&1; }
SNAP="/c/Users/AW/WorkBuddy/2026-09-08-18-52-06/guangti-wenwujie"

echo "=== 1. open ==="
AB open "$URL"

echo "=== 2. 基础渲染 ==="
AB eval 'JSON.stringify({
  brand: (document.querySelector(".brand-text h1")||{}).textContent,
  sub: (document.querySelector(".brand-text p")||{}).textContent,
  footer: (document.querySelector(".app-footer p")||{}).textContent,
  genBtn: !!document.querySelector("#btn-generate"),
  quota: (document.querySelector(".hint-text")||{}).textContent,
  dimOptions: document.querySelectorAll("#sel-dimension option").length,
  typePills: document.querySelectorAll("[data-type]").length,
  platformPills: document.querySelectorAll("[data-platform]").length,
  activeType: (document.querySelector(".content-pill.active")||{}).textContent,
  activePlatform: (document.querySelector(".platform-pill.active")||{}).textContent,
  labels: Array.prototype.map.call(document.querySelectorAll(".section-label"), function(e){return e.textContent}).join(" / ")
})'

echo "=== 3. 切行业维度 ==="
AB click '[data-mode="industry"]'
AB eval 'JSON.stringify({dimOptions: document.querySelectorAll("#sel-dimension option").length, first: (document.querySelectorAll("#sel-dimension option")[1]||{}).textContent})'

echo "=== 4. 选类型短视频脚本 ==="
AB click '[data-type="短视频脚本"]'
AB eval 'JSON.stringify({activeType:(document.querySelector(".content-pill.active")||{}).textContent, activePlatform:(document.querySelector(".platform-pill.active")||{}).textContent})'

echo "=== 5. 选平台B站 ==="
AB click '[data-platform="B站"]'
AB eval 'JSON.stringify({activePlatform:(document.querySelector(".platform-pill.active")||{}).textContent})'

echo "=== 6. 未选维度点生成 ==="
AB click '#btn-generate'
sleep 1
AB eval 'JSON.stringify({err: (document.querySelector(".error-panel")||{}).textContent || null})'

echo "=== 7. 选维度冥想正念 ==="
AB eval 'var s=document.getElementById("sel-dimension"); s.value="冥想正念"; s.dispatchEvent(new Event("change")); JSON.stringify({selected:s.value})'
sleep 1
AB eval 'JSON.stringify({selected:(document.getElementById("sel-dimension")||{}).value})'

echo "=== 8. 历史面板 ==="
AB click '#btn-history'
sleep 1
AB eval 'JSON.stringify({panel: !!document.querySelector(".history-panel"), text:((document.querySelector(".history-panel")||{}).textContent||"").slice(0,60)})'

echo "=== 9. 截图 ==="
AB screenshot "$SNAP/shot-main.png"

echo "=== 10. errors ==="
AB errors
echo "=== done ==="
