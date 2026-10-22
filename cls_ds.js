'use strict';
// ===================================================================================
// cls_ds.js — 道士（热血传奇 1.76 技能）。M1 流派：狗道（设计方案 §4.3）
// 核心 召唤神兽（狗，随技能等级成长，7 级起为金色神兽）；召唤骷髅为前期替身（与神兽同组，学会神兽后自动换狗）；
// 治愈术（自身+召唤物）、隐身术（怪物转打召唤物）保生存；灵魂火符/施毒术 为输出（后续「毒符」流派核心）。
// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（灵魂火符 150%+18 → 245%+1202、施毒 3→4 目标、5 秒冷却）。
// 召唤物 = ALLY.kind 'cqpet'（classes.js CLS_TY.pet），伤害吃召唤伤害加成；属性随技能等级与角色等级成长。
// ===================================================================================
// 神兽强化系数 [生命, 攻击]（石墓首领首杀过慢）
const CLS_DS_PET=[1.5,1.8];
const clsDsTx=d=>`${d[0]}-${d[1]}`;
clsDef('ds',[
 {id:'zys',t:2,n:'治愈术',r:1,col:0,ty:'heal',ic:'💚',fx:'shield',cqfx:'zhiliaoshu',cd:4,mana:L=>3+0.2*(L-1),
  v:L=>{const h=Math.round(12+6*(L-1)+combatLevel()*2);return{heal:h,txt:`恢复自身 ${h} 生命、召唤物 ${Math.round(h*1.5)} 生命，冷却 4 秒`}}},
 {id:'lhhf',t:1,n:'灵魂火符',r:3,col:0,ty:'bolt',el:'magic',ic:'📜',fx:'spirit',cqfx:'linghunhuofu',mana:L=>2+0.15*(L-1),
  v:(L,sy)=>{const d=CLS_DR(5,10,2.5,3.5,L,sy);return{dmg:d,txt:`符咒攻击单体：${clsDsTx(d)} 魔法伤害`}}},
 {id:'sds',t:1,n:'施毒术',r:7,col:1,ty:'pois',ic:'☠',cqfx:'shidu',cd:4,mana:L=>3,
  v:L=>{const d=+(2.5+1.4*(L-1)).toFixed(1),n=L>=15?4:3,dd=Math.min(35,12+L);return{dps:d,dur:8,n,dd,txt:`对 ${n} 个敌人施毒：绿毒每秒 ${d} 伤害（8 秒），红毒防御 -${dd}%，冷却 4 秒`}}},
 {id:'zhkl',t:0,n:'召唤骷髅',r:10,col:0,ty:'pet',g:'dspet',ic:'💀',cqfx:'zhaohuan',cd:3,mana:L=>8,
  v:L=>{const lv=combatLevel(),hp=Math.round(40+12*(L-1)+lv*6),a=Math.round(2+1.2*(L-1)+lv*0.5);return{hp,pd:[a,Math.round(a*1.8)],max:1,pn:'骷髅',txt:`召唤 1 只骷髅：生命 ${hp}、攻击 ${a}-${Math.round(a*1.8)}（与神兽只能存在其一）`}}},
 {id:'ysh',t:2,n:'隐身术',r:13,col:1,ty:'buff',g:'ysh',ic:'👻',fx:'shield',mana:L=>5,
  v:L=>{const d=Math.min(60,25+2*(L-1)),t=20+2*(L-1);return{dodge:d,dur:t,txt:`隐身：${d}% 几率不被怪物命中（怪物转攻召唤物），持续 ${t} 秒`}}},
 {id:'zhss',t:0,n:'召唤神兽',r:16,col:1,pre:['zhkl'],ty:'pet',g:'dspet',ic:'🐕',cqfx:'zhaohuan',cd:3,mana:L=>12,
  v:L=>{const lv=combatLevel(),hp=Math.round((120+30*(L-1)+lv*12)*CLS_DS_PET[0]),a=Math.round((6+2.6*(L-1)+lv*1.1)*CLS_DS_PET[1]),gold=L>=7;return{hp,pd:[a,Math.round(a*1.7)],el:'fire',th:10,max:1,pn:gold?'金色神兽':'神兽',
   txt:`召唤${gold?'金色':''}神兽：生命 ${hp}、火焰攻击 ${a}-${Math.round(a*1.7)}，反伤 10%（7 级起为金色神兽）`}}},
]);
CLS_DEF.ds.sk={lhhf:1};
CLS_BAL.ds={dk:[[1,1],[12,1.1],[30,1.25],[60,1.25]],ek:[[1,1.2],[12,1.5],[30,1.6],[60,1.6]]};
// 技能书规则（原版传奇之旅 skill.txt 对照；需求/书数/熟练度见 classes.js clsSkReq）
clsBookRule('ds',{zys:{oid:104002,on:'治愈术',or:7,exp:'A'},lhhf:{oid:104012,on:'灵魂火符',or:7},sds:{oid:104007,on:'施毒术',or:13},zhkl:{oid:104025,on:'召唤骷髅',or:17},ysh:{oid:104026,on:'隐身术',or:22,exp:'A'},zhss:{oid:104020,on:'召唤神兽',or:35}});
clsRegister();

// 召唤物生命加成（原 summon_surv.js，系统开发删除该文件后由职业文件补回，公式/条件不变）：学了 xd_wild 时 ST.sumlife += min(60, 10+3*(L-1))
{const f=calc;calc=function(...a){const r=f.apply(this,a);try{if(ST&&typeof bl==='function'&&bl('xd_wild')&&typeof slvl==='function'){const L=slvl('xd_wild');ST.sumlife=(ST.sumlife||0)+Math.min(60,10+3*(L-1))}}catch(e){}return r}}

function clsMir2Ds(){
// Mir2 扩展：倍率/未知耗蓝为本游戏设计值；新增技能 1/4/7 级对应原版三级。
clsDef('ds',[
 {id:'jslzf',n:'精神力战法',r:9,t:2,col:1,ty:'passive',el:'phys',ic:'✦',cqfx:'gongsha',cd:6,mana:()=>0,mir2:true,cat:'*',v:(L,sy)=>{return{ar:3+(L-1)*5/6,txt:'精神力战法：提高命中 '+(3+(L-1)*5/6).toFixed(1)+'%'}}},
 {id:'jtys',n:'集体隐身术',r:21,t:2,col:1,ty:'buff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>15,mir2:true,g:'ysh',v:(L,sy)=>{return{dodge:15+L*2,dur:12+L,txt:'集体隐身术：增强护持，持续 '+(12+L)+' 秒'}}},
 {id:'yld',n:'幽灵盾',r:22,t:2,col:1,ty:'buff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>18,mir2:true,g:'yld',v:(L,sy)=>{return{res:15+L*2,dur:12+L,txt:'幽灵盾：增强护持，持续 '+(12+L)+' 秒'}}},
 {id:'sszjs',n:'神圣战甲术',r:25,t:2,col:1,ty:'buff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>20,mir2:true,g:'sszjs',v:(L,sy)=>{return{def:15+L*2,dur:12+L,txt:'神圣战甲术：增强护持，持续 '+(12+L)+' 秒'}}},
 {id:'xlqs',n:'心灵启示',r:26,t:2,col:1,ty:'debuff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>12,mir2:true,v:(L,sy)=>{return{dur:5+L/3,stun:0,dd:8+L,txt:'心灵启示：'+"洞察目标弱点，降低防御"}}},
 {id:'kmz',n:'困魔咒',r:28,t:2,col:1,ty:'debuff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>25,mir2:true,v:(L,sy)=>{return{dur:5+L/3,stun:1+L/12,dd:0,txt:'困魔咒：'+"困住普通怪物，首领免疫控制"}}},
 {id:'qtzls',n:'群体治疗术',r:33,t:2,col:1,ty:'heal',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>30,mir2:true,v:(L,sy)=>{return{heal:30+L*8+combatLevel()*2,txt:'群体治疗术：恢复自己、英雄和召唤物生命'}}},
 {id:'qgb',n:'气功波',r:29,t:2,col:1,ty:'aoe',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>20,mir2:true,v:(L,sy)=>{const d=CLS_DR(12,24,3,5,L,sy);return{dmg:d,n:5,slow:3,stun:1,txt:'气功波：'+d.join('-')+'点伤害'}}},
 {id:'wjzq',n:'无极真气',r:36,t:2,col:1,ty:'buff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>40,mir2:true,g:'wjzq',v:(L,sy)=>{return{sdmg:15+L*2,dur:12+L,txt:'无极真气：增强护持，持续 '+(12+L)+' 秒'}}},
 {id:'sxs',n:'噬血术',r:47,t:2,col:1,ty:'bolt',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>35,mir2:true,v:(L,sy)=>{const d=CLS_DR(30,50,7,10,L,sy);return{dmg:d,n:5,txt:'噬血术：'+d.join('-')+'点伤害'}}},
 {id:'zhyl',n:'召唤月灵',r:45,t:2,col:1,ty:'pet',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>45,mir2:true,heroOnly:true,v:(L,sy)=>{const a=8+L*2+combatLevel();return{hp:180+L*35,pd:[a,a*2],max:1,pn:'月灵',el:'magic',txt:'召唤月灵：召唤独立伙伴'}}},
]);
clsBookRule('ds',{jslzf:{on:'精神力战法',or:9},jtys:{on:'集体隐身术',or:21},yld:{on:'幽灵盾',or:22},sszjs:{on:'神圣战甲术',or:25},xlqs:{on:'心灵启示',or:26},kmz:{on:'困魔咒',or:28},qtzls:{on:'群体治疗术',or:33},qgb:{on:'气功波',or:29},wjzq:{on:'无极真气',or:36},sxs:{on:'噬血术',or:47},zhyl:{on:'召唤月灵',or:45}});
clsRegister();
{const f=CLS_TY.bolt;CLS_TY.bolt=function(s,v,ms,tg){const before=tg&&tg.hp||0,out=f.apply(this,arguments);if(s.id==='sxs'){const h=Math.max(0,before-(tg&&tg.hp||0))*.15;H.life=Math.min(ST.life,H.life+h);floatHero('噬血 +'+Math.round(h),'#6f6')}return out}}
{const f=CLS_TY.heal;CLS_TY.heal=function(s,v){const out=f.apply(this,arguments);if(s.id==='qtzls'&&window.CQ&&CQ.heroCore&&CQ.heroCore()){const u=CQ.heroCore().unit;if(u)u.hp=Math.min(u.maxhp,u.hp+v.heal)}return out}}

}
