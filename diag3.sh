#!/bin/bash
URL="http://127.0.0.1:8977/index.html"
AB() { timeout 45 agent-browser "$@" 2>&1; }
AB open "$URL"
AB eval 'window.__BOOT=Math.random().toString(36).slice(2,8); window.__BOOT'
AB eval 'var s=document.getElementById("sel-dimension"); s.value="玛雅文明"; s.dispatchEvent(new Event("change")); document.querySelector("[data-type=\"爆款文案\"]").click(); document.getElementById("btn-generate").click(); "clicked:"+(window.__BOOT)'
sleep 2
AB eval 'JSON.stringify({boot:window.__BOOT, L:(window.__WJ_STATE||{}).loading, url:location.href})'
sleep 8
AB eval 'JSON.stringify({boot:window.__BOOT, L:(window.__WJ_STATE||{}).loading, url:location.href, nav:performance.getEntriesByType("navigation").length})'
sleep 15
AB eval 'JSON.stringify({boot:window.__BOOT, L:(window.__WJ_STATE||{}).loading, C:((window.__WJ_STATE||{}).content||"").length, E:(window.__WJ_STATE||{}).error, ta:!!document.getElementById("content"), url:location.href})'
sleep 20
AB eval 'JSON.stringify({boot:window.__BOOT, L:(window.__WJ_STATE||{}).loading, C:((window.__WJ_STATE||{}).content||"").length, E:(window.__WJ_STATE||{}).error, ta:!!document.getElementById("content"), url:location.href})'
AB errors
