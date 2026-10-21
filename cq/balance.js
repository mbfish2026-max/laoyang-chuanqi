'use strict';
// cq/balance.js — 数值框架（方案 §9）。在 data_cq.js 之后加载；其他系统只读这里的常量。
const CQ_BAL={
 lvlCap:60,rebirthMax:10,
 // 战力上限：基准 1.0 = 对应档 6 件套 + 同档极品武器、无强化；所有加成乘法叠满 ≤ 1.8
 cap:1.8,
 budget:{enh:0.35,anc:0.15,soul:0.10,rf:0.05,reb:0.10,title:0.05},
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
function cqBudgetProduct(){let p=1;for(const k in CQ_BAL.budget)p*=1+CQ_BAL.budget[k];return p}
// 强化累计加成百分比（+n）
function cqEnhPct(n){let s=0;for(let i=0;i<Math.min(n||0,CQ_BAL.enh.max);i++)s+=CQ_BAL.enh.pct[i];return s}
function cqCapMul(p){return Math.min(CQ_BAL.cap,p)}
