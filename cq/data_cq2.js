// cq/data_cq2.js — 老羊传奇 M2：第 2 章「比奇」、第 3 章「矿区」数据（方案 §3）。替换 ACTS[1]/ACTS[2]（原暗夜第二、三章）。
// 怪物 key 统一 cq 前缀，避免与暗夜 MONS（skel/yeti 等）冲突。首领真实时间刷新周期见 cq/m2_cq.js 的 CQ_BOSSRT。
(function(){
// ---------- 第 2 章：比奇（12–22） ----------
Object.assign(MONS,{
 cqskel:{n:'骷髅',ic:'💀',hp:40,dmg:[3,8],ar:36,def:10,exp:30},
 cqskelwar:{n:'骷髅战士',ic:'☠',hp:52,dmg:[4,10],ar:40,def:13,exp:38},
 cqaxeskel:{n:'掷斧骷髅',ic:'🪓',hp:44,dmg:[4,11],ar:44,def:11,exp:40,ranged:1},
 cqyeti:{n:'森林雪人',ic:'🦍',hp:70,dmg:[5,13],ar:48,def:15,exp:52},
 cqmaneater:{n:'食人花',ic:'🌺',hp:60,dmg:[5,12],ar:50,def:14,exp:50,el:'pois',res:{pois:40},spd:0.6},
 cqskelelite:{n:'骷髅精英',ic:'☠',hp:85,dmg:[6,15],ar:54,def:18,exp:66}});
Object.assign(BOSSES,{
 skelspirit:{n:'骷髅精灵',ic:'👻',hp:450,dmg:[7,18],ar:100,def:45,exp:2500},
 treedemon:{n:'千年树妖',ic:'🌳',hp:700,dmg:[9,22],ar:115,def:55,exp:4200,el:'pois',res:{pois:50}},
 zombieking:{n:'尸王',ic:'🧟',hp:1200,dmg:[11,28],ar:130,def:70,exp:9000,actboss:1}});
// ---------- 第 3 章：矿区（22–30） ----------
Object.assign(MONS,{
 cqzombie:{n:'僵尸',ic:'🧟',hp:95,dmg:[7,16],ar:58,def:20,exp:80,spd:0.8},
 cqcrawler:{n:'爬行僵尸',ic:'🧟',hp:88,dmg:[7,15],ar:60,def:18,exp:78,spd:0.7},
 cqelezombie:{n:'电僵尸',ic:'⚡',hp:100,dmg:[8,18],ar:62,def:20,exp:90,el:'light',res:{light:40}},
 cqmaggot:{n:'洞蛆',ic:'🐛',hp:80,dmg:[6,14],ar:60,def:16,exp:74},
 cqbeetle:{n:'盔甲虫',ic:'🪲',hp:120,dmg:[7,17],ar:62,def:30,exp:96},
 cqbat:{n:'山洞蝙蝠',ic:'🦇',hp:64,dmg:[6,15],ar:70,def:12,exp:70,spd:1.4}});
Object.assign(BOSSES,{
 elezombieking:{n:'电僵王',ic:'⚡',hp:1100,dmg:[12,30],ar:140,def:75,exp:9500,el:'light',res:{light:50}},
 stonezombieking:{n:'石墓尸王',ic:'🗿',hp:2000,dmg:[15,36],ar:160,def:90,exp:18000,actboss:1}});
// ---------- 任务（沿用 a2q*/a3q* id：acts.js 的奖励分支 a2q1 技能书、a3q1 生命、a3q2 戒指、a3q4 固定属性 仍生效） ----------
for(const k of ['a2q1','a2q2','a2q3','a2q4','a2q5','a2q6','a3q1','a3q2','a3q3','a3q4','a3q5','a3q6'])delete QUESTS[k];
Object.assign(QUESTS,{
 a2q1:{act:1,n:'骷髅洞',d:'肃清骷髅洞一层',rw:'技能书 ×1',clear:1},
 a2q2:{act:1,n:'骷髅精灵',d:'击败骷髅洞二层的 骷髅精灵',rw:'经验与金币'},
 a2q3:{act:1,n:'洞底',d:'肃清骷髅洞三层',rw:'金币',clear:1},
 a2q4:{act:1,n:'沃玛森林',d:'肃清沃玛森林',rw:'黑铁矿',clear:1},
 a2q5:{act:1,n:'千年树妖',d:'击败森林深处的 千年树妖',rw:'经验与金币'},
 a2q6:{act:1,n:'尸王殿',d:'击败尸王殿的 尸王',rw:'解锁第三章',fin:1},
 a3q1:{act:2,n:'南部矿区',d:'肃清南部矿区',rw:'生命丹：永久最大生命 +20',clear:1},
 a3q2:{act:2,n:'东部矿区',d:'肃清东部矿区',rw:'精良戒指',clear:1},
 a3q3:{act:2,n:'采矿所',d:'肃清采矿所一层',rw:'金币',clear:1},
 a3q4:{act:2,n:'电僵王',d:'击败采矿所二层的 电僵王',rw:'主属性 +3 体力 +2（永久）'},
 a3q5:{act:2,n:'黑铁矿坑',d:'肃清黑铁矿坑',rw:'黑铁矿',clear:1},
 a3q6:{act:2,n:'石墓尸王',d:'击败石墓深处的 石墓尸王',rw:'解锁第四章',fin:1}});
const Z=(n,ml,mons,bg,o={})=>Object.assign({n,ml,w:o.w||6,mons,bg},o);
ACTS[1]=Object.assign(ACTS[1],{n:'第二章 · 比奇',camp:'比奇城',boss:'尸王',fq:'a2q6',zones:[
 Z('骷髅洞·一层',12,['cqskel','cqskelwar'],'bg_cave',{dun:1,quest:'a2q1'}),
 Z('骷髅洞·二层',14,['cqskel','cqskelwar','cqaxeskel'],'bg_cave',{dun:1,boss:'skelspirit',quest:'a2q2'}),
 Z('骷髅洞·三层',16,['cqskelwar','cqaxeskel','cqskelelite'],'bg_catacomb',{dun:1,quest:'a2q3'}),
 Z('沃玛森林',18,['cqyeti','cqmaneater'],'bg_forest',{quest:'a2q4'}),
 Z('森林深处',20,['cqyeti','cqmaneater','cqskelelite'],'bg_forest',{boss:'treedemon',quest:'a2q5'}),
 Z('尸王殿',22,['cqskelelite','cqzombie','cqaxeskel'],'bg_tomb',{w:7,dun:1,boss:'zombieking',quest:'a2q6',bl:1}),
]});
ACTS[2]=Object.assign(ACTS[2],{n:'第三章 · 矿区',camp:'矿区营地',boss:'石墓尸王',fq:'a3q6',zones:[
 Z('南部矿区',22,['cqzombie','cqcrawler','cqbat'],'bg_cave',{quest:'a3q1'}),
 Z('东部矿区',24,['cqzombie','cqmaggot','cqbat'],'bg_cave',{quest:'a3q2'}),
 Z('采矿所·一层',26,['cqcrawler','cqmaggot','cqbeetle'],'bg_cave',{dun:1,quest:'a3q3'}),
 Z('采矿所·二层',27,['cqelezombie','cqbeetle','cqzombie'],'bg_cave',{dun:1,boss:'elezombieking',quest:'a3q4'}),
 Z('黑铁矿坑',28,['cqbeetle','cqelezombie','cqbat'],'bg_jail',{dun:1,quest:'a3q5'}),
 Z('石墓深处',30,['cqelezombie','cqbeetle','cqzombie'],'bg_tomb',{w:7,dun:1,boss:'stonezombieking',quest:'a3q6',bl:1}),
]});
// ---------- 首领专属极品（bossloot.js 按 boss 字段使用；每首领 2 件） ----------
UNIQUES.push(
 {n:'骷髅精灵之戒',boss:'skelspirit',b:'rin3',lv:14,rq:14,m:{maxdmg:[1,3],ar:[5,9],life:[10,20]}},
 {n:'骨灵头盔',boss:'skelspirit',b:'hlm2',lv:14,rq:14,m:{def:[2,4],mdef:[1,2],life:[15,25]}},
 {n:'树妖之心',boss:'treedemon',b:'amu4',lv:18,rq:18,m:{life:[25,40],mag:[1,2],tao:[1,2]}},
 {n:'青藤护腕',boss:'treedemon',b:'glv3',lv:18,rq:18,m:{def:[2,4],ias:[5,10],dex:[1,2]}},
 {n:'尸王战刃',boss:'zombieking',b:'swd6',lv:22,rq:22,m:{mindmg:[2,3],maxdmg:[5,9],ll:[2,3]}},
 {n:'尸王骨镯',boss:'zombieking',b:'shd5',lv:22,rq:22,m:{def:[3,5],maxdmg:[1,2],life:[20,30]}},
 {n:'雷殛之链',boss:'elezombieking',b:'amu5',lv:27,rq:27,m:{maxdmg:[2,4],mag:[2,3],crit:[2,4]}},
 {n:'电僵王之戒',boss:'elezombieking',b:'rin6',lv:27,rq:27,m:{maxdmg:[2,4],luck:1,ar:[8,12]}},
 {n:'石墓重铠',boss:'stonezombieking',b:'arm4',lv:30,rq:30,m:{def:[6,10],mdef:[2,4],life:[40,60]}},
 {n:'尸王之握',boss:'stonezombieking',b:'glv4',lv:30,rq:30,m:{def:[3,5],maxdmg:[2,4],crit:[2,3]}});
window.CQ_DATA2=1;
})();
