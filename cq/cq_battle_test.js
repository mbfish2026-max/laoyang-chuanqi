// 老羊传奇 M1 战斗移植测试：node cq/cq_battle_test.js
// 走位（传奇原规则）/ 英雄与合击规则 / 桥接 Host 读数与包装 / 特效只播一次（CSS 只有呼吸是 infinite）
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.join(__dirname,'..');
const T=require(path.join(root,'tests','cq_harness'))('cq_battle_test');const{G,ok,ctx}=T;
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
ok(G('hero.h.rage')===0&&G('hero.h.hejiCd')===30,'合击后怒气清零、冷却 30 秒');
ok(G('r.hits[0].d')>=Math.round(135*3.2*1.24*.9)-1,'合击伤害=(玩家上限+英雄上限)×倍率×(1+等级/50)');
ok(!G('hero.doHeji(host,true).ok'),'冷却中不能再次合击');
G('hero.tick(31,host)');ok(G('hero.h.hejiCd')===0,'冷却随时间结束');
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
ok(/body\.cq-on #hud[^{]*#fquest[^{]*#fzone\{display:none/.test(css)||/#fzone\{display:none/.test(css),'战斗页隐藏药水栏/任务行/区域栏（仅 body.cq-on）');
ok(inf.length===1&&inf[0]==='cqBreath','CSS 只有怪物卡片呼吸是 infinite：'+inf.join(','));
ok(/\.cqb \.card \.fig\{[^}]*animation:cqBreath/.test(css),'呼吸挂在 .card .fig');
const js=['cq/cq_fx.js','cq/cq_scene.js','cq_bridge.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
ok(!/iterations\s*:\s*Infinity|infinite/i.test(js.replace(/\/\/.*$/mg,'')),'JS 不创建循环动画');
T.done();
