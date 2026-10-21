'use strict';
// cq/balance.js — 数值框架（方案 §9）。在 data_cq.js 之后加载；其他系统只读这里的常量。
const CQ_BAL={
 lvlCap:60,rebirthMax:10,
 // 战力上限：基准 1.0 = 对应档 6 件套 + 同档极品武器、无强化；所有加成乘法叠满 ≤ 1.8
 cap:1.8,
 // hero = 英雄普攻 + 合击 占总伤害的上限比例（不参与连乘；战斗侧按 cqHeroShareOk 校验 / cqHeroDmgCap 截断）
 budget:{enh:0.35,anc:0.15,soul:0.10,rf:0.05,reb:0.10,title:0.05,hero:0.20},
 // 强化（§5.4）
 enh:{max:9,rate:[100,90,80,65,50,40,30,20,12],pct:[4,4,4,6,6,6,8,8,8],gold:n=>500*(n+1)*(n+1),ore:n=>n+1},
 // 掉落节奏目标（地狱）：每小时极品/套装 1–2、每 10 小时上古 1、每 100 小时至臻 1
 dropTarget:{eliteSetPerH:[1,2],ancPerH:0.1,myPerH:0.01},
 // 通关时长目标（小时）
 clearHours:{normal:12,nightmare:20,hell:30,ultimate:8},
 // 仓库（§5.8）
 stash:{p0:2,pMax:6,s0:2,sMax:8,sFree:2,pCost:p=>100000*p*p,sCost:p=>500000*p},
};
// 乘法叠满的总倍率（用于测试与调参自检）
function cqBudgetProduct(){let p=1;for(const k in CQ_BAL.budget)if(k!=='hero')p*=1+CQ_BAL.budget[k];return p}
// 强化累计加成百分比（+n）
function cqEnhPct(n){let s=0;for(let i=0;i<Math.min(n||0,CQ_BAL.enh.max);i++)s+=CQ_BAL.enh.pct[i];return s}
function cqCapMul(p){return Math.min(CQ_BAL.cap,p)}

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
CQ_BAL.book={boss:0.15,actboss:0.3,elite:0.02,normal:0.002,ownCls:0.7};
// 召唤物：属性 = (道术|魔法) × 系数 × (1 + 技能等级×lvK)；伤害占比上限（召唤流，src 'cqpet'）
CQ_BAL.summon={dog:{hp:12,atk:1.1,def:0.5},skel:{hp:7,atk:0.8,def:0.3},pet:{hp:1.0,atk:1.0,def:1.0},lvK:0.06,attrLv:0.8,revive:60,share:0.6,petMax:2};
