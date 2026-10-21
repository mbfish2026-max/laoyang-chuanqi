// M2 系统：node tests/cq_m2_test.js
const T=require('./cq_harness')('cq_m2_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.lvl=20;calc()`);ok(G('CQSys.m2')===1,'M2 就绪');
// ---- 第 2–3 章数据
ok(G('ACTS[1].n')==='第二章 · 比奇'&&G('ACTS[1].camp')==='比奇城'&&G('ACTS[1].zones.length')===6,'第 2 章地图链 6 张');
ok(G('ACTS[2].n')==='第三章 · 矿区'&&G('ACTS[2].zones.length')===6,'第 3 章地图链 6 张');
ok(G('ACTS[1].zones.every(z=>z.mons.every(k=>MONS[k]))&&ACTS[2].zones.every(z=>z.mons.every(k=>MONS[k]))'),'怪物 key 全部存在');
const ml=JSON.parse(G('JSON.stringify([ACTS[1].zones.map(z=>z.ml0||z.ml),ACTS[2].zones.map(z=>z.ml0||z.ml)])'));
ok(ml[0][0]===12&&ml[0][5]===22&&ml[1][0]===22&&ml[1][5]===30,'等级段 12–22 / 22–30 '+JSON.stringify(ml));
ok(G(`['skelspirit','treedemon','zombieking','elezombieking','stonezombieking'].every(k=>BOSSES[k])`)&&G('BOSSES.zombieking.actboss')===1&&G('BOSSES.stonezombieking.actboss')===1,'首领 5 个，两个章节首领');
ok(G(`ACTS[1].fq==='a2q6'&&QUESTS.a2q6.fin&&QUESTS.a3q6.fin&&!/符文|卡萨尔/.test(JSON.stringify([QUESTS.a2q1,QUESTS.a2q2,QUESTS.a2q6,QUESTS.a3q6]))`),'任务改写');
ok(G(`['skelspirit','treedemon','zombieking','elezombieking','stonezombieking'].every(k=>UNIQUES.filter(u=>u.boss===k&&BASEM[u.b]).length===2)`),'每首领 2 件专属且底材存在');
ok(G(`(blBuild(),['zombieking','stonezombieking'].every(k=>BOSS_LOOT[k]&&BOSS_LOOT[k].length===2))`),'bossloot 读到专属');
G(`S.act=1;S.zone=0;S.wave=0;MON=[]`);let n=0;for(let i=0;i<20;i++){G('MON=[];spawnWave()');n+=G('MON.length')}ok(n>0,'第 2 章刷怪正常');
// ---- 首领真实时间刷新
ok(G(`CQSys.bossCd('skelspirit')`)===600&&G(`CQSys.bossCd('zombieking')`)===1800&&G(`CQSys.bossCd('stonezombieking')`)===3600,'周期 10/30/60 分钟');
ok(G(`CQSys.bossRt('skelspirit').ready`)===true,'未击杀过 = 已刷新');
G(`window._ev=[];['bossKill','bossReady','bossWait'].forEach(e=>CQSys.on(e,d=>_ev.push(e+':'+d.key)))`);
G(`S.act=1;S.zone=1;S.wave=0;MON=[];const m=mkMon('skelspirit',16);m.qb=1;MON.push(m);killMon(m)`);
const r1=JSON.parse(G(`JSON.stringify(CQSys.bossRt('skelspirit'))`));ok(!r1.ready&&r1.left>590&&r1.kills===1,'击杀后开始倒计时');
G(`S.wave=ACTS[1].zones[1].w-1;MON=[];spawnWave()`);ok(!G(`MON.some(m=>m.key==='skelspirit')`)&&G('MON.length')>0&&G(`ACTS[1].zones[1].boss`)==='skelspirit','未刷新时首领波不出首领、数据不被改坏');
G(`S.bossRt.skelspirit.k-=601e3;step(1.1)`);ok(G(`CQSys.bossRt('skelspirit').ready`)===true&&G('_ev.join()').includes('bossReady:skelspirit'),'到点 bossReady（真实时间）');
G(`MON=[];spawnWave()`);ok(G(`MON.some(m=>m.key==='skelspirit')`),'刷新后首领波出首领');
ok(G(`CQSys.bossList(1).length`)===3&&G(`CQSys.bossList().length`)>=8,'首领列表');
ok(G(`CQSys.bossGo('treedemon').err||''`)!==''||G(`S.zone`)===4,'前往（未解锁时拒绝）');
// ---- 离线收益
G(`S.act=1;S.zone=1;S.unl=5;S.q.a2q2=1;S.hero={cls:'zs',name:'阿战',eq:{},rage:0,autoHeji:1,lvl:20};CQSys.hero();S.bossRt.skelspirit={k:Date.now()-5*3600e3,n:3};S.last=Date.now()-3*3600e3;S.lvl=30;calc()`);
G(`window._p=CQSys.power;CQSys.power=()=>99999`);G('offline()');G('CQSys.power=_p');
const off=JSON.parse(G('JSON.stringify(CQSys.offlineLast())'));
ok(off&&off.kills>0&&off.heroKills===Math.floor(off.kills*0.2)&&off.heroXp>0,'离线英雄击杀 = 本体×20% '+JSON.stringify({k:off.kills,h:off.heroKills}));
ok(off.boss.length===1&&off.boss[0].win&&off.boss[0].kills>=1&&off.boss[0].kills<=6,'离线期间首领按刷新次数击杀（上限 6）'+JSON.stringify(off.boss));
G(`S.last=Date.now()-30*3600e3;CQSys.power=()=>99999;offline();CQSys.power=_p`);const off2=JSON.parse(G('JSON.stringify(CQSys.offlineLast())'));
ok(off2.capSec===8*3600&&off2.boss[0].kills<=6,'离线上限 8 小时');
G(`S.bossRt.skelspirit={k:Date.now()-5*3600e3,n:3};S.last=Date.now()-3*3600e3;CQSys.power=()=>1;offline();CQSys.power=_p`);
ok(JSON.parse(G('JSON.stringify(CQSys.offlineLast())')).boss[0].win===false,'战力不足离线不击杀首领');
// ---- 技能书
ok(G(`['zs_csjs','zs_lhjf','fs_ldsh','ds_ysh','ds_zhss'].every(k=>CQ_BOOKS[k]&&!CQ_BOOKS[k].placeholder&&CQ_BOOKS[k].sk===k.slice(3))`)&&G(`CQ_BOOKS.zs_lhjf.lv`)===G(`SKM.lhjf.r`)&&!G(`CQ_BOOKS.zs_cs`),'技能书 id/等级对齐 cls_*.js');
ok(G(`CQSys.books('zs').length`)===6&&G(`CQSys.books('fs').length`)===14&&G(`CQSys.books('ds').length`)===12,'占位技能书 6/14/12');
G(`S.cls='zs';S.lvl=30;S.bag=[];CQSys.addMat('book_zs_gsjs',1)`);ok(G(`CQSys.bookCount('zs_gsjs')`)===1,'书是材料');
G(`window._lh=[];CQSys.onBookLearn(b=>_lh.push(b.id))`);
G(`S.lvl=10`);ok(G(`CQSys.bookLearn('fs_hqs').err`)==='职业不符'&&G(`CQSys.bookLearn('zs_lhjf').err`)==='需要等级 16','学习校验');G(`S.lvl=30`);
ok(G(`CQSys.bookLearn('zs_gsjs').ok`)===1&&G(`CQSys.bookKnown('zs_gsjs')`)&&G('_lh[0]')==='zs_gsjs'&&G(`CQSys.bookCount('zs_gsjs')`)===0,'学习：消耗书、记 S.cqBooks、回调职业 Bot');
ok(G(`CQSys.bookLearn('zs_gsjs').err`)==='已学会','不能重复学');
G(`CQSys.bookDef('zs_gsjs',{n:'攻杀剑术',lv:7,sk:'gs'})`);ok(G(`CQ_BOOKS.zs_gsjs.sk`)==='gs'&&!G(`CQ_BOOKS.zs_gsjs.placeholder`),'职业 Bot 可覆盖书定义');
let bd=0;G(`window._b=0;CQSys.on('bookDrop',()=>_b++)`);G(`for(let i=0;i<300;i++){const m=mkMon('zombieking',22);rollTC(m)}`);bd=G('_b');ok(bd>40&&bd<140,'章节首领爆书率≈30% 实测 '+bd+'/300');
// ---- 召唤物
G(`S.cls='ds';S.summons=[]`);ok(G(`CQSys.summonAdd('dog',{lv:3}).ok`)===1&&G(`CQSys.summonAdd('dog',{lv:3}).err`)==='数量已满','道士神兽 1 只');
ok(G(`CQSys.summonAdd('pet',{mon:'cqskel'}).err`)==='职业不符','道士不能诱惑');
const dog=JSON.parse(G(`JSON.stringify(CQSys.summonStats(S.summons[0].id))`));ok(dog.hp>0&&dog.atk>0&&dog.alive,'神兽属性 '+JSON.stringify(dog));
G(`const it=genItem(20,{base:BASEM.amu3,q:3});S.bag.push(it);window._u=it.uid`);ok(G(`CQSys.summonEquipCollar(S.summons[0].id,_u).ok`)===1,'项圈位');
G(`CQSys.summonDie(S.summons[0].id)`);ok(G(`CQSys.summonRevive(S.summons[0].id).err`)==='冷却中','死亡 60 秒复活冷却');
G(`S.summons[0].deadAt-=61e3`);ok(G(`CQSys.summonRevive(S.summons[0].id).ok`)===1,'冷却后复活');
G(`S.cls='fs';S.act=1;S.zone=0`);ok(G(`CQSys.summonAdd('pet',{mon:'cqskel',lv:5}).ok`)===1&&G(`CQSys.summonAdd('pet',{mon:'cqskel',lv:5}).err`)==='数量已满','法师宝宝 技能<10 级 1 只');
ok(G(`CQSys.summonAdd('pet',{mon:'cqskelwar',lv:10}).ok`)===1&&G(`CQSys.summonAdd('pet',{mon:'cqskel',lv:20}).err`)==='数量已满','≥10 级 2 只，最多 2');
ok(G(`CQSys.summonAdd('pet',{mon:'zombieking',lv:20}).err`)!=null,'不能诱惑首领/别图怪');
G(`CQSys._summonReset();CQSys._heroReset&&CQSys._heroReset();MON.length=0;window._m={hp:1e9,max:1e9,res:{},def:0,lv:30,key:'cqskel'};MON.push(_m)`);
G(`for(let i=0;i<20;i++)hitMon(_m,{phys:100},'player');for(let i=0;i<50;i++)hitMon(_m,{phys:500},'cqpet')`);
const ss=JSON.parse(G('JSON.stringify(CQSys.summonShare())'));ok(ss.share<=0.6+1e-6&&ss.share>0.55,'召唤物伤害占比 ≤60% 实测 '+ss.share.toFixed(3));
G(`save()`);ok(G(`JSON.parse(GS.getItem(CH_PRE+ACCT.cur)).summons.length`)===3&&G(`!!JSON.parse(GS.getItem(CH_PRE+ACCT.cur)).bossRt`),'召唤物/首领计时进角色存档');
// ---- 第 1 章通关解锁第 2 章（修复 q6 缺 fin）+ 存档迁移 v2
G(`S=newSave();load();S.q={q6:0}`);ok(G(`QUESTS.q6.fin===1&&QUESTS.q6.act===0`),'q6 带 fin/act');G(`questDone('q6')`);ok(G('actOpen(1,0)')===true,'打完半兽统领解锁第二章');
G(`S=newSave();load();S.q={q6:1};S.sv=1;delete S.bossRt;cqMigrate()`);ok(G('S.sv')>=2&&G('actOpen(1,0)')===true&&G('typeof S.bossRt')==='object','迁移 v2：旧存档补解锁第二章');
// ---- 全部任务可完成：清图任务带 clear，首领任务所在地图有该首领
{const bad=JSON.parse(G(`JSON.stringify(Object.keys(QUESTS).filter(k=>/^(q[1-6]|a[23]q[1-6])$/.test(k)).filter(k=>{let z=null;ACTS.forEach(a=>a.zones.forEach(x=>{if(x.quest===k)z=x}));if(!z)return true;return !QUESTS[k].clear&&!z.boss}))`));ok(bad.length===0,'第 1–3 章任务都可完成（清图带 clear 或地图有首领） '+bad.join());
 G(`S=newSave();load();S.q={};S.act=0;S.zone=ACTS[0].zones.findIndex(z=>z.quest==='q5');MON=[];zoneClear()`);ok(G('!!S.q.q5'),'清完比奇城东完成 q5');
 G(`S=newSave();load();S.q={q6:1};S.sv=2;cqMigrate()`);ok(G('S.sv')===3&&G('!!(S.q.q1&&S.q.q3&&S.q.q5)'),'迁移 v3：已通第一章补完成 q1/q3/q5');}
T.done();
