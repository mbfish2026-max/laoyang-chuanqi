'use strict';
// ===== 传奇终局数据：悬赏、功业、图鉴和世界首领。 =====
// 悬赏令（每日/每周）
const EG_BOUNTY={
 dailyN:5,
 types:{kill:{n:'猎杀',d:(z,n)=>`在 ${z} 击杀 ${n} 只怪物`},clear:{n:'清剿',d:z=>`彻底肃清 ${z}（打完全部波次）`},boss:{n:'讨首',d:(z,b)=>`在 ${z} 讨伐首领 ${b}`}},
 weekly:[{t:'wkill',n:'百骸之誓',goal:4000,d:n=>`任意区域击杀 ${n} 只怪物`},{t:'wclear',n:'焦土之誓',goal:50,d:n=>`肃清任意区域 ${n} 次`},{t:'wboss',n:'弑首之誓',goal:25,d:n=>`讨伐任意首领 ${n} 次`}],
 cache:{n:'盟重宝匣',ic:'🎁'},wcache:{n:'盟重重匣',ic:'🧰'}};
// 旧成长表仅供历史属性读取；新增成长由 mir2_progression 固定转生接管。
const EG_PARA={n:'魂阶',start:70,share:0.25,
 need:p=>Math.floor(4.0e6*(1+0.06*p)),
 cats:[{k:'core',n:'主属性',ic:'◆',stats:[['str','力量',5,50],['dex','敏捷',5,50],['vit','体力',5,50],['ene','精力',5,50]]},
  {k:'atk',n:'攻击',ic:'⚔',stats:[['spd','法术伤害%',1,50],['sumdmg','召唤物伤害%',1,50],['fcr','施法速度%',1,20],['dsx','致命一击%',0.5,20]]},
  {k:'def',n:'防御',ic:'⛨',stats:[['lifep','生命%',1,50],['allres','全抗',1,30],['defp','防御%',3,50],['dr','伤害减免',1,15]]},
  {k:'idle',n:'挂机效率',ic:'⌛',stats:[['mf','寻宝%',2,50],['gf','金币%',3,50],['xp','经验%',1,30],['sumlife','召唤物生命%',1,50]]}]};
// 功业录（成就）/ 称号 / 珍藏图鉴
// [id, 名称, 说明, 判定(e,st)→[当前,目标], 点数, 称号]
const EG_ACH=[
 ['k1','初尝血腥','击杀 1000 只怪物',()=>[S.kills||0,1000],5],
 ['k2','尸山','击杀 20000 只怪物',()=>[S.kills||0,20000],10],
 ['k3','骸骨之海','击杀 200000 只怪物',()=>[S.kills||0,200000],25,'骸海之主'],
 ['l1','渐入佳境','达到 30 级',()=>[S.lvl,30],5],['l2','传奇老手','达到 60 级',()=>[S.lvl,60],10],['lv45','传奇名将','达到 45 级',()=>[S.lvl,45],25,'传奇名将'],
 ['d0','荒原余生','通关普通难度',()=>[egDone(0,ACTS.length-1)?1:0,1],10],['d1','噩梦醒时','通关噩梦难度',()=>[egDone(1,ACTS.length-1)?1:0,1],15],['d2','炼狱归来','通关地狱难度',()=>[egDone(2,ACTS.length-1)?1:0,1],30,'炼狱归来者'],
 ['b1','告示板常客','完成 10 条悬赏',(e,s)=>[s.bounty||0,10],5],['b2','赏金猎人','完成 100 条悬赏',(e,s)=>[s.bounty||0,100],15,'赏金猎人'],
 ['reb1','初入转生','完成 1 次转生',()=>[S.reb||0,1],10],['reb10','十转功成','完成 10 次转生',()=>[S.reb||0,10],30,'十转名将'],
 ['u1','珍藏家','图鉴收集 10 件极品',e=>[Object.keys(e.codex.u).length,10],10],['u2','博物馆长','图鉴收集 40 件极品',e=>[Object.keys(e.codex.u).length,40],25,'博物馆长'],
 ['s1','成套','图鉴集齐 1 个套装',()=>[egCodexSetsDone(),1],10],
 ['g1','富甲一方','持有 100 万金币',()=>[S.gold,1e6],10,'盟重富豪'],
 ['w1','首领伏诛','击败世界首领',(e,s)=>[s.wboss||0,1],15,'降魔勇士'],
];
const EG_CODEX={attackEvery:10,defPerSet:1}; // 固定攻击、防御奖励，纳入既有战力预算。
// 新精英/首领词缀（并入 ELITE_AFF，蓝/金精英随机抽取；噩梦起首领 50% 附带 1 条）
const EG_AFF={
 regen:{n:'血肉再生',f:m=>{m.egRegen=0.03}},
 bomb:{n:'死亡爆裂',f:m=>{m.egBomb=1}},
 mirror:{n:'镜像',f:m=>{m.egMirror=1}},
 ward:{n:'骨盾守护',f:m=>{m.egWard=1;m.egWardT=0}},
 thorn:{n:'荆棘',f:m=>{m.egThorn=0.06}},
 frozen:{n:'冰狱',f:m=>{m.egFrz=1;m.egFrzT=4}}};
const EG_BOSSAFF=['regen','ward','frozen','thorn'];
// 世界首领：每 2 小时（游戏时间）在盟重降临，预告 2 分钟，持续 5 分钟
const EG_WB={n:'魔龙统领',ic:'🗿',cyc:7200,off:3000,warn:120,dur:300,hp:1500,dmg:[14,34],ar:160,def:120,exp:30000,res:{fire:40,cold:40,light:40,pois:40,phys:20},sk:['charge','inferno','stun']};
BOSSES.wb_mogos={n:EG_WB.n,ic:EG_WB.ic,hp:EG_WB.hp,dmg:EG_WB.dmg,ar:EG_WB.ar,def:EG_WB.def,exp:EG_WB.exp,res:EG_WB.res,sk:EG_WB.sk,eg:1};
