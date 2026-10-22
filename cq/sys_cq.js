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
const CQ_SV=5;// 角色存档结构版本；每次结构变更 +1 并在 CQ_MIG 追加一步
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
// ---------- 黑铁矿（原符文/宝石掉落位） ----------
const cqOre=n=>({uid:S.uid++,k:'mat',id:'heitie',n:n||1});
function cqJewBase(lv){const c=BASES.filter(b=>b.jew&&b.q<=Math.max(3,lv));return c.length?pick(c):BASEM.rin}
rollGood=function(m){return rnd()<0.7?genItem(m.lv,{base:cqJewBase(m.lv),mf:ST.mf,fac:m._fac}):cqOre(1+(m.boss?R(1,2):0))};
// 首领 / 精英额外：黑铁矿、祝福油、仓库扩充券
{const f=rollTC;rollTC=function(m){const out=f(m)||[];try{if(m.boss||m.actboss){if(rnd()<0.5)out.push(cqOre(R(1,3)));if(rnd()<0.08)out.push({uid:S.uid++,k:'mat',id:'zhufu',n:1});if(rnd()<0.02)out.push({uid:S.uid++,k:'mat',id:'ckq',n:1})}
 else if(m.fl==='uniq'||m.fl==='champ'){if(rnd()<0.15)out.push(cqOre(1))}else if(rnd()<0.03)out.push(cqOre(1))}catch(e){}return out}}
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
 // v2（M2）：q6 之前缺 fin 标记，已打完半兽统领的旧存档补解锁第二章；新字段 bossRt/summons/cqBooks 缺省
 function v2(){try{if(S.q&&S.q.q6&&typeof unlockAfter==='function')unlockAfter(0)}catch(e){}if(!S.bossRt)S.bossRt={};if(!Array.isArray(S.summons))S.summons=[];if(!S.cqBooks)S.cqBooks={}},
 // v3：q1/q3/q5（清图任务）原先缺 clear 标记永远不完成；已打完第一章（q6）的旧存档补完成并发奖励
 function v3(){try{if(S.q&&S.q.q6)for(const q of['q1','q3','q5'])if(!S.q[q]&&typeof questDone==='function')questDone(q)}catch(e){}},
 // v4（福利）：离线收益增加领取状态 claimed/doubled；旧存档里已结算的 S.cqOff 视为已领取（不能再补领双倍）；签到记录 ACCT.cqSign 缺省 {n:0,last:''}
 function v4(){if(S.cqOff&&typeof S.cqOff==='object'&&S.cqOff.claimed==null){S.cqOff.claimed=1;S.cqOff.doubled=0}try{if(typeof ACCT!=='undefined'&&ACCT&&!ACCT.cqSign)ACCT.cqSign={n:0,last:''}}catch(e){}},
 // v5（自动成长）：属性改为按等级推导；剩余属性点/技能点、洗点药水折金币；技能等级 20 → 9 按比例映射（职业侧 clsSk9：ceil(1+(旧-1)×8/19)）
 function v5(){let g=0;const L=S.lvl||1;const R=S.resp;if(R&&typeof R==='object'){const p=(k,f)=>Math.round(f(L)/100)*100;g+=(R.sk|0)*p('sk',l=>1000+l*l*30)+(R.at|0)*p('at',l=>500+l*l*20)}delete S.resp;
  if(g){S.gold=(S.gold||0)+g;S.agGold=(S.agGold||0)+g}agPtGold();if(!S.atb)S.atb={};delete S.autoAt;
  if(typeof clsSk9==='function')clsSk9();else if(!S.sk9&&S.sk){for(const id in S.sk){const v=S.sk[id]|0;if(v>0)S.sk[id]=Math.min(9,Math.ceil(1+(v-1)*8/19))}}
  S.sk9=1;if(!S.skx)S.skx={}},
];
function cqMigrate(){if(!S)return 0;const from=S.sv||0;for(let v=from;v<CQ_SV;v++)CQ_MIG[v]();S.sv=CQ_SV;if(typeof mir2SkillsMigrate==='function')mir2SkillsMigrate(S);
 if(window.CQMir2Maps){const mapped=CQMir2Maps.migrate(S);if(mapped!==S){S=mapped;MON=[];CORPSE=[];}applyDiff();}return CQ_SV-from}
{const f=load;load=function(){const r=f.apply(this,arguments);try{if(S){cqMigrate();if(typeof calc==='function')calc();save()}}catch(e){console.warn('cqMigrate',e)}return r}}
{const f=newSave;newSave=function(){const s=f();s.sv=CQ_SV;s.eq={};s.sk9=1;s.atb={};s.skx={};delete s.autoAt;if(window.CQMir2Maps)CQMir2Maps.fresh(s);return s}}
// ---------- 自动成长（docs/auto_growth_plan.md，照原版传奇之旅：升级不给属性点/技能点） ----------
// S.at 由「职业初始值 + floor(每级成长 × (等级-1)) + S.atb 固定加成（任务/转生）」推导，每次 calc 前写回；不再手动/自动加点。
// 成长表：职业开发可在 CLS_DEF[c].grow 或全局 clsAutoAt(c,L) 提供，缺省用 AG_GROW。
const AG_GROW={zs:{str:2.8,dex:0.3,vit:2.5,ene:0},fs:{str:0,dex:0.3,vit:2.5,ene:2.8},ds:{str:0.2,dex:0.3,vit:2.5,ene:2.7}};
// 旧点数折金币：属性点 100×(1+等级/10)、技能点 500×(1+等级/10)（每点）
const AG_GOLD={sp:L=>Math.round(100*(1+L/10)),kp:L=>Math.round(500*(1+L/10))};
const AG_K=['str','dex','vit','ene'];
function agGrow(c){const D=typeof CLS_DEF!=='undefined'&&CLS_DEF[c];return(D&&D.grow)||AG_GROW[c]||AG_GROW.zs}
function agAutoAt(c,L){c=c||(typeof curCls==='function'?curCls():'zs');L=Math.max(1,L||1);if(typeof clsAutoAt==='function'){try{const r=clsAutoAt(c,L);if(r)return Object.assign({},r)}catch(e){}}
 const B=(CLS_DEF[c]||CLS_DEF.zs).at,g=agGrow(c),o={};for(const k of AG_K)o[k]=(B[k]||0)+Math.floor((g[k]||0)*(L-1)+1e-9);return o}
function agPtGold(){let g=0;const L=S.lvl||1;if((S.sp|0)>0){g+=(S.sp|0)*AG_GOLD.sp(L);S.sp=0}if((S.kp|0)>0){g+=(S.kp|0)*AG_GOLD.kp(L);S.kp=0}
 if(g){S.gold=(S.gold||0)+g;S.agGold=(S.agGold||0)+g;if(typeof log==='function'&&!window.__NOUI)try{log(`<b style="color:#ffd76a">属性/技能改为自动成长：剩余点数折合 ${g} 金币</b>`)}catch(e){}}return g}
function cqAtFix(){try{if(!S||typeof CLS_DEF==='undefined'||typeof curCls!=='function')return 0;const a=agAutoAt(curCls(),S.lvl),x=S.atb||{};S.at=S.at||{};let n=0;
 for(const k of AG_K){const v=a[k]+(x[k]|0);if(S.at[k]!==v){S.at[k]=v;n++}}if(S.sp||S.kp)agPtGold();return n}catch(e){return 0}}
{const f=calc;calc=function(){cqAtFix();return f.apply(this,arguments)}}
// ---------- 对外接口 ----------
function cqItemCls(it){if(!it||it.k)return null;const b=BASEM[it.b];return(b&&b.ccls)||null}
function cqEquipAttrs(){const o={};for(const k of SLOTS){const it=S.eq[k];if(!it)continue;const m=allMods(it),l=itemLocal(it);for(const x in m)o[x]=(o[x]||0)+m[x];if(l.min)o.atkMin=(o.atkMin||0)+l.min;if(l.max)o.atkMax=(o.atkMax||0)+l.max;if(l.def)o.def=(o.def||0)+l.def}return o}
window.CQSys={sv:()=>CQ_SV,itemCls:cqItemCls,equipAttrs:cqEquipAttrs,genItem:(lv,o)=>genItem(lv,o||{}),rollDrops:m=>rollTC(m),addItem:it=>addBag(it),
 addMat:(id,n)=>addMat(id,n),matCount:id=>matCount(id),takeMat:cqTakeMat,acts:()=>ACTS,zone:()=>ACTS[S.act||0].zones[S.zone||0],monDef:k=>MONS[k]||BOSSES[k]||null};
