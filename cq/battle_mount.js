'use strict';
// cq/battle_mount.js — 战斗页挂载点（M0）
// 暗夜自有战斗画面（#mgrid/#arow/#fx + art2_atmo/char）不再作为主战场。
// 战斗开发 Bot 将传奇卡片战场挂到 #cqStage，并通过 CQBattle 接口对接。
// 详见 docs/battle_mount.md
(function(){
const VER='cq-20261021r';
window.CQ_VERSION=VER;
window.CQBattle={
  version:VER,
  /** 返回挂载容器 HTMLElement；战斗引擎应只在此节点内渲染 */
  stage(){return document.getElementById('cqStage')},
  /** 页签是否在战斗页 */
  isActive(){return typeof TAB==='undefined'||TAB==='fight'},
  /**
   * 从暗夜 calc() 结果映射到传奇战斗属性（M1 由 cq_bridge 填充）。
   * @returns {{atk,mag,tao,def,mdef,acc,agi,luck,aspd,crit,life,mana,lvl,cls}}
   */
  mapAttrs(){
    const st=(typeof ST!=='undefined'&&ST)||{};
    const s=(typeof S!=='undefined'&&S)||{};
    return{atk:st.wmin||0,mag:0,tao:0,def:st.def||0,mdef:0,acc:st.ar||0,agi:0,luck:0,aspd:st.ias||0,crit:st.bcrit||0,life:st.life||0,mana:st.mana||0,lvl:s.lvl||1,cls:s.cls||'zs'};
  },
  /** 击杀回调：战斗引擎应调用此函数触发 TC 掉落（接入 loot.js） */
  onKill(monSpec){if(typeof window.CQ_onKill==='function')return window.CQ_onKill(monSpec)},
  /** 暂停/恢复（切页签时由壳调用） */
  pause(){if(typeof window.CQ_pause==='function')window.CQ_pause()},
  resume(){if(typeof window.CQ_resume==='function')window.CQ_resume()},
  /** 战斗引擎注册实现 */
  register(impl){window.CQ_impl=impl||null}
};
function mountPlaceholder(){
  const st=document.getElementById('cqStage');if(!st||st.dataset.ready)return;
  st.dataset.ready='1';
  st.innerHTML='<div class="cq-ph"><div class="cq-ph-t">老羊传奇 · 战场挂载点</div><div class="cq-ph-s">#cqStage · CQBattle API</div><div class="cq-ph-v">'+VER+'</div></div>';
}
function hideAnYeBattle(){
  const ids=['mgrid','arow','fx'];
  for(const id of ids){const e=document.getElementById(id);if(e)e.classList.add('cq-legacy-hide')}
}
function showVersionChip(){
  if(document.getElementById('cqver'))return;
  const e=document.createElement('div');e.id='cqver';e.textContent=VER;
  e.title='老羊传奇版本';e.style.cssText='position:fixed;left:2px;bottom:52px;z-index:55;font-size:10px;line-height:14px;padding:0 5px;border-radius:4px;background:rgba(0,0,0,.45);color:#c9a14a;pointer-events:none';
  document.body.appendChild(e);
}
function boot(){
  const fb=document.getElementById('fbattle');
  if(fb&&!document.getElementById('cqStage')){
    const stage=document.createElement('div');stage.id='cqStage';stage.setAttribute('role','application');stage.setAttribute('aria-label','战场');
    // 插在 ftop 后，占满原战场区
    const top=document.getElementById('ftop');
    if(top&&top.nextSibling)fb.insertBefore(stage,top.nextSibling);else fb.appendChild(stage);
  }
  hideAnYeBattle();mountPlaceholder();showVersionChip();
}
// M1：按顺序加载传奇卡片战场（cq/*）与胶水 cq_bridge.js（不改 index.html）
const CQ_FILES=['cq/cq_move.js','cq/cq_hero.js','cq/cq_fx.js','cq/cq_scene.js','cq_bridge.js'];
function loadEngine(){
  if(window.__CQ_NO_ENGINE||document.getElementById('cqcss'))return;
  const l=document.createElement('link');l.id='cqcss';l.rel='stylesheet';l.href='cq/cq.css?v='+VER;document.head.appendChild(l);
  let i=0;const next=()=>{if(i>=CQ_FILES.length)return;const s=document.createElement('script');s.src=CQ_FILES[i++]+'?v='+VER+'m1';s.onload=next;s.onerror=()=>{console.error('[CQ] 加载失败',s.src);next()};document.body.appendChild(s)};next();
}
// 角色/技能/福利 设计稿页（cq/pages_cq.*，独立于战斗引擎加载）
function loadPages(){if(document.getElementById('cqpgcss'))return;const l=document.createElement('link');l.id='cqpgcss';l.rel='stylesheet';l.href='cq/pages_cq.css?v='+VER;document.head.appendChild(l);
  const s=document.createElement('script');s.src='cq/pages_cq.js?v='+VER;s.onload=function(){function connectMaps(){if(window.CQMir2Maps&&window.cqPg&&window.CQ&&CQ.Host){CQMir2Maps.installUI()}else{setTimeout(connectMaps,50)}}setTimeout(connectMaps,0)};document.body.appendChild(s)}
function boot2(){boot();loadEngine();loadPages()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot2);else boot2();
// 切页签暂停/恢复
if(typeof window!=='undefined'){
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest&&e.target.closest('#tabs button');
    if(!b)return;
    setTimeout(()=>{if(CQBattle.isActive())CQBattle.resume();else CQBattle.pause()},0);
  },true);
}
})();
// ── 底部导航：对齐设计稿 chuanqi_v2_live（战斗/角色/技能/地图/福利 五项，图标 nav_*.png）──
// 暗夜旧页签（背包/商店/佣兵/终局）不再出现在底栏：背包/商店/佣兵并入「角色」页顶部子页签；「福利」= 原终局页（悬赏/功业/事件/设置…）。
(function(){
if(typeof document==='undefined'||window.__NOUI)return;
const NAV=[['fight','battle','战斗'],['hero','role','角色'],['skill','skill','技能'],['map','map','地图'],['fuli','fuli','福利']];
const GRP={hero:'hero',bag:'hero',shop:'hero',merc:'hero',eg:'fuli',fuli:'fuli'};
// 英雄页沿用旧佣兵子页签键，存档与界面名称均为英雄。
const SUB=[['hero','角色'],['bag','背包'],['shop','商店'],['merc','英雄']];
window.CQ_NAV=NAV.map(n=>n[2]);
function go(t){if(t==='fuli')t='eg';TAB=t;render();try{PWRF.kick()}catch(e){}}
window.cqNavGo=go;
function sync(){const nav=document.getElementById('tabs');if(!nav)return;const g=GRP[TAB]||TAB;
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===g));
  const P=document.getElementById('panel');if(!P)return;
  if(GRP[TAB]==='hero'&&!P.querySelector(':scope>.cqsubnav'))P.insertAdjacentHTML('afterbegin',`<div class="stabs cqsubnav">${SUB.map(([k,n])=>`<button class="${TAB===k?'on':''}" data-st="${k}">${n}</button>`).join('')}</div>`);}
let PB=false;
function build(){const nav=document.getElementById('tabs');if(!nav)return false;
  nav.classList.add('cqnav');
  // 用捕获阶段接管点击：game.js 初始化时会覆盖各按钮 onclick（TAB=data-t），福利需映射到 eg
  if(!nav.__cqcap){nav.__cqcap=1;nav.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-t]');if(!b||!nav.contains(b))return;e.preventDefault();e.stopPropagation();go(b.dataset.t)},true)}
  const have={};nav.querySelectorAll('button').forEach(b=>{if(NAV.some(n=>n[0]===b.dataset.t)&&!have[b.dataset.t])have[b.dataset.t]=b;else b.remove()});
  NAV.forEach(([t,ic,lb],i)=>{let b=have[t];if(!b){b=document.createElement('button');b.dataset.t=t}
    if(!b.__cq){b.__cq=1;b.innerHTML=`<i style="background-image:url(assets/cq/ui/nav_${ic}.png)"></i>${lb}`;b.onclick=e=>{e.preventDefault();go(t)}}
    if(nav.children[i]!==b)nav.insertBefore(b,nav.children[i]||null)});
  const P=document.getElementById('panel');
  if(P&&!PB){PB=true;P.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('.cqsubnav button');if(s){e.stopPropagation();go(s.dataset.st)}});
    new MutationObserver(()=>{if(GRP[TAB]==='hero'&&!P.querySelector(':scope>.cqsubnav'))sync()}).observe(P,{childList:true})}
  return true}
function hook(){if(typeof render!=='function'||render.__cqnav)return;const r=render;render=function(){const o=r.apply(this,arguments);try{build();sync()}catch(e){}return o};render.__cqnav=1}
function init(){hook();build();try{sync()}catch(e){}
  const nav=document.getElementById('tabs');if(nav)new MutationObserver(()=>build()).observe(nav,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
setTimeout(init,0);
})();
