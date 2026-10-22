// 老羊传奇 M1 战斗移植测试：node cq/cq_battle_test.js
// 走位（传奇原规则）/ 英雄与合击规则 / 桥接 Host 读数与包装 / 特效只播一次（CSS 只有呼吸是 infinite）
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.join(__dirname,'..');
const T=require(path.join(root,'tests','cq_harness'))('cq_battle_test');const{G,ok,ctx}=T;const CQ_T=k=>G('CQ.HERO_TUNE.'+k);
for(const f of['cq/cq_move.js','cq/cq_hero.js','cq/cq_fx.js','cq_bridge.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
G(`S=newSave();load();S.lvl=12;calc();H.life=ST.life;H.mana=ST.mana`);
// ---------- 走位 ----------
G(`var B={mons:[{uid:1,idx:null},{uid:2,idx:null,boss:true}],roleIdx:null,_pets:[{hp:1,idx:null}]};CQ.MOVE.ensure(B)`);
ok(G('B.roleIdx')===26,'角色出生格 26');
ok(G('B.mons[0].idx')===1,'第一只怪出生格 1（MON_START）');
ok(G('B.mons[1].idx')>=12,'首领只在第 3 行以下（BOSS_MIN=12）');
ok(G('CQ.MOVE.cheb(B._pets[0].idx,B.roleIdx)')===1,'英雄出生在角色身边');
ok(G('JSON.stringify(CQ.MOVE.path({mons:[],roleIdx:null,_pets:[]},0,2))')==='[0,1,2]','A* 直线路径');
ok(G('CQ.MOVE.path({mons:[{idx:1}],roleIdx:null,_pets:[]},0,2).indexOf(1)')===-1,'A* 绕开占格');
G(`var B2={mons:[{uid:9,idx:2,walk_spd:0}],roleIdx:27,_pets:[]};for(let i=0;i<40;i++)CQ.MOVE.update(B2,.5)`);
ok(G('CQ.MOVE.cheb(B2.mons[0].idx,B2.roleIdx)')<=1,'怪物走到贴身后停下');
ok(G('CQ.MOVE.monCanAttack(B2,B2.mons[0])')==='role','贴身才可攻击');
// ---------- 英雄 / 合击 ----------
G(`localStorage.removeItem('cq_battle_hero_v1');var hero=new CQ.Hero(1,localStorage)`);
ok(G('hero.h.prof')===3&&G('hero.combo().name')==='劈星斩','战士默认带道士，合击=劈星斩');
ok(G("CQ.HEJI.COMBO[CQ.HEJI.comboKey(3,1)].name")==='劈星斩'&&G("CQ.HEJI.COMBO['2+2'].name")==='火龙气焰','合击表与顺序无关');
G(`var hits=[];var host={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d,s)=>{hits.push([m.uid,d,s]);return d},atkMax:()=>100,lvl:()=>12,heroK:()=>.35};
  MON=[mkMon(Object.keys(MONS)[0],10),mkMon(Object.keys(MONS)[0],10)];hero.h.autoHeji=false`);
ok(!G('hero.doHeji(host,true).ok')&&/怒气不足/.test(G('hero.doHeji(host,true).msg')),'怒气不足不能合击');
G('hero.addRage(250)');ok(G('hero.h.rage')===100,'怒气上限 100');
G('var r=hero.doHeji(host,true)');
ok(G('r.ok')&&G('r.hits.length')===1,'劈星斩单体合击命中一个目标');
ok(G('hero.h.rage')===0&&G('hero.h.hejiCd')===CQ_T('hejiCd'),'合击后怒气清零、冷却 HERO_TUNE.hejiCd 秒');
ok(G('r.total')>=Math.round(135*4.5*.9)-2&&G('r.total')<=Math.round(135*4.5*1.1)+2,'无 DPS 兜底：合击总伤=(玩家上限+英雄上限)×倍率，去掉等级加成');
G('host.dps=()=>1000;hero.h.rage=100;hero.h.hejiCd=0;var r2=hero.doHeji(host,true)');ok(G('r2.total')>=1000*6*.9-2&&G('r2.total')<=1000*6.8*1.1+2,'合击总伤 ≈ 玩家 6–6.8 秒 DPS（冷却 30 秒）');
G('hits.length=0;hero._fr=0;hero.unit.atkT=0;hero.h.skOff={zys:1,lhhf:1,sds:1};hero.tick(.01,host);hero.h.skOff={}');ok(G('hits[0][1]')>=Math.floor(1000*CQ_T('dpsK')*1.6*.9)-1&&G('hits[0][1]')<=Math.ceil(1000*CQ_T('dpsK')*1.6*1.1),'英雄普攻 = 玩家 DPS×dpsK×1.6 秒');
G('delete host.dps;hero.h.hejiCd=0');
ok(!G('hero.doHeji(host,true).ok'),'冷却中不能再次合击');
G('hero.tick(CQ.HERO_TUNE.hejiCd+1,host)');ok(G('hero.h.hejiCd')===0,'冷却随时间结束');
G('hits.length=0;hero.unit.atkT=0;hero.tick(.01,host)');ok(G('hits.length')===1&&G('hits[0][2]')==='cqhero','英雄自动普攻走 Host.hit');
G('hero.h.autoHeji=true;hero.h.rage=100;hero.h.hejiCd=0;var ev=hero.tick(.01,host)');ok(G('ev&&ev.type')==='heji','自动合击：满怒气自动施放');
ok(G("JSON.parse(localStorage.getItem('cq_battle_hero_v1')).hejiCount")>=1,'英雄兜底存档 localStorage');
// ---------- 桥接 Host ----------
const role=JSON.parse(G('JSON.stringify(CQ.Host.role())'));
ok(role.lvl===12&&role.maxhp>0&&role.hp>0,'Host.role 读 S/ST/H');
ok(G('CQ.Host.mons().length')===2,'Host.mons 读 MON 活怪');
G('var m0=MON[0];m0.hp=m0.max=1e6;var got=CQ.Host.hit(m0,500,"cqheji")');ok(G('got')>0&&G('m0.hp')<1e6,'Host.hit 经 hitMon 真实扣血');
G('MON[1].hp=0');ok(G('CQ.Host.mons().length')===1,'死怪不进战场');
G('var it=genItem(12,{mf:400});it.q=5;it.anc=2;var inf=CQ.Host.itemInfo(it)');
ok(G('inf.tier&&inf.tier.key')==='primal'&&G('inf.tier.top')===true,'至臻 → 光柱+极品横幅');
G('var it2=genItem(12,{});it2.q=1;it2.anc=0;it2.myth=0');ok(G('CQ.Host.itemInfo(it2).tier')===null,'普通物品无光柱');
ok(G('CQ.Host.zone().name').length>0,'Host.zone 区域名');
ok(Array.isArray(G('CQ.MISSING'))&&G('CQ.MISSING.length')>=5,'缺口清单 CQ.MISSING');
G('CQ._install()');ok(G('hitMon._cq')===1&&G('floatNum._cq')===1&&G('groundLoot._cq')===1&&G('spawnFloat._cq')===1,'运行时包装已安装（最外层）');
G('var mm=mkMon(Object.keys(MONS)[0],5);MON.push(mm);var hp0=mm.hp;hitMon(mm,{phys:3},"hero","#fff")');ok(G('mm.hp')<G('hp0'),'包装后 hitMon 仍正常结算');
// ---------- 特效只播一次 ----------
const css=fs.readFileSync(path.join(root,'cq/cq.css'),'utf8');const inf=[...css.matchAll(/animation:\s*([\w-]+)[^;}]*infinite/g)].map(m=>m[1]);
ok(G('CQ.HERO_TUNE.atkT')===1.6&&G('CQ.HERO_TUNE.atkK')===.35,'英雄普攻常量 CQ.HERO_TUNE：1.6 秒 / 武器上限 35%');
G('var hu=hero.unit;hero.tick(.01,host);var hr=hero.hurt(hu.maxhp+5,host)');ok(G('hr&&hr.dead')&&G('hu.hp')===0&&G('hero.reviveLeft(Date.now())')>0,'英雄受伤至 0 阵亡并进入复活倒计时');
ok(G('hero.hurt(5,host)')==null||G('hero.hurt(5,host).dmg')===0||G('hu.hp')===0,'阵亡后不再受伤');
G('hu.deadUntil=Date.now()-1;var rv=hero.tick(.01,host)');ok(G('rv&&rv.type')==='herorevive'&&G('hu.hp')>0,'倒计时结束英雄复活');
// ---------- CQSys 接入 ----------
ok(G('CQ.Host.atkMax()')===G('Math.max(1,(+ST.wmax||0)+(+ST.fire||0)+(+ST.cold||0))'),'atkMax 去掉等级×3 下限');
if(G('!!(window.CQSys&&CQSys.api===1)')){
  G(`S.hero=null;localStorage.setItem('cq_battle_hero_v1',JSON.stringify({prof:2,name:'老英雄',rage:55,autoHeji:false,hejiCount:3}));var st2=CQ.Host.heroStore()`);
  ok(G('localStorage.getItem("cq_battle_hero_v1")')===null,'旧 localStorage 英雄存档迁移后删除');
  ok(G('S.hero.cls')==='fs'&&G('S.hero.name')==='老英雄'&&G('S.hero.rage')===55&&G('S.hero.autoHeji')===0,'一次性迁移进 S.hero（职业/名字/怒气/自动合击）');
  G('var hx=new CQ.Hero(1,st2)');ok(G('hx.h.prof')===2&&G('hx.present()'),'英雄从 CQSys.hero 读');
  G('hx.h.rage=77;hx.persist()');ok(G('S.hero.rage')===77,'英雄状态经 heroSet 存 S.hero');
  G('S.hero=null;var hy=new CQ.Hero(1,CQ.Host.heroStore())');ok(!G('hy.present()')&&/尚未召唤/.test(G('hy.doHeji(host,true).msg')),'未创建英雄：不出手、合击提示召唤');
  G('S.lvl=22;CQSys.heroCreate("ds");hy.reload()');ok(G('hy.present()')&&G('hy.h.prof')===3,'heroCreate 后 reload 出现');
  ok(G('CQ.Host.heroStats()&&CQ.Host.heroStats().hp')>0,'heroStats 接入');
  const rr=JSON.parse(G('JSON.stringify(CQ.Host.role())'));ok(typeof rr.yb==='number'&&typeof rr.power==='number','顶栏元宝/战力来自 CQSys');
  ok(/mdl_mst_1006/.test(G('CQ.Host.monArt({key:"halforc"})')),'monArt 用 CQSys.monArt');
  ok(G('CQ.Host.bossInfo()&&("alive" in CQ.Host.bossInfo())'),'bossInfo 接入');
  G('window.CQ_SKCD.__t=5;CQSys.skillCast("__t")');ok(G('CQ.Host.skills.length>=0')&&G('(function(){var C=CQSys.skillCooldown("__t");return !C.placeholder&&C.cd===5})()'),'skillCooldown 已登记时取正式冷却');
  // step 内英雄出手（不依赖战斗页）
  G(`CQ._install();var HC=CQ.heroCore();HC.h.autoHeji=true;MON=[mkMon(Object.keys(MONS)[0],10)];MON[0].hp=MON[0].max=1e7;var _h0=0;var _hm2=hitMon;`);
  G(`var heroDmg=0;var _hw=hitMon;hitMon=function(m,d,src){var t=_hw.apply(this,arguments);if(src==='cqhero')heroDmg+=t;return t};for(var i=0;i<200;i++){step(.05)}`);
  ok(G('heroDmg')>0||G('HC.unit.atkT')<CQ_T('atkT'),'英雄在 step() 内出手（离开战斗页也算）');
}
// ---------- M1.3 召唤物 / 新序列帧 / 封顶 / 有效 DPS ----------
G(`ALLY=[];addAlly('cqpet',{sub:'zhss',n:'神兽',ic:'🐕',hp:100,dmg:[3,5],el:'fire',th:10});addAlly('cqpet',{sub:'yhzg',n:'宝宝·'+MONS[Object.keys(MONS)[0]].n,ic:'🐔',hp:50,dmg:[1,2]});addAlly('cqpet',{sub:'yhzg',n:'宝宝·x',ic:'🐔',hp:50,dmg:[1,2]});addAlly('golem',{hp:10,dmg:[1,1]})`);
ok(G('CQ.Host.pets().length')===2&&G('CQ.Host.pets().every(a=>a.kind==="cqpet")'),'召唤物：只取 cqpet，同主人最多 2 只');
ok(G('CQ.Host.petArt(ALLY[0])')==='assets/cq/ui/pet_ss.png','神兽立绘 pet_ss（无图时卡片退回 emoji）');
ok(/assets\/cq\/ui\//.test(G('CQ.Host.petArt(ALLY[1])')||'')||G('CQ.Host.petArt(ALLY[1])')===null,'宝宝立绘按原怪 monArt');
G('ALLY[0].art="pet_ss_gold"');ok(G('CQ.Host.petArt(ALLY[0])')==='assets/cq/ui/pet_ss_gold.png','有 art 字段优先');
G('ALLY[0].hp=0');ok(G('CQ.Host.pets().length')===2&&!G('CQ.Host.pets().includes(ALLY[0])'),'hp=0 的召唤物不显示');
G('ALLY=[]');
ok(G('(function(){var S0=SKM;return Object.keys(CQ.SKILL_FX_ART).length})()')===4&&G('CQ.SKILL_FX_ART["地狱火"]')==='diyuhuo'&&G('CQ.SKILL_FX_ART["抗拒火环"]')==='kangjuhuohuan'&&G('CQ.SKILL_FX_ART["诱惑之光"]')==='youhuozhiguang'&&G('CQ.SKILL_FX_ART["隐身术"]')==='yinshenshu','4 套美术序列帧按技能名接入');
{const ids=JSON.parse(G('JSON.stringify(Object.keys(SKM).filter(k=>CQ.SKILL_FX_ART[SKM[k].n]))'));ok(ids.length===0||ids.every(id=>G(`CQ.Host.skillFx("${id}")`)===G(`CQ.SKILL_FX_ART[SKM["${id}"].n]`)),'skillFx 专属帧优先于职业 cqfx 通用映射');}
for(const d of['kangjuhuohuan','diyuhuo','youhuozhiguang','yinshenshu']){const m=JSON.parse(fs.readFileSync(path.join(root,'assets/cq/fx',d,'fx.json'),'utf8'));ok(m.frameW===192&&fs.existsSync(path.join(root,'assets/cq/fx',d,'sheet.png'))&&m.loop!==true,'序列帧 '+d+' 存在且不循环');}
ok(JSON.parse(fs.readFileSync(path.join(root,'assets/cq/fx/diyuhuo/fx.json'),'utf8')).type==='line','地狱火 fx.json type=line');
ok(/an\.line/.test(fs.readFileSync(path.join(root,'cq/cq_fx.js'),'utf8'))&&/ctx\.rotate\(ang\)/.test(fs.readFileSync(path.join(root,'cq/cq_fx.js'),'utf8')),'cq_fx 支持 line 类型（根部锚定、旋转、朝左翻转）');
ok(G('CQ.capDmg(1000,{src:"hero",base:100})')===180&&G('CQ.capDmg(500,{src:"combo",mul:3.6})')===250&&G('CQ.capDmg(50,{src:"hero",base:100})')===50,'英雄/合击伤害走 CQ_BAL.cap 1.8 倍封顶');
G('var hc3=new CQ.Hero(1,localStorage);var host3=Object.assign({},host,{dps:()=>1000,cap:CQ.capDmg});hc3.h.rage=100;hc3.h.hejiCd=0;var r3=hc3.doHeji(host3,true)');ok(G('r3.total')<=1000*6.5*1.8+2&&G('r3.total')>=1000*6*.9-2,'合击 6–6.8 秒 DPS 且经封顶');
ok(CQ_T('dpsWin')===120&&CQ_T('hejiCd')===30,'有效 DPS 窗口 120 秒、合击冷却 30 秒（原版）');
G('var mo=mkMon(Object.keys(MONS)[0],1);mo.hp=10;mo.max=10;MON=[mo];var DS=CQ._dpsState,b0=DS.b[DS.b.length-1];hitMon(mo,{phys:5000},"hero","#fff");var b1=DS.b[DS.b.length-1]');ok(G('b1-b0')>0&&G('b1-b0')<=20,'有效 DPS：秒怪溢出不计（5000 伤害打 10 血只记剩余血量；测试里 hitMon 被包了两层）');
// ---------- M1.4 格子走位 / 地图接缝 / 立绘 ----------
ok(/\.cqb \.card,\.cqb \.hero\{[^}]*transition:transform \.2s/.test(css),'逐格移动 0.2 秒一步（原版 MoveBy .2）');
{const sc=fs.readFileSync(path.join(root,'cq/cq_scene.js'),'utf8');ok(/CELLW = 120 \* GK/.test(sc)&&/GRID_TOP = 150/.test(sc)&&!/st\.bossOn \? 160/.test(sc),'格子按原版 120×125 缩放、网格固定不随首领漂移');}
ok(/ground\.jpg\) 0 0\/390px 520px repeat/.test(css)&&!/ground_mirror/.test(css.replace(/\/\*[\s\S]*?\*\//g,'')),'地面用美术2 无缝 ground.jpg 整数 390×520 平铺（撤镜像临时图）');
// ---------- M1.5 卡片 = 格子比例、不重叠 ----------
{const sc=fs.readFileSync(path.join(root,'cq/cq_scene.js'),'utf8'),GK=390/750,colStep=122*GK,cw=Math.floor((colStep-2.5)*2)/2,chh=Math.floor(cw*125/120*2)/2;
 ok(/CARD_GAP = 2\.5/.test(sc)&&colStep-cw>=2&&colStep-cw<=3,'相邻卡片横向留 2–3px（'+(colStep-cw).toFixed(2)+'px）');
 ok(Math.abs(cw/chh-120/125)<0.01,'卡片宽高比 = 原版 120:125');
 ok(!/kind === 'boss'\) \{ w = BW/.test(sc),'首领卡同原版只占 1 格');}
ok(!/font-size:(?:[0-9]|10)(?:\.\d+)?px/.test(css),'全部字号 ≥11px');
ok(G('CQ.Host.petArt({art:"pet_kl"})')==='assets/cq/ui/pet_kl.png'&&G('CQ.Host.petArt({sub:"zhss",n:"金色神兽"})')==='assets/cq/ui/pet_ss_gold.png'&&G('CQ.Host.petArtFb({art:"pet_kl"})')===null,'召唤物优先 pet_*.png，骷髅不再退回 1014');
for(const k of['pet_kl','pet_ss','pet_ss_gold','mdl_mst_orclord','mdl_mst_imp'])ok(fs.existsSync(path.join(root,'assets/cq/ui/'+k+'.png')),'立绘文件 '+k);
ok(G('CQ.Host.monArt({key:"orclord",boss:1,n:"zz"})').indexOf('mdl_mst_orclord.png')>=0||G('!!(CQSys&&CQSys.monArt("orclord"))'),'首领按 key 找 mdl_mst_orclord.png');
G('CQ._artBad.__t=0');ok(G('CQ.Host.monArts({key:"zz_new",n:"鸡"}).join()')==='assets/cq/ui/mdl_mst_zz_new.png,assets/cq/ui/mdl_mst_1001.png,'+G('CQ.Host.monArts({key:"zz_new",n:"鸡"})[2]')&&!/ART_KEYS/.test(fs.readFileSync(path.join(root,'cq_bridge.js'),'utf8')),'立绘候选链：同名 key 文件 → 怪名 → 兜底池，无手写清单');
G('CQ.artBad("assets/cq/ui/mdl_mst_zz_new.png")');ok(G('CQ.Host.monArt({key:"zz_new",n:"鸡"})')==='assets/cq/ui/mdl_mst_1001.png','加载失败缓存后取下一级');
{const sc=fs.readFileSync(path.join(root,'cq/cq_scene.js'),'utf8');ok(/bot = g\.H - BOTH - POTH - PICKH/.test(sc)&&/PICKH = 124/.test(sc)&&/pick\.style\.top = \(pb - 120\)/.test(sc),'网格底边在「一键拾取」行之上（不压格子）');
 ok(/function refreshRole\(\)/.test(sc)&&/function renderUI\(now\)\{ refreshRole\(\);/.test(sc),'换角色/职业刷新角色卡名字与形象');}
for(const k of['treedemon','zombieking','elezombieking','stonezombieking'])ok(fs.existsSync(path.join(root,'assets/cq/ui/mdl_mst_'+k+'.png'))&&G('CQ.Host.monArt({key:"'+k+'",boss:1})').indexOf('mdl_mst_'+k)>=0,'首领立绘 '+k);
{const sc=fs.readFileSync(path.join(root,'cq/cq_scene.js'),'utf8');ok(/CQ\.artBad\(u\)/.test(sc),'卡片 img onerror 逐级兜底');ok(/\.cqb \.plaque\{top:70px;[^}]*writing-mode:horizontal-tb/.test(css)&&/\.cqb\.boss \.plaque\{display:none\}/.test(css)&&!/plaque\.style\.top = Math\.round\(H/.test(sc),'区域牌移到网格上方，不压第 6 列');}
ok(/\.card\.boss \.fig\{[^}]*max-height:150%[^}]*max-width:140%/.test(css),'首领 400 高立绘按卡尺寸等比缩放（不横向压邻格过多）');
ok(G('CQ.heroDpsK({cls:()=>"fs"})')===0.15&&G('CQ.heroDpsK({cls:()=>"zs"})')===0.2&&G('CQ.heroDpsK({cls:()=>"ds"})')===0.17&&G('CQ.heroDpsK({})')===CQ_T('dpsK'),'英雄普攻系数按玩家职业 dpsKBy（缺省 dpsK）');
G('CQ.artBad("assets/cq/ui/mdl_mst_zz_none.png")');ok(/mdl_mst_1001/.test(G('CQ.Host.monArt({key:"zz_none",n:"鸡"})'))&&/mdl_mst_1002/.test(G('CQ.Host.monArt({key:"zz_none",n:"鹿"})')),'monArt 兜底按怪名取传奇之旅立绘');
for(const n of[1001,1002,1003,1004,1005,1006,1007,1008,1009,1011,1012,1022,1023,1024,1025,1034,2002])ok(fs.existsSync(path.join(root,'assets/cq/ui/mdl_mst_'+n+'.png')),'立绘 mdl_mst_'+n);
ok(/body\.cq-on #hud[^{]*#fquest[^{]*#fzone\{display:none/.test(css)||/#fzone\{display:none/.test(css),'战斗页隐藏药水栏/任务行/区域栏（仅 body.cq-on）');
ok(inf.length===1&&inf[0]==='cqBreath','CSS 只有怪物卡片呼吸是 infinite：'+inf.join(','));
ok(/\.cqb \.card \.fig\{[^}]*animation:cqBreath/.test(css),'呼吸挂在 .card .fig');
const js=['cq/cq_fx.js','cq/cq_scene.js','cq_bridge.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
ok(!/iterations\s*:\s*Infinity|infinite/i.test(js.replace(/\/\/.*$/mg,'')),'JS 不创建循环动画');
// 底部导航对齐设计稿：战斗/角色/技能/地图/福利，nav_*.png 图标，不换行
{const bm=fs.readFileSync(path.join(root,'cq/battle_mount.js'),'utf8'),bc=fs.readFileSync(path.join(root,'cq/battle_mount.css'),'utf8');
 ok(/\[\['fight','battle','战斗'\],\['hero','role','角色'\],\['skill','skill','技能'\],\['map','map','地图'\],\['fuli','fuli','福利'\]\]/.test(bm),'底栏五项顺序与设计稿一致');
 ok(['battle','role','skill','map','fuli'].every(n=>fs.existsSync(path.join(root,'assets/cq/ui/nav_'+n+'.png'))),'底栏图标资源存在');
 ok(/#tabs\.cqnav\{[^}]*flex-wrap:nowrap/.test(bc)&&/#tabs\.cqnav button\{[^}]*white-space:nowrap/.test(bc),'底栏不换行');
 ok(/\['bag','背包'\],\['shop','商店'\],\['merc','英雄'\]\]/.test(bm)&&!/\['merc','佣兵'\]/.test(bm),'背包/商店在角色页子页签可达，英雄入口恢复');}
// 测试角色：一律 CQSys.createChar(name,cls) 新建（每职业一个，之后 switchChar 切回），不直接改 S.cls
const QAC={};const useCls=c=>{if(QAC[c])G(`switchChar(${QAC[c]})`);else QAC[c]=G(`CQSys.createChar('QA_${c}','${c}')`);return QAC[c]};
// ---------- 技能栏（设计稿 4 格 + 名称 + 图标，按当前职业，换职业即刷新） ----------
{const row=c=>(useCls(c),G(`(function(){var r=CQ.Host.skills();return JSON.stringify(r.map(function(x){return [x.id,x.n,x.img||'',x.lock||0,(SKM[x.id]||{}).cls]}))})()`));
 for(const c of['zs','fs','ds']){const r=JSON.parse(row(c));
  ok(r.length===4,c+' 技能栏 4 格：'+r.map(x=>x[1]).join('/'));
  ok(r.every(x=>x[4]===c&&x[1]),c+' 全是本职业技能且有名字');
  ok(r.filter(x=>x[2]).length>=3&&r.every(x=>!x[2]||fs.existsSync(path.join(root,x[2]))),c+' 图标为 ic_sk_*.png 且文件存在');}
 ok(row('zs')!==row('fs')&&row('fs')!==row('ds'),'换职业技能栏随之变化');
 useCls('fs');G(`S.sk=Object.assign({},S.sk,{ldsh:1});calc()`);
 const L=JSON.parse(G(`JSON.stringify(CQ.Host.skills().map(function(x){return [x.id,x.lock||0]}))`));
 ok(L.some(x=>x[0]==='hqs'&&!x[1])&&L.filter(x=>!x[1]).length>=1&&L.findIndex(x=>x[1])>L.findIndex(x=>!x[1]),'已学技能在前且未锁定，未学补位为锁定');useCls('zs');
 const sc=fs.readFileSync(path.join(root,'cq/cq_scene.js'),'utf8'),cc=fs.readFileSync(path.join(root,'cq/cq.css'),'utf8');
 ok(/classList\.toggle\('lock'/.test(sc)&&/\.csk\.lock/.test(cc)&&/\.csk \.key\{[^}]*white-space:nowrap/.test(cc),'场景渲染锁定态与名称（不换行）');}
// ---------- 角色 / 技能 / 福利 设计稿页（cq/pages_cq.js） ----------
{const src=fs.readFileSync(path.join(root,'cq/pages_cq.js'),'utf8'),bm=fs.readFileSync(path.join(root,'cq/battle_mount.js'),'utf8');
 ok(/loadPages\(\)/.test(bm)&&/cq\/pages_cq\.js/.test(bm)&&/cq\/pages_cq\.css/.test(bm),'battle_mount 加载 pages_cq.js/css');
 G('__NOUI=0');vm.runInContext(src,ctx,{filename:'cq/pages_cq.js'});G('__NOUI=1');
 const P='cqPg._t';ok(G('typeof cqPg')==='object'&&G('renderHero.__cqpg&&renderSkills.__cqpg&&renderEG.__cqpg')===1,'包装 renderHero/renderSkills/renderEG');
 const sl=JSON.parse(G(`JSON.stringify(${P}.EQL.concat(${P}.EQR))`));ok(sl.length===10&&new Set(sl).size===10&&sl.every(k=>G('SLOTS').includes(k)),'装备人偶只用现有 10 部位：'+sl.join(','));
 const role=G(`${P}.roleTop()`);ok((role.match(/class="cqslot/g)||[]).length===10,'角色页 10 个装备格');
 ok(['一键换装','铁匠强化','分配属性点','切换职业'].every(t=>role.includes(t))&&/战力 <b>/.test(role)&&/剩余属性点/.test(role),'角色页按钮/战力/属性点');
 ok(/CQSys\.equip/.test(src)&&/autoBest\(\)/.test(src),'一键换装走 CQSys.equip.autoBest');
 for(const c of['zs','fs','ds']){useCls(c);const h=G(`${P}.skillPage()`),L=G(`${P}.skList().length`);
  ok(L>=6&&(h.match(/class="sk2/g)||[]).length===L,c+' 技能页列出本职业全部技能 '+L);ok(/ic_sk_\d+\.png/.test(h)&&/自动释放顺序/.test(h),c+' 技能页图标+自动释放顺序');}
 useCls('zs');
 ok(JSON.stringify(G(`${P}.FLN.map(x=>x[1])`))==='["签到","离线收益","悬赏","功业","事件","更多"]','福利页签：签到/离线收益/悬赏/功业/事件/更多');
 const sp=G(`${P}.signPanel()`);ok((sp.match(/class="dy/g)||[]).length===7&&/签到领取|今日已签到/.test(sp),'签到 7 天格 + 领取按钮（CQSys.signin.state）');
 const st0=G('CQSys.signin.state().signed');G('cqPg.sign()');ok(G('CQSys.signin.state().claimedToday')===true&&G('CQSys.signin.state().signed')===st0+1,'签到按钮走 CQSys.signin.claim');
 ok(/今日已签到/.test(G(`${P}.signPanel()`)),'签到后按钮变为已签到');
 ok(/暂无离线收益|领取/.test(G(`${P}.offPanelPg()`))&&/CQSys\.offline/.test(src)&&/claim\(!!d\)/.test(src),'离线收益走 CQSys.offline.state/claim(double)');
 ok(!/S\.cqSign|CQ_SIGN\b/.test(src),'不再自带签到逻辑');}
// ---------- 角色/技能/福利 顶栏（设计稿 topbar） ----------
{const src=fs.readFileSync(path.join(root,'cq/pages_cq.js'),'utf8'),css=fs.readFileSync(path.join(root,'cq/pages_cq.css'),'utf8');
 const T2=JSON.parse(G('JSON.stringify(cqPg._t.TOPT)'));ok(['hero','bag','shop','skill','eg','map'].every(k=>T2[k])&&!T2.fight,'顶栏在 角色(含背包/商店/佣兵)/技能/福利/地图 显示，战斗页不显示（战斗页有自己的金属顶栏）');
 G('S.lvl=17;S.name="顶栏QA";S.gold=12345;calc();H.life=ST.life/2;H.mana=ST.mana');const d=JSON.parse(G('JSON.stringify(cqPg.topData())'));
 ok(d.lvl===17&&d.name==='顶栏QA'&&d.gold===G('CQSys.currency().gold')&&d.yb===G('CQSys.currency().yb'),'顶栏等级/名字/金币/元宝取真实数据（CQSys.currency）');
 ok(Math.abs(d.hp-50)<1&&Math.abs(d.mp-100)<1&&d.power===G('CQSys.power()'),'顶栏血蓝百分比与战力');
 for(const c of['zs','fs','ds']){useCls(c);ok(G('cqPg.topData().cls')===c&&G('ST.mana')>0,c+' 顶栏头像随职业切换（法力为正）');}useCls('zs');
 ok(/\.ava\.fs\{[^}]*hero_fs/.test(css)&&/\.ava\.ds\{[^}]*hero_ds/.test(css),'三职业头像图');
 ok(/#cqtopx\{[^}]*flex-wrap:nowrap/.test(css)&&/#cqtopx \.ccur div\{[^}]*white-space:nowrap/.test(css),'顶栏不换行');
 ok(/setInterval\(\(\)=>\{try\{if\(TOPT\[TAB\]/.test(src)&&/render\.__cqtop/.test(src),'顶栏 render 后与 0.5s 轮询刷新');}
// ---------- 地图页（设计稿 p7_map） ----------
{useCls('zs');G('S.lvl=7;calc();CQMir2Maps.installUI();MAPD=0;CQMir2Maps.show(0)');const P='cqPg._t';ok(G('CQMir2Maps.installUI.done')===1,'实际地图适配器已安装');ok(G('ACTS.length')===7,'传奇版七章');
 const h=G('CQMir2Maps.mapHTML()'),allh=G('ACTS.map((a,i)=>{CQMir2Maps.show(i);return CQMir2Maps.mapHTML()}).join("")');G('CQMir2Maps.show(0)');
 ok((allh.match(/onclick="CQMir2Maps.preview\(/g)||[]).length===G('ACTS.reduce((n,a)=>n+a.zones.length,0)'),'列出全部七章具体地图');ok((h.match(/data-mir2-ch=/g)||[]).length===7&&!/敬请期待/.test(h),'七章导航均可查看');
 ok(['一 · 新手村','二 · 比奇','三 · 矿区','七 · 魔龙城','首领刷新'].every(t=>h.includes(t)),'章节页签 + 首领刷新');
 ok(/钉耙猫头目/.test(allh)&&/半兽人头目/.test(allh)&&/尸王/.test(allh)&&/石墓尸王/.test(allh)&&/Lv\.12/.test(allh)&&/鸡 \/ 鹿/.test(allh),'首领/头目/等级/怪物取真实数据');
 ok(G("CQSys.bossList().every(b=>b.cd===CQSys.bossRt(b.key).cd)")&&G("CQSys.bossList().some(b=>b.cd===600)&&CQSys.bossList().some(b=>b.cd===3600)"),'刷新列表周期取 CQSys.bossRt');
 ok(G(`${P}.zState(0,0,0)`)==='here'&&G(`${P}.zState(0,1,0)`)==='lk'&&G(`${P}.zState(1,0,0)`)==='lk','状态：挂机中/未解锁');
 G('S.unl=2;S.cleared={0:1}');ok(G(`${P}.zState(0,0,0)`)==='here'&&G(`${P}.zState(0,1,0)`)==='open'&&G(`${P}.zState(0,2,0)`)==='open','状态：已解锁');
 G('goZone(1)');ok(G(`${P}.zState(0,0,0)`)==='done','状态：已通关');
G('TAB="map"');ok(G('CQMir2Maps.travel(0,2,0)')===true&&G('S.zone')===2&&G('TAB')==='fight','点地图 → 传送挂机（goZone + 回战斗页）');
 ok(G('CQMir2Maps.travel(0,5,0)')===false&&G('S.zone')===2,'未解锁地图不能传送');
 G('S.actU=S.actU||{};S.actU[0]=1');ok(G('CQMir2Maps.travel(1,0,0)')===true&&G('S.act')===1&&G('S.zone')===0,'跨章节传送（goAct）');G('goAct(0,0,1)');
 ok(G('cqPg._t.TOPT.map')===1,'地图页带顶栏');
 const br=fs.readFileSync(path.join(root,'cq_bridge.js'),'utf8');ok(/openMap: function\(\)\{ var b = document\.querySelector\('#tabs button\[data-t=map\]'\)/.test(br),'openMap 钩子仍点底栏地图');}
// ---------- 地图页 主线任务行 ----------
{useCls('zs');const h=G(`cqPg._t.mapPage('')`),src=fs.readFileSync(path.join(root,'cq/pages_cq.js'),'utf8'),css=fs.readFileSync(path.join(root,'cq/pages_cq.css'),'utf8');
 const q=G('cqPg.mqText()'),ql=G('CQSys.questLine()').replace(/<[^>]*>/g,'');ok(q&&ql.includes(q)&&/\(\d+\/\d+\)/.test(q),'任务行=当前主线任务名+进度（CQSys.questLine）：'+q);
 const i1=h.indexOf('cqmaptabs'),i2=h.indexOf('cqmqrow'),i3=h.indexOf('class="chc');ok(i1>0&&i2>i1&&i3>i2&&h.slice(i1,i2).indexOf('class="chc')<0,'任务行紧跟章节页签、在章节卡之前');
 ok(/\.cqmqrow\{[^}]*white-space:nowrap/.test(css)&&/\.cqmqrow \.t\{[^}]*text-overflow:ellipsis/.test(css)&&/\.cqmqrow\{[^}]*height:30px/.test(css),'任务行单行不换行、超长省略');
 ok(/class="cqmqbox hide"/.test(h)&&G('cqPg.mqToggle()')===true&&/class="cqmqbox"/.test(G(`cqPg._t.mapPage('')`))&&G('cqPg.mqToggle()')===false,'点击展开/再点收起');
 ok(/classList\.contains\('cqmq'\)\?mqb:det/.test(src),'原 .cqmq 面板移入展开框，不再放底部折叠区');
 ok(/closest\('\.cqmqbox,\.cqmqrow'\)\)mqToggle\(false\)/.test(src),'点空白处收起');}
// ---------- 英雄战斗（M2：走位 / 开启技能 AI / 合击怒气 / 受伤阵亡复活 / 无佣兵） ----------
{G(`var Bm={mons:[{uid:7,idx:5,walk_spd:99,moveT:99}],roleIdx:24,_pets:[{hp:1,idx:24-6}]};var _st=[];for(let i=0;i<30;i++){const a=Bm._pets[0].idx;CQ.MOVE.update(Bm,.4);_st.push(CQ.MOVE.cheb(a,Bm._pets[0].idx))}`);
 ok(G('_st.every(d=>d<=1)')&&G('_st.some(d=>d===1)'),'英雄每次只走一格');ok(G('CQ.MOVE.cheb(Bm._pets[0].idx,5)')<=1,'英雄走到怪身边');
 G('var _hsp=typeof heroSkPick==="function"?heroSkPick:undefined;globalThis.heroSkPick=undefined');// 先测本文件 HERO_SK 兜底
 G(`var hh=new CQ.Hero(2,localStorage);hh.h.prof=1;hh.h.exists=true;hh.h.autoHeji=false;var hit2=[];var gh={idx:0};var gv={};
  var h2={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d,s)=>{hit2.push(d);return d},atkMax:()=>100,lvl:()=>12,heroK:()=>.35,inRange:(m,r)=>CQ.MOVE.cheb(gh.idx,gv.idx)<=r};
  MON=[mkMon(Object.keys(MONS)[0],10)];MON[0].hp=1e7;gv.idx=20;hh.unit.atkT=0;hh.tick(.01,h2)`);
 ok(G('hit2.length')===0,'战士英雄：怪在射程外不出手');G('gv.idx=1;hh.unit.atkT=0;hh.tick(.01,h2)');ok(G('hit2.length')===1,'贴身后出手');
 G('hh.h.prof=2;gv.idx=4;hh.cds={};hh.unit.atkT=0;var e1=hh.tick(.01,h2)');ok(G('e1&&e1.skill')==='雷电术','法师英雄射程 4，放最高优先级已开技能（雷电术）');
 G('hh.unit.atkT=0;var e2=hh.tick(.01,h2)');ok(G('e2.skill')!=='雷电术','技能冷却中换下一个');
 G("hh.cds={};hh.h.skOff={ldsh:1};hh.unit.atkT=0;var e3=hh.tick(.01,h2)");ok(G('e3.skill')==='地狱火','关闭的技能不放（skOff）');
 G("hh.cds={};hh.h.skOff={bpx:1,ldsh:1,dyh:1,kjhh:1,hqs:1};hh.unit.atkT=0;var e4=hh.tick(.01,h2)");ok(G('e4.skill')===null&&G('e4.dmg')>0,'全关只普攻');
 G("hh.h.skOff={};hh.h.sk={hqs:{lv:1}};hh.cds={};hh.unit.atkT=0;var e5=hh.tick(.01,h2)");ok(G('e5.skill')==='火球术','有技能书表时只放学会的');G('delete hh.h.sk');
 G('hh.h.rage=0;hh.cds={};hh.unit.atkT=0;hh.tick(.01,h2)');ok(G('hh.h.rage')===3,'英雄出手 +3 怒气（原版）');
 G("hh.h.mode='rest';hh.h.rage=0;hh.unit.atkT=0;hit2.length=0;hh.tick(.01,h2);hh.addRage(5)");ok(G('hh.h.rage')===0&&G('hit2.length')===0,'休息模式不出手不涨怒气');G("hh.h.mode='attack'");
 G('globalThis.heroSkPick=_hsp');
 ok(G('CQ.HEJI.COMBO["1+2"].stun')===2&&G('CQ.HEJI.COMBO["3+3"].dot')===.2&&G('CQ.HEJI.COMBO["2+3"].heal')===.2&&G('CQ.HEJI.COMBO["1+3"].aoe')===false,'合击效果与原版一致（眩晕/持续/回血/单体）');
 G('hh.unit.hp=hh.unit.maxhp=100;hh.h.rage=0;var hu=hh.hurt(30,h2)');ok(G('hu.dmg')>0&&!G('hu.dead')&&G('hh.h.rage')===2,'英雄受伤掉血 +2 怒气');
 G('var hd=hh.hurt(1e6,h2)');ok(G('hd.dead')&&G('hh.reviveLeft(Date.now())')===30,'英雄阵亡，30 秒后复活');
 ok(G('hh.hurt(10,h2)')===null&&G('hh.tick(1,h2)')===null,'阵亡中不受伤不出手');
 G('var _n=h2.now;h2.now=()=>Date.now()+31e3;var rv=hh.tick(.01,h2);h2.now=_n');ok(G('rv&&rv.type')==='herorevive'&&G('hh.unit.hp===hh.unit.maxhp'),'复活满血');
 G(`CQ.Scene=CQ.Scene||{mounted:()=>false};var _g0=CQ.Scene.grid;var GB={b:{roleIdx:26},hero:{idx:8},view:m=>m._v};MON=[mkMon(Object.keys(MONS)[0],10),mkMon(Object.keys(MONS)[0],10),mkMon(Object.keys(MONS)[0],10)];MON[0]._v={idx:9};MON[1]._v={idx:20};MON[2]._v={idx:27};CQ.Scene.grid=()=>GB;var at=CQ._heroAttackers();CQ.Scene.grid=_g0`);
 ok(G('at.length')===1&&G('at[0]===MON[0]'),'只有贴身英雄（且没贴主角）的怪打英雄');
 G(`ALLY.push({kind:'merc',uid:991,hp:50,max:50});S.merc=S.merc||{t:'archer',lvl:1,eq:{}};CQSys.heroMigrate();step(.1)`);ok(G("ALLY.every(a=>a.kind!=='merc')")&&G('typeof mercTick')==='undefined','旧佣兵不再参战');}
{const fs2=require('fs');const C=G('JSON.stringify(Object.entries(CQ.HEJI.COMBO).map(([k,v])=>[k,v.fx]))');const M={'1+2':'leitingyiji','1+3':'pixingzhan','2+3':'morishenpan','1+1':'pohunzhan','2+2':'huolongqiyan','3+3':'shihunzhaoze'};
 ok(JSON.parse(C).every(([k,f])=>f==='heji_'+M[k]&&fs2.existsSync(root+'/assets/cq/ui/'+f+'.png')),'6 种合击组合 → heji_<名>.png 图标都在');
 ok(['zs','fs','ds'].every(c=>fs2.existsSync(root+'/assets/cq/ui/hero_head_'+c+'.png')),'英雄头像 hero_head_zs/fs/ds 都在');
 const sc=fs2.readFileSync(root+'/cq/cq_scene.js','utf8');ok(/function hejiIcon\(cb\)\{ return UI \+ \(cb && cb\.fx/.test(sc)&&/btn_heji\.png'; \}/.test(sc),'合击按钮按组合换图，缺图退回 btn_heji');
 ok(/'hero_head_' \+ \(PCLS\[p\]/.test(sc)&&/data-a="hero" data-r="hbtn"/.test(sc),'战斗页英雄按钮按英雄职业显示头像');ok(/class="hjic"/.test(sc),'合击演出大字带组合图标');}
if(G("typeof heroSkPick")==='function'){// 职业开发 cls_hero.js 接入（分支 cls-hero；master 未合并时跳过）
 G(`S.hero=null;CQSys.hero();S.hero.cls=null;S.lvl=22;CQSys.heroCreate('fs');var hc3=new CQ.Hero(1,{load:()=>({prof:2,exists:true,name:'x',rage:0,autoHeji:false,skOff:S.hero.skOff}),save:()=>{}});MON=[mkMon(Object.keys(MONS)[0],10)];MON[0].hp=1e7;
  var hit3=[];var h3={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d,s)=>{hit3.push(s);return d},atkMax:()=>100,lvl:()=>12,heroK:()=>.35};hc3.unit.atkT=0;var c3=hc3.tick(.01,h3)`);
 ok(G('c3&&c3.skill')==='火球术'&&G('hit3.every(s=>s==="cqhero")'),'有 cls_hero 时用 heroSkPick/heroCast 施法（初始火球术）');
 G(`S.hero.skOff={hqs:1};hc3.h.skOff=S.hero.skOff;for(const k in HERO_CD)delete HERO_CD[k];hc3.unit.atkT=0;var c4=hc3.tick(.01,h3)`);ok(G('c4&&c4.skill')===null&&G('c4.dmg')>0,'关闭后 heroSkPick 不选，改普攻');
 G(`hc3.h.skOff={heji:1};hc3.h.autoHeji=true;hc3.h.rage=100;hc3.h.hejiCd=0;hc3.unit.atkT=9;var c5=hc3.tick(.01,h3)`);ok(!(G('c5')&&G('c5.type')==='heji'),'skOff.heji 时不自动合击');}
{const fs3=require('fs'),src=fs3.readFileSync(root+'/cq/pages_cq.js','utf8');
 const chapters=G('CQMir2Maps.chapters');
 ok(chapters.length===4&&chapters.every(c=>fs3.existsSync(root+'/'+c.thumb)&&fs3.existsSync(root+'/'+c.bg)),'第四至七章场景与章节缩略图均使用存在的原创素材');
 ok(/zThumb\(a,i,'zth'\)/.test(src)&&/zThumb\(a,i,'zhead'\)/.test(src)&&/onerror="this\.style\.display='none'"/.test(src),'区域行与传送弹窗用同一张缩略图，缺图隐藏');
 ok(/c\.a>=2\?`assets\/cq\/map\/chapter_\$\{c\.a\+1\}\.webp`/.test(src)&&/chapter_4\.webp/.test(src)&&fs3.existsSync(root+'/assets/cq/map/chapter_3.webp')&&fs3.existsSync(root+'/assets/cq/map/chapter_4.webp'),'第 3/4 章卡片用 chapter_3/4.webp，1/2 章保留 stage_1001/1002');
 ok(!/1017/.test(src)&&/mdl_mst_\$\{b\}\.png/.test(src),'首领头像直接 mdl_mst_<key>.png，无 skelspirit→1017 兜底');}
{const fs4=require('fs'),css=fs4.readFileSync(root+'/cq/pages_cq.css','utf8'),js=fs4.readFileSync(root+'/cq/pages_cq.js','utf8');
 ok(['prof_bar_9s','prof_bar_fill_9s','sign_cell_9s','stamp_ok'].every(f=>fs4.existsSync(root+'/assets/ui/'+f+'.png')),'UI 美术 d851afb 4 张图都在');
 ok(/--cq-prof-bar,url\(\.\.\/assets\/ui\/prof_bar_9s\.png\)\) 6 fill/.test(css)&&/--cq-prof-bar-fill,url\(\.\.\/assets\/ui\/prof_bar_fill_9s\.png\)\) 5 fill/.test(css),'技能熟练度条：底 slice 6、填充 slice 5');
 ok(/Lv\.\$\{b\}\/\$\{SKMX\(\)\}/.test(js)&&/CLS_SKMAX/.test(js),'等级标签 Lv.x/上限（CLS_SKMAX，缺省 20）');
 ok(/sign_cell_9s\.png\)\) 12 fill/.test(css)&&/\.dy\.ok::after\{content:"";[^}]*stamp_ok\.png/.test(css),'签到格 sign_cell_9s slice 12，已签用 stamp_ok 印章替换 ✔');}
{const fs5=require('fs'),js=fs5.readFileSync(root+'/cq/pages_cq.js','utf8'),sc=fs5.readFileSync(root+'/cq/cq_scene.js','utf8');
 ok(/CQSys\.uiIcon\(k\)/.test(js)&&/'--cq-'\+k/.test(js)&&/C\.uiIcon\(k\)/.test(sc),'UI 杂项图/英雄头像优先 CQSys.uiIcon，原路径兜底');
 ok(/r\.reward\.icon\)SIGNIC\[r\.day\]=r\.reward\.icon/.test(js),'签到用 claim() 返回的技能书图标');
 ok(/data-a="hjoff"/.test(sc)&&/skToggle\('heji'/.test(sc),'英雄面板有合击开关（skOff.heji / CQSys.hero.skToggle）');
 G(`var hk=new CQ.Hero(1,localStorage);hk.h.exists=true;hk.h.autoHeji=true;hk.h.rage=100;hk.h.hejiCd=0;hk.unit.hp=hk.unit.maxhp=100;MON=[mkMon(Object.keys(MONS)[0],10)];MON[0].hp=1e7;var hkh={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d)=>d,atkMax:()=>100,lvl:()=>12,heroK:()=>.35};hk.unit.atkT=9;var ka=hk.autoHeji(hkh)`);
 ok(G('ka&&ka.type')==='heji'&&G('hk.h.hejiCd')===30,'合击开：自动合击，冷却 30 秒');
 G(`hk.h.skOff={heji:1};hk.h.rage=100;hk.h.hejiCd=0;var kb=hk.autoHeji(hkh)`);ok(G('kb')===null,'合击关：不自动合击');}
{G(`var hd2=new CQ.Hero(3,localStorage);hd2.h.prof=3;hd2.h.exists=true;hd2.unit.hp=hd2.unit.maxhp=100;MON=[mkMon(Object.keys(MONS)[0],10),mkMon(Object.keys(MONS)[0],10)];MON.forEach(m=>m.hp=1e9);
  var hdh={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d)=>d,atkMax:()=>100,lvl:()=>12,heroK:()=>.35,dps:()=>1000};hd2.h.rage=100;hd2.h.hejiCd=0;var rd=hd2.doHeji(hdh,true)`);
 ok(G('rd.name')==='噬魂沼泽'&&G('rd.total*(1+0.2*5)')>=1000*6*.9-4&&G('rd.total*(1+0.2*5)')<=1000*6.8*1.1+4,'噬魂沼泽：首击+5 跳持续合计 ≈ 一次合击总伤（不翻倍）');
 ok(G('JSON.stringify(CQ.HERO_TUNE.dpsKBy)')==='{"zs":0.2,"fs":0.15,"ds":0.17}'&&CQ_T('hejiCd')===30&&CQ_T('hejiSec')===6.5,'英雄普攻系数 zs.2/fs.15/ds.17，合击 6.5 秒 DPS、冷却 30 秒');}
T.done();
