#!/bin/bash
# 诊断 v2：单次 Bash 调用内完成，全程携带页面指纹确认 eval 连对页面
URL="http://127.0.0.1:8977/index.html"
AB() { timeout 60 agent-browser "$@" 2>&1; }

FP='JSON.stringify({t:document.title, root:document.getElementById("root")?document.getElementById("root").innerHTML.length:-1, sel:!!document.getElementById("sel-dimension")})'

echo "=== 1. open ==="
AB open "$URL"
echo "指纹: $FP"
AB eval "$FP"

echo "=== 2. 状态检查（内部） ==="
AB eval 'JSON.stringify({dim:window.__WJ_STATE.dimension, type:window.__WJ_STATE.type, plat:window.__WJ_STATE.platform, quota:window.__WJ_STATE.quota.remaining})'

echo "=== 3. 选维度 + 爆款文案 + 小红书 ==="
AB eval 'var s=document.getElementById("sel-dimension"); s.value="玛雅文明"; s.dispatchEvent(new Event("change")); JSON.stringify({sel:s.value, state:window.__WJ_STATE.dimension})'
AB click '[data-type="爆款文案"]'
AB click '[data-platform="小红书"]'
AB eval 'JSON.stringify({type:window.__WJ_STATE.type, plat:window.__WJ_STATE.platform})'

echo "=== 4. 点生成 ==="
AB click '#btn-generate'
sleep 3
AB eval 'JSON.stringify({loading:window.__WJ_STATE.loading, spinner:!!document.querySelector(".spinner")})'

echo "=== 5. 等待完成（最多 20 轮 x 6s） ==="
for i in $(seq 1 20); do
  sleep 6
  R=$(AB eval 'JSON.stringify({L:window.__WJ_STATE.loading, C:(window.__WJ_STATE.content||"").length, E:window.__WJ_STATE.error, hasTA:!!document.getElementById("content")})')
  echo "  [$i] $R"
  if echo "$R" | grep -q '"L":false'; then echo "  -> 结束"; break; fi
done

echo "=== 6. 最终 DOM 状态 ==="
AB eval 'JSON.stringify({
  hasContentTA: !!document.getElementById("content"),
  taLen: document.getElementById("content")?document.getElementById("content").value.length:-1,
  errPanel: (document.querySelector(".error-panel")||{}).textContent||null,
  titles: document.querySelectorAll(".title-option").length,
  quota: (document.querySelector(".hint-text")||{}).textContent,
  badge: (document.querySelector(".history-badge")||{}).textContent||null
})'

echo "=== 7. console ==="
AB console
echo "=== 8. errors ==="
AB errors
echo "=== done ==="
