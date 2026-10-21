// 数值框架：node tests/cq_balance_test.js
const T=require('./cq_harness')('cq_balance_test');const{G,ok}=T;
ok(G('CQ_BAL.budget.hero')===0.2,'budget.hero = 20%');
ok(Math.abs(G('cqBudgetProduct()')-1.35*1.15*1.1*1.05*1.1*1.05)<1e-9,'英雄项不进战力连乘');
ok(G('cqHeroShareOk(150,50,1000)')===true&&G('cqHeroShareOk(150,60,1000)')===false,'英雄普攻+合击 ≤ 20% 判定');
ok(Math.abs(G('cqHeroDmgCap(800)')-200)<1e-9,'本体 800 → 英雄上限 200（200/1000=20%）');
ok(G('cqHeroShare(0,0,0)')===0,'无伤害时占比 0');
// 系统侧强制：hitMon 对 cqhero/cqheji 按 30 秒窗口截断到 20%
G(`S=newSave();load();S.lvl=30;calc();CQSys._heroReset();MON.length=0;window._m={hp:1e9,max:1e9,res:{},def:0,lv:30,key:'deer'};MON.push(_m)`);
G(`for(let i=0;i<20;i++)hitMon(_m,{phys:100},'player')`);const p1=JSON.parse(G('JSON.stringify(CQSys.heroShare())'));
G(`for(let i=0;i<50;i++){hitMon(_m,{phys:200},'cqhero');hitMon(_m,{phys:300},'cqheji')}`);const sh=JSON.parse(G('JSON.stringify(CQSys.heroShare())'));
ok(p1.player>0&&sh.hero>0,'窗口记账 '+JSON.stringify(sh));
ok(sh.share<=0.2+1e-6,'英雄普攻+合击实际占比 '+sh.share.toFixed(4)+' ≤ 20%');
ok(sh.share>0.19,'上限内不被多砍（占比贴近 20%）');
T.done();
