'use strict';
// ===================================================================================
// cls_fs.js — 法师（热血传奇 1.76 技能）。M1 流派：雷电爆发（设计方案 §4.2）
// 核心 雷电术、冰咆哮；生存 魔法盾（减伤 50%→70%，web-replica 为 50% 分担）；辅助 火球术（协同）；抗拒火环（击退控场）、地狱火（直线群伤）、诱惑之光（宝宝，后续「宝宝流」核心）。
// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（雷电 150%→285%、冰咆哮 240%+173 → 330%+1333、5→6 目标）。
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

function clsMir2Fs(){
// Mir2 扩展：倍率/未知耗蓝为本游戏设计值；新增技能 1/4/7 级对应原版三级。
clsDef('fs',[
 {id:'dhq',n:'大火球',r:19,t:2,col:1,ty:'bolt',el:'fire',ic:'✦',cqfx:'huoqiang',cd:6,mana:()=>14,mir2:true,v:(L,sy)=>{const d=CLS_DR(16,28,4,6,L,sy);return{dmg:d,n:5,txt:'大火球：'+d.join('-')+'点伤害'}}},
 {id:'sxyd',n:'瞬息移动',r:19,t:2,col:1,ty:'buff',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>18,mir2:true,g:'sxyd',v:(L,sy)=>{return{dodge:15+L*2,dur:12+L,txt:'瞬息移动：增强护持，持续 '+(12+L)+' 秒'}}},
 {id:'blhy',n:'爆裂火焰',r:22,t:2,col:1,ty:'aoe',el:'fire',ic:'✦',cqfx:'huoqiang',cd:6,mana:()=>16,mir2:true,v:(L,sy)=>{const d=CLS_DR(25,45,8,12,L,sy);return{dmg:d,n:5,txt:'爆裂火焰：'+d.join('-')+'点伤害'}}},
 {id:'hq',n:'火墙',r:24,t:2,col:1,ty:'burn',el:'fire',ic:'✦',cqfx:'huoqiang',cd:6,mana:()=>39,mir2:true,v:(L,sy)=>{return{dps:8+L*3,bdur:4+L/3,n:5,txt:'火墙：持续灼烧 '+(4+L/3).toFixed(1)+' 秒'}}},
 {id:'jgdy',n:'疾光电影',r:26,t:2,col:1,ty:'cone',el:'light',ic:'✦',cqfx:'leidianshu',cd:6,mana:()=>58,mir2:true,v:(L,sy)=>{const d=CLS_DR(28,48,9,14,L,sy);return{dmg:d,n:5,txt:'疾光电影：'+d.join('-')+'点伤害'}}},
 {id:'dylg',n:'地狱雷光',r:30,t:2,col:1,ty:'aoe',el:'light',ic:'✦',cqfx:'leidianshu',cd:6,mana:()=>50,mir2:true,v:(L,sy)=>{const d=CLS_DR(32,52,10,16,L,sy);return{dmg:d,n:5,txt:'地狱雷光：'+d.join('-')+'点伤害'}}},
 {id:'sys',n:'圣言术',r:32,t:2,col:1,ty:'bolt',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>70,mir2:true,v:(L,sy)=>{const d=CLS_DR(12,24,3,5,L,sy);return{dmg:d,n:5,txt:'圣言术：'+d.join('-')+'点伤害'}}},
 {id:'hbz',n:'寒冰掌',r:36,t:2,col:1,ty:'bolt',el:'cold',ic:'✦',cqfx:'bingpaoxiao',cd:6,mana:()=>20,mir2:true,v:(L,sy)=>{const d=CLS_DR(30,50,8,12,L,sy);return{dmg:d,n:5,slow:3,stun:1,txt:'寒冰掌：'+d.join('-')+'点伤害'}}},
 {id:'mth',n:'灭天火',r:38,t:2,col:1,ty:'bolt',el:'fire',ic:'✦',cqfx:'huoqiang',cd:6,mana:()=>60,mir2:true,v:(L,sy)=>{const d=CLS_DR(65,110,12,18,L,sy);return{dmg:d,n:5,txt:'灭天火：'+d.join('-')+'点伤害'}}},
 {id:'lxhy',n:'流星火雨',r:47,t:2,col:1,ty:'aoe',el:'fire',ic:'✦',cqfx:'huoqiang',cd:6,mana:()=>65,mir2:true,v:(L,sy)=>{const d=CLS_DR(50,80,10,18,L,sy);return{dmg:d,n:5,dps:8+L*2,bdur:4,txt:'流星火雨：'+d.join('-')+'点伤害'}}},
 {id:'fss',n:'分身术',r:45,t:2,col:1,ty:'pet',el:'magic',ic:'✦',cqfx:'linghunhuofu',cd:6,mana:()=>45,mir2:true,heroOnly:true,v:(L,sy)=>{const a=8+L*2+(S.lvl||1);return{hp:180+L*35,pd:[a,a*2],max:1,pn:'法师分身',el:'magic',txt:'分身术：召唤独立伙伴'}}},
]);
clsBookRule('fs',{dhq:{on:'大火球',or:19},sxyd:{on:'瞬息移动',or:19},blhy:{on:'爆裂火焰',or:22},hq:{on:'火墙',or:24},jgdy:{on:'疾光电影',or:26},dylg:{on:'地狱雷光',or:30},sys:{on:'圣言术',or:32},hbz:{on:'寒冰掌',or:36},mth:{on:'灭天火',or:38},lxhy:{on:'流星火雨',or:47},fss:{on:'分身术',or:45}});
clsRegister();
// 1.76 已知基础 MP；保留旧技能成长/威力，避免旧档变弱。
for(const [id,mp] of Object.entries({hqs:4,kjhh:8,yhzg:6,dyh:19,ldsh:16,mfd:44,bpx:44}))SKM[id].mana=()=>mp;
// 不死识别只读取种类资料，不对首领执行秒杀。
const mir2Undead=m=>/skel|zombie|corpse|骷髅|僵尸|尸王|恶灵/.test((m.key||'')+' '+(m.n||''));
{const f=CLS_TY.bolt;CLS_TY.bolt=function(s,v,ms,tg){
 if(s.id==='sys'&&tg&&!tg.boss&&!tg.uniq&&!tg.champ&&!tg.fl&&mir2Undead(tg)&&tg.lv<=S.lvl+2&&rnd()<Math.min(.65,.15+slvl(s.id)*.05)){hitMon(tg,{magic:tg.hp},'hero');return[tg]}
 if(s.id==='mth'&&tg&&typeof tg.mana==='number')tg.mana=Math.max(0,tg.mana-(10+3*slvl(s.id)));
 return f.apply(this,arguments);
}}
{const f=CLS_TY.cone;CLS_TY.cone=function(s,v,ms,tg){if(s.id!=='jgdy')return f.apply(this,arguments);const out=clsOthers(ms,tg).slice(0,v.n||5);for(const m of out)clsHit(m,s.el,clsRR(v.dmg)*(mir2Undead(m)?1.5:1));return out}}
SKM.sys.v=(L,sy)=>({dmg:CLS_DR(14,24,3,4,L,sy),txt:'圣言术：概率净化等级不高于自身+2的不死普通怪；首领只受魔法伤害'});

}
