'use strict';
// prune_mig.js — legacy_prune 批次2：符文 / 宝石 / 护身符 / 珠宝 / 炼金匣 已删除后的旧存档清理（每次载入都跑，幂等）
// 规则（docs/legacy_prune_plan.md §批次2）：
//  · 背包 / 个人储物箱 S.stash / 个人仓库 S.pst / 共享仓库 ACCT.shared / 身上 S.eq / 英雄 S.hero.eq 里的
//    符文(k:'rune') 宝石(k:'gem') 护身符(cha_s/m/l) 珠宝(jew) 整件移除，按旧卖价折金币：符文 50×(号+1)，宝石 20×(级+1)，护身符/珠宝 200
//  · 装备上已镶嵌的符文/宝石/珠宝：拆掉销毁并同样折金币，凹槽清零（it.sock=0, it.soc=[]）
//  · 符文之语：保留物品本体、去掉符文之语（删 it.rw / it.rwm，白/灰底材名字恢复底材名）
//  · 金币加到当前角色 S.gold；累计记在 S.cqPruneG（便于追溯），不动其它字段
const PRUNE_B=new Set(['jew','cha_s','cha_m','cha_l']);
function pruneBad(it){if(!it||typeof it!=='object')return false;if(it.k==='rune'||it.k==='gem'||it.k==='jewel'||it.k==='charm')return true;
 if(it.k)return false;if(PRUNE_B.has(it.b))return true;const b=typeof BASEM!=='undefined'&&BASEM[it.b];return!!(b&&(b.s==='charm'||b.s==='jewel'))}
function pruneVal(it){if(!it)return 0;if(it.k==='rune'||it.r!=null&&!it.k&&!it.b)return 50*((+it.r||0)+1);if(it.k==='gem'||it.g!=null&&!it.b)return 20*((+it.lv||0)+1);return 200}
// 清理一件留下的装备：拆镶嵌物、去符文之语；返回折算金币
function pruneFix(it){if(!it||it.k)return 0;let g=0;
 if(Array.isArray(it.soc)&&it.soc.length){for(const x of it.soc)g+=x&&x.j?200:x&&x.r!=null?50*((+x.r||0)+1):x&&x.g!=null?20*((+x.lv||0)+1):0;it.soc=[]}
 if(it.sock)it.sock=0;if(!Array.isArray(it.soc))it.soc=[];
 if(it.rw!=null||it.rwm){delete it.rw;delete it.rwm;const b=typeof BASEM!=='undefined'&&BASEM[it.b];if(b&&(it.q===1||it.q===2||it.q===0))it.name=b.n}
 return g}
function pruneArr(a){if(!Array.isArray(a))return 0;let g=0;for(let i=a.length-1;i>=0;i--){if(pruneBad(a[i])){g+=pruneVal(a[i]);a.splice(i,1)}else g+=pruneFix(a[i])}return g}
function pruneObj(o){if(!o||typeof o!=='object')return 0;let g=0;for(const k of Object.keys(o)){const it=o[k];if(pruneBad(it)){g+=pruneVal(it);delete o[k]}else g+=pruneFix(it)}return g}
// fork 前（S.sv<1）的存档交给 cq/sys_cq.js 的 v1 迁移统一折算，这里跳过以免重复计金
function pruneSave(){if(typeof S==='undefined'||!S||!(S.sv>=1))return 0;let g=0;
 g+=pruneArr(S.bag);g+=pruneArr(S.stash);if(Array.isArray(S.pst))for(const p of S.pst)g+=pruneArr(p);
 g+=pruneObj(S.eq);if(S.hero&&S.hero.eq)g+=pruneObj(S.hero.eq);
 let sh=0;try{if(typeof ACCT!=='undefined'&&ACCT&&Array.isArray(ACCT.shared))for(const p of ACCT.shared)sh+=pruneArr(p)}catch(e){}
 g+=sh;if(g>0){S.gold=(S.gold||0)+g;S.cqPruneG=(S.cqPruneG||0)+g;try{if(typeof log==='function')log('旧版符文/宝石/护身符已移除，折合 '+g+' 金币')}catch(e){}
  if(sh>0)try{if(typeof acctSave==='function')acctSave()}catch(e){}}
 return g}
{const f=load;load=function(){const r=f.apply(this,arguments);try{pruneSave()}catch(e){console.warn('pruneSave',e)}return r}}
