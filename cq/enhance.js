'use strict';
// ===================================================================================
// cq/enhance.js — 铁匠强化 +1 ~ +9（方案 §5.4）
// it.en = 强化等级（0~9）。加成作用于底材攻击/防御：+1~3 每级 4%，+4~6 每级 6%，+7~9 每级 8%（累计，见 CQ_BAL.enh）
// 失败：+1~+3 无损；目标 +4~+6 掉 1 级；目标 +7~+9 掉回 +6；任何情况不碎装。勾选祝福油：失败不掉级（消耗 1 瓶）
// 花费：金币 CQ_BAL.enh.gold(n) + 黑铁矿 CQ_BAL.enh.ore(n)，n = 当前等级
// 入口：商店「铁匠」页签；装备详情「强化」按钮
// ===================================================================================
function cqEnhRate(n){return CQ_BAL.enh.rate[n]||0}
function cqEnhFail(n){return n<3?n:n<6?n-1:6}// 失败后等级（n=当前等级，目标 n+1）
function cqEnhCost(n){return{gold:CQ_BAL.enh.gold(n),ore:CQ_BAL.enh.ore(n)}}
function cqEnhOk(it){return!!it&&!it.k&&!!BASEM[it.b]&&(it.en||0)<CQ_BAL.enh.max}
// 返回 {ok:true/false, res:'up'|'fail'|'keep', from, to} 或 {err}
function cqEnhance(uid,o){o=o||{};const f=findItem(uid),it=f&&f.it;if(!it||it.k)return{err:'不可强化'};const n=it.en||0;
 if(n>=CQ_BAL.enh.max)return{err:'已强化到 +'+CQ_BAL.enh.max};const c=cqEnhCost(n);
 if(S.gold<c.gold)return{err:'金币不足'};if(matCount('heitie')<c.ore)return{err:'黑铁矿不足'};if(o.oil&&matCount('zhufu')<1)return{err:'没有祝福油'};
 S.gold-=c.gold;cqTakeMat('heitie',c.ore);if(o.oil)cqTakeMat('zhufu',1);
 const roll=o.roll!=null?o.roll:rnd()*100;let res,to;
 if(roll<cqEnhRate(n)){to=n+1;res='up'}else{to=o.oil?n:cqEnhFail(n);res=to===n?'keep':'fail'}
 it.en=to;if(to>=9)it.en9=1;S.enhLog=(S.enhLog||0)+1;if(typeof calc==='function'&&f.slot)calc();save();return{ok:res==='up',res,from:n,to}}
// 攻击/防御加成
{const f=itemLocal;itemLocal=function(it){const o=f(it);const p=cqEnhPct(it&&it.en)/100;if(p){if(o.min!=null)o.min=Math.round(o.min*(1+p));if(o.max!=null)o.max=Math.max(o.min+1,Math.round(o.max*(1+p)));if(o.def!=null)o.def=Math.round(o.def*(1+p))}return o}}
{const f=itemName;itemName=function(it){const n=f(it);return it&&!it.k&&it.en?n+' +'+it.en:n}}
// ---------- 界面 ----------
let CQ_OIL=0;
function cqEnhUI(uid){const f=findItem(uid),it=f&&f.it;if(!it)return;const n=it.en||0,mx=CQ_BAL.enh.max;
 if(n>=mx){modal(`<div class="mtitle">⚒ 铁匠强化</div><div class="gp"><div>${itemName(it)} 已强化到 +${mx}</div><div class="btns c"><button class="btn sm" onclick="closeM()">关闭</button></div></div>`);return}
 const c=cqEnhCost(n),fl=cqEnhFail(n),l0=itemLocal(it),nx=Object.assign({},it,{en:n+1}),l1=itemLocal(nx);
 const st=l=>l.max!=null?`攻击 ${l.min}-${l.max}`:l.def!=null?`防御 ${l.def}`:'—';
 modal(`<div class="mtitle">⚒ 铁匠强化</div><div class="gp cqenh"><div class="row"><span>${cell(it,'')}</span><span><b style="color:${itemColor(it)}">${itemName(it)}</b><br><small>+${n} → +${n+1}　${st(l0)} → ${st(l1)}</small></span></div>
 <div class="row"><span>成功率</span><b>${cqEnhRate(n)}%</b></div><div class="row"><span>失败结果</span><span>${fl===n?'无损':'降为 +'+fl}（不碎装）</span></div>
 <div class="row"><span>花费</span><span>◈ ${fmt(c.gold)}（有 ${fmt(S.gold)}）· 黑铁矿 ${c.ore}（有 ${matCount('heitie')}）</span></div>
 <div class="row"><label style="white-space:nowrap"><input type="checkbox" ${CQ_OIL?'checked':''} onchange="CQ_OIL=this.checked?1:0"> 使用祝福油（失败不掉级，有 ${matCount('zhufu')}）</label></div>
 <div class="btns c" style="white-space:nowrap"><button class="btn gold" onclick="cqEnhDo(${uid})">强化</button> <button class="btn sm" onclick="closeM()">关闭</button></div></div>`)}
function cqEnhDo(uid){const r=cqEnhance(uid,{oil:CQ_OIL});if(r.err){toast(r.err);return}
 toast(r.res==='up'?`强化成功 +${r.to}`:r.res==='keep'?'强化失败，祝福油保住了等级':`强化失败，降为 +${r.to}`);if(!window.__NOUI){cqEnhUI(uid);const m=document.querySelector('#modal .cqenh');if(m){m.classList.add(r.ok?'cqok':'cqng')}}}
{const f=renderShop;renderShop=function(){const r=f.apply(this,arguments);try{const P=$('#panel'),t=P.querySelector('.stabs');if(t&&!t.querySelector('.cqenht'))t.insertAdjacentHTML('beforeend',`<button class="cqenht ${SHT==='enh'?'on':''}" onclick="SHT='enh';render()">铁匠</button>`);
 if(SHT==='enh'&&t){t.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.classList.contains('cqenht')));let n=t.nextElementSibling;while(n){const x=n.nextElementSibling;n.remove();n=x}
  const L=[...SLOTS.map(k=>S.eq[k]).filter(Boolean),...S.bag.filter(x=>!x.k)];
  t.insertAdjacentHTML('afterend',`<div class="gp"><h3>⚒ 铁匠强化 <span class="r dim">黑铁矿 ${matCount('heitie')} · 祝福油 ${matCount('zhufu')}</span></h3><div class="dim">身上与背包的装备；+7 以上失败只掉回 +6，不碎装。</div><div class="grid">${L.map(it=>`<div class="shc">${cell(it,`cqEnhUI(${it.uid})`)}<small>+${it.en||0}</small></div>`).join('')||'<div class="dim">没有可强化的装备</div>'}</div></div>`)}}catch(e){console.warn(e)}return r}}
{const f=showItem;showItem=function(uid){const r=f.apply(this,arguments);try{const fi=findItem(uid),it=fi&&fi.it;const p=document.querySelector('#modal .ipanel');if(it&&!it.k&&p&&!p.querySelector('.cqenhb')){const b=p.querySelector('.btns');
 const h=`<button class="btn sm cqenhb" onclick="cqEnhUI(${uid})">强化 +${it.en||0}</button>`;if(b)b.insertAdjacentHTML('beforeend',h)}}catch(e){}return r}}
