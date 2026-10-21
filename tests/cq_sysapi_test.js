// M1 系统接口：node tests/cq_sysapi_test.js
const T=require('./cq_harness')('cq_sysapi_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.lvl=10;calc()`);
ok(G('CQSys.api')===1,'CQSys.api 就绪');
ok(G('CQSys.classes().map(c=>c.id).join()')==='zs,fs,ds','职业列表');
const id=G(`CQSys.createChar('老羊','fs')`);ok(id>0||id===0,'创建法师角色');ok(G('S.cls')==='fs'&&G('S.name')==='老羊','切到新角色');
ok(G(`CQSys.heroCreate('zs','阿战').ok`)===1&&G('S.hero.cls')==='zs','创建英雄');
ok(G(`CQSys.heroCreate('ds').err`)==='已有英雄','英雄只能建一次');
G(`CQSys.heroSet({rage:150,autoHeji:0});save()`);ok(G('S.hero.rage')===100&&G('S.hero.autoHeji')===0,'怒气封顶 100');
G(`const it=genItem(5,{base:BASEM.swd1,q:1});S.bag.push(it);window._u=it.uid`);
ok(G(`CQSys.heroEquip(_u).ok`)===1&&G('!!S.hero.eq.weapon'),'英雄穿戴');
const hs=JSON.parse(G('JSON.stringify(CQSys.heroStats())'));ok(hs.atkMax>0&&hs.hp>0&&hs.cls==='zs','英雄属性 '+JSON.stringify(hs));
ok(G(`CQSys.heroUnequip('weapon').ok`)===1&&!G('S.hero.eq.weapon'),'英雄卸下');
// 按角色区分：切回另一角色无此英雄
const c2=G(`CQSys.createChar('二号','ds')`);ok(!G('S.hero&&S.hero.cls'),'新角色英雄独立');G(`switchChar(${id})`);ok(G('S.hero&&S.hero.cls')==='zs','切回原角色英雄还在（随角色存档）');
ok(G(`CQSys.skillCooldown('x').placeholder`)===true,'冷却占位');G(`CQ_SKCD.lhjf=10;CQSys.skillCast('lhjf')`);const cd=JSON.parse(G(`JSON.stringify(CQSys.skillCooldown('lhjf'))`));ok(cd.cd===10&&cd.left>9&&!cd.ready,'冷却剩余');
ok(G(`CQSys.monArt('orclord').id`)==='mdl_mst_2001'&&G(`CQSys.monArt('nope')`)===null,'立绘映射');
ok(G('CQSys.currency().yb')===0&&G(`CQSys.ybAdd(50,'测试')`)===50&&G(`CQSys.ybSpend(20)`)===true&&G(`CQSys.ybSpend(999)`)===false&&G('ACCT.yb')===30,'元宝增减');
ok(G('CQSys.power()')>0,'战力 '+G('CQSys.power()'));
G(`window._ev=[];CQSys.on('bossSpawn',e=>_ev.push('s'));CQSys.on('bossEnrage',e=>_ev.push('e'));CQSys.on('bossDead',e=>_ev.push('d'))`);
G(`MON.length=0;MON.push({key:'orclord',boss:1,hp:100,max:100,dmg:[2,4]});CQSys.bossTick()`);ok(G('CQSys.bossInfo().alive')===true&&G('CQSys.bossInfo().enrageLeft')>80,'首领刷新与狂暴倒计时');
G(`(()=>{const D=Date.now;Date.now=()=>D()+91e3;CQSys.bossTick();Date.now=D})()`);ok(G('MON[0].cqEnr')===1&&G('MON[0].dmg[1]')===6,'90 秒狂暴 ×1.5');
G(`MON[0].hp=0;CQSys.bossTick()`);ok(G('_ev.join("")')==='sed'&&G('CQSys.bossInfo().respawnLeft')>55,'击杀后刷新倒计时 + 事件');
ok(G(`typeof CQSys.hit==='object'&&CQSys.critNow===false`),'暴击标记结构');
ok(G(`CQSys.potions().hp`)>=0&&G('typeof usePot')==='function'&&G('usePot.length')===1,'吃药接口 usePot(k)');
T.done();
