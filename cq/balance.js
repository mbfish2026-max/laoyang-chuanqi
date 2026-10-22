'use strict';
// cq/balance.js — 数值框架（方案 §9）。在 data_cq.js 之后加载；其他系统只读这里的常量。
const CQ_BAL={
 lvlCap:60,rebirthMax:10,
 // 战力上限：基准 1.0 = 对应档 6 件套 + 同档极品武器、无强化；所有加成乘法叠满 ≤ 1.8
 cap:1.8,
 // hero = 英雄普攻 + 合击 占总伤害的上限比例（不参与连乘；战斗侧按 cqHeroShareOk 校验 / cqHeroDmgCap 截断）
 budget:{enh:0.35,anc:0.15,soul:0.10,rf:0.05,reb:0.10,title:0.05,hero:0.25},
 // 强化（§5.4）
 enh:{max:9,rate:[100,90,80,65,50,40,30,20,12],pct:[4,4,4,6,6,6,8,8,8],gold:n=>250*(n+1)**2,ore:n=>n+1},
 // 掉落节奏目标（地狱）：每小时极品/套装 1–2、每 10 小时上古 1、每 100 小时至臻 1
 dropTarget:{eliteSetPerH:[1,2],ancPerH:0.1,myPerH:0.01},
 // 通关时长目标（小时）
 clearHours:{normal:12,nightmare:20,hell:30,ultimate:8},
 // 仓库（§5.8）
 stash:{p0:2,pMax:6,s0:2,sMax:8,sFree:2,pCost:p=>100000*p*p,sCost:p=>500000*p},
};
// 自动消耗节流（仅挂机自动买药；随从自动复活不受限）：只动玩家侧花费，不削怪物/首领。
// 自动吃红药/瞬回仅在 HP 低于 hpMax% 时；花费后金币不低于 floor(lvl)；近期自动花费 ≤ 近期收入 × share + base（新角色固定起步额度）
// on=0（默认，3h 消融 B 方案最优）：节流关闭，阈值上限回到 95%；on=1 启用下列参数
CQ_BAL.spend={on:0,hpMax:55,share:0.5,base:2000,floor:lv=>300+(lv|0)*60,win:lv=>20000+(lv|0)*2000};
function cqSpL(){if(typeof S==='undefined'||!S)return{inc:0,sp:0};if(!S.cqSp||typeof S.cqSp!=='object')S.cqSp={inc:0,sp:0};return S.cqSp}
// 记录收入；累计超过窗口时收入/花费同比减半 → 近似“近期”滑动窗口
function cqInc(g){g=+g||0;if(g<=0)return;const L=cqSpL();L.inc+=g;const W=CQ_BAL.spend.win(S.lvl);while(L.inc>W){L.inc/=2;L.sp/=2}}
// 自动花费 c 金是否允许（不扣钱）；cqSpend 允许则记账并扣钱，返回 true/false
function cqSpendOk(c){c=+c||0;const B=CQ_BAL.spend;if(!B.on||typeof S==='undefined'||!S)return true;const L=cqSpL();
 if(S.gold-c<B.floor(S.lvl))return false;return L.sp+c<=L.inc*B.share+B.base}
function cqSpend(c){if(!cqSpendOk(c))return false;S.gold-=c;cqSpL().sp+=c;return true}
// 乘法叠满的总倍率（用于测试与调参自检）
function cqBudgetProduct(){let p=1;for(const k in CQ_BAL.budget)if(k!=='hero')p*=1+CQ_BAL.budget[k];return p}
// 强化累计加成百分比（+n）
function cqEnhPct(n){let s=0;for(let i=0;i<Math.min(n||0,CQ_BAL.enh.max);i++)s+=CQ_BAL.enh.pct[i];return s}
function cqCapMul(p){return Math.min(CQ_BAL.capMul||1.8,p)}

// M1 系统接口数值（docs/systems_api.md）：英雄占位系数、暴击倍率、首领刷新/狂暴（秒）
CQ_BAL.hero={k:0.35,hp0:40,takesDmg:0,cls:{zs:{atk:1.2,def:0.8,hp:14},fs:{atk:1.5,def:0.4,hp:8},ds:{atk:1.0,def:0.6,hp:10}}};
CQ_BAL.critMul=1.5;
CQ_BAL.boss={respawn:60,enrage:90,enrMul:1.5};
// 英雄伤害占比：share = (英雄普攻 + 合击) / 总伤害；超过 CQ_BAL.budget.hero 即违规
function cqHeroShare(heroDmg,hejiDmg,totalDmg){const h=(+heroDmg||0)+(+hejiDmg||0),t=+totalDmg||0;return t>0?h/t:0}
function cqHeroShareOk(heroDmg,hejiDmg,totalDmg){return cqHeroShare(heroDmg,hejiDmg,totalDmg)<=CQ_BAL.budget.hero+1e-9}
// 给定玩家本体伤害 P，英雄+合击允许的最大伤害：x/(P+x) ≤ s → x ≤ P·s/(1-s)
function cqHeroDmgCap(playerDmg){const s=CQ_BAL.budget.hero;return Math.max(0,(+playerDmg||0)*s/(1-s))}

// ---------- M2 数值（docs/systems_api.md） ----------
// 首领真实时间刷新（秒）：小首领 10 分钟、章节首领 30–60 分钟（§7.3）；离线：上限 8 小时，英雄击杀 = 本体离线击杀 × heroK，离线首领胜负按战力，掉落折半，最多 bossMax 次
CQ_BAL.bossRt={small:600,act:1800,actLate:3600};
CQ_BAL.off={maxH:8,heroK:0.2,bossMax:6,bossDrop:0.5,winPow:0.8};
// 技能书：每次击杀掉落几率；本职业书占比
// 技能书：掉率 + 原版 skill.txt 升级规则（9 级；需求等级每级 +3；书 1,2,3,5,10,20,30,40,45 本；熟练度原版表）
CQ_BAL.book={boss:0.4,actboss:0.45,elite:0.1,normal:0.02,ownCls:0.85,maxLv:9,lvStep:3,cnt:[1,2,3,5,10,20,30,40,45],exp:[1000,2000,5000,10000,16000,25000,30000,40000,50000],expK:1};// 规则本体在 classes.js clsSkReq（职业侧），此处仅兜底
// 召唤物：属性 = (道术|魔法) × 系数 × (1 + 技能等级×lvK)；伤害占比上限（召唤流，src 'cqpet'）
CQ_BAL.summon={dog:{hp:12,atk:1.1,def:0.5},skel:{hp:7,atk:0.8,def:0.3},pet:{hp:1.0,atk:1.0,def:1.0},lvK:0.06,attrLv:0.8,revive:60,share:0.6,petMax:2};

// ---------- 实际伤害封顶（M2）：总加成倍率 ≤ CQ_BAL.capMul ----------
// CQ_BAL.cap(dmg, ctx) → 封顶后的伤害数值。ctx = {src:'player'|'hero'|'combo'|'summon', base?:未加成伤害, mul?:已乘总倍率}，字段可缺：
//   有 base → min(dmg, base×capMul)；否则有 mul → mul>capMul 时 dmg×capMul/mul；都没有 → 用当前角色实测总倍率 CQ_BAL.curMul(src)（见 cq/cap_cq.js），再无则原样返回。
CQ_BAL.capMul=1.8;
CQ_BAL.cap=function(dmg,ctx){dmg=+dmg||0;if(dmg<=0)return dmg;ctx=ctx||{};const C=CQ_BAL.capMul;
 if(+ctx.base>0)return Math.min(dmg,ctx.base*C);let m=+ctx.mul;if(!(m>0)&&typeof CQ_BAL.curMul==='function')m=CQ_BAL.curMul(ctx.src||'player');
 return m>C?dmg*C/m:dmg};
