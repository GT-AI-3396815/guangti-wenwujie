#!/bin/bash
URL="http://127.0.0.1:8977/index.html"
AB() { timeout 200 agent-browser "$@" 2>&1; }
AB open "$URL"
AB eval '
(async function(){
  function snap(){ var S=window.__WJ_STATE; return S ? {L:S.loading, C:(S.content||"").length, E:S.error, ta:!!document.getElementById("content")} : {NOSTATE:1, url:location.href}; }
  var s=document.getElementById("sel-dimension");
  if(!s) return JSON.stringify({fail:"no select", url:location.href});
  s.value="玛雅文明"; s.dispatchEvent(new Event("change"));
  document.querySelector("[data-type=\"爆款文案\"]").click();
  document.querySelector("[data-platform=\"小红书\"]").click();
  var before = {dim:window.__WJ_STATE.dimension, type:window.__WJ_STATE.type, plat:window.__WJ_STATE.platform};
  document.getElementById("btn-generate").click();
  var log=[];
  for(var i=0;i<50;i++){
    await new Promise(function(r){setTimeout(r,2000)});
    var st=snap();
    log.push(i+":"+JSON.stringify(st));
    if(st.NOSTATE) break;
    if(!st.L) break;
  }
  return JSON.stringify({before:before, final:snap(), url:location.href, tail:log.slice(-4)}, null, 1);
})()
'
