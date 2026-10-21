// 强化费用 / 普通难度推进门槛 / 自动药水与随从复活节流：node tests/cq_spend_test.js
const T=require('./cq_harness')('cq_spend_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc()`);
// 1) 强化金币
ok(G('CQ_BAL.enh.gold(0)')===250&&G('CQ_BAL.enh.gold(1)')===1000&&G('CQ_BAL.enh.gold(8)')===20250,'强化金币 250×(n+1)²');
ok(G('cqEnhCost(3).gold')===4000,'cqEnhCost 使用 CQ_BAL.enh.gold');
// 2) GATE
ok(G('gateOf(0,0)')===6&&G('gateOf(2,0)')===6,'普通难度门槛 6');ok(G('gateOf(0,1)')===4,'噩梦仍为 4');ok(G('gateOf(0,2)')===G('HELL_GATE[0]'),'地狱不变');
// 3) 节流
G(`S.apot={on:1,hp:90,rej:80,mp:50}`);ok(G(`cqAP('hp')`)===0.4&&G(`cqAP('rej')`)===0.4&&G(`cqAP('mp')`)===0.5,'自动吃红药/瞬回阈值封顶 40%');
G(`S.lvl=10;S.cqSp={inc:0,sp:0};S.gold=100000;S.pot.hp=0;S.pot.mp=0;autoTick()`);ok(G('S.pot.hp')===0,'无近期收入：不自动买药');
G(`S.cqSp={inc:10000,sp:0};S.gold=100000;autoTick()`);const sp=G('S.cqSp.sp');ok(sp>0&&sp<=3000&&G('S.pot.hp')>0,'有收入：买药，花费 ≤30% 收入 sp='+sp);
G(`S.cqSp={inc:1e6,sp:0};S.gold=G0=CQ_BAL.spend.floor(S.lvl)+50;S.pot.hp=0;S.pot.mp=0;autoTick()`);ok(G('S.gold')>=G('CQ_BAL.spend.floor(S.lvl)'),'不跌破金币保底');
G(`cqInc(1e6)`);ok(G('S.cqSp.inc')<=G('CQ_BAL.spend.win(S.lvl)'),'收入窗口衰减');
// 随从自动复活
G(`S.merc={t:Object.keys(MERCS)[0],lvl:10,nm:'t',dead:1};S.cqSp={inc:0,sp:0};S.gold=1e7;mercRevive(1)`);ok(G('S.merc.dead')===1,'无收入额度：不自动复活');
G(`S.cqSp={inc:1e8,sp:0};mercRevive(1)`);ok(!G('S.merc.dead'),'额度足够：自动复活');
G(`S.merc.dead=1;S.cqSp={inc:0,sp:0};S.gold=1e7;var g0=S.gold;mercRevive()`);ok(!G('S.merc.dead')&&G('S.gold')<G('g0'),'手动复活不受节流');
T.done();
