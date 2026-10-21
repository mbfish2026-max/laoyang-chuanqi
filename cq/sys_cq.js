'use strict';
// ===================================================================================
// cq/sys_cq.js — 老羊传奇 M1 系统胶水（index.html 末尾加载，作为最外层包装）
// 1) 品质：不再产出 破旧/超强/合成/符文之语；底材自带属性 bm（传奇白字）写入 it.m；无凹槽
// 2) 符文/宝石掉落 → 黑铁矿；熔炼匣（炼金匣）入口关闭
// 3) 材料：黑铁碎片（原残骸精华）/ 黑铁矿 / 祝福油 / 仓库扩充券
// 4) 等级上限 60（CQ_BAL.lvlCap）
// 5) 存档版本 S.sv / ACCT.sv 与迁移 cqMigrate（只处理本作 cq_ 存档，绝不读取暗夜 anye_ 数据）
// 6) 对外接口 window.CQSys（给战斗 / 职业 Bot）
// ===================================================================================
const CQ_SV=1;// 角色存档结构版本；每次结构变更 +1 并在 CQ_MIG 追加一步
// ---------- 材料 ----------
Object.assign(MATS.ess,{n:'黑铁碎片',c:'#9aa4b0',d:'回收装备所得。用途：淬锋精铸。'});
Object.assign(MATS,{
 heitie:{n:'黑铁矿',c:'#8c8c99',d:'怪物掉落的矿石。用途：铁匠强化（每级需要 等级+1 块）。'},
 zhufu:{n:'祝福油',c:'#ffd76a',d:'强化时勾选使用：失败不掉级（每次消耗 1 瓶）。'},
 ckq:{n:'仓库扩充券',c:'#7fd0ff',d:'共享仓库第 3 页起扩容所需。首领小概率掉落。'}});
function cqTakeMat(id,n){if(matCount(id)<n)return false;for(let i=S.bag.length-1;i>=0&&n>0;i--){const x=S.bag[i];if(x.k!=='mat'||x.id!==id)continue;const t=Math.min(n,x.n||0);x.n-=t;n-=t;if(x.n<=0)S.bag.splice(i,1)}return true}
// ---------- 品质与底材白字 ----------
{const f=genItem;genItem=function(ilvl,opt){opt=opt||{};let it=f(ilvl,opt);
 for(let i=0;i<6&&it&&!it.k&&(it.q===0||it.q===2||it.q===7||it.q===8);i++)it=f(ilvl,Object.assign({},opt,{q:1}));
 if(it&&!it.k){const b=BASEM[it.b];it.sock=0;it.soc=[];delete it.rw;if(it.q===1)it.name=b.n;
  if(b&&b.bm&&!it.bmd){it.bmd=1;for(const k in b.bm){const v=Array.isArray(b.bm[k])?R(b.bm[k][0],b.bm[k][1]):b.bm[k];if(v)it.m[k]=(it.m[k]||0)+v}}}
 return it}}
// ---------- 符文 / 宝石 → 黑铁矿 ----------
const cqOre=n=>({uid:S.uid++,k:'mat',id:'heitie',n:n||1});
rollRune=function(){return cqOre(1)};
rollGem=function(){return cqOre(1)};
function cqJewBase(lv){const c=BASES.filter(b=>b.jew&&b.q<=Math.max(3,lv));return c.length?pick(c):BASEM.rin}
rollGood=function(m){return rnd()<0.7?genItem(m.lv,{base:cqJewBase(m.lv),mf:ST.mf,fac:m._fac}):cqOre(1+(m.boss?R(1,2):0))};
if(typeof TCS!=='undefined')for(const k in TCS)if(TCS[k].runes)TCS[k].runes=0;
// 首领 / 精英额外：黑铁矿、祝福油、仓库扩充券
{const f=rollTC;rollTC=function(m){const out=f(m)||[];try{if(m.boss||m.actboss){if(rnd()<0.5)out.push(cqOre(R(1,3)));if(rnd()<0.08)out.push({uid:S.uid++,k:'mat',id:'zhufu',n:1});if(rnd()<0.02)out.push({uid:S.uid++,k:'mat',id:'ckq',n:1})}
 else if(m.fl==='uniq'||m.fl==='champ'){if(rnd()<0.15)out.push(cqOre(1))}else if(rnd()<0.03)out.push(cqOre(1))}catch(e){}return out}}
// 炼金匣 / 熔炼匣：关闭（Q4 待定，暂不回归）
if(typeof genJC==='function')genJC=function(){return null};// D2 护身符/珠宝不产出
cubeUI=function(){if(!window.__NOUI)toast('炼金匣已关闭')};
// ---------- 等级上限 ----------
{const f=xpNeed;xpNeed=function(l){return l>=CQ_BAL.lvlCap?9e15:f(l)}}
// ---------- 存档迁移 ----------
// v0（暗夜结构 fork 后首次）→ v1：去掉符文/宝石/凹槽/符文之语；D2 底材物品折算金币；补强化字段
function cqAllItems(){const a=[];const push=(arr)=>{for(const x of arr||[])a.push(x)};push(S.bag);for(const p of S.pst||[])push(p);push(Object.values(S.eq||{}).filter(Boolean));return a}
function cqBadItem(it){return!it||it.k==='rune'||it.k==='gem'||(!it.k&&!BASEM[it.b])}
function cqStrip(arr){let g=0;for(let i=arr.length-1;i>=0;i--){const it=arr[i];if(cqBadItem(it)){g+=it&&it.k==='rune'?50*((it.r||0)+1):it&&it.k==='gem'?20*((it.lv||0)+1):100;arr.splice(i,1)}else if(!it.k){it.sock=0;it.soc=[];delete it.rw;delete it.rwm}}return g}
const CQ_MIG=[
 function v1(){let g=cqStrip(S.bag);for(const p of S.pst||[])g+=cqStrip(p);for(const k in S.eq||{}){const it=S.eq[k];if(cqBadItem(it)){delete S.eq[k];g+=100}else if(it){it.sock=0;it.soc=[];delete it.rw}}
  for(const it of cqAllItems())if(!it.k&&it.en==null)it.en=0;S.gold=(S.gold||0)+g;if(S.lvl>CQ_BAL.lvlCap)S.lvl=CQ_BAL.lvlCap;S.cqMigGold=g},
];
function cqMigrate(){if(!S)return 0;const from=S.sv||0;for(let v=from;v<CQ_SV;v++)CQ_MIG[v]();S.sv=CQ_SV;return CQ_SV-from}
{const f=load;load=function(){const r=f.apply(this,arguments);try{if(cqMigrate()&&typeof calc==='function')calc()}catch(e){console.warn('cqMigrate',e)}return r}}
{const f=newSave;newSave=function(){const s=f();s.sv=CQ_SV;s.eq={};return s}}
// ---------- 对外接口 ----------
function cqItemCls(it){if(!it||it.k)return null;const b=BASEM[it.b];return(b&&b.ccls)||null}
function cqEquipAttrs(){const o={};for(const k of SLOTS){const it=S.eq[k];if(!it)continue;const m=allMods(it),l=itemLocal(it);for(const x in m)o[x]=(o[x]||0)+m[x];if(l.min)o.atkMin=(o.atkMin||0)+l.min;if(l.max)o.atkMax=(o.atkMax||0)+l.max;if(l.def)o.def=(o.def||0)+l.def}return o}
// M1：任何直接造出的符文/宝石（任务奖励、秘境、悬赏、首领 runes 字段等）在入包时统一换成黑铁矿
{const f=addBag;addBag=function(it){if(it&&(it.k==='rune'||it.k==='gem')){const o=cqOre(it.k==='rune'?1+Math.floor((it.r|0)/8):1);return f.call(this,o)}return f.apply(this,arguments)}}
for(const q of Object.values(QUESTS))if(q&&typeof q.rw==='string')q.rw=q.rw.replace(/高阶符文|符文|宝石/g,'黑铁矿');
if(typeof TCS!=='undefined')for(const k in TCS)if(TCS[k]&&TCS[k].runes)TCS[k].runes=0;
window.CQSys={sv:()=>CQ_SV,itemCls:cqItemCls,equipAttrs:cqEquipAttrs,genItem:(lv,o)=>genItem(lv,o||{}),rollDrops:m=>rollTC(m),addItem:it=>addBag(it),
 addMat:(id,n)=>addMat(id,n),matCount:id=>matCount(id),takeMat:cqTakeMat,acts:()=>ACTS,zone:()=>ACTS[S.act||0].zones[S.zone||0],monDef:k=>MONS[k]||BOSSES[k]||null};
