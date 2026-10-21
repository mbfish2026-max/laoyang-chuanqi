// cq/hud_cq.js — 老羊传奇 M1：战斗页底栏收起后的系统侧承接（不改 #pots/#fquest/#fzone 的 id 与结构）
// 1) 自动吃药阈值接口  2) 药水数量 + 设置放进背包页  3) 主线任务收进地图页  4) 挂机开关接口
(function(){
const CS=window.CQSys=window.CQSys||{};
const D={on:1,hp:40,rej:20,mp:15};
CS.autoPot=p=>{if(!S.apot)S.apot=Object.assign({},D);if(p&&typeof p==='object'){for(const k of['on','hp','rej','mp'])if(k in p)S.apot[k]=k==='on'?(p[k]?1:0):Math.max(0,Math.min(95,Math.round(+p[k]||0)));save();CS.emit&&CS.emit('autoPot',S.apot)}return Object.assign({},D,S.apot)};
CS.idle=()=>!S.auto;              // true = 原地挂机
CS.setAuto=on=>{S.auto=on?1:0;save();if(!window.__NOUI&&typeof render==='function')render();CS.emit&&CS.emit('auto',{auto:S.auto});return S.auto};
CS.questLine=()=>typeof questLine==='function'?questLine():'';
const PN={hp:'红药',mp:'蓝药',rej:'瞬回',tp:'回城'};
window.cqApStep=(k,d)=>{const a=CS.autoPot();CS.autoPot({[k]:(a[k]|0)+d});render()};
function potHTML(){const a=CS.autoPot(),pt=S.pot||{};
 const th=k=>`<span class="cqap"><button class="btn xs" onclick="cqApStep('${k}',-5)">−</button><b>${a[k]}%</b><button class="btn xs" onclick="cqApStep('${k}',5)">+</button></span>`;
 return`<div class="gp cqpot"><h3>药水 <span class="r"><button class="btn xs ${a.on?'on':''}" onclick="CQSys.autoPot({on:${a.on?0:1}});render()">自动吃药 ${a.on?'开':'关'}</button></span></h3>
 ${['hp','mp','rej','tp'].map(k=>`<div class="row"><span>${PN[k]} ×<b>${pt[k]|0}</b></span><span>${k==='tp'?'':`低于 ${th(k)} 自动 `}<button class="btn xs" onclick="usePot('${k}');render()" ${(pt[k]|0)?'':'disabled'}>使用</button></span></div>`).join('')}</div>`}
if(typeof renderBag==='function'){const f=renderBag;renderBag=function(){const r=f.apply(this,arguments);try{if(!window.__NOUI){const P=document.getElementById('panel');if(P&&!P.querySelector('.cqpot'))P.insertAdjacentHTML('beforeend',potHTML())}}catch(e){console.error(e)}return r}}
if(typeof renderMap==='function'){const f=renderMap;renderMap=function(){const r=f.apply(this,arguments);try{if(!window.__NOUI){const P=document.getElementById('panel');if(P&&!P.querySelector('.cqmq')){const w=typeof autoHoldWhy==='function'?autoHoldWhy():'';
 P.insertAdjacentHTML('afterbegin',`<div class="gp cqmq"><h3>主线任务 <span class="r"><button class="btn xs ${S.auto?'on':''}" onclick="CQSys.setAuto(${S.auto?0:1})">${S.auto?'自动推进':'原地挂机'}</button></span></h3><div>${CS.questLine()}</div>${w?`<div class="dim">${w}</div>`:''}</div>`)}}}catch(e){console.error(e)}return r}}
CS.potHTML=potHTML;
})();
