'use strict';
// ===================================================================================
// cls_ds.js — 道士（热血传奇 1.76 技能）。M1 流派：狗道（设计方案 §4.3）
// 核心 召唤神兽（狗，随技能等级成长，15 级起为金色神兽）；召唤骷髅为前期替身（与神兽同组，学会神兽后自动换狗）；
// 治愈术（自身+召唤物）、隐身术（怪物转打召唤物）保生存；灵魂火符/施毒术 为输出（后续「毒符」流派核心）。
// 技能等级 1–20，每级 1 技能点。数值参考 web-replica skill.txt（灵魂火符 150%+18 → 245%+1202、施毒 3→4 目标、5 秒冷却）。
// 召唤物 = ALLY.kind 'cqpet'（classes.js CLS_TY.pet），伤害吃召唤伤害加成；属性随技能等级与角色等级成长。
// ===================================================================================
// 神兽强化系数 [生命, 攻击]（石墓首领首杀过慢）
const CLS_DS_PET=[1.5,1.8];
const clsDsTx=d=>`${d[0]}-${d[1]}`;
clsDef('ds',[
 {id:'zys',t:2,n:'治愈术',r:1,col:0,ty:'heal',ic:'💚',fx:'shield',cqfx:'zhiliaoshu',cd:4,mana:L=>3+0.2*(L-1),
  v:L=>{const h=Math.round(12+6*(L-1)+(S.lvl||1)*2);return{heal:h,txt:`恢复自身 ${h} 生命、召唤物 ${Math.round(h*1.5)} 生命，冷却 4 秒`}}},
 {id:'lhhf',t:1,n:'灵魂火符',r:3,col:0,ty:'bolt',el:'magic',ic:'📜',fx:'spirit',cqfx:'linghunhuofu',mana:L=>2+0.15*(L-1),
  v:(L,sy)=>{const d=CLS_DR(5,10,2.5,3.5,L,sy);return{dmg:d,txt:`符咒攻击单体：${clsDsTx(d)} 魔法伤害`}}},
 {id:'sds',t:1,n:'施毒术',r:7,col:1,ty:'pois',ic:'☠',cqfx:'shidu',cd:4,mana:L=>3,
  v:L=>{const d=+(2.5+1.4*(L-1)).toFixed(1),n=L>=15?4:3,dd=Math.min(35,12+L);return{dps:d,dur:8,n,dd,txt:`对 ${n} 个敌人施毒：绿毒每秒 ${d} 伤害（8 秒），红毒防御 -${dd}%，冷却 4 秒`}}},
 {id:'zhkl',t:0,n:'召唤骷髅',r:10,col:0,ty:'pet',g:'dspet',ic:'💀',cqfx:'zhaohuan',cd:3,mana:L=>8,
  v:L=>{const lv=S.lvl||1,hp=Math.round(40+12*(L-1)+lv*6),a=Math.round(2+1.2*(L-1)+lv*0.5);return{hp,pd:[a,Math.round(a*1.8)],max:1,pn:'骷髅',txt:`召唤 1 只骷髅：生命 ${hp}、攻击 ${a}-${Math.round(a*1.8)}（与神兽只能存在其一）`}}},
 {id:'ysh',t:2,n:'隐身术',r:13,col:1,ty:'buff',g:'ysh',ic:'👻',fx:'shield',mana:L=>5,
  v:L=>{const d=Math.min(60,25+2*(L-1)),t=20+2*(L-1);return{dodge:d,dur:t,txt:`隐身：${d}% 几率不被怪物命中（怪物转攻召唤物），持续 ${t} 秒`}}},
 {id:'zhss',t:0,n:'召唤神兽',r:16,col:1,pre:['zhkl'],ty:'pet',g:'dspet',ic:'🐕',cqfx:'zhaohuan',cd:3,mana:L=>12,
  v:L=>{const lv=S.lvl||1,hp=Math.round((120+30*(L-1)+lv*12)*CLS_DS_PET[0]),a=Math.round((6+2.6*(L-1)+lv*1.1)*CLS_DS_PET[1]),gold=L>=15;return{hp,pd:[a,Math.round(a*1.7)],el:'fire',th:10,max:1,pn:gold?'金色神兽':'神兽',
   txt:`召唤${gold?'金色':''}神兽：生命 ${hp}、火焰攻击 ${a}-${Math.round(a*1.7)}，反伤 10%（15 级起为金色神兽）`}}},
]);
CLS_DEF.ds.sk={lhhf:1};
CLS_BAL.ds={dk:[[1,1],[12,1.1],[30,1.25],[60,1.25]],ek:[[1,1.2],[12,1.5],[30,1.6],[60,1.6]]};
CLS_SKPLAN.ds={order:['lhhf','zys','lhhf','lhhf','sds','lhhf','zhkl','zhkl','lhhf','zhkl','ysh','zhkl','zhss','zhss','zhss','zhss','zhss','sds','zhss','zhss','zys','zhss'],
 fill:()=>bl('zhss')<20?['zhss','zys']:bl('sds')<20?['sds','lhhf']:bl('lhhf')<20?['lhhf']:['zys','ysh','zhkl']};
clsRegister();
