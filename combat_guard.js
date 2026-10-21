'use strict';
// combat_guard.js — 战斗保底（替代已删除的 immfloor.js，legacy_prune C10 后由总控批准重建，系统侧）
// 1) 有效抗性封顶 80：老羊传奇第 1~3 章的头目/精英（噩梦起的免疫词缀）及第 4/5 章怪物抗性可达 100（免疫 → 伤害 0），
//    物理职业打不动会整波卡住。任何伤害类型有效抗性最高 80（至少吃 20% 伤害）；诅咒等 -抗 先生效再封顶。
// 2) 原地挂机卡波保底：acts.js stuckTick 只在自动推进（S.auto）时撤退；原地挂机（S.auto=0）同一波 45 秒
//    无击杀、怪物总血量无下降（ACX.st，stuckTick 维护）则清掉本波、0.5 秒后刷新一波。终局模式（EGM）不处理。
const CG={RES_CAP:80,STUCK:45,n:0};
{const f=resOf;resOf=function(m,k){const r=f(m,k);return r>CG.RES_CAP?CG.RES_CAP:r}}
{const f=stuckTick;stuckTick=function(dt){f(dt);if(S.auto||(typeof EGM!=='undefined'&&EGM)||!(ACX.st>CG.STUCK))return;
 ACX.st=0;CG.n++;try{if(typeof log==='function')log('<b style="color:#f84">久战不下，重整本波</b>')}catch(e){}MON=[];spawnT=0.5}}
