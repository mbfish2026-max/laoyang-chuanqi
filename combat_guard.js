'use strict';
// 防卡死保底；战斗防护统一由 acts.js 的防御/魔御计算。
const CG={STUCK:45,n:0};
{const f=stuckTick;stuckTick=function(dt){f(dt);if(S.auto||(typeof EGM!=='undefined'&&EGM)||!(ACX.st>CG.STUCK))return;
 ACX.st=0;CG.n++;try{if(typeof log==='function')log('<b style="color:#f84">久战不下，重整本波</b>')}catch(e){}MON=[];spawnT=0.5}}

// 普通攻击的魔御入口；装备自身魔御由原函数处理，任务魔御按固定防护值结算。
if(window.CQMir2Equip){const f=CQMir2Equip.magicGuard;CQMir2Equip.magicGuard=function(v,el,eq){const n=f.call(this,v,el==='pois'?'magic':el,eq);if(!(n>0))return n;return Math.max(1,n*100/(100+((S&&S.bon&&S.bon.mdef)||0)))}}

{const f=calc;calc=function(){const o=f.apply(this,arguments);if(S){cqMetaParaDefense();for(const k in o.res)o.res[k]=0}return o}}
