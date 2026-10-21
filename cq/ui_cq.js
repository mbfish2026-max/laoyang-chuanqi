// cq/ui_cq.js — 老羊传奇 M1：运行时界面清理（D2 残留入口）+ 小字号/换行修正。只改 DOM，不动玩法数据。
// 去掉：符文图鉴/符文之语页签、背包「炼金匣」「符文/宝石」筛选、回收设置里的符文行、缩颅/法球等 D2 部位选项。
(function(){
if(typeof window==='undefined'||typeof document==='undefined')return;
const BAD_BTN=/^(符文图鉴|炼金匣|符文|宝石|符文宝石|高阶符文|符文之语|缩颅|法球)(\s|$|（|\()/;
const BAD_ROW=/^(符文[：:]|符文之语|高阶符文|缩颅|法球)/;
function strip(root){
  if(!root||!root.querySelectorAll)return;
  root.querySelectorAll('button,span.tag,label').forEach(b=>{const t=(b.textContent||'').trim(),oc=b.getAttribute('onclick')||'';
    if(BAD_BTN.test(t)||/cubeUI|stashCube|SKT=3|BAGF='(rune|gem)'/.test(oc))b.remove()});
  root.querySelectorAll('.row,.rw,.rgrid').forEach(r=>{const t=(r.textContent||'').trim();if(BAD_ROW.test(t)||/runeMax/.test(r.innerHTML.slice(0,400)))r.remove()});
  root.querySelectorAll('option').forEach(o=>{if(BAD_BTN.test((o.textContent||'').trim()))o.remove()});
}
if(typeof renderSkills==='function'){const f=renderSkills;renderSkills=function(){if(typeof SKT!=='undefined'&&SKT===3)SKT=0;return f.apply(this,arguments)}}
let q=0;const run=()=>{q=0;strip(document.getElementById('panel'));strip(document.getElementById('modal'));strip(document.getElementById('setM'))};
function boot(){new MutationObserver(()=>{if(!q){q=1;Promise.resolve().then(run)}}).observe(document.body,{childList:true,subtree:true});run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.cqUiStrip=strip;
})();
