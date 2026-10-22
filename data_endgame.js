'use strict';
// ===== 终局系统数据（第五阶段）。全部名称原创。 =====
// 悬赏令（每日/每周）
const EG_BOUNTY={
 dailyN:5,
 types:{kill:{n:'猎杀',d:(z,n)=>`在 ${z} 击杀 ${n} 只怪物`},clear:{n:'清剿',d:z=>`彻底肃清 ${z}（打完全部波次）`},boss:{n:'讨首',d:(z,b)=>`在 ${z} 讨伐首领 ${b}`}},
 weekly:[{t:'wkill',n:'百骸之誓',goal:4000,d:n=>`任意区域击杀 ${n} 只怪物`},{t:'wclear',n:'焦土之誓',goal:50,d:n=>`肃清任意区域 ${n} 次`},{t:'wboss',n:'弑首之誓',goal:25,d:n=>`讨伐任意首领 ${n} 次`},{t:'wrift',n:'深隙之誓',goal:10,d:n=>`完成封魔幻境 ${n} 次`}],
 cache:{n:'暮誓宝匣',ic:'🎁'},wcache:{n:'夜誓重匣',ic:'🧰'}};
// 封魔幻境（无限层秘境）：tier 0 = 普通封魔幻境（不限时、掉钥石）；tier≥1 = 封魔试炼（消耗钥石、限时）
const EG_RIFT={n:'封魔幻境',gn:'封魔试炼',key:{n:'封魔幻境钥石',ic:'🔮'},guard:'封魔幻境守望者',rank:'封魔幻境碑',
 limit:300,goal:100,pts:{n:1,champ:3,uniq:6},
 hp:T=>Math.pow(1.10,T),dmg:T=>Math.pow(1.04,T),xp:T=>1.4*(1+0.12*T),mf:T=>40+12*T,gf:T=>30+15*T,
 guardHP:1.5,upCost:{keys:2,gold:T=>2000+T*400}};
// 魂阶（满级后的无限成长）：70 级起 25% 经验同时注入魂阶，99 级后 100%；每阶 1 点，四类分配
const EG_PARA={n:'魂阶',start:70,share:0.25,
 need:p=>Math.floor(4.0e6*(1+0.06*p)),
 cats:[{k:'core',n:'主属性',ic:'◆',stats:[['str','力量',5,50],['dex','敏捷',5,50],['vit','体力',5,50],['ene','精力',5,50]]},
  {k:'atk',n:'攻击',ic:'⚔',stats:[['spd','法术伤害%',1,50],['sumdmg','召唤物伤害%',1,50],['fcr','施法速度%',1,20],['dsx','致命一击%',0.5,20]]},
  {k:'def',n:'防御',ic:'⛨',stats:[['lifep','生命%',1,50],['allres','全抗',1,30],['defp','防御%',3,50],['dr','伤害减免',1,15]]},
  {k:'idle',n:'挂机效率',ic:'⌛',stats:[['mf','寻宝%',2,50],['gf','金币%',3,50],['xp','经验%',1,30],['sumlife','召唤物生命%',1,50]]}]};
// 传说威能 EG_LP / EG_LPC / EG_LEG：已删除（eg_power.js，legacy_prune B1）；旧存档 S.eg.lp 与物品 it.lp 保留但不生效
// 纪元（赛季）EG_SEASON：已删除（eg_season.js，legacy_prune C5）；旧纪元角色由 stash.js 载入时转为普通角色
// 隐藏关卡「蘑菇王国」（原创彩蛋）：通关当前难度后，在坍颓村讨伐铸匠亡魂可拾得「老园丁的枯手杖」，配 1 张回城卷轴打开秘径
Object.assign(MONS,{
 shroom:{n:'伞菇兵',ic:'🍄',hp:60,dmg:[3,9],ar:40,def:20,exp:42,a:'m_shroom',res:{pois:50},eg:1},
 sporer:{n:'毒孢菇',ic:'🟣',hp:44,dmg:[2,8],ar:38,def:14,exp:44,ranged:1,el:'pois',a:'m_sporer',res:{pois:75},sk:['poisbreath'],eg:1},
 hopper:{n:'菌丝跳跳',ic:'🐸',hp:50,dmg:[4,10],ar:46,def:16,exp:40,spd:1.5,a:'m_hopper',res:{cold:30},eg:1}});
Object.assign(BOSSES,{shroomking:{n:'菌伞大王·噗噗',ic:'👑',hp:650,dmg:[8,20],ar:120,def:80,exp:9000,a:'b_shroomking',res:{pois:75,fire:-25},sk:['charge','poisbreath'],eg:1}});
const EG_SECRET={n:'蘑菇王国',staff:{n:'老园丁的枯手杖',ic:'🦯'},waves:12,mons:['shroom','sporer','hopper'],boss:'shroomking',
 hint:'流放者营地的老人们说：坍颓村的铸匠亡魂生前总替一位老园丁修补手杖……',xp:1.6,mf:150};
// 功业录（成就）/ 称号 / 珍藏图鉴
// [id, 名称, 说明, 判定(e,st)→[当前,目标], 点数, 称号]
const EG_ACH=[
 ['k1','初尝血腥','击杀 1000 只怪物',()=>[S.kills||0,1000],5],
 ['k2','尸山','击杀 20000 只怪物',()=>[S.kills||0,20000],10],
 ['k3','骸骨之海','击杀 200000 只怪物',()=>[S.kills||0,200000],25,'骸海之主'],
 ['l1','渐入佳境','达到 30 级',()=>[S.lvl,30],5],['l2','暮土老手','达到 60 级',()=>[S.lvl,60],10],['l3','冥途尽头','达到 90 级',()=>[S.lvl,90],25,'冥途行者'],
 ['d0','荒原余生','通关普通难度',()=>[egDone(0,4)?1:0,1],10],['d1','噩梦醒时','通关噩梦难度',()=>[egDone(1,4)?1:0,1],15],['d2','炼狱归来','通关地狱难度',()=>[egDone(2,4)?1:0,1],30,'炼狱归来者'],
 ['b1','告示板常客','完成 10 条悬赏',(e,s)=>[s.bounty||0,10],5],['b2','赏金猎人','完成 100 条悬赏',(e,s)=>[s.bounty||0,100],15,'赏金猎人'],
 ['r1','初探裂隙','完成 1 次封魔幻境',(e,s)=>[s.rift||0,1],5],['r2','深渊十层','通关封魔试炼 10 层',e=>[e.rift.best,10],10],['r3','深渊廿五','通关封魔试炼 25 层',e=>[e.rift.best,25],20,'裂隙行者'],['r4','深渊五十','通关封魔试炼 50 层',e=>[e.rift.best,50],40,'无尽深渊'],
 ['p1','魂阶初凝','魂阶达到 10',e=>[e.para.lv,10],10],['p2','魂阶百炼','魂阶达到 100',e=>[e.para.lv,100],30,'百炼之魂'],
 ['x1','威能初现','收录 1 个传说威能',e=>[Object.keys(e.lp.arch).length,1],5],['x2','熔炼大师','收录全部 12 个传说威能',e=>[Object.keys(e.lp.arch).length,12],30,'熔炼大师'],
 ['u1','珍藏家','图鉴收集 10 件暗金',e=>[Object.keys(e.codex.u).length,10],10],['u2','博物馆长','图鉴收集 40 件暗金',e=>[Object.keys(e.codex.u).length,40],25,'博物馆长'],
 ['s1','成套','图鉴集齐 1 个套装',()=>[egCodexSetsDone(),1],10],
 ['g1','富甲一方','持有 100 万金币',()=>[S.gold,1e6],10,'暮土富豪'],
 ['m1','噗！','讨伐菌伞大王',(e,s)=>[s.king||0,1],10,'菌王克星'],
 ['w1','巨像倒下','击败世界首领',(e,s)=>[s.wboss||0,1],15,'屠巨者'],
];
const EG_CODEX={uMF:0.5,setRes:1,allU:5};// 每件暗金 +0.5% 寻宝；每集齐一套 +1 全抗；暗金全收集 +5% 经验
// 新精英/首领词缀（并入 ELITE_AFF，蓝/金精英随机抽取；噩梦起首领 50% 附带 1 条）
const EG_AFF={
 regen:{n:'血肉再生',f:m=>{m.egRegen=0.03}},
 bomb:{n:'死亡爆裂',f:m=>{m.egBomb=1}},
 mirror:{n:'镜像',f:m=>{m.egMirror=1}},
 ward:{n:'骨盾守护',f:m=>{m.egWard=1;m.egWardT=0}},
 thorn:{n:'荆棘',f:m=>{m.egThorn=0.06}},
 frozen:{n:'冰狱',f:m=>{m.egFrz=1;m.egFrzT=4}}};
const EG_BOSSAFF=['regen','ward','frozen','thorn'];
// 世界首领：每 2 小时（游戏时间）在暮土降临，预告 2 分钟，持续 5 分钟
const EG_WB={n:'灰烬巨像·莫戈斯',ic:'🗿',cyc:7200,off:3000,warn:120,dur:300,hp:1500,dmg:[14,34],ar:160,def:120,exp:30000,res:{fire:40,cold:40,light:40,pois:40,phys:20},sk:['charge','inferno','stun']};
BOSSES.wb_mogos={n:EG_WB.n,ic:EG_WB.ic,hp:EG_WB.hp,dmg:EG_WB.dmg,ar:EG_WB.ar,def:EG_WB.def,exp:EG_WB.exp,res:EG_WB.res,sk:EG_WB.sk,eg:1};
