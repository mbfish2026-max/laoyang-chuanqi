// 强化费用 / 普通难度推进门槛 / 自动药水与随从复活节流：node tests/cq_spend_test.js
const T=require('./cq_harness')('cq_spend_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc()`);
// 1) 强化金币
ok(G('CQ_BAL.enh.gold(0)')===250&&G('CQ_BAL.enh.gold(1)')===1000&&G('CQ_BAL.enh.gold(8)')===20250,'强化金币 250×(n+1)²');
ok(G('cqEnhCost(3).gold')===4000,'cqEnhCost 使用 CQ_BAL.enh.gold');
// 2) GATE
ok(G('gateOf(0,0)')===6&&G('gateOf(2,0)')===6,'普通难度门槛 6');ok(G('gateOf(0,1)')===4,'噩梦仍为 4');ok(G('gateOf(0,2)')===G('HELL_GATE[0]'),'地狱不变');
// 3) 节流：默认关闭（on=0，消融 B 方案）
ok(G('CQ_BAL.spend.on')===0,'默认节流关闭');G(`S.apot={on:1,hp:90,rej:80,mp:50}`);ok(G(`cqAP('hp')`)===0.9,'关闭时阈值上限 95%');
G(`S.lvl=10;S.cqSp={inc:0,sp:0};S.gold=100000;S.pot.hp=0;S.pot.mp=0;autoTick()`);ok(G('S.pot.hp')===8,'关闭时照常自动买药');
// 开启后（on=1）
G(`CQ_BAL.spend.on=1`);ok(G(`cqAP('hp')`)===0.55&&G(`cqAP('rej')`)===0.55&&G(`cqAP('mp')`)===0.5,'开启：红药/瞬回阈值封顶 55%');
G(`S.cqSp={inc:0,sp:0};S.gold=100000;S.pot.hp=0;S.pot.mp=0;autoTick()`);const s0=G('S.cqSp.sp');ok(s0>0&&s0<=2000,'新角色起步额度 2000 内可买药 sp='+s0);
G(`S.cqSp={inc:0,sp:2000};S.pot.hp=0;S.pot.mp=0;autoTick()`);ok(G('S.pot.hp')===0,'起步额度用完且无收入：不买');
G(`S.cqSp={inc:10000,sp:2000};S.pot.hp=0;S.pot.mp=0;autoTick()`);const sp=G('S.cqSp.sp');ok(sp>2000&&sp<=7000,'花费 ≤ 50% 收入 + 2000 sp='+sp);
G(`S.cqSp={inc:1e6,sp:0};S.gold=CQ_BAL.spend.floor(S.lvl)+50;S.pot.hp=0;S.pot.mp=0;autoTick()`);ok(G('S.gold')>=G('CQ_BAL.spend.floor(S.lvl)'),'不跌破金币保底');
G(`cqInc(1e6)`);ok(G('S.cqSp.inc')<=G('CQ_BAL.spend.win(S.lvl)'),'收入窗口衰减');
// 随从自动复活不受节流
G(`S.merc={t:Object.keys(MERCS)[0],lvl:10,nm:'t',dead:1};S.cqSp={inc:0,sp:1e9};S.gold=1e7;mercRevive(1)`);ok(!G('S.merc.dead'),'开启节流时随从自动复活仍不受限');
G(`CQ_BAL.spend.on=0`);
T.done();
