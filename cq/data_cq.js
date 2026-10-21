'use strict';
// ===================================================================================
// cq/data_cq.js — 老羊传奇 M1 数据层（在 data_acts.js 之后、game.js 之前加载）
// 原地替换暗夜 D2 数据表：部位名、品质名、底材 BASES/BASEM、词缀 PREFIX/SUFFIX、极品 UNIQUES、套装 SETS/SETITEMS、
// 第 1 章地图链 ACTS[0] + 怪物/首领；清空符文 RUNES / 符文之语 RUNEWORDS（数据层遗留，掉落改出黑铁矿，见 cq/sys_cq.js）。
// 所有名字为传奇风格原创命名或 1.76 通用名。数值为 M1 占位，按 docs/balance.md 的框架后续校准。
// ===================================================================================
window.CQ_DATA=1;
// ---------- 部位：内部键沿用暗夜（避免改装备/对比/仓库逻辑），显示名换成传奇 10 部位 ----------
// shield→左手镯、gloves→右手镯、amulet→项链；两只手镯是各自的底材组（手镯 / 护腕），见 docs/systems_m1.md
Object.assign(SLOTN,{weapon:'武器',armor:'衣服',helm:'头盔',amulet:'项链',shield:'手镯',gloves:'护腕',ring1:'戒指',ring2:'戒指',belt:'腰带',boots:'鞋子'});
// ---------- 品质：0/2/7/8 不再产出（破旧/超强/合成/符文之语），保留下标以兼容旧逻辑 ----------
QN.splice(0,QN.length,'普通','普通','普通','精良','稀有','极品','套装','—','—');
QC.splice(0,QC.length,'#e8e0d0','#e8e0d0','#e8e0d0','#6f8fff','#f2e05a','#c8a050','#3fdc4f','#e8e0d0','#e8e0d0');
// ---------- 底材 ----------
// q 需求/出现等级；dmg 攻击区间；def 防御区间；bm 底材自带属性（传奇首饰/手镯的白字）；ccls 职业限定（zs/fs/ds）
const CQB=(id,s,cat,n,q,o)=>Object.assign({id,s,cat,n,q,str:0,tier:q>=30?2:q>=16?1:0},o||{});
const CQ_BASES=[
 // 武器
 CQB('swd1','weapon','sword','木剑',1,{dmg:[2,5]}),
 CQB('dag1','weapon','dagger','匕首',3,{dmg:[1,6]}),
 CQB('swd2','weapon','sword','青铜剑',5,{dmg:[3,7]}),
 CQB('swd3','weapon','sword','铁剑',8,{dmg:[4,9]}),
 CQB('axe1','weapon','axe','青铜斧',10,{dmg:[3,11]}),
 CQB('swd4','weapon','sword','短剑',12,{dmg:[5,12]}),
 CQB('wand1','weapon','wand','海魂',14,{dmg:[2,8],bm:{mag:[1,2]},ccls:'fs'}),
 CQB('wand2','weapon','wand','偃月',15,{dmg:[3,9],bm:{tao:[1,2]},ccls:'ds'}),
 CQB('swd5','weapon','sword','八荒',15,{dmg:[6,15]}),
 CQB('swd6','weapon','sword','凌风',18,{dmg:[7,17]}),
 CQB('swd7','weapon','sword','修罗',22,{dmg:[8,21]}),
 CQB('wand3','weapon','wand','魔杖',24,{dmg:[4,12],bm:{mag:[2,4]},ccls:'fs'}),
 CQB('wand4','weapon','wand','降魔',24,{dmg:[5,12],bm:{tao:[2,4]},ccls:'ds'}),
 CQB('axe2','weapon','axe','斩马刀',26,{dmg:[9,24]}),
 CQB('swd8','weapon','sword','炼狱',30,{dmg:[10,30],ccls:'zs'}),
 // 衣服
 CQB('arm1','armor','armor','布衣',1,{def:[2,3]}),
 CQB('arm2','armor','armor','轻型盔甲',11,{def:[3,6]}),
 CQB('arm3','armor','armor','中型盔甲',16,{def:[4,8]}),
 CQB('arm4','armor','armor','重盔甲',22,{def:[6,10],ccls:'zs'}),
 CQB('arm5','armor','armor','魔法长袍',22,{def:[4,7],bm:{mag:[1,2]},ccls:'fs'}),
 CQB('arm6','armor','armor','灵魂战衣',22,{def:[5,8],bm:{tao:[1,2]},ccls:'ds'}),
 CQB('arm7','armor','armor','战神盔甲',30,{def:[8,14],ccls:'zs'}),
 // 头盔
 CQB('hlm1','helm','helm','青铜头盔',4,{def:[1,2]}),
 CQB('hlm2','helm','helm','魔法头盔',14,{def:[1,3],bm:{mdef:[0,1]}}),
 CQB('hlm3','helm','helm','骷髅头盔',20,{def:[2,4]}),
 CQB('hlm4','helm','helm','道士头盔',24,{def:[2,4],bm:{mdef:[1,2]}}),
 // 项链（jew：只经由首饰掉落路径产出）
 CQB('amu','amulet','amulet','金项链',3,{jew:1,bm:{ar:[1,1]}}),
 CQB('amu2','amulet','amulet','传统项链',7,{jew:1,bm:{mdef:[1,1]}}),
 CQB('amu3','amulet','amulet','灯笼项链',11,{jew:1,bm:{dex:[1,1]}}),
 CQB('amu4','amulet','amulet','白色虎齿项链',16,{jew:1,bm:{maxdmg:[0,1],luck:[1,1]}}),
 CQB('amu5','amulet','amulet','黑檀项链',22,{jew:1,bm:{mag:[1,2]}}),
 CQB('amu6','amulet','amulet','天珠项链',25,{jew:1,bm:{maxdmg:[1,3]}}),
 // 手镯（左，shield 槽）
 CQB('shd1','shield','bracelet','小手镯',3,{def:[0,1]}),
 CQB('shd2','shield','bracelet','银手镯',8,{def:[0,1],bm:{ar:[1,1]}}),
 CQB('shd3','shield','bracelet','大手镯',12,{def:[1,1]}),
 CQB('shd4','shield','bracelet','魔力手镯',16,{def:[0,1],bm:{mag:[0,1]}}),
 CQB('shd5','shield','bracelet','骷髅手镯',20,{def:[1,2],bm:{maxdmg:[0,1]}}),
 // 护腕（右，gloves 槽）
 CQB('glv1','gloves','bracelet','铁手镯',5,{def:[0,1]}),
 CQB('glv2','gloves','bracelet','皮制护腕',9,{def:[1,1]}),
 CQB('glv3','gloves','bracelet','钢手镯',14,{def:[1,2]}),
 CQB('glv4','gloves','bracelet','死神手套',20,{def:[1,2],bm:{maxdmg:[0,2]}}),
 CQB('glv5','gloves','bracelet','道士手镯',24,{def:[1,2],bm:{tao:[0,1]}}),
 // 戒指
 CQB('rin','ring','ring','古铜戒指',3,{jew:1,bm:{maxdmg:[0,1]}}),
 CQB('rin2','ring','ring','牛角戒指',8,{jew:1,bm:{mdef:[1,1]}}),
 CQB('rin3','ring','ring','六角戒指',12,{jew:1,bm:{def:[1,1]}}),
 CQB('rin4','ring','ring','珊瑚戒指',16,{jew:1,bm:{maxdmg:[1,2]}}),
 CQB('rin5','ring','ring','骷髅戒指',20,{jew:1,bm:{dex:[1,2]}}),
 CQB('rin6','ring','ring','蓝色水晶戒指',22,{jew:1,bm:{mag:[1,2]}}),
 // 腰带 / 鞋子
 CQB('blt1','belt','belt','布腰带',2,{def:[0,1]}),
 CQB('blt2','belt','belt','皮腰带',8,{def:[1,1]}),
 CQB('blt3','belt','belt','钢腰带',15,{def:[1,2]}),
 CQB('bot1','boots','boots','布鞋',2,{def:[0,1]}),
 CQB('bot2','boots','boots','皮靴',8,{def:[1,1]}),
 CQB('bot3','boots','boots','铁靴',15,{def:[1,2]}),
];
for(const b of CQ_BASES)if(b.ccls)b.cls=1;
// 旧底材 id → 部位（供仍引用 D2 底材的终局模块兜底，如 uber.js）
const CQ_D2_SLOT={};for(const b of BASES)CQ_D2_SLOT[b.id]=b.s==='charm'||b.s==='jewel'?'amulet':b.s;function cqD2Slot(id){return CQ_D2_SLOT[id]||null}
BASES.length=0;for(const b of CQ_BASES)BASES.push(b);
for(const k of Object.keys(BASEM))delete BASEM[k];for(const b of BASES)BASEM[b.id]=b;
// ---------- 词缀（AF 格式：名, 词缀等级, 需求等级, 组, 适用类型, 属性区间） ----------
// 新键（mag 魔法 / tao 道术 / mdef 魔防 / luck 幸运 / crit 暴击）只做存储与显示，由职业/战斗 Bot 通过 CQSys.attrs() 读取
// 适用类型沿用 ITYPES：weap 武器 / armo 防具（含手镯 brac）/ amul 项链 / ring 戒指；g 为同组互斥
ITYPES.axe=['weap','mele','axe'];ITYPES.bracelet=['armo','brac'];ITYPES.amulet=['amul'];ITYPES.ring=['ring'];
const J='amul,ring',WJ='weap,amul,ring',AJ='armo,amul,ring',ALL='weap,armo,amul,ring';
PREFIX.length=0;PREFIX.push(
 AF('锋利的',1,1,'mind','weap',{mindmg:[1,2]}),AF('凶猛的',4,3,'maxd','weap',{maxdmg:[1,3]}),AF('狂暴的',12,10,'maxd','weap',{maxdmg:[2,5]}),
 AF('迅捷的',8,6,'ias','weap',{ias:[5,10]}),AF('嗜血的',14,12,'ll','weap',{ll:[1,3]}),
 AF('坚固的',1,1,'def','armo',{def:[1,2]}),AF('厚重的',10,8,'def','armo',{def:[2,4]}),AF('抗魔的',6,5,'mdef',AJ,{mdef:[1,2]}),
 AF('精准的',3,2,'ar',WJ,{ar:[2,6]}),AF('灵动的',4,3,'dex',ALL,{dex:[1,2]}),AF('魔力的',5,4,'mag',WJ,{mag:[1,2]}),AF('神圣的',5,4,'tao',WJ,{tao:[1,2]}),
 AF('强壮的',3,2,'life',ALL,{life:[5,15]}),AF('充盈的',3,2,'mana',AJ,{mana:[5,15]}));
SUFFIX.length=0;SUFFIX.push(
 AF('之攻击',2,1,'jmaxd',J,{maxdmg:[1,2]}),AF('之防御',4,3,'jdef',J,{def:[1,2]}),AF('之幸运',8,6,'luck',WJ,{luck:[1,1]}),
 AF('之寻宝',5,4,'mf',ALL,{mf:[5,15]}),AF('之财富',3,2,'gf',ALL,{gf:[10,25]}),AF('之暴击',12,10,'crit',WJ,{crit:[1,3]}),
 AF('之生命',1,1,'slife',ALL,{life:[5,12]}),AF('之法力',1,1,'smana',ALL,{mana:[5,12]}),AF('之准确',6,5,'sar',ALL,{ar:[2,5]}));
// 命名：items.js 用 (dn||n)+前缀+底材，后缀显示为「X之」→ 生命之坚固的布衣
for(const x of SUFFIX)x.dn=x.n.replace(/^之/,'')+'之';
Object.assign(MODT,{mag:'魔法 +{v}',tao:'道术 +{v}',mdef:'魔防 +{v}',luck:'幸运 +{v}',crit:'暴击 +{v}%',mindmg:'攻击下限 +{v}',maxdmg:'攻击上限 +{v}',
 def:'防御 +{v}',ar:'准确 +{v}',dex:'敏捷 +{v}',life:'生命 +{v}',mana:'魔法值 +{v}',ias:'攻速 +{v}%',ll:'吸血 {v}%',mf:'寻宝 +{v}%',gf:'金币 +{v}%',
 para:'麻痹 {v}%',prot:'护身（伤害转魔）{v}%',revive:'复活（每 5 分钟一次）'});
// ---------- 极品（暗金位）：第 1 章 + 特戒；boss 字段 = 该首领专属（bossloot.js 优先使用，方案 §5.3 每首领 2–4 件） ----------
UNIQUES.length=0;UNIQUES.push(
 {n:'银杏·青锋',b:'swd3',lv:6,rq:6,m:{mindmg:[1,2],maxdmg:[3,5],ar:[4,8],life:[10,15]}},
 {n:'半兽獠牙',boss:'orclord',b:'axe1',lv:10,rq:10,m:{maxdmg:[4,7],ias:[10,15],ll:[1,2]}},
 {n:'毒蛇谷·蛇牙链',boss:'redsnakeking',b:'amu3',lv:10,rq:10,m:{maxdmg:[1,2],dex:[1,2],mf:[10,20]}},
 {n:'稻草人的旧护腕',boss:'rakecatking',b:'glv1',lv:5,rq:5,m:{def:[1,2],life:[8,12],gf:[20,30]}},
 {n:'钉耙猫王之戒',boss:'rakecatking',b:'rin',lv:6,rq:6,m:{maxdmg:[1,2],ar:[3,5],luck:1}},
 {n:'红蛇王鳞衣',boss:'redsnakeking',b:'arm2',lv:11,rq:11,m:{def:[2,4],mdef:[1,2],life:[15,25]}},
 {n:'半兽统领的战盔',boss:'orclord',b:'hlm1',lv:12,rq:12,m:{def:[1,3],maxdmg:[1,2],life:[10,20]}},
 // 特戒（1.76 经典名，章 3+ 首领）：麻痹/护身/复活
 {n:'麻痹戒指',b:'rin4',lv:22,rq:22,m:{para:[5,8],maxdmg:[0,1]},spec:1},
 {n:'护身戒指',b:'rin3',lv:22,rq:22,m:{prot:[30,40]},spec:1},
 {n:'复活戒指',b:'rin2',lv:22,rq:22,m:{revive:1},spec:1});
// ---------- 套装：祖玛（占位，章 5 正式掉落；M1 仅供界面与掉落链路测试） ----------
for(const k of Object.keys(SETS))delete SETS[k];
SETS.zuma={n:'祖玛',bonus:{2:{ias:10},4:{edmg:10,life:30}}};
SETITEMS.length=0;SETITEMS.push(
 {n:'祖玛头盔',set:'zuma',b:'hlm3',lv:38,rq:38,m:{def:3,mdef:2}},
 {n:'祖玛项链',set:'zuma',b:'amu6',lv:38,rq:38,m:{maxdmg:3,ar:5}},
 {n:'祖玛手镯',set:'zuma',b:'shd5',lv:38,rq:38,m:{maxdmg:2,def:1}},
 {n:'祖玛戒指',set:'zuma',b:'rin5',lv:38,rq:38,m:{maxdmg:3}});
// ---------- 符文 / 符文之语 / 宝石：数据层清空（M1 已定不做；旧存档中的符文由迁移折算，见 cq/sys_cq.js） ----------
RUNES.length=0;RUNEWORDS.length=0;
// ---------- 第 1 章：新手村（银杏村） ----------
Object.assign(MONS,{
 chick:{n:'鸡',ic:'🐔',hp:6,dmg:[1,2],ar:12,def:1,exp:6},
 deer:{n:'鹿',ic:'🦌',hp:10,dmg:[1,3],ar:14,def:2,exp:8,spd:1.2},
 scarecrow:{n:'稻草人',ic:'🎃',hp:14,dmg:[1,4],ar:18,def:3,exp:11},
 hookcat:{n:'多钩猫',ic:'🐱',hp:16,dmg:[2,4],ar:22,def:4,exp:13,spd:1.2},
 rakecat:{n:'钉耙猫',ic:'🐈',hp:20,dmg:[2,5],ar:24,def:5,exp:15},
 halforc:{n:'半兽人',ic:'👹',hp:26,dmg:[2,6],ar:26,def:6,exp:18},
 spider1:{n:'毒蜘蛛',ic:'🕷',hp:18,dmg:[2,5],ar:26,def:5,exp:16,el:'pois',res:{pois:50}},
 redsnake:{n:'红蛇',ic:'🐍',hp:22,dmg:[2,6],ar:28,def:6,exp:18,spd:1.1},
 tigersnake:{n:'虎蛇',ic:'🐍',hp:30,dmg:[3,7],ar:30,def:8,exp:22},
 orcwar:{n:'半兽战士',ic:'👺',hp:36,dmg:[3,8],ar:32,def:9,exp:26}});
Object.assign(BOSSES,{
 rakecatking:{n:'钉耙猫王',ic:'🐯',hp:150,dmg:[3,9],ar:60,def:25,exp:500},
 redsnakeking:{n:'红蛇王',ic:'🐉',hp:200,dmg:[4,11],ar:70,def:35,exp:800,el:'pois',res:{pois:50}},
 orclord:{n:'半兽统领',ic:'👹',hp:320,dmg:[6,16],ar:90,def:55,exp:4000,actboss:1}});
Object.assign(QUESTS,{
 q1:{act:0,n:'初出银杏村',d:'清理比奇城南全部怪物',rw:'技能点 +1'},
 q2:{act:0,n:'钉耙猫王',d:'击败比奇城西的 钉耙猫王',rw:'经验与金币'},
 q3:{act:0,n:'比奇城北',d:'清理比奇城北全部怪物',rw:'精良戒指'},
 q4:{act:0,n:'红蛇王',d:'击败毒蛇山谷的 红蛇王',rw:'黑铁矿 ×3'},
 q5:{act:0,n:'比奇城东',d:'清理比奇城东全部怪物',rw:'金币'},
 q6:{act:0,n:'半兽统领',d:'击败半兽人古墓的 半兽统领',rw:'解锁第二章',fin:1}});
ACTS[0]=Object.assign(ACTS[0],{n:'第一章 · 新手村',camp:'银杏村',boss:'半兽统领',fq:'q6',zones:[
 Z('银杏村外',1,['chick','deer'],'bg_moor'),
 Z('比奇城南',2,['deer','scarecrow','chick'],'bg_moor',{quest:'q1'}),
 Z('比奇城西',4,['scarecrow','hookcat','rakecat'],'bg_forest',{boss:'rakecatking',quest:'q2'}),
 Z('比奇城东',6,['hookcat','rakecat','halforc'],'bg_forest',{quest:'q5'}),
 Z('比奇城北',8,['halforc','spider1','rakecat'],'bg_forest',{quest:'q3'}),
 Z('毒蛇山谷',10,['redsnake','tigersnake','spider1'],'bg_cave',{boss:'redsnakeking',quest:'q4',dun:1}),
 Z('半兽人古墓',12,['halforc','tigersnake','orcwar'],'bg_catacomb',{w:6,boss:'orclord',quest:'q6',dun:1}),
]});
// 第 2~7 章：M2 起替换（当前保留暗夜原章节数据仅用于推进不崩，名称待改）
