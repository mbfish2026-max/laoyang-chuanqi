// M1 系统接口：node tests/cq_sysapi_test.js
const T=require('./cq_harness')('cq_sysapi_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.lvl=10;calc()`);
ok(G('CQSys.api')===1,'CQSys.api 就绪');
ok(G('CQSys.classes().map(c=>c.id).join()')==='zs,fs,ds','职业列表');
const id=G(`CQSys.createChar('老羊','fs')`);ok(id>0||id===0,'创建法师角色');ok(G('S.cls')==='fs'&&G('S.name')==='老羊','切到新角色');
G('S.lvl=22');ok(G(`CQSys.heroCreate('zs','阿战').ok`)===1&&G('S.hero.cls')==='zs','创建英雄');
ok(G(`CQSys.heroCreate('ds').err`)==='已有英雄','英雄只能建一次');
G(`CQSys.heroSet({rage:150,autoHeji:0});save()`);ok(G('S.hero.rage')===100&&G('S.hero.autoHeji')===0,'怒气封顶 100');
G(`const it=genItem(5,{base:BASEM.swd1,q:1});S.bag.push(it);window._u=it.uid`);
ok(G(`CQSys.heroEquip(_u).ok`)===1&&G('!!S.hero.eq.weapon'),'英雄穿戴');
const hs=JSON.parse(G('JSON.stringify(CQSys.heroStats())'));ok(hs.atkMax>0&&hs.hp>0&&hs.cls==='zs','英雄属性 '+JSON.stringify(hs));
ok(G(`CQSys.heroUnequip('weapon').ok`)===1&&!G('S.hero.eq.weapon'),'英雄卸下');
// 按角色区分：切回另一角色无此英雄
const c2=G(`CQSys.createChar('二号','ds')`);ok(!G('S.hero&&S.hero.cls'),'新角色英雄独立');G(`switchChar(${id})`);ok(G('S.hero&&S.hero.cls')==='zs','切回原角色英雄还在（随角色存档）');
ok(G(`CQSys.skillCooldown('x').placeholder`)===true,'冷却占位');G(`CQ_SKCD.lhjf=10;CQSys.skillCast('lhjf')`);const cd=JSON.parse(G(`JSON.stringify(CQSys.skillCooldown('lhjf'))`));ok(cd.cd===10&&cd.left>9&&!cd.ready,'冷却剩余');
ok(G(`CQSys.monArt('skelspirit').id`)==='mdl_mst_skelspirit'&&G(`CQSys.monArt('nope')`)===null,'立绘映射');
ok(G('CQSys.currency().yb')===0&&G(`CQSys.ybAdd(50,'测试')`)===50&&G(`CQSys.ybSpend(20)`)===true&&G(`CQSys.ybSpend(999)`)===false&&G('ACCT.yb')===30,'元宝增减');
ok(G('CQSys.power()')>0,'战力 '+G('CQSys.power()'));
G(`window._ev=[];CQSys.on('bossSpawn',e=>_ev.push('s'));CQSys.on('bossEnrage',e=>_ev.push('e'));CQSys.on('bossDead',e=>_ev.push('d'))`);
G(`MON.length=0;MON.push({key:'orclord',boss:1,hp:100,max:100,dmg:[2,4]});CQSys.bossTick()`);ok(G('CQSys.bossInfo().alive')===true&&G('CQSys.bossInfo().enrageLeft')>80,'首领刷新与狂暴倒计时');
G(`(()=>{const D=Date.now;Date.now=()=>D()+91e3;CQSys.bossTick();Date.now=D})()`);ok(G('MON[0].cqEnr')===1&&G('MON[0].dmg[1]')===6,'90 秒狂暴 ×1.5');
G(`MON[0].hp=0;CQSys.bossTick()`);ok(G('_ev.join("")')==='sed'&&G('CQSys.bossInfo().respawnLeft')>55,'击杀后刷新倒计时 + 事件');
ok(G(`typeof CQSys.hit==='object'&&CQSys.critNow===false`),'暴击标记结构');
ok(G(`CQSys.potions().hp`)>=0&&G('typeof usePot')==='function'&&G('usePot.length')===1,'吃药接口 usePot(k)');
// 自动吃药阈值 / 挂机开关
ok(G('JSON.stringify(CQSys.autoPot())')==='{"on":1,"hp":40,"rej":20,"mp":15}','自动吃药默认阈值');
G(`MON.length=0;calc();S.pot.hp=5;S.pot.rej=0;H.potT=0;CQSys.autoPot({hp:60});H.life=ST.life*0.5;step(0.01)`);ok(G('S.pot.hp')===4,'阈值 60% 时 50% 血自动喝红药');
G(`CQSys.autoPot({on:0});H.potT=0;H.life=ST.life*0.1;step(0.01)`);ok(G('S.pot.hp')===4,'关闭后不自动吃');
G(`CQSys.autoPot({on:1,hp:0});H.potT=0;step(0.01)`);ok(G('S.pot.hp')===4,'阈值 0 = 该药不自动');
ok(G('CQSys.autoPot({hp:200}).hp')===95,'阈值上限 95');
ok(G('CQSys.setAuto(0)')===0&&G('CQSys.idle()')===true&&G('CQSys.setAuto(1)')===1,'挂机开关');
ok(typeof G('CQSys.questLine()')==='string'&&/药水/.test(G('CQSys.potHTML()')),'任务行/药水面板 HTML');
// ---- 怪物立绘对照 web-replica monster.txt
{const fs0=require('fs'),path0=require('path');const want={chick:1001,deer:1002,hookcat:1003,rakecat:1004,scarecrow:1005,halforc:1006,orcwar:1008,spider1:1009,redsnake:1025,tigersnake:1025,cqskel:1013,cqzombie:1023};
 ok(Object.keys(want).every(k=>G(`(CQSys.monArt('${k}')||{}).id`)==='mdl_mst_'+want[k]),'monArt 按 monster.txt 映射（鸡1001…红蛇/虎蛇1025）');
 ok(G("CQSys.monArt('orclord').id")==='mdl_mst_orclord'&&G("CQSys.monArt('imp').id")==='mdl_mst_imp'&&G("CQSys.monArt('zombieking').id")==='mdl_mst_zombieking'&&G("CQSys.monArt('nosuchmon')")===null,'无图的怪 monArt 返回 null，不退到骷髅；美术2 首领/怪按 key 映射');
 ok(fs0.readdirSync(path0.join(__dirname,'..','assets/cq/ui')).filter(f=>/^mdl_mst_[a-z]\w*\.png$/.test(f)).every(f=>G(`CQ_MONART['${f.slice(8,-4)}']`)===f.slice(0,-4)),'assets/cq/ui 里每张 mdl_mst_<key>.png 都在 CQ_MONART');
 const fs=require('fs'),path=require('path');ok(Object.values(JSON.parse(G('JSON.stringify(CQ_MONART)'))).filter(Boolean).every(a=>fs.existsSync(path.join(__dirname,'..','assets/cq/ui',a+'.png'))),'映射的立绘文件都存在');}
T.done();
