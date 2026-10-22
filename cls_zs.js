'use strict';
// ===================================================================================
// cls_zs.js — 战士（热血传奇 1.76 技能）。M1 流派：烈火单体（设计方案 §4.1）
// 核心 烈火剑法；辅助 基本剑术、攻杀剑术（协同烈火）；刺杀剑术/半月弯刀/野蛮冲撞 为通用技能（后续流派「半月群刷」「刺杀冲撞」的核心）。
// 技能书最高 9 级，不分配技能点；需求等级按 1.76 学习顺序压缩到 M1 第一章（1–16 级）。
// 数值参考 /workspace/chuanqi/web-replica/assets/config/skill.txt（攻杀 200%→380%、烈火 400%→590% 攻击力），换算到本项目「武器伤害 +x%」口径。
// 引擎：classes.js（clsDef / CLS_TY / clsBookRule / CLS_BAL）；战场特效 cqfx = cq 序列帧目录（每次施放只播一次）。
// ===================================================================================
// 战士技能伤害统一系数（主动技能武器伤害%/固定伤害、基本剑术伤害加成；命中/眩晕/冷却不乘）
const CLS_ZS_K=1.25;
// 基本剑术附带吸血（1.76 无单独吸血技能，并入剑术被动）：[1 级, 上限] %
const CLS_ZS_LL=[3,5];
const clsZsTx=(p,f)=>`武器伤害 ${p>=0?'+':''}${p}%${f?`，额外 +${f} 物理`:''}`;
clsDef('zs',[
 {id:'jbjs',t:0,n:'基本剑术',r:1,col:0,ty:'passive',cat:'*',ic:'🗡',v:L=>{const d=Math.round((6+3*(L-1))*CLS_ZS_K),a=15+5*(L-1),ll=+Math.min(CLS_ZS_LL[1],CLS_ZS_LL[0]+0.25*(L-1)).toFixed(1);return{dmg:d,ar:a,ll,txt:`被动：武器伤害 +${d}%，命中 +${a}%，技能伤害 ${ll}% 转为生命`}}},
 {id:'gsjs',t:0,n:'攻杀剑术',r:3,col:1,ty:'hit',ic:'⚔',fx:'slash',cqfx:'gongsha',mana:L=>1,
  v:(L,sy)=>{const p=Math.round((80+12*(L-1))*sy*CLS_ZS_K),f=Math.round((3+2*(L-1))*CLS_ZS_K);return{pct:p,flat:f,ar:30,txt:`蓄力重击：${clsZsTx(p,f)}，本次命中 +30%`}}},
 {id:'csjs',t:0,n:'刺杀剑术',r:7,col:2,pre:['gsjs'],ty:'mhit',ic:'🔱',fx:'slash',cqfx:'gongsha',mana:L=>2,
  v:(L,sy)=>{const p=Math.round((60+12*(L-1))*sy*CLS_ZS_K);return{pct:p,n:2,sure:1,txt:`隔位刺击：前两个敌人各受 ${clsZsTx(p)}，必定命中（无视防御）`}}},
 {id:'bywd',t:1,n:'半月弯刀',r:10,col:0,ty:'mall',ic:'🌙',fx:'slash',cqfx:'banyue',mana:L=>3,sm:3,syn:[['csjs'],3],
  v:(L,sy)=>{const p=Math.round((20+10*(L-1))*sy*CLS_ZS_K);return{pct:p,n:5,txt:`扇形横扫最多 5 个敌人：${clsZsTx(p)}`}}},
 {id:'ymcz',t:1,n:'野蛮冲撞',r:13,col:1,ty:'hit',ic:'🐂',fx:'slash',cqfx:'yemanchongzhuang',cd:8,mana:L=>4,
  v:(L,sy)=>{const p=Math.round((100+15*(L-1))*sy*CLS_ZS_K),st=+(1.5+0.1*(L-1)).toFixed(1);return{pct:p,stun:Math.min(3.5,st),sure:1,txt:`冲撞：${clsZsTx(p)}，击退并眩晕 ${Math.min(3.5,st)} 秒（首领免疫眩晕），冷却 8 秒`}}},
 {id:'lhjf',t:0,n:'烈火剑法',r:16,col:1,pre:['gsjs'],ty:'hit',ic:'🔥',fx:'boom',cqfx:'liehuo',cd:6,mana:L=>6,syn:[['jbjs','gsjs'],4],
  v:(L,sy)=>{const p=Math.round((400+30*(L-1))*sy*CLS_ZS_K),f=Math.round((10+6*(L-1))*CLS_ZS_K);return{pct:p,flat:f,sure:1,txt:`召唤烈火附于剑上：${clsZsTx(p,f)}，必定命中，冷却 6 秒`}}},
]);
CLS_DEF.zs.sk={jbjs:1};CLS_DEF.zs.lpv=7;CLS_DEF.zs.lpl=4;CLS_DEF.zs.lifePct=50;// 有效生命约 ×2：每点体力生命 4→7、每级 2→4、职业生命 +50%
CLS_DEF.zs.hitMana=1;CLS_DEF.zs.block=5;// 每次近战命中 +1 法力；持盾额外格挡 5
// 平衡（按等级插值）：mk 近战总系数、ek 对首领/精英额外系数
CLS_BAL.zs={mk:[[1,1],[12,1],[30,1],[60,1]],ek:[[1,1.2],[12,1.3],[30,1.3],[60,1.3]]};
// 技能书规则（原版传奇之旅 skill.txt 对照；需求/书数/熟练度见 classes.js clsSkReq）
clsBookRule('zs',{jbjs:{oid:104003,on:'基本剑术',or:7,exp:'A'},gsjs:{oid:104006,on:'攻杀剑术',or:17,exp:'A'},csjs:{oid:104015,on:'刺杀剑术',or:25,exp:[800,2000,5000,10000,16000,25000,30000,40000,50000,60000]},bywd:{oid:104033,on:'半月弯刀',or:28,exp:[600,2000,5000,10000,16000,25000,30000,40000,50000,60000]},ymcz:{oid:104017,on:'野蛮冲撞',or:30,exp:[600,2000,5000,10000,16000,25000,30000,40000,50000,60000]},lhjf:{oid:104016,on:'烈火剑法',or:35}});
clsRegister();

function clsMir2Zs(){
// Mir2 扩展：倍率/未知耗蓝为本游戏设计值；新增技能 1/4/7 级对应原版三级。
clsDef('zs',[
 {id:'szh',n:'狮子吼',r:38,t:2,col:1,ty:'mall',el:'phys',ic:'✦',cqfx:'gongsha',cd:6,mana:()=>20,mir2:true,v:(L,sy)=>{return{pct:0,n:5,stun:1+L/12,txt:'狮子吼：震慑普通怪物，首领免疫控制'}}},
 {id:'zrjf',n:'逐日剑法',r:47,t:2,col:1,ty:'mhit',el:'phys',ic:'✦',cqfx:'gongsha',cd:6,mana:()=>25,mir2:true,v:(L,sy)=>{return{pct:350+L*25,n:5,stun:0,txt:'逐日剑法：直线剑气伤害'}}},
 {id:'ktz',n:'开天斩',r:45,t:2,col:1,ty:'mhit',el:'phys',ic:'✦',cqfx:'gongsha',cd:6,mana:()=>25,mir2:true,heroOnly:true,v:(L,sy)=>{return{pct:350+L*25,n:5,stun:0,txt:'开天斩：直线剑气伤害'}}},
]);
clsBookRule('zs',{szh:{on:'狮子吼',or:38},zrjf:{on:'逐日剑法',or:47},ktz:{on:'开天斩',or:45}});
clsRegister();

}
