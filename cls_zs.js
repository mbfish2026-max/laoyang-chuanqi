'use strict';
// ===================================================================================
// cls_zs.js — 战士（热血传奇 1.76 技能）。M1 流派：烈火单体（设计方案 §4.1）
// 核心 烈火剑法；辅助 基本剑术、攻杀剑术（协同烈火）；刺杀剑术/半月弯刀/野蛮冲撞 为通用技能（后续流派「半月群刷」「刺杀冲撞」的核心）。
// 技能等级 1–20，每级 1 技能点；需求等级按 1.76 学习顺序压缩到 M1 第一章（1–16 级）。
// 数值参考 /workspace/chuanqi/web-replica/assets/config/skill.txt（攻杀 200%→380%、烈火 400%→590% 攻击力），换算到本项目「武器伤害 +x%」口径。
// 引擎：classes.js（clsDef / CLS_TY / CLS_SKPLAN / CLS_BAL）；战场特效 cqfx = cq 序列帧目录（每次施放只播一次）。
// ===================================================================================
const clsZsTx=(p,f)=>`武器伤害 ${p>=0?'+':''}${p}%${f?`，额外 +${f} 物理`:''}`;
clsDef('zs',[
 {id:'jbjs',t:0,n:'基本剑术',r:1,col:0,ty:'passive',cat:'*',ic:'🗡',v:L=>{const d=6+3*(L-1),a=15+5*(L-1);return{dmg:d,ar:a,txt:`被动：武器伤害 +${d}%，命中 +${a}%`}}},
 {id:'gsjs',t:0,n:'攻杀剑术',r:3,col:1,ty:'hit',ic:'⚔',fx:'slash',cqfx:'gongsha',mana:L=>1,
  v:(L,sy)=>{const p=Math.round((80+12*(L-1))*sy),f=Math.round(3+2*(L-1));return{pct:p,flat:f,ar:30,txt:`蓄力重击：${clsZsTx(p,f)}，本次命中 +30%`}}},
 {id:'csjs',t:0,n:'刺杀剑术',r:7,col:2,pre:['gsjs'],ty:'mhit',ic:'🔱',fx:'slash',cqfx:'gongsha',mana:L=>2,
  v:(L,sy)=>{const p=Math.round((60+12*(L-1))*sy);return{pct:p,n:2,sure:1,txt:`隔位刺击：前两个敌人各受 ${clsZsTx(p)}，必定命中（无视防御）`}}},
 {id:'bywd',t:1,n:'半月弯刀',r:10,col:0,ty:'mall',ic:'🌙',fx:'slash',cqfx:'banyue',mana:L=>3,sm:3,syn:[['csjs'],3],
  v:(L,sy)=>{const p=Math.round((20+10*(L-1))*sy);return{pct:p,n:5,txt:`扇形横扫最多 5 个敌人：${clsZsTx(p)}`}}},
 {id:'ymcz',t:1,n:'野蛮冲撞',r:13,col:1,ty:'hit',ic:'🐂',fx:'slash',cqfx:'yemanchongzhuang',cd:8,mana:L=>4,
  v:(L,sy)=>{const p=Math.round((100+15*(L-1))*sy),st=+(1.5+0.1*(L-1)).toFixed(1);return{pct:p,stun:Math.min(3.5,st),sure:1,txt:`冲撞：${clsZsTx(p)}，击退并眩晕 ${Math.min(3.5,st)} 秒（首领免疫眩晕），冷却 8 秒`}}},
 {id:'lhjf',t:0,n:'烈火剑法',r:16,col:1,pre:['gsjs'],ty:'hit',ic:'🔥',fx:'boom',cqfx:'liehuo',cd:6,mana:L=>6,syn:[['jbjs','gsjs'],4],
  v:(L,sy)=>{const p=Math.round((400+30*(L-1))*sy),f=Math.round(10+6*(L-1));return{pct:p,flat:f,sure:1,txt:`召唤烈火附于剑上：${clsZsTx(p,f)}，必定命中，冷却 6 秒`}}},
]);
CLS_DEF.zs.sk={jbjs:1};CLS_DEF.zs.hitMana=1;CLS_DEF.zs.block=5;// 每次近战命中 +1 法力；持盾额外格挡 5
// 平衡（按等级插值）：mk 近战总系数、ek 对首领/精英额外系数
CLS_BAL.zs={mk:[[1,1],[12,1],[30,1],[60,1]],ek:[[1,1.2],[12,1.3],[30,1.3],[60,1.3]]};
CLS_SKPLAN.zs={order:['gsjs','jbjs','gsjs','jbjs','gsjs','csjs','gsjs','jbjs','bywd','gsjs','jbjs','ymcz','gsjs','jbjs','lhjf','lhjf','gsjs','lhjf','jbjs','lhjf','lhjf','gsjs'],
 fill:()=>bl('lhjf')<20?['lhjf','gsjs','jbjs']:bl('gsjs')<20?['gsjs','jbjs']:bl('jbjs')<20?['jbjs']:['bywd','csjs','ymcz']};
clsRegister();
