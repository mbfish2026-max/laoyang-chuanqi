'use strict';
// ===================================================================================
// cq/stash_cq.js — 个人仓库 / 共享仓库（方案 §5.8）
// 页数：个人 S.pstN（初始 2，最多 6，每页 金币 10万×页序²）；共享 ACCT.shN（初始 2，最多 8；第 3 页起 仓库扩充券×1 + 金币 50万×页序）
// 每页 48 格（PAGE_SZ）。数组长度 = 已解锁页数，因此其余仓库逻辑（存取/整理/云同步）无需改动。
// 共享仓库：职业筛选 全部/战士/法师/道士/通用；任务物品(it.quest)、绑定物品(it.bind) 不可存入共享仓库。
// 旧存档（暗夜结构 20 页）：把物品压缩进前 N 页；装不下则保留所需页数（只增不删，绝不丢物品）。ACCT.sv 记录账号层版本。
// ===================================================================================
const CQ_ACCT_SV=1;
function cqFitPages(P,n0,max){const all=P.flat();const need=Math.max(n0,Math.ceil(slotsUsed(all)/PAGE_SZ));let n=Math.max(n0,Math.min(max,need));
 for(;;){const pages=mkPages(n);let ok=true;for(const it of all){const i=pages.findIndex(pg=>fits(pg,it,PAGE_SZ));if(i<0){ok=false;break}pushInto(pages[i],it)}
  if(ok||n>=Math.max(max,P.length)){if(!ok){/* 极端情况：保留原页 */return{pages:P,n:P.length}}return{pages,n}}n++}}
function cqStashNorm(){const B=CQ_BAL.stash;
 if(S&&Array.isArray(S.pst)){if(!S.pstN)S.pstN=B.p0;if(S.pst.length!==S.pstN){if(S.pst.length>S.pstN){const r=cqFitPages(S.pst,S.pstN,B.pMax);S.pst.length=0;S.pst.push(...r.pages);S.pstN=r.n}else while(S.pst.length<S.pstN)S.pst.push([])}}
 if(typeof ACCT!=='undefined'&&ACCT&&Array.isArray(ACCT.shared)){if(!ACCT.shN)ACCT.shN=B.s0;if(ACCT.shared.length!==ACCT.shN){if(ACCT.shared.length>ACCT.shN){const r=cqFitPages(ACCT.shared,ACCT.shN,B.sMax);ACCT.shared.length=0;ACCT.shared.push(...r.pages);ACCT.shN=r.n}else while(ACCT.shared.length<ACCT.shN)ACCT.shared.push([])}ACCT.sv=CQ_ACCT_SV}}
{const f=load;load=function(){const r=f.apply(this,arguments);try{if(!S.pst&&typeof migrateChar==='function')migrateChar(curChar()||{name:'战士',id:1});cqStashNorm()}catch(e){console.warn('cqStashNorm',e)}return r}}
// 扩容：w='p' 个人 / 's' 共享。返回 {ok} 或 {err}
function cqStashCost(w){const B=CQ_BAL.stash;const n=w==='s'?shN():pstN(),p=n+1;if(w==='s'){if(n>=B.sMax)return null;return{gold:B.sCost(p),ckq:p>B.sFree?1:0,page:p}}if(n>=B.pMax)return null;return{gold:B.pCost(p),ckq:0,page:p}}
function cqStashExpand(w){const c=cqStashCost(w);if(!c)return{err:'已达上限'};if(S.gold<c.gold)return{err:'金币不足'};if(c.ckq&&matCount('ckq')<c.ckq)return{err:'需要仓库扩充券'};
 S.gold-=c.gold;if(c.ckq)cqTakeMat('ckq',c.ckq);if(w==='s'){ACCT.shN=shN()+1;ACCT.shared.push([]);acctSave();if(typeof clSyncSoon==='function')try{clSyncSoon()}catch(e){}}else{S.pstN=pstN()+1;S.pst.push([])}save();return{ok:true,page:c.page}}
function cqStashExpandUI(w){const c=cqStashCost(w);if(!c)return toast('已达上限');if(!confirm(`扩充到第 ${c.page} 页：金币 ${fmt(c.gold)}${c.ckq?' + 仓库扩充券 ×1':''}？`))return;const r=cqStashExpand(w);toast(r.err||('已扩充到 '+c.page+' 页'));render()}
// 共享仓库：不可存入
function cqShareBlocked(it){return!!(it&&(it.quest||it.bind))}
{const f=depositUid;depositUid=function(uid,w,pref){if(w==='s'){const it=S.bag.find(x=>x.uid===uid);if(cqShareBlocked(it)){if(!window.__NOUI)toast('任务/绑定物品不能放入共享仓库');return false}}return f.apply(this,arguments)}}
{const f=stashToStash;stashToStash=function(uid){const fi=findItem(uid);if(fi&&fi.where==='p'&&cqShareBlocked(fi.it)){if(!window.__NOUI)toast('任务/绑定物品不能放入共享仓库');return false}return f.apply(this,arguments)}}
// 职业筛选
const CQ_CLSF=[['all','全部'],['zs','战士'],['fs','法师'],['ds','道士'],['none','通用']];
function cqClsMatch(it,c){if(!c||c==='all')return true;const k=cqItemCls(it);return c==='none'?!k:k===c}
{const f=stMatch;stMatch=function(g){if(STV==='shared'&&STF.c&&STF.c!=='all'&&!cqClsMatch(g.it,STF.c))return false;return f.apply(this,arguments)}}
{const f=renderBag;renderBag=function(){const r=f.apply(this,arguments);try{if(window.__NOUI||(STV!=='pst'&&STV!=='shared'))return r;const P=$('#panel');if(!P||P.querySelector('.cqstx'))return r;const sh=STV==='shared',w=sh?'s':'p',c=cqStashCost(w);
 const chips=sh?`<div class="stabs sm cqclsf" style="white-space:nowrap;overflow-x:auto">${CQ_CLSF.map(([k,n])=>`<button class="${(STF.c||'all')===k?'on':''}" onclick="STF.c='${k}';render()">${n}</button>`).join('')}</div>`:'';
 const ex=`<div class="btns cqstx" style="white-space:nowrap"><span class="dim">${sh?'共享':'个人'}仓库 ${sh?shN():pstN()}/${sh?CQ_BAL.stash.sMax:CQ_BAL.stash.pMax} 页</span> ${c?`<button class="btn xs" onclick="cqStashExpandUI('${w}')">＋ 扩容（◈${fmt(c.gold)}${c.ckq?' + 扩充券':''}）</button>`:''}</div>`;
 const t=P.querySelector('.bagv');if(t)t.insertAdjacentHTML('afterend',chips+ex)}catch(e){console.warn(e)}return r}}
if(typeof STF!=='undefined'&&STF.c==null)STF.c='all';
