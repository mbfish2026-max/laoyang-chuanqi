'use strict';
// ===================================================================================
// cls_fs.js — 法师（热血传奇 1.76 技能）。M1 流派：雷电爆发（设计方案 §4.2）
// 核心 雷电术、冰咆哮；生存 魔法盾（减伤 50%→70%，web-replica 为 50% 分担）；辅助 火球术（协同）；抗拒火环（击退控场）、地狱火（直线群伤）、诱惑之光（宝宝，后续「宝宝流」核心）。
// 技能等级 1–20，每级 1 技能点。数值参考 web-replica skill.txt（雷电 150%→285%、冰咆哮 240%+173 → 330%+1333、5→6 目标）。
// ===================================================================================
const clsFsTx=(d,el)=>`${d[0]}-${d[1]} ${({fire:'火焰',cold:'冰冷',light:'雷电',magic:'魔法'})[el]}`;
clsDef('fs',[
 {id:'hqs',t:0,n:'火球术',r:1,col:0,ty:'bolt',el:'fire',ic:'🔥',fx:'boom',cqfx:'huoqiu',mana:L=>1.5+0.1*(L-1),
  v:(L,sy)=>{const d=CLS_DR(4,8,2,3,L,sy);return{dmg:d,txt:`火球攻击单体：${clsFsTx(d,'fire')}`}}},
 {id:'kjhh',t:0,n:'抗拒火环',r:3,col:1,ty:'aoe',el:'fire',ic:'⭕',fx:'ring',cqfx:'huoqiang',cd:6,sm:1,mana:L=>3,
  v:(L,sy)=>{const d=CLS_DR(3,6,1.5,2.5,L,sy),st=+(1.2+0.08*(L-1)).toFixed(1);return{dmg:d,n:8,stun:Math.min(3,st),txt:`推开身边全部敌人：${clsFsTx(d,'fire')}，击退眩晕 ${Math.min(3,st)} 秒（首领免疫），冷却 6 秒`}}},
 {id:'yhzg',t:2,n:'诱惑之光',r:7,col:0,ty:'charm',el:'light',ic:'✨',cqfx:'zhaohuan',cd:3,mana:L=>6,
  v:L=>{const p=Math.min(90,40+3*(L-1)),lv=2+Math.floor(L/3),mx=L>=10?2:1,k=+(1.5+0.1*(L-1)).toFixed(1);return{p,lv,max:mx,k,txt:`诱惑等级 ≤ 自身+${lv} 的普通怪物成为宝宝（成功率 ${p}%，最多 ${mx} 只，10 级 +1），宝宝生命/攻击 ×${k}；宝宝死亡 60 秒后才能再诱惑`}}},
 {id:'dyh',t:0,n:'地狱火',r:9,col:2,pre:['hqs'],ty:'cone',el:'fire',ic:'🌋',fx:'boom',cqfx:'huoqiang',sm:2,mana:L=>4+0.2*(L-1),syn:[['hqs'],4],
  v:(L,sy)=>{const d=CLS_DR(8,14,3.5,5,L,sy);return{dmg:d,n:3,txt:`直线火焰贯穿前排 3 个敌人：${clsFsTx(d,'fire')}`}}},
 {id:'ldsh',t:2,n:'雷电术',r:11,col:1,ty:'bolt',el:'light',ic:'⚡',fx:'bolt',cqfx:'leidianshu',mana:L=>3+0.15*(L-1),syn:[['hqs'],5],
  v:(L,sy)=>{const d=CLS_DR(10,26,5,9,L,sy);return{dmg:d,txt:`天雷劈击单体：${clsFsTx(d,'light')}`}}},
 {id:'mfd',t:2,n:'魔法盾',r:5,col:2,ty:'buff',g:'mfd',ic:'🛡',fx:'shield',cqfx:'mofadun',cd:12,mana:L=>6+0.3*(L-1),
  v:L=>{const d=Math.min(70,50+1.5*(L-1)),t=Math.round(40+3*(L-1));return{dr:d,dur:t,txt:`魔法盾护身：受到的伤害减少 ${d}%，持续 ${t} 秒，冷却 12 秒`}}},
 {id:'bpx',t:1,n:'冰咆哮',r:14,col:1,pre:['ldsh'],ty:'aoe',el:'cold',ic:'❄',fx:'ring',cqfx:'bingpaoxiao',cd:3,sm:2,mana:L=>8+0.3*(L-1),syn:[['hqs','ldsh'],4],
  v:(L,sy)=>{const d=CLS_DR(18,28,6,9,L,sy),n=L>=15?6:5;return{dmg:d,n,slow:3,txt:`冰暴轰击最多 ${n} 个敌人：${clsFsTx(d,'cold')}，减速 3 秒，冷却 3 秒`}}},
]);
// 诱惑之光：宝宝 = 被诱惑怪物本身（种类随地图），ALLY.kind='cqpet'；最多 v.max 只；宝宝死亡后 60 秒内不能再诱惑
CLS_TY.charm=function(s,v,ms){const c=ms.filter(m=>!m.boss&&!m.fl&&m.lv<=S.lvl+v.lv&&!(m.uniq||m.champ));if(!c.length)return[];const m=c[0];
 if(rnd()*100>=v.p){floatHero('诱惑失败','#aaa');return[m]}
 const k=v.k*(1+(ST.sdmg||0)/200);m.hp=0;m.fade=0.3;addAlly('cqpet',{sub:s.id,mkey:m.key,art:m.key,n:'宝宝·'+m.n,ic:m.ic,hp:m.max*k*2,dmg:m.dmg.map(x=>x*k),el:'phys'});H.charmN=clsPetN(s.id);floatHero('诱惑成功','#e0c0ff');return[m]};
CLS_TY.charm.ok=function(s,ms){const v=SV(s.id,slvl(s.id)),n=clsPetN(s.id);if(n<(H.charmN||0))H.charmDeadT=GT;H.charmN=n;
 return n<v.max&&GT-(H.charmDeadT??-1e9)>=60&&ms.some(m=>!m.boss&&!m.fl&&m.lv<=S.lvl+v.lv)};
CLS_PRI.charm=1;
{const f=resetRuntime;resetRuntime=function(){f();H.charmN=0}}
CLS_DEF.fs.sk={hqs:1};CLS_DEF.fs.life0=65;CLS_DEF.fs.lpl=3;CLS_DEF.fs.lpv=2.5;// 生存：基础生命 40→65、每级 1.5→3、每点体力 2→2.5
CLS_DEF.fs.elMul=el=>el==='light'&&bl('ldsh')?Math.min(30,bl('hqs')*1.5):0;// 雷电爆发协同：火球术每级 +1.5% 雷电伤害（上限 30%）
CLS_BAL.fs={dk:[[1,1.5],[12,1.35],[30,1.25],[60,1.2]],ek:[[1,1.2],[12,1.3],[30,1.3],[60,1.3]]};
// 技能书规则（原版传奇之旅 skill.txt 对照；需求/书数/熟练度见 classes.js clsSkReq）
clsBookRule('fs',{hqs:{oid:104001,on:'火球术',or:7,exp:'A'},kjhh:{oid:104008,on:'抗拒火环',or:12},yhzg:{oid:104028,on:'诱惑之光',or:13},dyh:{oid:104009,on:'地狱火',or:16},ldsh:{oid:104010,on:'雷电术',or:17,exp:'A'},mfd:{oid:104021,on:'魔法盾',or:32},bpx:{oid:104023,on:'冰咆哮',or:35}});
clsRegister();
