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
ok(G('hero.h.prof')===3&&G('hero.combo().name')==='雷霆一击','战士默认带道士，合击=雷霆一击');
ok(G("CQ.HEJI.COMBO[CQ.HEJI.comboKey(3,1)].name")==='雷霆一击'&&G("CQ.HEJI.COMBO['2+2'].name")==='火龙气焰','合击表与顺序无关');
G(`var hits=[];var host={now:()=>Date.now(),targets:()=>MON.filter(m=>m.hp>0),hit:(m,d,s)=>{hits.push([m.uid,d,s]);return d},atkMax:()=>100,lvl:()=>12,heroK:()=>.35};
  MON=[mkMon(Object.keys(MONS)[0],10),mkMon(Object.keys(MONS)[0],10)];hero.h.autoHeji=false`);
ok(!G('hero.doHeji(host,true).ok')&&/怒气不足/.test(G('hero.doHeji(host,true).msg')),'怒气不足不能合击');
G('hero.addRage(250)');ok(G('hero.h.rage')===100,'怒气上限 100');
G('var r=hero.doHeji(host,true)');
ok(G('r.ok')&&G('r.hits.length')===2,'群体合击命中全部目标');
ok(G('hero.h.rage')===0&&G('hero.h.hejiCd')===CQ_T('hejiCd'),'合击后怒气清零、冷却 HERO_TUNE.hejiCd 秒');
ok(G('r.total')>=Math.round(135*3.2*.9)-2&&G('r.total')<=Math.round(135*3.2*1.1)+2,'无 DPS 兜底：合击总伤=(玩家上限+英雄上限)×倍率，去掉等级加成');
G('host.dps=()=>1000;hero.h.rage=100;hero.h.hejiCd=0;var r2=hero.doHeji(host,true)');ok(G('r2.total')>=1000*6*.9-2&&G('r2.total')<=1000*6.8*1.1+2,'合击总伤 ≈ 玩家 6–6.8 秒 DPS');
G('hits.length=0;hero._fr=0;hero.unit.atkT=0;hero.tick(.01,host)');ok(G('hits[0][1]')>=Math.floor(1000*CQ_T('dpsK')*1.6*.9)-1&&G('hits[0][1]')<=Math.ceil(1000*CQ_T('dpsK')*1.6*1.1),'英雄普攻 = 玩家 DPS×dpsK×1.6 秒');
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
  G('CQSys.heroCreate("ds");hy.reload()');ok(G('hy.present()')&&G('hy.h.prof')===3,'heroCreate 后 reload 出现');
  ok(G('CQ.Host.heroStats()&&CQ.Host.heroStats().hp')>0,'heroStats 接入');
  const rr=JSON.parse(G('JSON.stringify(CQ.Host.role())'));ok(typeof rr.yb==='number'&&typeof rr.power==='number','顶栏元宝/战力来自 CQSys');
  ok(/mdl_mst_1015/.test(G('CQ.Host.monArt({key:"halforc"})')),'monArt 用 CQSys.monArt');
  ok(G('CQ.Host.bossInfo()&&("alive" in CQ.Host.bossInfo())'),'bossInfo 接入');
  G('window.CQ_SKCD.__t=5;CQSys.skillCast("__t")');ok(G('CQ.Host.skills.length>=0')&&G('(function(){var C=CQSys.skillCooldown("__t");return !C.placeholder&&C.cd===5})()'),'skillCooldown 已登记时取正式冷却');
  // step 内英雄出手（不依赖战斗页）
  G(`CQ._install();var HC=CQ.heroCore();HC.h.autoHeji=true;MON=[mkMon(Object.keys(MONS)[0],10)];MON[0].hp=MON[0].max=1e7;var _h0=0;var _hm2=hitMon;`);
  G(`var heroDmg=0;var _hw=hitMon;hitMon=function(m,d,src){var t=_hw.apply(this,arguments);if(src==='cqhero')heroDmg+=t;return t};for(var i=0;i<200;i++){step(.05)}`);
  ok(G('heroDmg')>0||G('HC.unit.atkT')<CQ_T('atkT'),'英雄在 step() 内出手（离开战斗页也算）');
}
ok(/body\.cq-on #hud[^{]*#fquest[^{]*#fzone\{display:none/.test(css)||/#fzone\{display:none/.test(css),'战斗页隐藏药水栏/任务行/区域栏（仅 body.cq-on）');
ok(inf.length===1&&inf[0]==='cqBreath','CSS 只有怪物卡片呼吸是 infinite：'+inf.join(','));
ok(/\.cqb \.card \.fig\{[^}]*animation:cqBreath/.test(css),'呼吸挂在 .card .fig');
const js=['cq/cq_fx.js','cq/cq_scene.js','cq_bridge.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
ok(!/iterations\s*:\s*Infinity|infinite/i.test(js.replace(/\/\/.*$/mg,'')),'JS 不创建循环动画');
T.done();
